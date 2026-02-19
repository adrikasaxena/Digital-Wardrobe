import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },

  description: { type: String, default: "" },

  sizes: {
    type: [String], // ["S","M","L"]
    default: [],
  },

  inStock: {
    type: Boolean,
    default: true,
  },

  image: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "Active",
  },
});

export default mongoose.model("Product", productSchema);
