import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "authUsers",
    required: true,
  },

  // ✅ Store COMPLETE product details for each item
  courseDetails: [
    {
      // Core IDs
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productId: String,
      
      // Names
      name: { type: String, required: true },
      title: String,
      
      // Pricing - ALL variants
      price: { type: Number, required: true },
      priceINR: Number,
      priceUSD: Number,
      dumpsPriceInr: String,
      dumpsPriceUsd: String,
      dumpsMrpInr: String,
      dumpsMrpUsd: String,
      comboPriceInr: String,
      comboPriceUsd: String,
      comboMrpInr: String,
      comboMrpUsd: String,
      
      // Product details
      category: String,
      code: String,
      sapExamCode: String,
      sku: String,
      slug: String,
      
      // ✅ CRITICAL: PDF URLs - These were missing!
      imageUrl: String,
      samplePdfUrl: String,
      mainPdfUrl: String,
      
      // Exam details
      duration: String,
      eachQuestionMark: String,
      numberOfQuestions: String,
      passingScore: String,
      
      // Instructions
      mainInstructions: String,
      sampleInstructions: String,
      
      // Descriptions
      Description: String,
      longDescription: String,
      
      // Status and action
      status: String,
      action: String,
      
      // SEO
      metaTitle: String,
      metaKeywords: String,
      metaDescription: String,
      schema: String,
      
      // Type and quantity
      type: { type: String, default: "exam" },
      quantity: { type: Number, default: 1 },
    },
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  discount: {
    type: Number,
    default: 0,
  },

  paymentId: {
    type: String,
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
    enum: ["razorpay", "paypal"],
  },

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },

  purchaseDate: {
    type: Date,
    default: Date.now,
  },

  currency: {
    type: String,
    required: true,
    default: "INR",
  },
});

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  try {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const latestOrder = await this.constructor.findOne(
        { orderNumber: new RegExp(`^${year}${month}${day}`) },
        { orderNumber: 1 },
        { sort: { orderNumber: -1 } }
      );

      let sequence = "0001";
      if (latestOrder && latestOrder.orderNumber) {
        const lastSequence = parseInt(latestOrder.orderNumber.slice(-4));
        sequence = String(lastSequence + 1).padStart(4, "0");
      }

      this.orderNumber = `${year}${month}${day}${sequence}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema, "orders");