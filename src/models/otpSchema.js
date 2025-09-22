const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true, index: { expires: "0s" } },
  attempts: { type: Number, default: 0 },
    purpose: {
    type: String,
    enum: ['signup', 'password-reset'],
    default: 'signup'
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.otps || mongoose.model("otps", otpSchema);