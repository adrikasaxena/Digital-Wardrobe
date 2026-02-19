import mongoose from "mongoose";
import crypto from "crypto";

const outfitPieceSchema = new mongoose.Schema(
  {
    slot: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ["product", "userItem"],
      required: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const savedOutfitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "Saved Outfit",
      trim: true,
    },
    shareId: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(8).toString("hex"),
    },
    pieces: {
      type: [outfitPieceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("SavedOutfit", savedOutfitSchema);
