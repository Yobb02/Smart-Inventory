import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Create server/.env and add your MongoDB Atlas connection string.');
  mongoose.connection.on('connected',()=>console.log('✓ MongoDB connected'));
  mongoose.connection.on('error',(err)=>console.error('MongoDB error:',err.message));
  await mongoose.connect(uri,{serverSelectionTimeoutMS:10000});
  // Older builds used a global unique SKU index. Drop it so SKU uniqueness is per account.
  try { await mongoose.connection.collection('products').dropIndex('sku_1'); console.log('✓ Removed legacy global SKU index'); } catch (e) { if (e.codeName !== 'IndexNotFound') console.warn('Legacy SKU index check:', e.message); }
}
