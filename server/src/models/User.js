import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','staff'], default: 'staff' },
  avatar: {
    image: { type: String, default: '' },
    icon: { type: String, default: 'UserRound' },
    color: { type: String, default: '#3567ff' }
  },
  settings: {
    systemName: { type: String, default: 'Smart Inventory' },
    language: { type: String, default: 'en-PH' },
    timeZone: { type: String, default: 'Asia/Manila' },
    notifyLowStock: { type: Boolean, default: true },
    notifyOutOfStock: { type: Boolean, default: true },
    defaultReorderLevel: { type: Number, default: 5 },
    defaultUnit: { type: String, default: 'pcs' }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
