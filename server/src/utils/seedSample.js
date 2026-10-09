import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { attachStarterCatalog } from './starterCatalog.js';

const arg = name => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
};
const check = process.argv.includes('--check');
const filter = (arg('user') || arg('email') || '').toLowerCase();

await connectDB();
const all = await User.find().sort({ createdAt: 1 });
if (!all.length) {
  console.log('No user accounts yet. Register in the app first, then run: npm run seed:demo');
  process.exit(0);
}
const targets = filter
  ? all.filter(u => u.email.toLowerCase().includes(filter) || u.name.toLowerCase().includes(filter))
  : process.argv.includes('--all') ? all : [];

console.log(`${filter ? 'Matching' : 'All'} accounts: ${all.length}, selected: ${targets.length}`);
for (const u of all) console.log(`  ${u.name.padEnd(24)} ${u.email.padEnd(28)} ${String(u.role).padEnd(6)} products: ${await Product.countDocuments({ owner: u._id })}`);
if (!targets.length) {
  console.log('\nNothing selected. Re-run with one of:');
  console.log('  npm run seed:demo -- --user <name or email>   # one account');
  console.log('  npm run seed:demo -- --all                    # every account');
  console.log('  npm run seed:demo -- --check                  # list accounts only');
  process.exit(0);
}
if (check) { console.log('Nothing was written (--check).'); process.exit(0); }

for (const u of targets) {
  const r = await attachStarterCatalog(u._id);
  const total = await Product.countDocuments({ owner: u._id });
  const alerts = await Product.countDocuments({ owner: u._id, active: true, $expr: { $lte: ['$quantity', '$reorderLevel'] } });
  console.log(`✓ ${u.name} (${u.email}) — added ${r.products} products and ${r.movements} movements · now ${total} products, ${alerts} at or below reorder level`);
}
await mongoose.disconnect();
