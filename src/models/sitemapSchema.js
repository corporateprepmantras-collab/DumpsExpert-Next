import mongoose from "mongoose";

const sitemapSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SiteMap || mongoose.model("SiteMap", sitemapSchema);
