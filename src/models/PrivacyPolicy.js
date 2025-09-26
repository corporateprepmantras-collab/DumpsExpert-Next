import mongoose, { Schema } from "mongoose";

const privacyPolicySchema = new Schema(
  {
    html: { type: String, required: true },
  },
  { timestamps: true }
);

const PrivacyPolicy =
  mongoose.models.PrivacyPolicy ||
  mongoose.model("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;
