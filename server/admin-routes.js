const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const space = require("./space-utils");
const { v4: uuidv4 } = require("uuid");
const { verifyToken, checkRole } = require("./auth-service");

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
  // space.upload.single("image"),
  async (req, res) => {
    try {
      // TODO: finish method
      res.status(201).send("Category created");
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
      let category = await db.findCategory(categoryId);

      if (category.imageUrl) {
        // TODO: amazonaws.com in env var?!
        const imageUrl = category.imageUrl.split("amazonaws.com/")[1];

        console.log(category.imageUrl);
        console.log(imageUrl);

        await space.deleteImage(imageUrl);
      }

      // TODO: delete all items in category before

      await db.deleteCategory(categoryId);
      const categories = await db.getCategoriesWithItems();
      res.status(201).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post("/item", verifyToken, checkRole("admin"), async (req, res) => {
  const { item, categoryId, image } = req.body;
  try {
    await db.addItem(item, categoryId);
    res.status(201).send("Item created");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/add-on", verifyToken, checkRole("admin"), async (req, res) => {
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
