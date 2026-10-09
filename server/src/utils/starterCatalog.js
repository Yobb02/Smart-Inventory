import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Movement from '../models/Movement.js';

export const SUPPLIERS = [
  { key: 'manila', name: 'Manila Office Supplies Co.', contactEmail: 'orders@manilaoffice.example', phone: '(02) 8285 1120', address: 'Unit 4, Batasan Complex, Quezon City' },
  { key: 'biztec', name: 'Biztec Computer Supplies', contactEmail: 'sales@biztecph.example', phone: '(02) 8749 3311', address: 'Gilmore Highway, Quezon City' },
  { key: 'province', name: 'Province Print & Paper', contactEmail: 'info@provinceprint.example', phone: '(033) 433 1188', address: 'San Roque, Iloilo City' },
  { key: 'harbor', name: 'Harbor Packaging Supply', contactEmail: 'orders@harborpack.example', phone: '(033) 550 2140', address: 'Pawod, La Paz, Iloilo City' }
];

export const PRODUCTS = [
  { sku: 'OFC-1001', name: 'A4 Bond Paper 80gsm (Ream)', description: 'Standard ream for printing and recording forms.', unitCost: 245, reorderLevel: 20, binLocation: 'A1-03', supplier: 'province', opening: 60, history: [{ type: 'OUT', quantity: 12, daysAgo: 20, reason: 'Monthly document printing' }, { type: 'OUT', quantity: 8, daysAgo: 11, reason: 'Records section request' }, { type: 'IN', quantity: 24, daysAgo: 6, reason: 'Replenishment from Province Print & Paper' }] },
  { sku: 'OFC-1002', name: 'Short Bond Paper 80gsm (Ream)', description: 'For logbooks and short-form outputs.', unitCost: 225, reorderLevel: 15, binLocation: 'A1-04', supplier: 'province', opening: 30, history: [{ type: 'OUT', quantity: 6, daysAgo: 14, reason: 'Admission forms run' }, { type: 'OUT', quantity: 10, daysAgo: 4, reason: 'Seminar handouts' }] },
  { sku: 'OFC-1003', name: 'Legal Folder Cartons (Box of 100)', description: 'Empty cartons for legal-size folders.', unitCost: 480, reorderLevel: 8, binLocation: 'A1-06', supplier: 'province', opening: 12, history: [{ type: 'OUT', quantity: 4, daysAgo: 9, reason: 'Archiving project files' }] },
  { sku: 'OFC-1004', name: 'Black Ballpen (Box of 12)', description: 'General-purpose office pens.', unitCost: 95, reorderLevel: 10, binLocation: 'A2-01', supplier: 'manila', opening: 24, history: [{ type: 'OUT', quantity: 6, daysAgo: 18, reason: 'Front desk issuance' }, { type: 'OUT', quantity: 4, daysAgo: 7, reason: 'Staff replenishment' }] },
  { sku: 'OFC-1005', name: 'Sticky Notes 76x76mm (Pack)', description: 'Assorted pastel pads.', unitCost: 55, reorderLevel: 12, binLocation: 'A2-05', supplier: 'manila', opening: 18, history: [{ type: 'OUT', quantity: 8, daysAgo: 13, reason: 'Planning board activity' }, { type: 'OUT', quantity: 10, daysAgo: 2, reason: 'Inventory count tagging' }] },
  { sku: 'OFC-1006', name: 'Whiteboard Marker Set (4 Colors)', description: 'Low-odor markers for the activity board.', unitCost: 130, reorderLevel: 8, binLocation: 'A2-07', supplier: 'manila', opening: 15, history: [{ type: 'OUT', quantity: 3, daysAgo: 21, reason: 'Training session' }, { type: 'OUT', quantity: 4, daysAgo: 5, reason: 'Class advisory use' }] },
  { sku: 'OFC-1007', name: 'A4 Glossy Photo Paper 200gsm (Pack of 50)', description: 'For event documentation and posters.', unitCost: 320, reorderLevel: 6, binLocation: 'A1-08', supplier: 'province', opening: 10, history: [{ type: 'OUT', quantity: 2, daysAgo: 16, reason: 'Awardee certificates' }] },
  { sku: 'IT-2001', name: 'Wireless Mouse (Logitech M171)', description: 'Replacement peripheral for the workstations.', unitCost: 520, reorderLevel: 8, binLocation: 'B1-02', supplier: 'biztec', opening: 14, history: [{ type: 'OUT', quantity: 5, daysAgo: 19, reason: 'Lab workstation upgrade' }, { type: 'OUT', quantity: 2, daysAgo: 8, reason: 'Lost unit replacement' }] },
  { sku: 'IT-2002', name: 'USB Flash Drive 32GB', description: 'SanDisk / Kingston assortment.', unitCost: 295, reorderLevel: 10, binLocation: 'B1-04', supplier: 'biztec', opening: 26, history: [{ type: 'OUT', quantity: 8, daysAgo: 12, reason: 'Backups for the records section' }] },
  { sku: 'IT-2003', name: 'CAT6 LAN Cable 3m', description: 'Patch cable, factory crimped.', unitCost: 145, reorderLevel: 12, binLocation: 'B1-06', supplier: 'biztec', opening: 30, history: [{ type: 'OUT', quantity: 10, daysAgo: 17, reason: 'Network re-cabling' }, { type: 'IN', quantity: 20, daysAgo: 3, reason: 'Purchase order released' }] },
  { sku: 'IT-2004', name: 'DDR4 RAM Module 8GB', description: '2666MHz module for the lab units.', unitCost: 1590, reorderLevel: 5, binLocation: 'B2-01', supplier: 'biztec', opening: 9, history: [{ type: 'OUT', quantity: 4, daysAgo: 10, reason: 'Memory upgrade batch' }] },
  { sku: 'IT-2005', name: '8-Port Gigabit Switch', description: 'Desktop switch for the annex room.', unitCost: 1250, reorderLevel: 3, binLocation: 'B2-03', supplier: 'biztec', opening: 5, history: [{ type: 'OUT', quantity: 3, daysAgo: 15, reason: 'Annex network deployment' }] },
  { sku: 'IT-2006', name: 'Toner Cartridge HP 107A (Black)', description: 'For the admin printing unit.', unitCost: 1180, reorderLevel: 6, binLocation: 'B2-05', supplier: 'biztec', opening: 10, history: [{ type: 'OUT', quantity: 4, daysAgo: 22, reason: 'Quarterly printing load' }, { type: 'OUT', quantity: 6, daysAgo: 1, reason: 'Emergency replacement' }] },
  { sku: 'IT-2007', name: 'microSD Card 16GB', description: 'For the CCTV and camera units.', unitCost: 380, reorderLevel: 6, binLocation: 'B1-08', supplier: 'biztec', opening: 12, history: [{ type: 'OUT', quantity: 4, daysAgo: 6, reason: 'CCTV storage swap' }] },
  { sku: 'WH-3001', name: 'Bubble Wrap Roll 50cm', description: 'Protective packing for outgoing items.', unitCost: 210, reorderLevel: 10, binLocation: 'C1-01', supplier: 'harbor', opening: 28, history: [{ type: 'OUT', quantity: 6, daysAgo: 20, reason: 'Fragile shipment packing' }] },
  { sku: 'WH-3002', name: 'Corrugated Box Small 20x14x8cm', description: 'Standard outbound box.', unitCost: 32, reorderLevel: 30, binLocation: 'C1-02', supplier: 'harbor', opening: 80, history: [{ type: 'OUT', quantity: 40, daysAgo: 14, reason: 'Batch dispatch' }, { type: 'OUT', quantity: 25, daysAgo: 2, reason: 'Weekly deliveries' }] },
  { sku: 'WH-3003', name: 'Packing Tape Clear 2in', description: 'Roll, carton sealing.', unitCost: 68, reorderLevel: 15, binLocation: 'C1-04', supplier: 'harbor', opening: 36, history: [{ type: 'OUT', quantity: 14, daysAgo: 9, reason: 'Carton sealing supply' }] }
];

