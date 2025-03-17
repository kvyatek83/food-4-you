const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const space = require("./space-utils");
const { v4: uuidv4 } = require("uuid");

// Route to get all categories with their items
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.getCategoriesWithItems();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/add-ons", async (req, res) => {
  try {
    const addOns = await db.getAddOns();
    res.json(addOns);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// TODO: move t oadmin file and use auth
// Route to create a category - should move to admin API
router.post("/category", space.upload.single("image"), async (req, res) => {
  // const { category, image } = req.body;
  try {
    let category = req.body.category;
    if (typeof category === "string") {
      category = JSON.parse(category);
    }

    category.uuid = uuidv4();
    category.type = category.enName;

    if (req.file) {
      // Store the complete URL
      // category.imageUrl = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${req.file.key}`;
      category.imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
    }

    await db.addCategory(category);
    res.status(201).send("Category created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to create an item - should move to admin API
router.post("/item", async (req, res) => {
  const { item, categoryId, image } = req.body;
  try {
    await db.addItem(item, categoryId);
    res.status(201).send("Item created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to create an item - should move to admin API
router.post("/add-on", async (req, res) => {
  const addOn = req.body;
  try {
    await db.addAddOn(addOn);
    res.status(201).send("Add-on created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
