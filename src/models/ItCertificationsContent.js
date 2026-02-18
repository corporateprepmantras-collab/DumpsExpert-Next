import mongoose from "mongoose";

const ItCertificationsContentSchema = new mongoose.Schema(
  {
    upperPara: { type: String, required: true },
    lowerPara: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.ItCertificationsContent ||
  mongoose.model("ItCertificationsContent", ItCertificationsContentSchema);
