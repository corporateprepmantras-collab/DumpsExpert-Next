// models/Redirect.js
import mongoose from "mongoose";

const redirectSchema = new mongoose.Schema(
  {
    fromUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    toUrl: {
      type: String,
      required: true,
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true 
  }
);

// Add index for faster lookups
redirectSchema.index({ fromUrl: 1 });
redirectSchema.index({ isActive: 1 });

const Redirect = mongoose.models.Redirect || mongoose.model("Redirect", redirectSchema);

export default Redirect;