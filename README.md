# Smart Inventory System — MERN Rebuild

A clean rebuild of the Smart Inventory System using the **MERN stack**:
- MongoDB — database
- Express.js — REST API
- React.js + Vite — frontend
- Node.js — server runtime

The implementation follows the submitted project proposal's core scope (login, product management, inventory tracking, stock updates, reports) and the Weeks 5–6 design's stock tracking, alerts, procurement, notification-ready modular separation, and supplier/purchase-order workflow.

## Requirements
- Windows 10/11
- Node.js 20+ recommended (Node 24 can also run this project)
- MongoDB running locally or MongoDB Atlas

## 1. Backend
```powershell
cd server
copy .env.example .env
npm install
npm run seed
npm run dev
```
Default API: http://localhost:5000

## 2. Frontend
Open another terminal:
```powershell
cd client
copy .env.example .env
npm install
npm run dev
```
Open: http://localhost:5173

## Demo accounts
Admin: `admin@sims.local` / `Admin@12345`
Staff: `staff@sims.local` / `Staff@12345`

## Main features
- Login and account registration
- Admin/staff roles
- Dashboard statistics
- Product/SKU management
- Stock IN / OUT / adjustment
- Movement history
- Low-stock alerts
- Supplier records
- Purchase order lifecycle
- Admin automatic low-stock restock PO generation
- Keyboard/USB barcode scanner-compatible SKU lookup
- CSV inventory report

## MongoDB
Local default:
`mongodb://127.0.0.1:27017/smart_inventory`

For MongoDB Atlas, replace `MONGODB_URI` in `server/.env` with the Atlas connection string.

## Deployment
Deploy `server` as a Node/Express service (Render or another Node host) and `client` as a Vite static site (Vercel or another static host). Set `CLIENT_URL` on the backend to the deployed frontend URL and `VITE_API_URL` on the frontend to the deployed backend `/api` URL.

## Important source-scope note
The proposal document explicitly lists online sales, supplier integration, barcode/RFID scanning, and multi-branch inventory management as exclusions. This rebuild keeps the core academic scope while also implementing the supplier/procurement and scanner concepts present in the Weeks 5–6 design document; these extra modules can be disabled or removed if your instructor requires strict adherence to the earlier scope.
