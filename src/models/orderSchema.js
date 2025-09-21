import mongoose from "mongoose"


const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'authUsers', // Changed to authUsers
    required: true 
  },
  courseDetails: [{
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    sapExamCode: String,
    category: String,
    sku: String,
    samplePdfUrl: String,
    mainPdfUrl: String,
    slug: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: { 
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'paypal']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  }
});

orderSchema.pre('save', async function(next) {
  try {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const latestOrder = await this.constructor.findOne(
        { orderNumber: new RegExp(`^${year}${month}${day}`) },
        { orderNumber: 1 },
        { sort: { orderNumber: -1 } }
      );

      let sequence = '0001';
      if (latestOrder && latestOrder.orderNumber) {
        const lastSequence = parseInt(latestOrder.orderNumber.slice(-4));
        sequence = String(lastSequence + 1).padStart(4, '0');
      }

      this.orderNumber = `${year}${month}${day}${sequence}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders');