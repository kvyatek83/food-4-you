const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const { verifyToken, checkRole } = require("./auth-service");
const { v4: uuidv4 } = require("uuid");

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

router.post("/orders", verifyToken, checkRole("travler"), async (req, res) => {
  try {
    const { customerDetails, cartItems, addOns } = req.body;

    // Prepare order data structure
    const orderData = {
      uuid: uuidv4(),
      customerName: customerDetails?.name || "",
      customerPhone: customerDetails?.phone || "",
      totalAmount: 0,
      printed: false,
      orderDate: new Date(),
      items: [],
    };

    console.log(JSON.stringify(cartItems));

    // Process each item in the cart
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const item = cartItem.item;

      // Process each variant/permutation of this item
      cartItem.items.forEach((selectedAddOnIds) => {
        // Calculate price for this item
        const basePrice = item.price;
        const freeAddOns = item.freeAvailableAddOns || 0;
        const pricePerAddOn = item.addOnPrice || 0;

        // Calculate add-on costs beyond free limit
        const paidAddOns = Math.max(0, selectedAddOnIds.length - freeAddOns);
        const addOnCost = paidAddOns * pricePerAddOn;

        // Calculate total for this item
        const itemTotalPrice = basePrice + addOnCost;
        totalAmount += itemTotalPrice;

        // Add item to order
        orderData.items.push({
          uuid: uuidv4(),
          itemUuid: item.uuid,
          itemName: item.enName,
          price: basePrice,
          quantity: 1,
          selectedAddOns: selectedAddOnIds,
          itemTotalPrice: itemTotalPrice,
        });
      });
    }

    // Set total order amount
    orderData.totalAmount = totalAmount;

    // Save order to database
    const order = await db.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// TODO: change role
router.put(
  "/orders/:id/printed",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { printed } = req.body;

      if (typeof printed !== "boolean") {
        return res.status(400).json({ error: "Invalid printed status" });
      }

      await db.updateOrderPrintStatus(req.params.id, printed);

      const updatedOrder = await db.getOrderById(req.params.id);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order print status:", error);
      res.status(500).json({ error: "Failed to update order print status" });
    }
  }
);

module.exports = router;
