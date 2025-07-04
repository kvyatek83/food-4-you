const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const db = require("./database-utils");
const space = require("./space-utils");
const { v4: uuidv4 } = require("uuid");
const { verifyToken, checkRole } = require("./auth-service");
const {
  uploadDatabaseToS3,
  listBackups,
  downloadBackup,
} = require("./backup-utils");

// ------------- CONFIG ENDPOINTS -------------
router.post("/config", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const updatedConfig = await db.updateConfiguration(req.body);
    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/config", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const config = await db.getConfiguration();
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// ------------- BACKUP ENDPOINTS -------------
router.post("/backup", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    await uploadDatabaseToS3();
    res.status(201).send("Backup completed.");
  } catch (error) {
    res.status(500).send("Backup failed.");
  }
});

router.get("/backups", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const backups = await listBackups();
    res.status(200).json(backups);
  } catch (error) {
    res.status(500).send("Error fetching backup list.");
  }
});

router.post("/restore", verifyToken, checkRole("admin"), async (req, res) => {
  const { backupKey } = req.body;
  if (!backupKey) {
    return res.status(400).send("Backup key is required.");
  }

  try {
    // Download the backup
    await downloadBackup(backupKey);
    const restoredDbPath = path.join(__dirname, "restored-app.db");
    const currentDbPath = path.join(__dirname, process.env.DB_PATH || "app.db");

    // Close current database connections
    await db.closeConnections();

    // Replace the database file
    fs.renameSync(restoredDbPath, currentDbPath);

    // Reinitialize the database connection
    await db.initializeDatabase();

    res.status(201).send("Database restored successfully.");
  } catch (error) {
    console.error("Failed to restore database backup:", error);
    res.status(500).send("Failed to restore database backup.");
  }
});

// ------------- DATABASE DOWNLOAD ENDPOINTS -------------
router.get("/download/database", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const dbPath = path.join(__dirname, process.env.DB_PATH || "app.db");
    
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: "Database file not found" });
    }

    const timestamp = new Date().toISOString().split('T')[0]; 
    const filename = `app-${timestamp}.db`;
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(dbPath).size);
    
    const fileStream = fs.createReadStream(dbPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error("Error downloading database:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download database" });
      }
    });

  } catch (error) {
    console.error("Error downloading database:", error);
    res.status(500).json({ error: "Failed to download database" });
  }
});

// ------------- CATEGORY ENDPOINTS -------------

