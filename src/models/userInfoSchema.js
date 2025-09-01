const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userInfoSchema = new mongoose.Schema({
  authUserId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to authUsers _id
  email: { type: String, required: true, unique: true },
password: {
  type: String,required: true,select: false,  },
  name: { type: String },
  role: { type: String, enum: ['guest', 'student', 'admin'], default: 'guest' },
  subscription: { type: String, default: 'no' },
  provider: { type: String, default: 'credentials' },
  providerId: { type: String },
  isVerified: { type: Boolean, default: false },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  dob: { type: Date },
  gender: { type: String },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

userInfoSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userInfoSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.models.UserInfo || mongoose.model('UserInfo', userInfoSchema);