import mongoose from "mongoose";
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const GeneralFAQ = mongoose.models.GeneralFAQ || mongoose.model("GeneralFAQ", faqSchema);
export default GeneralFAQ;