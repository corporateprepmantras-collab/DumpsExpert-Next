import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "authUsers",
      required: true,
    },
    orderNumber: {
      type: String,
      // ✅ REMOVED: unique: true (preventing duplicate index warning)
    },
    courseDetails: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: {
          type: String,
          required: true,
        },
        code: String,
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        duration: String,
        numberOfQuestions: Number,
        passingScore: String,
        status: {
          type: String,
          default: "active",
        },
        mainInstructions: String,
        sampleInstructions: String,
        slug: String,
        imageUrl: String,
        type: {
          type: String,
          default: "exam",
        },
        mainPdfUrl: {
          type: String,
          default: "",
        },
        expiryDate: {
          type: Date,
          required: true,
        },
        isExpired: {
          type: Boolean,
          default: false,
        },
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
    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["razorpay", "paypal", "stripe"],
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

// ✅ Index for efficient queries (FIXED - unique moved here)
orderSchema.index({ user: 1, purchaseDate: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true }); // ✅ Unique constraint here only
orderSchema.index({ expiryDate: 1 });
orderSchema.index({ "courseDetails.expiryDate": 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
