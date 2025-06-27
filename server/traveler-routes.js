const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const { verifyToken, checkRole } = require("./auth-service");
const { v4: uuidv4 } = require("uuid");

// Helper function for consistent error handling and logging
const handleError = (error, res, operation, entity = 'item') => {
  const timestamp = new Date().toISOString();
  const errorMessage = error.message || 'Unknown error';
  
  // Determine error code based on error type
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode = 500;
  
  if (error.name === 'SequelizeValidationError') {
    errorCode = 'VALIDATION_ERROR';
    statusCode = 400;
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    errorCode = 'DUPLICATE_ENTRY';
    statusCode = 409;
  } else if (error.message && error.message.includes('not found')) {
    errorCode = 'NOT_FOUND';
    statusCode = 404;
  }
  
  // Log error for production monitoring
  console.error(`[${timestamp}] ${operation} failed:`, {
    error: errorMessage,
    code: errorCode,
    statusCode: statusCode,
    stack: error.stack,
    entity: entity,
    operation: operation
  });

  // Return structured error response
  res.status(statusCode).json({
    message: errorCode,
    params: {
      operation: operation,
      entity: entity,
      timestamp: timestamp,
      details: errorMessage
    }
  });
};

// Route to get all categories with their items
router.get(
  "/categories",
  verifyToken,
  checkRole("traveler"),
  async (req, res) => {
    try {
      const categories = await db.getCategoriesWithItems();
      res.json(categories);
    } catch (error) {
      handleError(error, res, "getCategories", "category");
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
    handleError(error, res, "getAddOns", "addon");
  }
});

router.post("/orders", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const orderData = req.body;
    const order = await db.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    handleError(error, res, "createOrder", "order");
  }
});

// Update order print status
router.put(
  "/orders/:id/printed",
  verifyToken,
  checkRole("traveler"),
  async (req, res) => {
    try {
      const orderId = req.params.id;
      const { printed } = req.body;
      
      const order = await db.findOrder(orderId);
      if (!order) {
        return res.status(404).json({
          message: "ORDER_NOT_FOUND",
          params: {
            orderId: orderId,
            operation: "updatePrintStatus"
          }
        });
      }

      await db.updateOrderPrintStatus(orderId, printed);
      res.json({ success: true });
    } catch (error) {
      handleError(error, res, "updateOrderPrintStatus", "order");
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
    const { printerAvailable, printerEnabled, printerIp, lastError, timestamp } = req.body;
    
    // Update configuration with printer status and error
    const statusUpdate = {
      printerAvailable: printerAvailable,
      lastPrinterError: lastError,
      lastStatusCheck: new Date(timestamp)
    };
    
    await db.updateConfiguration(statusUpdate);
    
    console.log(`Printer status updated: available=${printerAvailable}, error=${lastError}`);
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
    
    // Log print result
    console.log(`Print result: success=${success}, message=${message}, isTest=${isTest}, errorCode=${errorCode}`);
    
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

// Endpoint for Android to get environment variables (non-sensitive only)
router.get("/env", verifyToken, checkRole("traveler"), async (req, res) => {
  try {
    const envVars = {
      webViewUrl: process.env.WEBVIEW_URL || process.env.BASE_URL || `http://192.168.68.59:${process.env.PORT || 3000}`,
      appVersion: process.env.APP_VERSION || "1.0.0"
      // Note: Not exposing serverUrl or other sensitive environment variables
    };    
    
    res.json(envVars);
  } catch (error) {
    console.error("Error fetching environment variables:", error);
    res.status(500).json({ error: "Failed to fetch environment variables" });
  }
});

module.exports = router;
