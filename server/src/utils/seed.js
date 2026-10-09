import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

await connectDB();
const email = process.env.SEED_ADMIN_EMAIL || 'admin@sims.local';
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
let user = await User.findOne({ email });
if (!user) user = await User.create({ name: 'System Administrator', email, password: await bcrypt.hash(password, 10), role: 'admin' });
console.log(`Admin ready: ${user.email}`);
await mongoose.disconnect();
