const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const { verifyToken, checkRole } = require("./auth-service");
const space = require("./space-utils");


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
