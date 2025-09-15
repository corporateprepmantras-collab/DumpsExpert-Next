import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"BlogCategory",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['publish', 'unpublish'],
    default: 'unpublish',
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

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);