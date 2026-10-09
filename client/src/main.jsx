import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowDownToLine, ArrowRight, ArrowUpFromLine, BarChart3, Bell, Boxes, Camera, Check, ChevronDown, ChevronRight, CircleAlert, CircleCheck, Database, Download, Eye, EyeOff, FileText, History, KeyRound, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Truck, UserRound, X } from 'lucide-react';
import { api, downloadReport, logout, saveSession, saveUser, user } from './lib/api';
import './styles.css';

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const AVATAR_ICONS = { UserRound, Boxes, Package, Truck, Activity, ShieldCheck };
const AVATAR_COLORS = ['#3567ff', '#22c7df', '#10a778', '#d18a1d', '#df5360', '#7c5cff'];
const DEFAULT_SETTINGS = { systemName: 'Smart Inventory', language: 'en-PH', timeZone: 'Asia/Manila', notifyLowStock: true, notifyOutOfStock: true, defaultReorderLevel: 5, defaultUnit: 'pcs' };
const LANGUAGES = [['en-PH', 'English (Philippines)'], ['en-US', 'English (United States)'], ['en-GB', 'English (United Kingdom)'], ['fil-PH', 'Filipino']];
const TIME_ZONES = ['Asia/Manila', 'Asia/Singapore', 'Asia/Bangkok', 'Asia/Tokyo', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney', 'UTC'];
const UNITS = ['pcs', 'item', 'box', 'carton', 'kg', 'litre', 'metre', 'ream'];
const useSettings = () => ({ ...DEFAULT_SETTINGS, ...(useAuth().me?.settings || {}) });
const fmtDate = (value, settings) => { try { return new Intl.DateTimeFormat(settings.language || 'en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: settings.timeZone || undefined }).format(new Date(value)); } catch { return new Date(value).toLocaleString(); } };
function AuthProvider({ children }) {
  const [me, setMe] = useState(user());
  const login = data => { saveSession(data); setMe(data.user); };
  const update = profile => { saveUser(profile); setMe(profile); };
  const signout = () => { logout(); setMe(null); };
  useEffect(() => { if (!localStorage.getItem('sims_token')) return; api.get('/auth/me').then(r => update(r.data.user)).catch(() => {}); }, []);
  return <AuthContext.Provider value={{ me, login, update, signout }}>{children}</AuthContext.Provider>;
}
function Avatar({ person, size = 35, className = '' }) {
  const avatar = person?.avatar || {};
  const Icon = AVATAR_ICONS[avatar.icon];
  const style = { width: size, height: size, fontSize: Math.round(size * .42), background: avatar.image ? 'none' : avatar.color || '#3567ff' };
  if (avatar.image) return <span className={`avatar ${className}`} style={style}><img src={avatar.image} alt={`${person?.name || 'User'} profile`} /></span>;
  return <span className={`avatar ${className}`} style={style}>{Icon ? <Icon size={Math.round(size * .5)} /> : (person?.name?.[0]?.toUpperCase() || '?')}</span>;
}
function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return <div className="pw-wrap">
    <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} required />
    <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
  </div>;
}
const resizeAvatar = file => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file); const img = new Image();
  img.onload = () => {
    const side = 160, canvas = document.createElement('canvas'); canvas.width = canvas.height = side;
    const crop = Math.min(img.width, img.height);
    canvas.getContext('2d').drawImage(img, (img.width - crop) / 2, (img.height - crop) / 2, crop, crop, 0, 0, side, side);
    URL.revokeObjectURL(url); resolve(canvas.toDataURL('image/jpeg', .82));
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unreadable image file.')); };
  img.src = url;
});
function Guard({ children }) { return useAuth().me ? children : <Navigate to="/login" replace />; }
const nav = [
  ['/', 'Dashboard', LayoutDashboard], ['/inventory', 'Inventory', Boxes], ['/products', 'Products', Package], ['/suppliers', 'Suppliers', Truck], ['/movements', 'Movements', History], ['/alerts', 'Alerts', AlertTriangle], ['/reports', 'Reports', BarChart3], ['/settings', 'Settings', Settings]
];
const brandParts = name => { const parts = String(name || DEFAULT_SETTINGS.systemName).trim().toUpperCase().split(/\s+/); return [parts[0], parts.slice(1).join(' ')]; };
function Shell({ children }) {
  const { me, signout } = useAuth(); const settings = useSettings(); const [mobile, setMobile] = useState(false); const loc = useLocation();
  const current = nav.find(n => n[0] === loc.pathname);
  const [brandOne, brandTwo] = brandParts(settings.systemName);
  useEffect(() => { document.title = settings.systemName || DEFAULT_SETTINGS.systemName; }, [settings.systemName]);
  return <div className="app-shell">
    <div className="aurora a1"/><div className="aurora a2"/><div className="grain"/>
    <aside className={mobile ? 'sidebar show' : 'sidebar'}>
      <div className="side-brand"><div className="logo-orbit"><Boxes size={21}/><i/></div><div><strong>{brandOne}{brandTwo && <span> {brandTwo}</span>}</strong><small>Inventory Intelligence</small></div><button className="close-mobile" onClick={() => setMobile(false)}><X/></button></div>
      <div className="workspace-tag"><span/> WORKSPACE</div>
      <nav className="main-nav">{nav.map(([path, label, Icon]) => <Link key={path} to={path} onClick={() => setMobile(false)} className={loc.pathname === path ? 'nav-item active' : 'nav-item'}><span className="nav-icon"><Icon size={17}/></span><span>{label}</span>{label === 'Alerts' && <AlertBadge/>}{loc.pathname === path && <ChevronRight className="nav-chevron" size={15}/>}</Link>)}</nav>
      <div className="side-footer"><div className="db-pill"><span className="live-dot"/> MongoDB Atlas <em>LIVE</em></div><Link to="/settings" className="profile-mini"><Avatar person={me} size={35}/><div><b>{me?.name}</b><small>{me?.role === 'admin' ? 'Administrator' : 'Staff account'}</small></div></Link><button className="logout-btn" onClick={signout}><LogOut size={16}/> Sign out</button></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="menu-btn" onClick={() => setMobile(true)}><Menu/></button><div className="breadcrumbs"><span>{settings.systemName.toUpperCase()}</span><ChevronRight size={13}/><b>{current?.[1] || 'Dashboard'}</b></div><div className="top-right"><div className="stack-badge"><span className="live-dot"/> MERN <i/> MongoDB</div><Link to="/settings" className="top-user-link" aria-label="Open your profile"><Avatar person={me} size={34}/></Link></div></header><div className="page-wrap">{children}</div></main>
  </div>;
}
function AlertBadge() { const settings = useSettings(); const [count, setCount] = useState(0); useEffect(() => { if (!settings.notifyLowStock) { setCount(0); return; } api.get('/dashboard/alerts').then(r => setCount(r.data.length)).catch(() => {}); }, [settings.notifyLowStock]); return count ? <span className="nav-badge">{count}</span> : null; }
function PageHead({ eyebrow, title, text, action }) { return <div className="page-head"><div><span className="eyebrow-blue">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>; }
function Empty({ icon: Icon = Boxes, title = 'Nothing here yet.', text = 'Add your first record to begin.' }) { return <div className="empty-state"><div className="empty-icon"><Icon size={20}/></div><b>{title}</b><span>{text}</span></div>; }
function Modal({ title, subtitle, onClose, children }) { return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal-card"><div className="modal-head"><div><span>WORKSPACE ACTION</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button onClick={onClose}><X/></button></div>{children}</div></div>; }

function Login() {
  const { login } = useAuth(); const navTo = useNavigate();
  useEffect(() => { document.title = `${DEFAULT_SETTINGS.systemName} — Sign in`; }, []);
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(''); const [session, setSession] = useState(null);
  useEffect(() => { if (!session) return; const t = setTimeout(() => { login(session); navTo('/inventory'); }, 1500); return () => clearTimeout(t); }, [session]);
  const submit = async e => { e.preventDefault(); setError(''); setNotice(''); setBusy(true); setPhase('checking'); try { const r = await api.post(`/auth/${mode === 'login' ? 'login' : 'register'}`, form); if (mode === 'register') { setPhase(''); setBusy(false); setMode('login'); setForm({ name: '', email: form.email, password: '' }); setNotice('Account created successfully. Please sign in with your new account.'); } else { setPhase('granted'); setSession(r.data); } } catch (err) { setPhase(''); setBusy(false); setError(err.response?.data?.message || (err.code === 'ERR_NETWORK' ? 'Backend is offline. Start the server with npm run dev.' : 'Unable to continue.')); } };
  return <div className="auth-page"><div className="auth-stars"/><div className="auth-light light-one"/><div className="auth-light light-two"/>
    <div className="auth-layout"><section className="hero-copy"><div className="hero-brand"><div className="logo-orbit big"><Boxes size={27}/></div><div><b>SMART<span>INV</span></b><small>SMART INVENTORY SYSTEM</small></div></div><div className="hero-label"><Sparkles size={14}/> YOUR STOCK, ONE WORKFLOW</div><h1>From <span>record</span> to <span>action.</span></h1><p>Follow one simple flow: authenticate, manage products, move stock, watch alerts, update the dashboard, and download your report.</p><div className="flow-strip"><Flow n="01" icon={<UserRound/>} title="LOGIN"/><ArrowRight/><Flow n="02" icon={<Package/>} title="PRODUCTS"/><ArrowRight/><Flow n="03" icon={<Activity/>} title="STOCK IN / OUT"/><ArrowRight/><Flow n="04" icon={<AlertTriangle/>} title="LOW-STOCK ALERT"/></div><div className="hero-points"><span><ShieldCheck size={15}/> Account-isolated data</span><span><Database size={15}/> MongoDB Atlas</span><span><CircleCheck size={15}/> Downloadable reports</span></div></section>
      <section className="login-card"><div className="login-card-top"><span className="status-chip"><i/> SECURE ACCESS</span><div className="mini-shield"><ShieldCheck size={17}/></div></div><h2>{mode === 'login' ? 'Welcome back.' : 'Create an account.'}</h2><p>{mode === 'login' ? 'Sign in to access your private inventory workspace.' : 'Your products and stock records will belong only to this account.'}</p>{error && <div className="form-error"><CircleAlert size={16}/>{error}</div>}{notice && <div className="form-success"><Check size={16}/>{notice}</div>}
        <form onSubmit={submit} className="auth-form">{mode === 'register' && <label>Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required/></label>}<label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required/></label><label>Password<PasswordInput autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}/></label><button className="auth-button" disabled={busy || !!phase}>{phase === 'checking' ? 'Verifying…' : busy ? 'Please wait…' : mode === 'login' ? 'Sign in to workspace' : 'Create account'}</button></form><button className="switch-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setNotice(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></section></div>
    {phase && <SignInEffect granted={phase === 'granted'}/>}
  </div>;
}
function SignInEffect({ granted }) { return <div className="signin-fx"><div className="fx-card"><div className={granted ? 'fx-ring done' : 'fx-ring'}><i/><i className="fx-arc"/>{granted ? <Check className="fx-check" size={30}/> : <Boxes size={25} className="fx-logo"/>}</div><b>{granted ? 'Access granted' : 'Verifying credentials'}</b><span className="fx-sub">{granted ? 'Opening your inventory workspace…' : 'Checking your email and password'}</span><div className="fx-steps">{['AUTHENTICATE', 'LOAD CATALOG', 'OPEN INVENTORY'].map((step, i) => <em key={step} className={granted ? 'fx-step on' : 'fx-step'} style={{ animationDelay: `${i * 160}ms` }}>{step}</em>)}</div><div className="fx-bar"><i className={granted ? 'full' : ''}/></div></div></div>; }
function Flow({ n, icon, title }) { return <div className="flow-step"><small>{n}</small><span>{icon}</span><b>{title}</b></div>; }

