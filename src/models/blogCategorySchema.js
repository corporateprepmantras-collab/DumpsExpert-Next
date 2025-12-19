import mongoose from "mongoose";

const blogCategorySchema = new mongoose.Schema(
  {
    sectionName: String,
    category: String,
    language: String,
    slug: String,

    imageUrl: String,
    imagePublicId: String,

    metaTitle: String,
    metaKeywords: String,
    metaDescription: String,

    // Store ANY text (JSON or normal text)
    schema: String,

    openGraphTitle: String,
    openGraphDescription: String,
    openGraphImage: String,

    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
  },
  { timestamps: true }
);

export default mongoose.models.BlogCategory ||
  mongoose.model("BlogCategory", blogCategorySchema);
