const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  otpExpires: {
    type: Date,
    required: true,
    index: { expires: "0s" },
  },
  attempts: {
    type: Number,
    default: 0,
  },
  purpose: {
    type: String,
    enum: ["signup", "password-reset"],
    default: "signup",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for faster queries
otpSchema.index({ email: 1, otp: 1 });

// Make sure the model name matches what you import
const OTP = mongoose.models.otps || mongoose.model("otps", otpSchema);

module.exports = OTP;
