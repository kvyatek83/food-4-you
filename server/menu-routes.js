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

module.exports = router;
