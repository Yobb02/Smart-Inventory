import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowDownToLine, ArrowRight, ArrowUpFromLine, BarChart3, Boxes, Check, ChevronRight, CircleAlert, CircleCheck, Database, Download, Eye, EyeOff, FileText, History, LayoutDashboard, LogOut, Menu, Package, Plus, Search, ShieldCheck, Sparkles, Truck, UserRound, X } from 'lucide-react';
import { api, downloadReport, logout, saveSession, user } from './lib/api';
import './styles.css';

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
function AuthProvider({ children }) {
  const [me, setMe] = useState(user());
  const login = data => { saveSession(data); setMe(data.user); };
  const signout = () => { logout(); setMe(null); };
  return <AuthContext.Provider value={{ me, login, signout }}>{children}</AuthContext.Provider>;
}
function Guard({ children }) { return useAuth().me ? children : <Navigate to="/login" replace />; }
const nav = [
  ['/', 'Dashboard', LayoutDashboard], ['/inventory', 'Inventory', Boxes], ['/products', 'Products', Package], ['/suppliers', 'Suppliers', Truck], ['/movements', 'Movements', History], ['/alerts', 'Alerts', AlertTriangle], ['/reports', 'Reports', BarChart3]
];
function Shell({ children }) {
  const { me, signout } = useAuth(); const [mobile, setMobile] = useState(false); const loc = useLocation();
  const current = nav.find(n => n[0] === loc.pathname);
  return <div className="app-shell">
    <div className="aurora a1"/><div className="aurora a2"/><div className="grain"/>
    <aside className={mobile ? 'sidebar show' : 'sidebar'}>
      <div className="side-brand"><div className="logo-orbit"><Boxes size={21}/><i/></div><div><strong>SMART<span>INV</span></strong><small>Inventory Intelligence</small></div><button className="close-mobile" onClick={() => setMobile(false)}><X/></button></div>
      <div className="workspace-tag"><span/> WORKSPACE</div>
      <nav className="main-nav">{nav.map(([path, label, Icon]) => <Link key={path} to={path} onClick={() => setMobile(false)} className={loc.pathname === path ? 'nav-item active' : 'nav-item'}><span className="nav-icon"><Icon size={17}/></span><span>{label}</span>{label === 'Alerts' && <AlertBadge/>}{loc.pathname === path && <ChevronRight className="nav-chevron" size={15}/>}</Link>)}</nav>
      <div className="side-footer"><div className="db-pill"><span className="live-dot"/> MongoDB Atlas <em>LIVE</em></div><div className="profile-mini"><div className="profile-avatar">{me?.name?.[0]?.toUpperCase()}</div><div><b>{me?.name}</b><small>{me?.role === 'admin' ? 'Administrator' : 'Staff account'}</small></div></div><button className="logout-btn" onClick={signout}><LogOut size={16}/> Sign out</button></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="menu-btn" onClick={() => setMobile(true)}><Menu/></button><div className="breadcrumbs"><span>SMART INVENTORY</span><ChevronRight size={13}/><b>{current?.[1] || 'Dashboard'}</b></div><div className="top-right"><div className="stack-badge"><span className="live-dot"/> MERN <i/> MongoDB</div><div className="top-user">{me?.name?.[0]?.toUpperCase()}</div></div></header><div className="page-wrap">{children}</div></main>
  </div>;
}
function AlertBadge() { const [count, setCount] = useState(0); useEffect(() => { api.get('/dashboard/alerts').then(r => setCount(r.data.length)).catch(() => {}); }, []); return count ? <span className="nav-badge">{count}</span> : null; }
function PageHead({ eyebrow, title, text, action }) { return <div className="page-head"><div><span className="eyebrow-blue">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>; }
function Empty({ icon: Icon = Boxes, title = 'Nothing here yet.', text = 'Add your first record to begin.' }) { return <div className="empty-state"><div className="empty-icon"><Icon size={20}/></div><b>{title}</b><span>{text}</span></div>; }
function Modal({ title, subtitle, onClose, children }) { return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal-card"><div className="modal-head"><div><span>WORKSPACE ACTION</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button onClick={onClose}><X/></button></div>{children}</div></div>; }

function Login() {
  const { login } = useAuth(); const navTo = useNavigate();
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const submit = async e => { e.preventDefault(); setError(''); setNotice(''); setBusy(true); try { const r = await api.post(`/auth/${mode === 'login' ? 'login' : 'register'}`, form); if (mode === 'register') { setMode('login'); setForm({ name: '', email: form.email, password: '' }); setNotice('Account created successfully. Please sign in with your new account.'); } else { login(r.data); navTo('/'); } } catch (err) { setError(err.response?.data?.message || (err.code === 'ERR_NETWORK' ? 'Backend is offline. Start the server with npm run dev.' : 'Unable to continue.')); } finally { setBusy(false); } };
  return <div className="auth-page"><div className="auth-stars"/><div className="auth-light light-one"/><div className="auth-light light-two"/>
    <div className="auth-layout"><section className="hero-copy"><div className="hero-brand"><div className="logo-orbit big"><Boxes size={27}/></div><div><b>SMART<span>INV</span></b><small>SMART INVENTORY SYSTEM</small></div></div><div className="hero-label"><Sparkles size={14}/> YOUR STOCK, ONE WORKFLOW</div><h1>From <span>record</span> to <span>action.</span></h1><p>Follow one simple flow: authenticate, manage products, move stock, watch alerts, update the dashboard, and download your report.</p><div className="flow-strip"><Flow n="01" icon={<UserRound/>} title="LOGIN"/><ArrowRight/><Flow n="02" icon={<Package/>} title="PRODUCTS"/><ArrowRight/><Flow n="03" icon={<Activity/>} title="STOCK IN / OUT"/><ArrowRight/><Flow n="04" icon={<AlertTriangle/>} title="LOW-STOCK ALERT"/></div><div className="hero-points"><span><ShieldCheck size={15}/> Account-isolated data</span><span><Database size={15}/> MongoDB Atlas</span><span><CircleCheck size={15}/> Downloadable reports</span></div></section>
      <section className="login-card"><div className="login-card-top"><span className="status-chip"><i/> SECURE ACCESS</span><div className="mini-shield"><ShieldCheck size={17}/></div></div><h2>{mode === 'login' ? 'Welcome back.' : 'Create an account.'}</h2><p>{mode === 'login' ? 'Sign in to access your private inventory workspace.' : 'Your products and stock records will belong only to this account.'}</p>{error && <div className="form-error"><CircleAlert size={16}/>{error}</div>}{notice && <div className="form-success"><Check size={16}/>{notice}</div>}
        <form onSubmit={submit} className="auth-form">{mode === 'register' && <label>Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required/></label>}<label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required/></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" required/><button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}<span>{showPassword ? 'Hide password' : 'Show password'}</span></button></div></label><button className="auth-button" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to workspace' : 'Create account'}</button></form><button className="switch-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setNotice(''); setShowPassword(false); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></section></div>
  </div>;
}
function Flow({ n, icon, title }) { return <div className="flow-step"><small>{n}</small><span>{icon}</span><b>{title}</b></div>; }

function Dashboard() {
  const [stats, setStats] = useState(null); const [err, setErr] = useState('');
  const load = () => api.get('/dashboard/stats').then(r => setStats(r.data)).catch(e => setErr(e.response?.data?.message || 'Unable to load dashboard.'));
  useEffect(() => { void load(); }, []); if (err) return <ErrorBox message={err} retry={load}/>; if (!stats) return <Loading/>;
  return <><PageHead eyebrow="COMMAND CENTER" title="Inventory overview" text="A live view of your own products, stock movements and alerts." action={<button className="report-button" onClick={() => downloadReport()}><Download size={17}/> Export report</button>}/><div className="stat-grid"><Stat icon={<Package/>} label="Active products" value={stats.products}/><Stat icon={<AlertTriangle/>} label="Low-stock alerts" value={stats.lowStock} tone="amber"/><Stat icon={<Truck/>} label="Suppliers" value={stats.suppliers}/><Stat icon={<History/>} label="Stock movements" value={stats.movements}/></div><div className="dashboard-grid"><section className="glass-panel activity-panel"><div className="panel-title"><div><span>ACTIVITY STREAM</span><h3>Recent inventory movements</h3></div><Link to="/movements">View all <ArrowRight size={14}/></Link></div>{stats.recent.length ? stats.recent.map(m => <div className="activity-row" key={m._id}><div className={m.type === 'OUT' ? 'activity-icon out' : 'activity-icon'}>{m.type === 'OUT' ? <ArrowDownToLine size={16}/> : <ArrowUpFromLine size={16}/>}</div><div><b>{m.product?.name || 'Product'}</b><small>{m.type} · {m.quantity} unit(s) · {new Date(m.createdAt).toLocaleString()}</small></div><strong>{m.after}</strong></div>) : <Empty icon={History} title="No movements yet." text="Stock transactions will appear here."/>}</section><section className="glass-panel flow-panel"><div className="panel-title"><div><span>YOUR WORKFLOW</span><h3>How the system works</h3></div></div><div className="workflow-list"><WorkflowItem n="01" title="LOGIN" text="Authenticate your own account."/><WorkflowItem n="02" title="PRODUCTS" text="Add, edit and view your catalog."/><WorkflowItem n="03" title="INVENTORY" text="Record Stock-In / Stock-Out and update quantity."/><WorkflowItem n="04" title="CHECK LEVEL" text="The system compares quantity with reorder level."/><WorkflowItem n="05" title="ALERT" text="Low stock appears in your alert center."/><WorkflowItem n="06" title="REPORT" text="Download your own inventory report."/></div></section></div></>;
}
function Stat({ icon, label, value, tone = '' }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div><i className="stat-glow"/></div>; }
function WorkflowItem({ n, title, text }) { return <div className="workflow-item"><b>{n}</b><div><strong>{title}</strong><small>{text}</small></div></div>; }
function Loading() { return <div className="loading-screen"><div className="loader"/><span>Loading your private workspace…</span></div>; }
function ErrorBox({ message, retry }) { return <div className="glass-panel error-box"><CircleAlert/><div><h3>Something needs attention</h3><p>{message}</p><button onClick={retry}>Try again</button></div></div>; }

function Products() {
  const [items, setItems] = useState([]); const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const blank = { sku: '', name: '', unitCost: 0, reorderLevel: 5, quantity: 0, binLocation: '', description: '' }; const [form, setForm] = useState(blank);
  const load = () => api.get('/products', { params: q ? { q } : {} }).then(r => setItems(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load products.'));
  useEffect(() => { void load(); }, []);
  const openNew = () => { setEditing(null); setForm(blank); setError(''); setOpen(true); };
  const edit = p => { setEditing(p._id); setForm({ sku: p.sku, name: p.name, unitCost: p.unitCost, reorderLevel: p.reorderLevel, quantity: p.quantity, binLocation: p.binLocation || '', description: p.description || '' }); setOpen(true); };
  const save = async e => { e.preventDefault(); setError(''); try { if (editing) await api.put(`/products/${editing}`, form); else await api.post('/products', form); setOpen(false); setForm(blank); load(); } catch (e) { setError(e.response?.data?.message || 'Could not save product.'); } };
  const remove = async id => { if (!confirm('Delete this product and its movement history?')) return; try { await api.delete(`/products/${id}`); load(); } catch (e) { setError(e.response?.data?.message || 'Could not delete product.'); } };
  return <><PageHead eyebrow="PRODUCT CATALOG" title="Products" text="Add, edit and view products. Every record belongs only to your account." action={<button className="report-button" onClick={openNew}><Plus size={17}/> New product</button>}/>{error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}<section className="glass-panel"><div className="table-toolbar"><div><span>INVENTORY LEDGER</span><h3>Your products</h3></div><div className="search-box"><Search size={16}/><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search SKU or product"/></div></div>{items.length ? <div className="table-scroll"><table><thead><tr><th>SKU</th><th>Product</th><th>Quantity</th><th>Reorder</th><th>Bin</th><th>Cost</th><th>Actions</th></tr></thead><tbody>{items.map(p => <tr key={p._id}><td><span className="sku-chip">{p.sku}</span></td><td><b>{p.name}</b><small>{p.description || 'No description'}</small></td><td><span className={p.quantity <= p.reorderLevel ? 'qty low' : 'qty'}>{p.quantity}</span></td><td>{p.reorderLevel}</td><td>{p.binLocation || '—'}</td><td>₱{Number(p.unitCost).toFixed(2)}</td><td><button className="table-action" onClick={() => edit(p)}>Edit</button><button className="table-action danger" onClick={() => remove(p._id)}>Delete</button></td></tr>)}</tbody></table></div> : <Empty icon={Package} title="No products yet." text="Click New product to start your catalog."/>}</section>{open && <ProductModal title={editing ? 'Edit product' : 'Add a new product'} form={form} setForm={setForm} editing={editing} onClose={() => setOpen(false)} onSave={save}/>}</>;
}
function ProductModal({ title, form, setForm, editing, onClose, onSave }) { return <Modal title={title} subtitle="This record will be private to the currently signed-in account." onClose={onClose}><form className="modal-form" onSubmit={onSave}><div className="two-fields"><Field label="SKU / Barcode"><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-1001" required/></Field><Field label="Product name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Wireless Mouse" required/></Field></div><div className="two-fields"><Field label="Unit cost"><input type="number" min="0" step="0.01" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })}/></Field><Field label="Reorder level"><input type="number" min="0" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })}/></Field></div><div className="two-fields"><Field label={editing ? 'Current quantity' : 'Opening quantity'}><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}/></Field><Field label="Bin location"><input value={form.binLocation} onChange={e => setForm({ ...form, binLocation: e.target.value })} placeholder="A-01"/></Field></div><Field label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional product details"/></Field><div className="modal-actions"><button type="button" className="ghost-btn" onClick={onClose}>Cancel</button><button className="report-button"><Check size={16}/>{editing ? 'Save changes' : 'Add product'}</button></div></form></Modal> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }

function Inventory() {
  const [products, setProducts] = useState([]); const [selected, setSelected] = useState(''); const [type, setType] = useState('IN'); const [qty, setQty] = useState(''); const [reason, setReason] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const load = () => api.get('/products').then(r => setProducts(r.data)).catch(e => setError(e.response?.data?.message || 'Could not load inventory.')); useEffect(() => { void load(); }, []);
  const submit = async e => { e.preventDefault(); setMessage(''); setError(''); if (!selected) return setError('Choose a product first.'); try { const r = await api.post(`/products/${selected}/movement`, { type, quantity: Number(qty), reason }); setMessage(`${type === 'IN' ? 'Stock-In' : 'Stock-Out'} recorded. New quantity: ${r.data.product.quantity}.`); setQty(''); setReason(''); load(); } catch (e) { setError(e.response?.data?.message || 'Could not update stock.'); } };
  return <><PageHead eyebrow="INVENTORY CONTROL" title="Stock In / Out" text="Update quantity, then the system checks the stock level against the reorder level."/><div className="inventory-layout"><section className="glass-panel transaction-card"><div className="transaction-head"><div className="transaction-orb"><Activity/></div><div><span>INVENTORY TRANSACTION</span><h3>Record a stock movement</h3></div></div>{error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}{message && <div className="inline-success"><Check size={16}/>{message}</div>}<form onSubmit={submit} className="transaction-form"><Field label="Product"><select value={selected} onChange={e => setSelected(e.target.value)} required><option value="">Select a product…</option>{products.map(p => <option key={p._id} value={p._id}>{p.sku} — {p.name} (Qty: {p.quantity})</option>)}</select></Field><div className="movement-toggle"><button type="button" className={type === 'IN' ? 'selected in' : ''} onClick={() => setType('IN')}><ArrowUpFromLine/> STOCK IN</button><button type="button" className={type === 'OUT' ? 'selected out' : ''} onClick={() => setType('OUT')}><ArrowDownToLine/> STOCK OUT</button></div><Field label="Quantity"><input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity" required/></Field><Field label="Reason"><input value={reason} onChange={e => setReason(e.target.value)} placeholder="Purchase, sale, damaged, adjustment…"/></Field><button className="report-button full"><Activity size={17}/> Update quantity & check stock</button></form></section><section className="glass-panel level-card"><div className="panel-title"><div><span>STOCK LEVEL</span><h3>Current inventory</h3></div></div>{products.length ? products.map(p => <div className="level-row" key={p._id}><div><b>{p.name}</b><small>{p.sku} · reorder at {p.reorderLevel}</small></div><div className="level-number"><strong>{p.quantity}</strong><span className={p.quantity <= p.reorderLevel ? 'low-label' : 'normal-label'}>{p.quantity <= p.reorderLevel ? 'LOW' : 'NORMAL'}</span></div></div>) : <Empty icon={Package} title="No products yet." text="Create a product before recording stock."/>}</section></div></>;
}

function Suppliers() {
  const blank = { name: '', contactEmail: '', phone: '', address: '' };
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/suppliers')
    .then(r => setItems(r.data))
    .catch(e => setError(e.response?.data?.message || 'Could not load suppliers.'));

  useEffect(() => { void load(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(blank);
    setError('');
  };

  const edit = supplier => {
    setEditing(supplier._id);
    setForm({
      name: supplier.name || '',
      contactEmail: supplier.contactEmail || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setError('');
  };

  const save = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) await api.put(`/suppliers/${editing}`, form);
      else await api.post('/suppliers', form);
      resetForm();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const del = async id => {
    if (!confirm('Delete this supplier?')) return;
    setError('');
    try {
      await api.delete(`/suppliers/${id}`);
      if (editing === id) resetForm();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete supplier.');
    }
  };

  return <>
    <PageHead eyebrow="SUPPLIER DIRECTORY" title="Suppliers" text="Add, edit and view supplier records for your inventory operations."/>
    {error && <div className="inline-alert"><CircleAlert size={16}/>{error}</div>}
    <div className="two-panel">
      <section className="glass-panel">
        <span className="panel-label">{editing ? 'EDIT SUPPLIER' : 'NEW SUPPLIER'}</span>
        <h3>{editing ? 'Update supplier' : 'Add supplier'}</h3>
        <form className="modal-form" onSubmit={save}>
          <Field label="Supplier name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" required/></Field>
          <Field label="Contact email"><input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="supplier@example.com"/></Field>
          <Field label="Phone"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxxx"/></Field>
          <Field label="Address"><textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></Field>
          <div className="modal-actions">
            {editing && <button type="button" className="ghost-btn" onClick={resetForm}>Cancel</button>}
            <button className="report-button" disabled={saving}><Check size={16}/>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add supplier'}</button>
          </div>
        </form>
      </section>
      <section className="glass-panel">
        <div className="panel-title"><div><span>YOUR SUPPLIERS</span><h3>Supplier list</h3></div></div>
        {items.length ? items.map(s => <div className="supplier-row" key={s._id}>
          <div className="supplier-icon"><Truck size={17}/></div>
          <div><b>{s.name}</b><small>{s.contactEmail || 'No email'} · {s.phone || 'No phone'}</small><small>{s.address || 'No address'}</small></div>
          <button className="table-action" onClick={() => edit(s)}>Edit</button>
          <button className="table-action danger" onClick={() => del(s._id)}>Delete</button>
        </div>) : <Empty icon={Truck} title="No suppliers yet." text="Add your first supplier."/>}
      </section>
    </div>
  </>;
}
function Movements() { const [items, setItems] = useState([]); const load = async () => { const p = await api.get('/products'); const rows = []; for (const product of p.data) { const m = await api.get(`/products/${product._id}/movements`); rows.push(...m.data.map(x => ({ ...x, product }))); } rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); setItems(rows); }; useEffect(() => { load().catch(() => {}); }, []); return <><PageHead eyebrow="AUDIT TRAIL" title="Movements" text="Every stock transaction for your account in one timeline."/><section className="glass-panel"><div className="table-scroll"><table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Before → After</th><th>Recorded by</th></tr></thead><tbody>{items.map(m => <tr key={m._id}><td>{new Date(m.createdAt).toLocaleString()}</td><td><b>{m.product?.name}</b><small>{m.product?.sku}</small></td><td><span className={`movement-tag ${m.type.toLowerCase()}`}>{m.type}</span></td><td>{m.quantity}</td><td>{m.before} → {m.after}</td><td>{m.user?.name || 'You'}</td></tr>)}</tbody></table></div>{!items.length && <Empty icon={History} title="No movements yet." text="Your Stock-In and Stock-Out activity will appear here."/>}</section></>; }
function Alerts() { const [items, setItems] = useState([]); const load = () => api.get('/dashboard/alerts').then(r => setItems(r.data)); useEffect(() => { void load(); }, []); return <><PageHead eyebrow="ATTENTION CENTER" title="Low-stock alerts" text="This list follows your workflow: update quantity → check level → alert." action={<button className="report-button" onClick={load}><Activity size={16}/> Refresh</button>}/><section className="alert-grid">{items.length ? items.map(p => <div className="alert-card" key={p._id}><div className="alert-card-icon"><AlertTriangle/></div><div><span>LOW STOCK</span><h3>{p.name}</h3><p>{p.sku} · Reorder level {p.reorderLevel}</p></div><strong>{p.quantity}</strong></div>) : <div className="glass-panel"><Empty icon={CircleCheck} title="All stock levels are normal." text="No product is currently at or below its reorder level."/></div>}</section></>; }
function Reports() { const [downloading, setDownloading] = useState(false); const run = async () => { setDownloading(true); try { await downloadReport(); } catch { alert('Could not download the report. Please make sure the backend is running.'); } finally { setDownloading(false); } }; return <><PageHead eyebrow="REPORT CENTER" title="Reports" text="Download a CSV report containing only the inventory belonging to your account."/><div className="report-hero glass-panel"><div className="report-art"><FileText/></div><div><span>PRIVATE INVENTORY REPORT</span><h2>Export your current inventory</h2><p>The downloaded CSV contains SKU, product, quantity, reorder level, unit cost, bin location and supplier.</p><button className="report-button" onClick={run} disabled={downloading}><Download size={17}/>{downloading ? 'Preparing…' : 'Download CSV report'}</button></div></div></>; }
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
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter>);
