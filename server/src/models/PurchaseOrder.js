import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, min: 1, required: true },
  unitCost: { type: Number, min: 0, required: true }
}, { _id: false });
const poSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  number: { type: String, unique: true, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  items: [itemSchema],
  status: { type: String, enum: ['DRAFT', 'PENDING', 'RECEIVED', 'CANCELLED'], default: 'PENDING' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('PurchaseOrder', poSchema);
