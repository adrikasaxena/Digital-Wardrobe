import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   GET ALL USERS (admin)
========================= */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* =========================
   UPDATE USER
========================= */
router.put("/:id", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // safety check
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // only update provided fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;

    const updatedUser = await user.save();

    // remove password before sending back
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    console.log("USER UPDATED:", userResponse._id);

    res.json(userResponse);
  } catch (err) {
    console.error("UPDATE USER ERROR:", err.message);
    res.status(500).json({ message: "Failed to update user" });
  }
});

/* =========================
   DELETE USER
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
