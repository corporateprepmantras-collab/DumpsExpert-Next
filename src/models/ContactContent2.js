import mongoose, { Schema, models } from "mongoose";

const ContactContent2Schema = new Schema(
  {
    html: { type: String, required: true },
  },
  { timestamps: true }
);

// Use existing model if it exists (prevents OverwriteModelError)
const ContactContent2 =
  models.ContactContent2 || mongoose.model("ContactContent2", ContactContent2Schema);

export default ContactContent2;
