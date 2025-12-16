// models/productListSchema.js
import mongoose from "mongoose";

const productListSchema = new mongoose.Schema(
  {
    sapExamCode: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    title: { type: String, default: "" },
    price: { type: String, default: "" },
    category: { type: String, default: "" },
    status: { type: String, default: "" },
    action: { type: String, default: "" },
    samplePdfUrl: { type: String, default: "" },
    mainPdfUrl: { type: String, default: "" },

    dumpsPriceInr: { type: String, default: "" },
    dumpsPriceUsd: { type: String, default: "" },
    dumpsMrpInr: { type: String, default: "" },
    dumpsMrpUsd: { type: String, default: "" },

    onlinePriceInr: { type: String, default: "" },
    onlinePriceUsd: { type: String, default: "" },
    onlineMrpInr: { type: String, default: "" },
    onlineMrpUsd: { type: String, default: "" },

    comboPriceInr: { type: String, default: "" },
    comboPriceUsd: { type: String, default: "" },
    comboMrpInr: { type: String, default: "" },
    comboMrpUsd: { type: String, default: "" },

    sku: { type: String, default: "" },
    longDescription: { type: String, default: "" },
    Description: { type: String, default: "" },
    slug: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    schema: { type: String, default: "" },

    // New exam information fields
    examCode: { type: String, default: "" },
    examName: { type: String, default: "" },
    totalQuestions: { type: String, default: "" },
    passingScore: { type: String, default: "" },
    duration: { type: String, default: "" },
    examLastUpdated: { type: Date, default: null },

    faqs: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
      ],
      default: [],
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: false,
    },
  },
  { timestamps: true }
);

// Clear any existing model to prevent conflicts
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product = mongoose.model("Product", productListSchema);
export default Product;
