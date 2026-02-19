import express from "express";
import multer from "multer";
import UserItem from "../models/UserItem.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/items", upload.single("image"), async (req, res) => {
  try {
    const { user, name, category = "Personal" } = req.body;

    if (!user || !name || !req.file) {
      return res.status(400).json({ message: "User, name, and image are required." });
    }

    const item = await UserItem.create({
      user,
      name,
      category,
      image: req.file.filename,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("CREATE USER ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to upload item." });
  }
});

router.get("/items/user/:id", async (req, res) => {
  try {
    const items = await UserItem.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("GET USER ITEMS ERROR:", err);
    res.status(500).json({ message: "Failed to load uploaded items." });
  }
});

router.delete("/items/:id", async (req, res) => {
  try {
    await UserItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE USER ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to delete item." });
  }
});

export default router;
