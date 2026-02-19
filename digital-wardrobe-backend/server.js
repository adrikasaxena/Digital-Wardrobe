import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import wardrobeRoutes from "./routes/wardrobeRoutes.js";
import savedOutfitRoutes from "./routes/savedOutfitRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve uploaded images
app.use("/uploads", express.static("uploads"));

// ROUTES (THIS IS WHAT YOU WERE MISSING)
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);      // 🔥 LOGIN + SIGNUP
app.use("/api/users", userRoutes);     // 🔥 USER MANAGEMENT (ADMIN)
app.use("/api/cart", cartRoutes);     // 🔥 CART MANAGEMENT
app.use("/api/orders", orderRoutes);   // 🔥 ORDER MANAGEMENT
app.use("/api/wardrobe", wardrobeRoutes); // 🔥 USER WARDROBE ITEMS
app.use("/api/saved-outfits", savedOutfitRoutes); // 🔥 SAVED OUTFITS

// db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
