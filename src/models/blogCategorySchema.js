import mongoose from 'mongoose';

const blogCategorySchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
  },
  metaTitle: {
    type: String,
    required: true,
  },
  metaKeywords: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  schema: {
    type: String,
    default: '{}',
    validate: {
      validator: function(v) {
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid JSON format'
    }
  }
}, { timestamps: true });

export default mongoose.models.BlogCategory || mongoose.model('BlogCategory', blogCategorySchema);