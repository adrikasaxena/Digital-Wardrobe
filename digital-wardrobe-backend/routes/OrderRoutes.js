import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

/* create order */
router.post("/", async (req, res) => {
  try {
    const { user, items, totalAmount } = req.body;

    if (!user) {
      return res.status(400).json({ message: "User is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required." });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Total amount must be greater than 0." });
    }

    const order = await Order.create({
      user,
      items,
      totalAmount: Number(totalAmount),
    });
    res.json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to create order." });
  }
});

/* user: get own orders */
router.get("/user/:id", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("GET USER ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to load order history." });
  }
});

/* admin: get all orders */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to load orders." });
  }
});

export default router;
