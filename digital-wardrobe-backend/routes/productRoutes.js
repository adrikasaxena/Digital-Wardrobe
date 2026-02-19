import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

/* MULTER */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* CREATE PRODUCT */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description = "",
      sizes = "[]",
      inStock = "true",
    } = req.body;

    if (!name || !category || !price || !req.file) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      description,
      sizes: Array.isArray(JSON.parse(sizes)) ? JSON.parse(sizes) : [],
      inStock: inStock === "true",
      image: req.file.filename,
      status: "Active",
    });

    res.json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Product creation failed" });
  }
});

/* UPDATE PRODUCT */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      description: req.body.description || "",
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
      inStock: req.body.inStock === "true",
    };

    if (req.file) update.image = req.file.filename;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* GET PRODUCTS */
router.get("/", async (_, res) => {
  const products = await Product.find();
  res.json(products);
});

/* DELETE PRODUCT */
router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
