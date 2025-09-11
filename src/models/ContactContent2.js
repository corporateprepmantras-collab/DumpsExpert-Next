import mongoose from "mongoose";

const ContactContent2 = new mongoose.Schema(
  {
    html: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Content2 || mongoose.model("ContactContent2", ContactContent2);
