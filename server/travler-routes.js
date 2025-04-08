const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const { verifyToken, checkRole } = require("./auth-service");

// Route to get all categories with their items
router.get(
  "/categories",
  verifyToken,
  checkRole("travler"),
  async (req, res) => {
    try {
      const categories = await db.getCategoriesWithItems();
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
  checkRole("travler"),
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

router.get("/add-ons", verifyToken, checkRole("travler"), async (req, res) => {
  try {
    const addOns = await db.getAddOns();
    res.json(addOns);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
