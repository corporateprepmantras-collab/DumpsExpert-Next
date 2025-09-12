import mongoose, { models, Schema } from "mongoose";

const ContactContent1Schema = new Schema(
  {
    html: { type: String, required: true },
  },
  { timestamps: true }
);

// Use existing model if it exists to prevent OverwriteModelError
const ContactContent1 =
  models.ContactContent1 ||
  mongoose.model("ContactContent1", ContactContent1Schema);

export default ContactContent1;
