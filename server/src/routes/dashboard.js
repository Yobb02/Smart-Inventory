import express from 'express';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Movement from '../models/Movement.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
const owner = req => ({ owner: req.user._id });
router.get('/stats', async (req, res, next) => {
  try {
    const o = owner(req);
    const [products, suppliers, movements, pendingPOs, lowStock] = await Promise.all([
      Product.countDocuments({ ...o, active: true }), Supplier.countDocuments(o), Movement.countDocuments(o), PurchaseOrder.countDocuments({ ...o, status: 'PENDING' }), Product.countDocuments({ ...o, active: true, $expr: { $lte: ['$quantity', '$reorderLevel'] } })
    ]);
    const recent = await Movement.find(o).populate('product', 'name sku').populate('user', 'name').sort({ createdAt: -1 }).limit(8);
    res.json({ products, suppliers, movements, pendingPOs, lowStock, recent });
  } catch (e) { next(e); }
});
router.get('/alerts', async (req, res, next) => { try { res.json(await Product.find({ ...owner(req), active: true, $expr: { $lte: ['$quantity', '$reorderLevel'] } }).populate('supplier', 'name').sort({ quantity: 1 })); } catch (e) { next(e); } });
router.get('/report.csv', async (req, res, next) => {
  try {
    const ps = await Product.find(owner(req)).populate({ path: 'supplier', match: { owner: req.user._id }, select: 'name' }).sort({ sku: 1 });
    const esc = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    let csv = 'SKU,Product,Quantity,Reorder Level,Unit Cost,Bin Location,Supplier\n';
    for (const p of ps) csv += [p.sku, p.name, p.quantity, p.reorderLevel, p.unitCost, p.binLocation, p.supplier?.name || ''].map(esc).join(',') + '\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="smart-inventory-report.csv"');
    res.send(csv);
  } catch (e) { next(e); }
});
export default router;
