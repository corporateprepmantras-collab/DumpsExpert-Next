import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const productCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, trim: true },
    description: { type: String },
    descriptionBelow: { type: String },
    image: { type: String },
    public_id: { type: String },
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    remarks: { type: String },
    status: { type: String, enum: ["Ready", "Publish"], default: "Ready" },
    faqs: [faqSchema], // ✅ Added FAQs array
  },
  { timestamps: true }
);

const ProductCategory =
  mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", productCategorySchema);

export default ProductCategory;
