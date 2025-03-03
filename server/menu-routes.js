const express = require("express");
const router = express.Router();
const db = require("./database-utils");

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

// Route to create a category - should move to admin API
router.post("/category", async (req, res) => {
  const category = req.body;
  try {
    await db.addCategory(category);
    res.status(201).send("Category created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to create an item - should move to admin API
router.post("/item", async (req, res) => {
  const { item, categoryId } = req.body;
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