function Dashboard() {
  const settings = useSettings();
  const [stats, setStats] = useState(null); const [err, setErr] = useState('');
  const load = () => api.get('/dashboard/stats').then(r => setStats(r.data)).catch(e => setErr(e.response?.data?.message || 'Unable to load dashboard.'));
  useEffect(() => { load(); }, []); if (err) return <ErrorBox message={err} retry={load}/>; if (!stats) return <Loading/>;
  return <><PageHead eyebrow="COMMAND CENTER" title="Inventory overview" text="A live view of your own products, stock movements and alerts." action={<button className="report-button" onClick={() => downloadReport()}><Download size={17}/> Export report</button>}/><div className="stat-grid"><Stat icon={<Package/>} label="Active products" value={stats.products}/><Stat icon={<AlertTriangle/>} label="Low-stock alerts" value={stats.lowStock} tone="amber"/><Stat icon={<Truck/>} label="Suppliers" value={stats.suppliers}/><Stat icon={<History/>} label="Stock movements" value={stats.movements}/></div><div className="dashboard-grid"><section className="glass-panel activity-panel"><div className="panel-title"><div><span>ACTIVITY STREAM</span><h3>Recent inventory movements</h3></div><Link to="/movements">View all <ArrowRight size={14}/></Link></div>{stats.recent.length ? stats.recent.map(m => <div className="activity-row" key={m._id}><div className={m.type === 'OUT' ? 'activity-icon out' : 'activity-icon'}>{m.type === 'OUT' ? <ArrowDownToLine size={16}/> : <ArrowUpFromLine size={16}/>}</div><div><b>{m.product?.name || 'Product'}</b><small>{m.type} · {m.quantity} {settings.defaultUnit} · {fmtDate(m.createdAt, settings)}</small></div><strong>{m.after}</strong></div>) : <Empty icon={History} title="No movements yet." text="Stock transactions will appear here."/>}</section><section className="glass-panel flow-panel"><div className="panel-title"><div><span>YOUR WORKFLOW</span><h3>How the system works</h3></div></div><div className="workflow-list"><WorkflowItem n="01" title="LOGIN" text="Authenticate your own account."/><WorkflowItem n="02" title="PRODUCTS" text="Add, edit and view your catalog."/><WorkflowItem n="03" title="INVENTORY" text="Record Stock-In / Stock-Out and update quantity."/><WorkflowItem n="04" title="CHECK LEVEL" text="The system compares quantity with reorder level."/><WorkflowItem n="05" title="ALERT" text="Low stock appears in your alert center."/><WorkflowItem n="06" title="REPORT" text="Download your own inventory report."/></div></section></div></>;
}
function Stat({ icon, label, value, tone = '' }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div><i className="stat-glow"/></div>; }
function WorkflowItem({ n, title, text }) { return <div className="workflow-item"><b>{n}</b><div><strong>{title}</strong><small>{text}</small></div></div>; }
function Loading() { return <div className="loading-screen"><div className="loader"/><span>Loading your private workspace…</span></div>; }
function ErrorBox({ message, retry }) { return <div className="glass-panel error-box"><CircleAlert/><div><h3>Something needs attention</h3><p>{message}</p><button onClick={retry}>Try again</button></div></div>; }