router.post(
  "/category",
  verifyToken,
  checkRole("admin"),
  space.upload.single("image"),
  async (req, res) => {
    try {
      let category = req.body.category;

      // TODO: fix "undefined" is not valid JSON
      if (typeof category === "string") {
        category = JSON.parse(category);
      }

      category.uuid = uuidv4();
      category.type = category.enName;

      if (req.file) {
        // TODO: amazonaws.com in env var?!
        category.imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
      }

      await db.addCategory(category);
      const categories = await db.getCategoriesWithItems();
      res.status(201).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/category",
  verifyToken,
  checkRole("admin"),
  space.upload.single("image"),
  async (req, res) => {
    try {
      let category = req.body.category;

      if (typeof category === "string") {
        category = JSON.parse(category);
      }

      // Find the existing category
      const existingCategory = await db.findCategory(category.uuid);

      if (!existingCategory) {
        return res.status(404).send("Category not found");
      }

      // Check if there's a new image
      if (req.file) {
        // If there's an existing image, delete it from S3
        if (existingCategory.imageUrl) {
          const oldImageKey =
            existingCategory.imageUrl.split("amazonaws.com/")[1];
          await space.deleteImage(oldImageKey);
        }

        // Set the new image URL
        category.imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
      }

      // else {
      //   // Keep the existing image URL if no new image is uploaded
      //   category.imageUrl = existingCategory.imageUrl;
      // }

      // Update the category
      await db.updateCategory(category);

      const categories = await db.getCategoriesWithItems();
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete(
  "/category/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const categoryId = req.params.id;
      const category = await db.findCategory(categoryId);

      if (!category) {
        return res.status(404).send("Category not found");
      }

      // Delete the category's image from S3 if it exists
      if (category.imageUrl) {
        const imageKey = category.imageUrl.split("amazonaws.com/")[1];
        await space.deleteImage(imageKey);
      }

      // Delete all items in the category
      await space.deleteFolder(`items/${categoryId}`);
      await db.deleteItemsByCategoryId(categoryId);

      // Delete the category itself
      await db.deleteCategory(categoryId);

      const categories = await db.getCategoriesWithItems();
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ------------- ITEM ENDPOINTS -------------

// Create new item
router.post(
  "/item",
  verifyToken,
  checkRole("admin"),
  space.upload.single("image"),
  async (req, res) => {
    try {
      let item = req.body.item;

      if (typeof item === "string") {
        item = JSON.parse(item);
      }

      item.uuid = uuidv4();

      // Handle image upload if provided
      if (req.file) {
        item.imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
      }

      // Convert availability object to individual fields if provided
      if (item.availability) {
        item.availableMonday = item.availability.monday;
        item.availableTuesday = item.availability.tuesday;
        item.availableWednesday = item.availability.wednesday;
        item.availableThursday = item.availability.thursday;
        item.availableFriday = item.availability.friday;
        item.availableSaturday = item.availability.saturday;
        item.availableSunday = item.availability.sunday;
        delete item.availability;
      }

      // Convert availableAddOnUuids to JSON string if it's an array
      if (Array.isArray(item.availableAddOnUuids)) {
        item.availableAddOnUuids = JSON.stringify(item.availableAddOnUuids);
      }

      await db.addItem(item, item.categoryId);

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
      // 
      res.status(201).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Get a single item
router.get("/item/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const item = await db.findItem(req.params.id);
    if (!item) {
      return res.status(404).send("Item not found");
    }

    const plainItem = item.get({ plain: true });

    // Generate presigned URL for item
    if (plainItem.imageUrl) {
      console.log("Generating presigned URL for item");
      const imageKey = plainItem.imageUrl.split("amazonaws.com/")[1];
      plainItem.imageUrl = space.getPresignedUrl(imageKey);
    }

    // Parse availableAddOnUuids
    plainItem.availableAddOnUuids = plainItem.availableAddOnUuids
      ? JSON.parse(plainItem.availableAddOnUuids)
      : [];

    // Format availability as an object for frontend convenience
    plainItem.availability = {
      monday: plainItem.availableMonday,
      tuesday: plainItem.availableTuesday,
      wednesday: plainItem.availableWednesday,
      thursday: plainItem.availableThursday,
      friday: plainItem.availableFriday,
      saturday: plainItem.availableSaturday,
      sunday: plainItem.availableSunday,
    };

    res.json(plainItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update an item
router.put(
  "/item/:id",
  verifyToken,
  checkRole("admin"),
  space.upload.single("image"),
  async (req, res) => {
    try {
      let item = req.body.item;
      if (typeof item === "string") {
        item = JSON.parse(item);
      }

      const existingItem = await db.findItem(req.params.id);
      if (!existingItem) {
        return res.status(404).send("Item not found");
      }

      // Ensure the item keeps its UUID
      item.uuid = req.params.id;

      // Handle image upload if provided
      if (req.file) {
        // Delete old image if exists
        if (existingItem.imageUrl) {
          const oldImageKey = existingItem.imageUrl.split("amazonaws.com/")[1];
          await space.deleteImage(oldImageKey);
        }

        // Set new image URL
        item.imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
      }

      // else {
      //   // Keep existing image
      //   item.imageUrl = existingItem.imageUrl;
      // }

      // Convert availability object to individual fields if provided
      if (item.availability) {
        item.availableMonday = item.availability.monday;
        item.availableTuesday = item.availability.tuesday;
        item.availableWednesday = item.availability.wednesday;
        item.availableThursday = item.availability.thursday;
        item.availableFriday = item.availability.friday;
        item.availableSaturday = item.availability.saturday;
        item.availableSunday = item.availability.sunday;
        delete item.availability;
      }

      // Convert availableAddOnUuids to JSON string if it's an array
      if (Array.isArray(item.availableAddOnUuids)) {
        item.availableAddOnUuids = JSON.stringify(item.availableAddOnUuids);
      }

      await db.updateItem(item);

      const categories = await db.getCategoriesWithItems();
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Delete an item
router.delete(
  "/item/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const itemId = req.params.id;
      const item = await db.findItem(itemId);

      if (!item) {
        return res.status(404).send("Item not found");
      }

      // Delete the item's image from S3 if it exists
      if (item.imageUrl) {
        const imageKey = item.imageUrl.split("amazonaws.com/")[1];
        await space.deleteImage(imageKey);
      }

      await db.deleteItem(itemId);

      const categories = await db.getCategoriesWithItems();
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ------------- ADD-ON ENDPOINTS -------------

// Create new add-on
router.post("/add-on", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    let addOn = req.body;

    if (typeof addOn === "string") {
      addOn = JSON.parse(addOn);
    }

    // Generate UUID if not provided
    if (!addOn.uuid) {
      addOn.uuid = uuidv4();
    }

    // Set default inStock value if not provided
    if (addOn.inStock === undefined) {
      addOn.inStock = true;
    }

    await db.addAddOn(addOn);

    const addOns = await db.getAddOns();
    res.status(201).json(addOns);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get a single add-on
router.get("/add-on/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const addOn = await db.findAddOn(req.params.id);
    if (!addOn) {
      return res.status(404).send("Add-on not found");
    }
    res.json(addOn.get({ plain: true }));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update an add-on
router.put("/add-on/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    let addOn = req.body;

    if (typeof addOn === "string") {
      addOn = JSON.parse(addOn);
    }

    const existingAddOn = await db.findAddOn(req.params.id);
    if (!existingAddOn) {
      return res.status(404).send("Add-on not found");
    }

    // Ensure UUID is preserved
    addOn.uuid = req.params.id;

    await db.updateAddOn(addOn);

    const addOns = await db.getAddOns();
    res.status(200).json(addOns);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete an add-on
router.delete(
  "/add-on/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const addOnId = req.params.id;

      const existingAddOn = await db.findAddOn(addOnId);
      if (!existingAddOn) {
        return res.status(404).send("Add-on not found");
      }

      await db.deleteAddOn(addOnId);

      const addOns = await db.getAddOns();
      res.status(200).json(addOns);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ------------- ORDERS ENDPOINTS -------------

router.get("/orders", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let orders;
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      orders = await db.getOrdersByDateRange(startDate, endDate, page, limit);
    } else {
      orders = await db.getAllOrders(page, limit);
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get order statistics
router.get(
  "/orders/stats",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      // Default to last 30 days if no date range
      const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : new Date(new Date().setDate(new Date().getDate() - 30));

      const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : new Date();

      const stats = await db.getOrderStats(startDate, endDate);

      res.json({
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        ...stats,
      });
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      res.status(500).json({ error: "Failed to fetch order statistics" });
    }
  }
);

module.exports = router;
