import express from 'express';
import Product from '../models/Product.js';
import Movement from '../models/Movement.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
const owner = req => ({ owner: req.user._id });

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    const filter = { ...owner(req) };
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { sku: { $regex: q, $options: 'i' } }];
    res.json(await Product.find(filter).populate({ path: 'supplier', match: { owner: req.user._id }, select: 'name' }).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body, owner: req.user._id, sku: String(req.body.sku || '').trim().toUpperCase() };
    if (data.supplier) {
      const Supplier = (await import('../models/Supplier.js')).default;
      const s = await Supplier.findOne({ _id: data.supplier, owner: req.user._id });
      if (!s) data.supplier = null;
    }
    const p = await Product.create(data);
    if (Number(p.quantity) > 0) await Movement.create({ owner: req.user._id, product: p._id, type: 'IN', quantity: p.quantity, before: 0, after: p.quantity, reason: 'Opening quantity', user: req.user._id });
    res.status(201).json(p);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const p = await Product.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { ...req.body, sku: String(req.body.sku || '').trim().toUpperCase() }, { new: true, runValidators: true }).populate('supplier', 'name');
    if (!p) return res.status(404).json({ message: 'Product not found in your account.' });
    res.json(p);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const p = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!p) return res.status(404).json({ message: 'Product not found in your account.' });
    await Movement.deleteMany({ owner: req.user._id, product: p._id });
    res.json({ message: 'Product deleted.' });
  } catch (e) { next(e); }
});

router.post('/:id/movement', async (req, res, next) => {
  try {
    const { type, quantity, reason = '' } = req.body;
    const qty = Number(quantity);
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type) || !Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: 'Enter a valid stock movement.' });
    const p = await Product.findOne({ _id: req.params.id, owner: req.user._id });
    if (!p) return res.status(404).json({ message: 'Product not found in your account.' });
    const before = p.quantity;
    const after = type === 'IN' ? before + qty : type === 'OUT' ? before - qty : qty;
    if (after < 0) return res.status(400).json({ message: 'Stock cannot go below zero.' });
    p.quantity = after;
    await p.save();
    const m = await Movement.create({ owner: req.user._id, product: p._id, type, quantity: qty, before, after, reason, user: req.user._id });
    res.json({ product: p, movement: m, lowStock: after <= p.reorderLevel });
  } catch (e) { next(e); }
});

router.get('/:id/movements', async (req, res, next) => {
  try {
    const p = await Product.findOne({ _id: req.params.id, owner: req.user._id });
    if (!p) return res.status(404).json({ message: 'Product not found in your account.' });
    res.json(await Movement.find({ product: p._id, owner: req.user._id }).populate('user', 'name').sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

export default router;
