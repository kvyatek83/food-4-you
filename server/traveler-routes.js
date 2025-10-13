const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const { verifyToken, checkRole } = require("./auth-service");
const space = require("./space-utils");
const { logger } = require("./logger-service");


// Route to get all categories with their items
router.get(
  "/categories",
  verifyToken,
  checkRole("traveler"),
  async (req, res) => {
    try {
      const tmpCategories = await db.getCategoriesWithItems();

      const categories = tmpCategories.map(category => {
        if (category.imageUrl && category.imageUrl.includes("amazonaws.com")) {
          console.log(`Before: ${category.imageUrl}`);
          const imageKey = category.imageUrl.split("amazonaws.com/")[1];
          category.imageUrl = space.getPresignedUrl(imageKey);
          console.log(`After: ${category.imageUrl}`);
          
        }
        category.items.forEach(item => {
          if (item.imageUrl && item.imageUrl.includes("amazonaws.com")) {
            const imageKey = item.imageUrl.split("amazonaws.com/")[1];
            item.imageUrl = space.getPresignedUrl(imageKey);
          }
        });
        return category;
      });
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Get menu items filtered by day
router.get(
  "/menu/:day?",
  verifyToken,
  checkRole("traveler"),
  async (req, res) => {
    try {
      const day = req.params.day;
      const availableItems = await db.getCategoriesWithAvailableItems(day);
      res.json(availableItems);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/add-ons", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const addOns = await db.getAddOns();
    res.json(addOns);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/orders", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const orderData = req.body;
    const order = await db.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order print status
router.put(
  "/orders/:id/printed",
  verifyToken,
  checkRole("traveler"),
  async (req, res) => {
    try {
      const { printed } = req.body;
      await db.updateOrderPrintStatus(req.params.id, printed);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order print status:", error);
      res.status(500).json({ error: "Failed to update print status" });
    }
  }
);

// ------------- ANDROID PRINTER ENDPOINTS -------------
// Endpoint for Android to get basic configuration (non-sensitive only)
router.get("/printer-config", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const config = await db.getConfiguration();
    
    // Only return non-sensitive printer configuration
    const safeConfig = {
      printerIp: config.printerIp,
      printerEnabled: config.printerEnabled
    };
    
    res.json(safeConfig);
  } catch (error) {
    console.error("Error fetching printer config:", error);
    res.status(500).json({ error: "Failed to fetch printer config" });
  }
});

// Endpoint for Android to report printer status
router.post("/printer-status", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const { 
      printerAvailable, 
      printerEnabled, 
      printerIp, 
      lastError, 
      timestamp,
      errorType,
      errorDetails 
    } = req.body;
    
    // Update configuration with printer status and enhanced error information
    const statusUpdate = {
      printerAvailable: printerAvailable,
      lastPrinterError: lastError,
      lastStatusCheck: new Date(timestamp)
    };

    // If there's an error, update error categorization fields
    if (lastError && errorType) {
      statusUpdate.printerErrorType = errorType;
      statusUpdate.printerErrorDetails = errorDetails || lastError;
      statusUpdate.lastErrorTimestamp = new Date(timestamp);
      
      // Get current config to increment error count
      const currentConfig = await db.getConfiguration();
      statusUpdate.printerErrorCount = (currentConfig.printerErrorCount || 0) + 1;

      // Log the printer error with detailed information
      logger.logPrinterEvent('error_reported', printerIp, false, {
        errorType: errorType,
        errorMessage: lastError,
        errorDetails: errorDetails,
        errorCount: statusUpdate.printerErrorCount,
        printerEnabled: printerEnabled,
        correlationId: req.correlationId
      });

      logger.error('Printer Error Detected', null, {
        printerIp: printerIp,
        errorType: errorType,
        errorMessage: lastError,
        errorDetails: errorDetails,
        errorCount: statusUpdate.printerErrorCount,
        event: 'printer_error_categorized'
      });
    } else if (!lastError && printerAvailable) {
      // Clear error fields if printer is now available and no error
      statusUpdate.printerErrorType = null;
      statusUpdate.printerErrorDetails = null;

      // Log printer recovery
      logger.logPrinterEvent('status_recovered', printerIp, true, {
        event: 'printer_recovered',
        previousError: statusUpdate.lastPrinterError,
        correlationId: req.correlationId
      });
    }
    
    await db.updateConfiguration(statusUpdate);
    
    logger.info(`Printer status updated`, {
      printerIp: printerIp,
      available: printerAvailable,
      enabled: printerEnabled,
      errorType: errorType || 'none',
      errorMessage: lastError || 'none',
      event: 'printer_status_updated'
    });
    
    console.log(`Printer status updated: available=${printerAvailable}, error=${lastError}, type=${errorType}`);
    res.status(200).json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Error updating printer status:", error);
    res.status(500).json({ error: "Failed to update printer status" });
  }
});

// Endpoint for Android to report print results
router.post("/print-result", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const { success, message, errorCode, isTest, timestamp } = req.body;
    
    // Log print result with detailed information
    console.log(`Print result: success=${success}, message=${message}, isTest=${isTest}, errorCode=${errorCode}`);
    
    const config = await db.getConfiguration();
    
    if (success) {
      logger.logPrinterEvent('print_completed', config.printerIp, true, {
        isTest: isTest,
        message: message,
        event: 'print_success',
        correlationId: req.correlationId
      });
    } else {
      // Log print failure with error categorization from Android
      const { errorType, errorDetails } = req.body;
      
      logger.logPrinterEvent('print_failed', config.printerIp, false, {
        isTest: isTest,
        errorCode: errorCode,
        errorType: errorType,
        errorMessage: message,
        errorDetails: errorDetails,
        event: 'print_failure',
        correlationId: req.correlationId
      });

      logger.error('Print Operation Failed', null, {
        printerIp: config.printerIp,
        errorCode: errorCode,
        errorType: errorType,
        errorMessage: message,
        errorDetails: errorDetails,
        isTest: isTest,
        event: 'print_operation_failed'
      });
    }
    
    // Update last print attempt in configuration
    const printUpdate = {
      lastPrintAttempt: new Date(timestamp),
      lastPrintSuccess: success,
      lastPrintError: success ? null : message
    };
    
    await db.updateConfiguration(printUpdate);
    
    res.status(200).json({ success: true, message: "Print result logged" });
  } catch (error) {
    console.error("Error logging print result:", error);
    res.status(500).json({ error: "Failed to log print result" });
  }
});

