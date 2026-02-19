import express from "express";
import SavedOutfit from "../models/SavedOutfit.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { user, name = "Saved Outfit", pieces = [] } = req.body;

    if (!user) {
      return res.status(400).json({ message: "User is required." });
    }

    if (!Array.isArray(pieces) || pieces.length === 0) {
      return res.status(400).json({ message: "Outfit must include at least one piece." });
    }

    const outfit = await SavedOutfit.create({ user, name, pieces });
    res.status(201).json(outfit);
  } catch (err) {
    console.error("CREATE SAVED OUTFIT ERROR:", err);
    res.status(500).json({ message: "Failed to save outfit." });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const outfits = await SavedOutfit.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(outfits);
  } catch (err) {
    console.error("GET SAVED OUTFITS ERROR:", err);
    res.status(500).json({ message: "Failed to load saved outfits." });
  }
});

router.get("/share/:shareId", async (req, res) => {
  try {
    const outfit = await SavedOutfit.findOne({ shareId: req.params.shareId });
    if (!outfit) {
      return res.status(404).json({ message: "Shared outfit not found." });
    }
    res.json(outfit);
  } catch (err) {
    console.error("GET SHARED OUTFIT ERROR:", err);
    res.status(500).json({ message: "Failed to load shared outfit." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, pieces } = req.body;

    if (!Array.isArray(pieces) || pieces.length === 0) {
      return res.status(400).json({ message: "Outfit must include at least one piece." });
    }

    const updated = await SavedOutfit.findByIdAndUpdate(
      req.params.id,
      {
        name: name || "Saved Outfit",
        pieces,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Saved outfit not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE SAVED OUTFIT ERROR:", err);
    res.status(500).json({ message: "Failed to update outfit." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await SavedOutfit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE SAVED OUTFIT ERROR:", err);
    res.status(500).json({ message: "Failed to delete outfit." });
  }
});

export default router;
