import express from "express";
import Cart from "../models/Cart.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================
   GET CART
====================== */
router.get("/", authMiddleware, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  res.json(cart.items);
});

/* ======================
   ADD TO CART
====================== */
router.post("/add", authMiddleware, async (req, res) => {
  const { productId } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  const existing = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();
  await cart.populate("items.product");

  res.json(cart.items);
});

/* ======================
   UPDATE QUANTITY
====================== */
router.put("/update", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.json([]);

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (!item) return res.status(404).json({ message: "Item not found" });

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate("items.product");

  res.json(cart.items);
});

/* ======================
   REMOVE ITEM
====================== */
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.json([]);

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId
  );

  await cart.save();
  await cart.populate("items.product");

  res.json(cart.items);
});

export default router;
