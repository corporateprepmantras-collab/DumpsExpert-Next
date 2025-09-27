import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true }, // home, about, blog, etc.

    // Basic SEO
    title: String,
    keywords: String,
    description: String,

    // Open Graph
    ogtitle: String,
    ogdescription: String,
    ogimage: String,
    ogurl: String,

    // Twitter
    twittertitle: String,
    twitterdescription: String,
    twitterimage: String,
    twittercard: { type: String, default: "summary_large_image" },

    // Additional
    canonicalurl: String,
    schema: String,
  },
  { timestamps: true }
);

export default mongoose.models.SEO || mongoose.model("SEO", seoSchema);
