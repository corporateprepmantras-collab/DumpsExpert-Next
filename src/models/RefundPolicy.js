import mongoose from "mongoose";

const RefundPolicySchema = new mongoose.Schema(
  {
    html: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.RefundPolicy ||
  mongoose.model("RefundPolicy", RefundPolicySchema);
