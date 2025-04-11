const express = require("express");
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
    // res.status(201).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/config", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const envs = {
      printerIp: process.env.PRINTER_IP,
    };

    res.json(envs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// ------------- BACKUP ENDPOINTS -------------
router.post("/backup", async (req, res) => {
  try {
    await uploadDatabaseToS3();
    res.status(200).send("Backup completed.");
  } catch (error) {
    res.status(500).send("Backup failed.");
  }
});

router.get("/backups", async (req, res) => {
  try {
    const backups = await listBackups();
    res.status(200).json(backups);
  } catch (error) {
    res.status(500).send("Error fetching backup list.");
  }
});

router.post("/restore", async (req, res) => {
  const { backupKey } = req.body;
  if (!backupKey) {
    return res.status(400).send("Backup key is required.");
  }

  try {
    await downloadBackup(backupKey);
    res.status(200).send("Database restored from backup.");
  } catch (error) {
    res.status(500).send("Failed to restore database backup.");
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

      const categories = await db.getCategoriesWithItems();
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

module.exports = router;
