const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  type: { type: String, required: true, enum: ['regular', 'online', 'combo'] },
  imageUrl: { type: String },
  samplePdfUrl: { type: String },
  mainPdfUrl: { type: String },
});

const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'authUsers', 
    required: true,
    index: true
  },
  items: [cartItemSchema],
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Create a compound index for efficient lookups
cartSchema.index({ user: 1, 'items.productId': 1, 'items.type': 1 });

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);