export async function attachStarterCatalog(owner) {
  const byName = new Map((await Supplier.find({ owner }, 'name').lean()).map(s => [s.name, s._id]));
  const missing = SUPPLIERS.filter(s => !byName.has(s.name)).map(({ key, ...data }) => ({ owner, ...data }));
  if (missing.length) for (const doc of await Supplier.insertMany(missing)) byName.set(doc.name, doc._id);
  const supplierOf = key => byName.get(SUPPLIERS.find(s => s.key === key).name) || null;

  const owned = new Set((await Product.find({ owner }, 'sku').lean()).map(p => String(p.sku).toUpperCase()));
  const specs = PRODUCTS.filter(p => !owned.has(p.sku));
  if (!specs.length) return { products: 0, movements: 0, suppliers: SUPPLIERS.length };

  const ledger = specs.map(spec => {
    let stock = spec.opening;
    const steps = [{ type: 'IN', quantity: spec.opening, before: 0, after: spec.opening, reason: 'Opening quantity', daysAgo: 30 }];
    for (const h of [...spec.history].sort((a, b) => b.daysAgo - a.daysAgo)) {
      const after = h.type === 'IN' ? stock + h.quantity : stock - h.quantity;
      steps.push({ ...h, before: stock, after });
      stock = after;
    }
    return { spec, steps, quantity: stock };
  });

  const products = await Product.insertMany(ledger.map(({ spec, quantity }) => ({
    owner, sku: spec.sku, name: spec.name, description: spec.description, unitCost: spec.unitCost,
    reorderLevel: spec.reorderLevel, binLocation: spec.binLocation, quantity, supplier: supplierOf(spec.supplier), active: true
  })));
  const ago = days => new Date(Date.now() - days * 864e5);
  const movements = ledger.flatMap((entry, i) => entry.steps.map(step => ({
    owner, user: owner, product: products[i]._id, type: step.type, quantity: step.quantity,
    before: step.before, after: step.after, reason: step.reason, createdAt: ago(step.daysAgo), updatedAt: ago(step.daysAgo)
  })));
  await Movement.collection.insertMany(movements);
  return { products: products.length, movements: movements.length, suppliers: SUPPLIERS.length };
}
