import mongoose, { Schema } from "mongoose";

const GuaranteeSchema = new Schema(
  {
    html: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Avoid model overwrite issue in Next.js hot reload
export default mongoose.models.Guarantee || mongoose.model("Guarantee", GuaranteeSchema);
