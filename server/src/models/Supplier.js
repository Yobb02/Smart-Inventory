import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  contactEmail: { type: String, default: '', trim: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
