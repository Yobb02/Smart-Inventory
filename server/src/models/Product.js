import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sku: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  unitCost: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 5 },
  binLocation: { type: String, default: '' },
  quantity: { type: Number, min: 0, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  active: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ owner: 1, sku: 1 }, { unique: true });
export default mongoose.model('Product', productSchema);
