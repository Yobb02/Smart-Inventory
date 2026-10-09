import express from 'express';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.get('/', async (req, res, next) => { try { res.json(await PurchaseOrder.find({ owner: req.user._id }).populate('supplier', 'name').populate('items.product', 'sku name').populate('createdBy', 'name').sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.post('/auto-restock', adminOnly, async (req, res, next) => {
  try {
    const low = await Product.find({ owner: req.user._id, active: true, $expr: { $lte: ['$quantity', '$reorderLevel'] } });
    if (!low.length) return res.status(400).json({ message: 'No low-stock products.' });
    const groups = new Map();
    for (const p of low) { const key = String(p.supplier || 'none'); if (!groups.has(key)) groups.set(key, []); groups.get(key).push({ product: p._id, quantity: Math.max(1, p.reorderLevel * 2 - p.quantity), unitCost: p.unitCost }); }
    const count = await PurchaseOrder.countDocuments();
    const created = []; let i = 0;
    for (const [supplier, items] of groups) { created.push(await PurchaseOrder.create({ owner: req.user._id, number: `PO-${new Date().getFullYear()}-${String(count + i + 1).padStart(4, '0')}`, supplier: supplier === 'none' ? null : supplier, items, createdBy: req.user._id, notes: 'Generated from low-stock alert' })); i++; }
    res.status(201).json(created);
  } catch (e) { next(e); }
});
router.patch('/:id/status', async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!po) return res.status(404).json({ message: 'Purchase order not found.' });
    po.status = req.body.status; await po.save();
    if (po.status === 'RECEIVED') for (const item of po.items) { const p = await Product.findOne({ _id: item.product, owner: req.user._id }); if (p) { p.quantity += item.quantity; await p.save(); await (await import('../models/Movement.js')).default.create({ owner: req.user._id, product: p._id, type: 'IN', quantity: item.quantity, before: p.quantity - item.quantity, after: p.quantity, reason: `Received ${po.number}`, user: req.user._id }); } }
    res.json(po);
  } catch (e) { next(e); }
});
export default router;
