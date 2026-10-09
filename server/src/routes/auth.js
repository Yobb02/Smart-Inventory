import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { attachStarterCatalog } from '../utils/starterCatalog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const AVATAR_ICONS = ['UserRound', 'Boxes', 'Package', 'Truck', 'Activity', 'ShieldCheck'];
const AVATAR_COLORS = ['#3567ff', '#22c7df', '#10a778', '#d18a1d', '#df5360', '#7c5cff'];
const LANGUAGES = ['en-PH', 'en-US', 'en-GB', 'fil-PH'];
const UNITS = ['pcs', 'item', 'box', 'carton', 'kg', 'litre', 'metre', 'ream'];
const SETTINGS_DEFAULTS = { systemName: 'Smart Inventory', language: 'en-PH', timeZone: 'Asia/Manila', notifyLowStock: true, notifyOutOfStock: true, defaultReorderLevel: 5, defaultUnit: 'pcs' };
const DATA_IMAGE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/;
const plain = value => value && typeof value.toObject === 'function' ? value.toObject() : value || {};
const knownTimeZone = zone => { try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); return true; } catch { return false; } };
const cleanSettings = raw => {
  const s = plain(raw);
  const name = String(s.systemName ?? '').trim();
  const level = Number.parseInt(s.defaultReorderLevel, 10);
  return {
    systemName: name && name.length <= 40 ? name : SETTINGS_DEFAULTS.systemName,
    language: LANGUAGES.includes(s.language) ? s.language : SETTINGS_DEFAULTS.language,
    timeZone: typeof s.timeZone === 'string' && s.timeZone.length <= 64 && knownTimeZone(s.timeZone) ? s.timeZone : SETTINGS_DEFAULTS.timeZone,
    notifyLowStock: Boolean(s.notifyLowStock),
    notifyOutOfStock: Boolean(s.notifyOutOfStock),
    defaultReorderLevel: Number.isInteger(level) && level >= 0 && level <= 9999 ? level : SETTINGS_DEFAULTS.defaultReorderLevel,
    defaultUnit: UNITS.includes(s.defaultUnit) ? s.defaultUnit : SETTINGS_DEFAULTS.defaultUnit
  };
};
const publicUser = user => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
  avatar: { image: user.avatar?.image || '', icon: AVATAR_ICONS.includes(user.avatar?.icon) ? user.avatar.icon : 'UserRound', color: AVATAR_COLORS.includes(user.avatar?.color) ? user.avatar.color : '#3567ff' },
  settings: cleanSettings({ ...SETTINGS_DEFAULTS, ...plain(user.settings) })
});
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'That email is already registered. Please sign in.' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'staff' });
    // New workspaces start with the stock catalog so the Inventory picker is never empty.
    await attachStarterCatalog(user._id).catch(e => console.warn('Starter catalog skipped:', e.message));
    // Deliberately do NOT issue a token here. Registration must return the user to Login.
    res.status(201).json({ message: 'Account created successfully. Please sign in to continue.', user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: tokenFor(user._id), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/profile', protect, async (req, res, next) => {
  try {
    const name = String(req.body.name ?? req.user.name).trim();
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    if (name.length > 60) return res.status(400).json({ message: 'Name must be 60 characters or fewer.' });
    const sent = req.body.avatar || {};
    const image = typeof sent.image === 'string' ? sent.image.trim().replace(/\s/g, '') : req.user.avatar?.image || '';
    if (image && !DATA_IMAGE.test(image)) return res.status(400).json({ message: 'That profile image is not supported. Use a PNG, JPG or WEBP file.' });
    if (image.length > 300000) return res.status(400).json({ message: 'Profile image is too large. Please choose a smaller photo.' });
    const account = await User.findById(req.user._id);
    if (!account) return res.status(401).json({ message: 'Your account no longer exists.' });
    account.name = name;
    account.avatar = {
      image,
      icon: AVATAR_ICONS.includes(sent.icon) ? sent.icon : account.avatar?.icon || 'UserRound',
      color: AVATAR_COLORS.includes(sent.color) ? sent.color : account.avatar?.color || '#3567ff'
    };
    await account.save();
    res.json({ message: 'Profile updated successfully.', user: publicUser(account) });
  } catch (e) { next(e); }
});

router.put('/settings', protect, async (req, res, next) => {
  try {
    const account = await User.findById(req.user._id);
    if (!account) return res.status(401).json({ message: 'Your account no longer exists.' });
    const incoming = req.body || {};
    if (incoming.systemName !== undefined) {
      const systemName = String(incoming.systemName).trim();
      if (!systemName) return res.status(400).json({ message: 'System name is required.' });
      if (systemName.length > 40) return res.status(400).json({ message: 'System name must be 40 characters or fewer.' });
      incoming.systemName = systemName;
    }
    if (incoming.defaultReorderLevel !== undefined) {
      const level = Number(incoming.defaultReorderLevel);
      if (!Number.isInteger(level) || level < 0 || level > 9999) return res.status(400).json({ message: 'Default reorder level must be a whole number between 0 and 9999.' });
    }
    account.settings = cleanSettings({ ...SETTINGS_DEFAULTS, ...plain(account.settings), ...incoming });
    await account.save();
    res.json({ message: 'Settings saved successfully.', user: publicUser(account) });
  } catch (e) { next(e); }
});

router.put('/password', protect, async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const account = await User.findById(req.user._id);
    if (!account) return res.status(401).json({ message: 'Your account no longer exists.' });
    if (!(await bcrypt.compare(currentPassword, account.password))) return res.status(400).json({ message: 'Your current password is incorrect.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    if (await bcrypt.compare(newPassword, account.password)) return res.status(400).json({ message: 'New password must be different from the current one.' });
    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (e) { next(e); }
});

export default router;