function Products() {
  const settings = useSettings();
  const [items, setItems] = useState([]); const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const blank = { sku: '', name: '', unitCost: 0, reorderLevel: settings.defaultReorderLevel, quantity: 0, binLocation: '', description: '' }; const [form, setForm] = useState(blank);
  const load = () => api.get('/products', { params: q ? { q } : {} }).then(r => setItems(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load products.'));
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing(null); setForm(blank); setError(''); setOpen(true); };
  const edit = p => { setEditing(p._id); setForm({ sku: p.sku, name: p.name, unitCost: p.unitCost, reorderLevel: p.reorderLevel, quantity: p.quantity, binLocation: p.binLocation || '', description: p.description || '' }); setOpen(true); };
  const save = async e => { e.preventDefault(); setError(''); try { if (editing) await api.put(`/products/${editing}`, form); else await api.post('/products', form); setOpen(false); setForm(blank); load(); } catch (e) { setError(e.response?.data?.message || 'Could not save product.'); } };
  const remove = async id => { if (!confirm('Delete this product and its movement history?')) return; try { await api.delete(`/products/${id}`); load(); } catch (e) { setError(e.response?.data?.message || 'Could not delete product.'); } };
  return <><PageHead eyebrow="PRODUCT CATALOG" title="Products" text="Add, edit and view products. Every record belongs only to your account." action={<button className="report-button" onClick={openNew}><Plus size={17}/> New product</button>}/>{error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}<section className="glass-panel"><div className="table-toolbar"><div><span>INVENTORY LEDGER</span><h3>Your products</h3></div><div className="search-box"><Search size={16}/><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search SKU or product"/></div></div>{items.length ? <div className="table-scroll"><table><thead><tr><th>SKU</th><th>Product</th><th>Quantity ({settings.defaultUnit})</th><th>Reorder</th><th>Bin</th><th>Cost</th><th>Actions</th></tr></thead><tbody>{items.map(p => <tr key={p._id}><td><span className="sku-chip">{p.sku}</span></td><td><b>{p.name}</b><small>{p.description || 'No description'}</small></td><td><span className={p.quantity <= p.reorderLevel ? 'qty low' : 'qty'}>{p.quantity}</span></td><td>{p.reorderLevel}</td><td>{p.binLocation || '—'}</td><td>₱{Number(p.unitCost).toFixed(2)}</td><td><button className="table-action" onClick={() => edit(p)}>Edit</button><button className="table-action danger" onClick={() => remove(p._id)}>Delete</button></td></tr>)}</tbody></table></div> : <Empty icon={Package} title="No products yet." text="Click New product to start your catalog."/>}</section>{open && <ProductModal title={editing ? 'Edit product' : 'Add a new product'} form={form} setForm={setForm} editing={editing} onClose={() => setOpen(false)} onSave={save}/>}</>;
}
function ProductModal({ title, form, setForm, editing, onClose, onSave }) { return <Modal title={title} subtitle="This record will be private to the currently signed-in account." onClose={onClose}><form className="modal-form" onSubmit={onSave}><div className="two-fields"><Field label="SKU / Barcode"><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-1001" required/></Field><Field label="Product name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Wireless Mouse" required/></Field></div><div className="two-fields"><Field label="Unit cost"><input type="number" min="0" step="0.01" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })}/></Field><Field label="Reorder level"><input type="number" min="0" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })}/></Field></div><div className="two-fields"><Field label={editing ? 'Current quantity' : 'Opening quantity'}><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}/></Field><Field label="Bin location"><input value={form.binLocation} onChange={e => setForm({ ...form, binLocation: e.target.value })} placeholder="A-01"/></Field></div><Field label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional product details"/></Field><div className="modal-actions"><button type="button" className="ghost-btn" onClick={onClose}>Cancel</button><button className="report-button"><Check size={16}/>{editing ? 'Save changes' : 'Add product'}</button></div></form></Modal> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function ProductPicker({ products, selected, onSelect, unit }) {
  const box = useRef(null); const [open, setOpen] = useState(false); const [q, setQ] = useState('');
  const chosen = products.find(p => p._id === selected);
  const term = q.trim().toLowerCase();
  const matches = (term ? products.filter(p => `${p.sku} ${p.name}`.toLowerCase().includes(term)) : products).slice(0, 60);
  const pick = p => { onSelect(p._id); setOpen(false); setQ(''); };
  useEffect(() => {
    if (!open) return;
    const away = e => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  return <div className="field picker" ref={box}>
    <span>Product</span>
    <button type="button" className="picker-field" onClick={() => { setQ(''); setOpen(o => !o); }} aria-expanded={open}>
      <span className={chosen ? 'picker-value' : 'picker-placeholder'}>{chosen ? `${chosen.sku} — ${chosen.name} (Qty: ${chosen.quantity} ${unit})` : 'Select a product…'}</span>
      <ChevronDown size={15}/>
    </button>
    {open && <div className="picker-pop">
      <div className="picker-search"><Search size={15}/><input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter') { e.preventDefault(); if (matches[0]) pick(matches[0]); } }} placeholder="Search by name or SKU…"/></div>
      <div className="picker-list">{matches.length ? matches.map(p => <button type="button" key={p._id} className={p._id === selected ? 'picker-option active' : 'picker-option'} onClick={() => pick(p)}><div><b>{p.name}</b><small>{p.sku} · reorder at {p.reorderLevel}</small></div><em className={p.quantity <= p.reorderLevel ? 'low' : ''}>{p.quantity} {unit}</em></button>) : <div className="picker-empty">No product matches “{q}”.</div>}</div>
    </div>}
  </div>;
}

function Inventory() {
  const settings = useSettings();
  const [products, setProducts] = useState([]); const [selected, setSelected] = useState(''); const [type, setType] = useState('IN'); const [qty, setQty] = useState(''); const [reason, setReason] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [adding, setAdding] = useState(false); const blank = { sku: '', name: '', unitCost: 0, reorderLevel: settings.defaultReorderLevel, quantity: 0, binLocation: '', description: '' }; const [form, setForm] = useState(blank);
  const load = () => api.get('/products').then(r => setProducts(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load inventory.')); useEffect(() => { load(); }, []);
  const addProduct = async e => { e.preventDefault(); setError(''); try { const r = await api.post('/products', { ...form, reorderLevel: Number(form.reorderLevel) || 0, quantity: Number(form.quantity) || 0, unitCost: Number(form.unitCost) || 0 }); setForm(blank); setAdding(false); await load(); setSelected(r.data._id); setMessage(`${r.data.sku} was added to your catalog and selected.`); } catch (x) { setError(x.response?.data?.message || 'Could not save product.'); } };
  const submit = async e => { e.preventDefault(); setMessage(''); setError(''); if (!selected) return setError('Choose a product first.'); try { const r = await api.post(`/products/${selected}/movement`, { type, quantity: Number(qty), reason }); setMessage(`${type === 'IN' ? 'Stock-In' : 'Stock-Out'} recorded. New quantity: ${r.data.product.quantity} ${settings.defaultUnit}.`); setQty(''); setReason(''); load(); } catch (e) { setError(e.response?.data?.message || 'Could not update stock.'); } };
  return <><PageHead eyebrow="INVENTORY CONTROL" title="Stock In / Out" text="Update quantity, then the system checks the stock level against the reorder level."/><div className="inventory-layout"><section className="glass-panel transaction-card"><div className="transaction-head"><div className="transaction-orb"><Activity/></div><div><span>INVENTORY TRANSACTION</span><h3>Record a stock movement</h3></div></div>{error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}{message && <div className="inline-success"><Check size={16}/>{message}</div>}<form onSubmit={submit} className="transaction-form"><div className="product-pick"><ProductPicker products={products} selected={selected} onSelect={setSelected} unit={settings.defaultUnit}/><button type="button" className="add-product-btn" onClick={() => { setForm(blank); setAdding(true); }}><Plus size={15}/> Add product</button></div><div className="movement-toggle"><button type="button" className={type === 'IN' ? 'selected in' : ''} onClick={() => setType('IN')}><ArrowUpFromLine/> STOCK IN</button><button type="button" className={type === 'OUT' ? 'selected out' : ''} onClick={() => setType('OUT')}><ArrowDownToLine/> STOCK OUT</button></div><Field label={`Quantity (${settings.defaultUnit})`}><input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity" required/></Field><Field label="Reason"><input value={reason} onChange={e => setReason(e.target.value)} placeholder="Purchase, sale, damaged, adjustment…"/></Field><button className="report-button full"><Activity size={17}/> Update quantity & check stock</button></form></section><section className="glass-panel level-card"><div className="panel-title"><div><span>STOCK LEVEL</span><h3>Current inventory</h3></div></div>{products.length ? products.map(p => <div className="level-row" key={p._id}><div><b>{p.name}</b><small>{p.sku} · reorder at {p.reorderLevel}</small></div><div className="level-number"><strong>{p.quantity}</strong><span className={p.quantity <= p.reorderLevel ? 'low-label' : 'normal-label'}>{p.quantity <= p.reorderLevel ? 'LOW' : 'NORMAL'}</span></div></div>) : <Empty icon={Package} title="No products yet." text="Use Add product above, or open the Products page."/>}</section></div>{adding && <ProductModal title="Add a new product" subtitle="It appears in the product list right away." form={form} setForm={setForm} editing={null} onClose={() => setAdding(false)} onSave={addProduct}/>}</>;
}

function Suppliers() { const [items, setItems] = useState([]); const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', address: '' }); const [error, setError] = useState(''); const load = () => api.get('/suppliers').then(r => setItems(r.data)); useEffect(() => { load(); }, []); const add = async e => { e.preventDefault(); try { await api.post('/suppliers', form); setForm({ name: '', contactEmail: '', phone: '', address: '' }); load(); } catch (e) { setError(e.response?.data?.message || 'Could not add supplier.'); } }; const del = async id => { if (!confirm('Delete this supplier?')) return; await api.delete(`/suppliers/${id}`); load(); }; return <><PageHead eyebrow="SUPPLIER DIRECTORY" title="Suppliers" text="Manage your own supplier records for inventory operations."/>{error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}<div className="two-panel"><section className="glass-panel"><span className="panel-label">NEW SUPPLIER</span><h3>Add supplier</h3><form className="modal-form" onSubmit={add}><Field label="Supplier name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" required/></Field><Field label="Contact email"><input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="supplier@example.com"/></Field><Field label="Phone"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxxx"/></Field><Field label="Address"><textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></Field><button className="report-button"><Plus size={16}/> Add supplier</button></form></section><section className="glass-panel"><div className="panel-title"><div><span>YOUR SUPPLIERS</span><h3>Supplier list</h3></div></div>{items.length ? items.map(s => <div className="supplier-row" key={s._id}><div className="supplier-icon"><Truck size={17}/></div><div><b>{s.name}</b><small>{s.contactEmail || 'No email'} · {s.phone || 'No phone'}</small></div><button className="table-action danger" onClick={() => del(s._id)}>Delete</button></div>) : <Empty icon={Truck} title="No suppliers yet." text="Add your first supplier."/>}</section></div></>; }
function Movements() { const settings = useSettings(); const [items, setItems] = useState([]); const load = async () => { const p = await api.get('/products'); const rows = []; for (const product of p.data) { const m = await api.get(`/products/${product._id}/movements`); rows.push(...m.data.map(x => ({ ...x, product }))); } rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); setItems(rows); }; useEffect(() => { load().catch(() => {}); }, []); return <><PageHead eyebrow="AUDIT TRAIL" title="Movements" text="Every stock transaction for your account in one timeline."/><section className="glass-panel"><div className="table-scroll"><table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Before → After</th><th>Recorded by</th></tr></thead><tbody>{items.map(m => <tr key={m._id}><td>{fmtDate(m.createdAt, settings)}</td><td><b>{m.product?.name}</b><small>{m.product?.sku}</small></td><td><span className={`movement-tag ${m.type.toLowerCase()}`}>{m.type}</span></td><td>{m.quantity} {settings.defaultUnit}</td><td>{m.before} → {m.after}</td><td>{m.user?.name || 'You'}</td></tr>)}</tbody></table></div>{!items.length && <Empty icon={History} title="No movements yet." text="Your Stock-In and Stock-Out activity will appear here."/>}</section></>; }
function Alerts() { const settings = useSettings(); const [items, setItems] = useState([]); const load = () => api.get('/dashboard/alerts').then(r => setItems(r.data)).catch(() => {}); useEffect(() => { if (!settings.notifyLowStock) { setItems([]); return; } load(); }, [settings.notifyLowStock]); const visible = settings.notifyOutOfStock ? items : items.filter(p => Number(p.quantity) > 0); return <><PageHead eyebrow="ATTENTION CENTER" title="Low-stock alerts" text="This list follows your workflow: update quantity → check level → alert." action={<button className="report-button" onClick={load}><Activity size={16}/> Refresh</button>}/>{!settings.notifyLowStock ? <div className="glass-panel"><Empty icon={Bell} title="Low-stock alerts are turned off." text="Open Settings → Notification settings to turn them back on."/></div> : <section className="alert-grid">{visible.length ? visible.map(p => { const out = Number(p.quantity) <= 0; return <div className="alert-card" key={p._id}><div className="alert-card-icon"><AlertTriangle/></div><div><span>{out ? 'OUT OF STOCK' : 'LOW STOCK'}</span><h3>{p.name}</h3><p>{p.sku} · Reorder level {p.reorderLevel}</p></div><strong>{p.quantity}</strong></div>; }) : <div className="glass-panel"><Empty icon={CircleCheck} title="All stock levels are normal." text="No product is currently at or below its reorder level."/></div>}</section>}</>; }
function Reports() { const [downloading, setDownloading] = useState(false); const run = async () => { setDownloading(true); try { await downloadReport(); } catch { alert('Could not download the report. Please make sure the backend is running.'); } finally { setDownloading(false); } }; return <><PageHead eyebrow="REPORT CENTER" title="Reports" text="Download a CSV report containing only the inventory belonging to your account."/><div className="report-hero glass-panel"><div className="report-art"><FileText/></div><div><span>PRIVATE INVENTORY REPORT</span><h2>Export your current inventory</h2><p>The downloaded CSV contains SKU, product, quantity, reorder level, unit cost, bin location and supplier.</p><button className="report-button" onClick={run} disabled={downloading}><Download size={17}/>{downloading ? 'Preparing…' : 'Download CSV report'}</button></div></div></>; }
function useSaveSettings() {
  const { update } = useAuth();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const save = async patch => { setBusy(true); setMessage(''); setError(''); try { const r = await api.put('/auth/settings', patch); update(r.data.user); setMessage(r.data.message); } catch (x) { setError(x.response?.data?.message || 'Could not save your settings.'); } finally { setBusy(false); } };
  return { busy, message, error, save };
}
function Notice({ error, message }) { return <>{error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}{message && <div className="inline-success"><Check size={16}/>{message}</div>}</>; }
const SETTINGS_TABS = [
  ['general', 'General settings', 'System name, language and time zone', SlidersHorizontal],
  ['account', 'Account settings', 'Profile details, image and password', UserRound],
  ['notifications', 'Notification settings', 'Low-stock and out-of-stock alerts', Bell],
  ['inventory', 'Inventory settings', 'Stock threshold and measurement unit', Boxes]
];
function SettingsPage() {
  const [tab, setTab] = useState('general');
  return <>
    <PageHead eyebrow="WORKSPACE PREFERENCES" title="Settings" text="Control how the system presents itself, how your account is secured, and how inventory behaves."/>
    <div className="settings-tabs">{SETTINGS_TABS.map(([key, label, text, Icon]) => <button type="button" key={key} className={tab === key ? 'settings-tab active' : 'settings-tab'} onClick={() => setTab(key)}><span className="settings-tab-icon"><Icon size={17}/></span><div><b>{label}</b><small>{text}</small></div></button>)}</div>
    {tab === 'general' && <GeneralSettings/>}
    {tab === 'account' && <AccountSettings/>}
    {tab === 'notifications' && <NotificationSettings/>}
    {tab === 'inventory' && <InventorySettings/>}
  </>;
}
function GeneralSettings() {
  const settings = useSettings(); const { busy, message, error, save } = useSaveSettings();
  const [form, setForm] = useState({ systemName: settings.systemName, language: settings.language, timeZone: settings.timeZone });
  const [previewOne, previewTwo] = brandParts(form.systemName);
  return <div className="two-panel">
    <section className="glass-panel">
      <div className="panel-title"><div><span>GENERAL SETTINGS</span><h3>System identity and locale</h3></div></div>
      <Notice error={error} message={message}/>
      <form className="modal-form" onSubmit={e => { e.preventDefault(); save(form); }}>
        <Field label="System name"><input value={form.systemName} onChange={e => setForm({ ...form, systemName: e.target.value })} maxLength={40} placeholder="Smart Inventory" required/></Field>
        <Field label="Language"><select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>{LANGUAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        <Field label="Time zone"><select value={form.timeZone} onChange={e => setForm({ ...form, timeZone: e.target.value })}>{TIME_ZONES.map(zone => <option key={zone} value={zone}>{zone}</option>)}</select></Field>
        <button className="report-button" disabled={busy}><Check size={16}/>{busy ? 'Saving…' : 'Save general settings'}</button>
      </form>
    </section>
    <section className="glass-panel">
      <div className="panel-title"><div><span>LIVE PREVIEW</span><h3>How it will appear</h3></div></div>
      <div className="preview-row"><span>SIDEBAR BRAND</span><strong>{previewOne}{previewTwo && <em> {previewTwo}</em>}</strong></div>
      <div className="preview-row"><span>DATE AND TIME</span><strong>{fmtDate(new Date().toISOString(), { ...settings, ...form })}</strong></div>
      <div className="preview-row"><span>LANGUAGE</span><strong>{LANGUAGES.find(([value]) => value === form.language)?.[1] || form.language}</strong></div>
      <div className="preview-row"><span>TIME ZONE</span><strong>{form.timeZone}</strong></div>
      <p className="panel-hint">Your system name is used in the sidebar, the page title and the top bar. Language and time zone control how every date and time is shown across the workspace.</p>
    </section>
  </div>;
}
function NotificationSettings() {
  const settings = useSettings(); const { busy, message, error, save } = useSaveSettings();
  const [form, setForm] = useState({ notifyLowStock: settings.notifyLowStock, notifyOutOfStock: settings.notifyOutOfStock });
  const rows = [['notifyLowStock', 'Low-stock alerts', 'Show products at or below their reorder level in the alert centre, and display the count badge next to Alerts in the sidebar.'], ['notifyOutOfStock', 'Out-of-stock alerts', 'Include products with zero quantity in the alert list. Turn this off to review only items that still have stock left to sell.']];
  return <div className="settings-body glass-panel">
    <div className="panel-title"><div><span>NOTIFICATION SETTINGS</span><h3>Stock alert preferences</h3></div></div>
    <Notice error={error} message={message}/>
    {rows.map(([key, label, text]) => <div className="switch-row" key={key}><div><b>{label}</b><small>{text}</small></div><button type="button" role="switch" aria-checked={form[key]} aria-label={label} className={form[key] ? 'switch on' : 'switch'} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}><i/></button></div>)}
    <div className="modal-actions"><Link to="/alerts" className="ghost-btn">Open alert centre</Link><button type="button" className="report-button" disabled={busy} onClick={() => save(form)}><Check size={16}/>{busy ? 'Saving…' : 'Save notifications'}</button></div>
  </div>;
}
function InventorySettings() {
  const settings = useSettings(); const { busy, message, error, save } = useSaveSettings();
  const [form, setForm] = useState({ defaultReorderLevel: String(settings.defaultReorderLevel), defaultUnit: settings.defaultUnit });
  return <div className="two-panel">
    <section className="glass-panel">
      <div className="panel-title"><div><span>INVENTORY SETTINGS</span><h3>Stock defaults</h3></div></div>
      <Notice error={error} message={message}/>
      <form className="modal-form" onSubmit={e => { e.preventDefault(); save({ ...form, defaultReorderLevel: Number(form.defaultReorderLevel) }); }}>
        <Field label="Default reorder level"><input type="number" min="0" max="9999" value={form.defaultReorderLevel} onChange={e => setForm({ ...form, defaultReorderLevel: e.target.value })} required/></Field>
        <Field label="Default measurement unit"><select value={form.defaultUnit} onChange={e => setForm({ ...form, defaultUnit: e.target.value })}>{UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></Field>
        <button className="report-button" disabled={busy}><Check size={16}/>{busy ? 'Saving…' : 'Save inventory settings'}</button>
      </form>
    </section>
    <section className="glass-panel">
      <div className="panel-title"><div><span>WHAT THIS CHANGES</span><h3>Where defaults apply</h3></div></div>
      <div className="apply-list">
        <div><Package size={16}/><p>New products open with reorder level <b>{form.defaultReorderLevel || 0}</b>.</p></div>
        <div><Boxes size={16}/><p>Quantities are labelled in <b>{form.defaultUnit}</b> on Products, Stock In/Out and Movements.</p></div>
        <div><AlertTriangle size={16}/><p>A product is flagged low when its quantity reaches <b>{form.defaultReorderLevel || 0}</b> or lower.</p></div>
      </div>
      <p className="panel-hint">These are defaults only. Products you already created keep their own reorder level until you edit them.</p>
    </section>
  </div>;
}
function AccountSettings() {
  const { me, update } = useAuth();
  const [name, setName] = useState(me?.name || '');
  const [avatar, setAvatar] = useState({ image: '', icon: 'UserRound', color: AVATAR_COLORS[0], ...(me?.avatar || {}) });
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState(''); const [pwError, setPwError] = useState(''); const [pwBusy, setPwBusy] = useState(false); const [ask, setAsk] = useState(false);
  const pick = async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { const image = await resizeAvatar(file); setAvatar(a => ({ ...a, image })); setError(''); } catch { setError('That file could not be read as an image.'); } };
  const save = async e => { e.preventDefault(); setError(''); setMessage(''); setBusy(true); try { const r = await api.put('/auth/profile', { name, avatar }); update(r.data.user); setMessage(r.data.message); } catch (x) { setError(x.response?.data?.message || 'Could not save your profile.'); } finally { setBusy(false); } };
  const validate = () => !pw.currentPassword ? 'Enter your current password.' : pw.newPassword.length < 6 ? 'New password must be at least 6 characters.' : pw.newPassword !== pw.confirmPassword ? 'The two new passwords do not match.' : pw.newPassword === pw.currentPassword ? 'New password must be different from your current one.' : '';
  const requestChange = e => { e.preventDefault(); setPwMessage(''); const problem = validate(); setPwError(problem); if (!problem) setAsk(true); };
  const changePassword = async () => { setAsk(false); setPwBusy(true); setPwError(''); try { const r = await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword }); setPwMessage(r.data.message); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }); } catch (x) { setPwError(x.response?.data?.message || 'Could not change your password.'); } finally { setPwBusy(false); } };
  return <>
    <div className="two-panel">
      <section className="glass-panel">
        <div className="panel-title"><div><span>ACCOUNT SETTINGS</span><h3>Profile image and name</h3></div></div>
        <div className="avatar-preview"><Avatar person={{ ...me, name, avatar }} size={84} className="avatar-lg"/><div><b>{name || 'Your name'}</b><small>{me?.email}</small></div></div>
        <div className="avatar-tools"><label className="ghost-btn file-btn"><Camera size={14}/> Upload photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} hidden/></label>{avatar.image ? <button type="button" className="table-action danger" onClick={() => setAvatar(a => ({ ...a, image: '' }))}><Trash2 size={12}/> Remove photo</button> : null}</div>
        <span className="panel-label">ICON</span>
        <div className="choice-row">{Object.entries(AVATAR_ICONS).map(([key, Icon]) => <button type="button" key={key} className={avatar.icon === key && !avatar.image ? 'choice-btn selected' : 'choice-btn'} onClick={() => setAvatar(a => ({ ...a, icon: key, image: '' }))}><Icon size={16}/></button>)}</div>
        <span className="panel-label">COLOUR</span>
        <div className="choice-row">{AVATAR_COLORS.map(c => <button type="button" key={c} className={avatar.color === c ? 'colour-dot selected' : 'colour-dot'} style={{ background: c }} onClick={() => setAvatar(a => ({ ...a, color: c }))} aria-label={`Use colour ${c}`}/>)}</div>
        {error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}{message && <div className="inline-success"><Check size={16}/>{message}</div>}
        <form className="modal-form" onSubmit={save}>
          <Field label="Display name"><input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" maxLength={60} required/></Field>
          <Field label="Email address"><input value={me?.email || ''} disabled/></Field>
          <button className="report-button" disabled={busy}><Check size={16}/>{busy ? 'Saving…' : 'Save profile'}</button>
        </form>
      </section>
      <section className="glass-panel">
        <div className="panel-title"><div><span>SECURITY</span><h3>Change password</h3></div></div>
        {pwError && <div className="inline-alert"><CircleAlert size={16}/>{pwError}</div>}{pwMessage && <div className="inline-success"><Check size={16}/>{pwMessage}</div>}
        <form className="modal-form" onSubmit={requestChange}>
          <Field label="Current password"><PasswordInput autoComplete="current-password" value={pw.currentPassword} onChange={v => setPw(p => ({ ...p, currentPassword: v }))} placeholder="Enter your current password"/></Field>
          <Field label="New password"><PasswordInput autoComplete="new-password" value={pw.newPassword} onChange={v => setPw(p => ({ ...p, newPassword: v }))} placeholder="At least 6 characters"/></Field>
          <Field label="Confirm new password"><PasswordInput autoComplete="new-password" value={pw.confirmPassword} onChange={v => setPw(p => ({ ...p, confirmPassword: v }))} placeholder="Type the new password again"/></Field>
          <button className="report-button" disabled={pwBusy}><KeyRound size={16}/>{pwBusy ? 'Updating…' : 'Change password'}</button>
        </form>
        <p className="panel-hint">You stay signed in on this device. Use the new password the next time you log in.</p>
      </section>
    </div>
    {ask && <Modal title="Change your password?" subtitle="This action cannot be undone." onClose={() => setAsk(false)}>
      <div className="confirm-note"><KeyRound size={18}/><div>You are about to change the password for <b>{me?.email}</b>. Make sure you remember the new one before continuing.</div></div>
      <div className="modal-actions"><button type="button" className="ghost-btn" onClick={() => setAsk(false)}>Cancel</button><button type="button" className="report-button" onClick={changePassword}><Check size={16}/> Yes, change my password</button></div>
    </Modal>}
  </>;
}
function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/" element={<Guard><Shell><Dashboard/></Shell></Guard>}/>
    <Route path="/inventory" element={<Guard><Shell><Inventory/></Shell></Guard>}/>
    <Route path="/products" element={<Guard><Shell><Products/></Shell></Guard>}/>
    <Route path="/suppliers" element={<Guard><Shell><Suppliers/></Shell></Guard>}/>
    <Route path="/movements" element={<Guard><Shell><Movements/></Shell></Guard>}/>
    <Route path="/alerts" element={<Guard><Shell><Alerts/></Shell></Guard>}/>
    <Route path="/reports" element={<Guard><Shell><Reports/></Shell></Guard>}/>
    <Route path="/settings" element={<Guard><Shell><SettingsPage/></Shell></Guard>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter>);
