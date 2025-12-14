// models/Redirect.js
import mongoose from "mongoose";

const RedirectSchema = new mongoose.Schema(
  {
    fromUrl: {
      type: String,
      required: [true, "From URL is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          return v.startsWith('/');
        },
        message: 'From URL must start with /'
      }
    },
    toUrl: {
      type: String,
      required: [true, "To URL is required"],
      trim: true,
    },
    hits: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
RedirectSchema.index({ fromUrl: 1, active: 1 });
RedirectSchema.index({ active: 1 });

export default mongoose.models.Redirect || mongoose.model("Redirect", RedirectSchema);