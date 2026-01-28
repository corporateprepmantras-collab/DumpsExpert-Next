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
    schemaHere: { type: String }, // ✅ New field for schema markup
    image: { type: String },
    public_id: { type: String },
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    remarks: { type: String },
    status: {
      type: String,
      enum: ["Publish", "Unpublish"], // ✅ Fixed to only Publish/Unpublish
      default: "Unpublish",
    },
    faqs: [faqSchema],
  },
  { timestamps: true },
);

// Add indexes for better query performance
productCategorySchema.index({ status: 1 }); // For filtering published categories
productCategorySchema.index({ slug: 1 }); // For category page lookups
productCategorySchema.index({ name: 1 }); // For searching/sorting by name

const ProductCategory =
  mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", productCategorySchema);

export default ProductCategory;
