import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Movement from '../models/Movement.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

const email = process.argv[2];
if (!email) { console.error('Usage: npm run claim:legacy -- your@email.com'); process.exit(1); }
await connectDB();
const user = await User.findOne({ email: email.toLowerCase().trim() });
if (!user) { console.error('User not found. Create the account first.'); process.exit(1); }
for (const Model of [Product, Supplier, Movement, PurchaseOrder]) await Model.updateMany({ owner: { $exists: false } }, { $set: { owner: user._id } });
console.log(`Legacy records without an owner were assigned to ${user.email}.`);
await mongoose.disconnect();