// Endpoint for web app to get detailed printer status with error information
router.get("/printer-status-details", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const config = await db.getConfiguration();
    
    // Provide detailed printer status for web app
    const printerStatusDetails = {
      printerAvailable: config.printerAvailable,
      printerEnabled: config.printerEnabled,
      printerIp: config.printerIp,
      lastPrinterError: config.lastPrinterError,
      printerErrorType: config.printerErrorType,
      printerErrorDetails: config.printerErrorDetails,
      printerErrorCount: config.printerErrorCount || 0,
      lastErrorTimestamp: config.lastErrorTimestamp,
      lastStatusCheck: config.lastStatusCheck,
      lastPrintAttempt: config.lastPrintAttempt,
      lastPrintSuccess: config.lastPrintSuccess,
      lastPrintError: config.lastPrintError,
      // User-friendly error messages based on error type
      userFriendlyError: getUserFriendlyErrorMessage(config.printerErrorType, config.printerErrorDetails)
    };
    
    res.json(printerStatusDetails);
  } catch (error) {
    console.error("Error fetching printer status details:", error);
    logger.error('Failed to fetch printer status details', error, {
      event: 'printer_status_details_fetch_error',
      correlationId: req.correlationId
    });
    res.status(500).json({ error: "Failed to fetch printer status details" });
  }
});

// Helper function to generate user-friendly error messages
function getUserFriendlyErrorMessage(errorType, errorDetails) {
  if (!errorType) return null;
  
  const errorMessages = {
    'no_paper': 'The printer is out of paper. Please refill the paper and try again.',
    'lid_open': 'The printer lid is open. Please close the lid and try again.',
    'not_connected': 'The printer is not connected to the tablet. Please check the connection and try again.',
    'communication_error': 'There was a communication error with the printer. Please check the connection and try again.',
    'device_error': 'The printer has a hardware error. Please check the device and try again.',
    'unknown': `There was an issue with the printer: ${errorDetails || 'Unknown error'}`
  };
  
  return errorMessages[errorType] || errorMessages['unknown'];
}

// Endpoint for Android to get environment variables (non-sensitive only)
router.get("/env", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    // TODO: add a new env variable for the webview url
    const envVars = {
      webViewUrl: isProduction ? 'http://food-4-u-chabad-antigua.work' : process.env.WEBVIEW_URL || process.env.BASE_URL || `http://192.168.68.59:${process.env.PORT || 3000}`,
      appVersion: process.env.APP_VERSION || "1.0.0",
      // Note: Not exposing serverUrl or other sensitive environment variables
    };   
    
    res.json(envVars);
  } catch (error) {
    console.error("Error fetching environment variables:", error);
    res.status(500).json({ error: "Failed to fetch environment variables" });
  }
});

module.exports = router;
