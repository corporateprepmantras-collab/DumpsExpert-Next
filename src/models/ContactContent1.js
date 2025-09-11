import mongoose from "mongoose";

const ContactContent1 = new mongoose.Schema(
  {
    html: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Content1 ||
  mongoose.model("ContactContent1", ContactContent1);
