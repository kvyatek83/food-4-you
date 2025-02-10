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

// Route to create a category
router.post("/categories", async (req, res) => {
  const category = req.body;
  try {
    await db.addCategory(category);
    res.status(201).send("Category created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to create an item
router.post("/items", async (req, res) => {
  const { item, categoryId } = req.body;
  try {
    await db.addItem(item, categoryId);
    res.status(201).send("Item created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
