SMART INVENTORY MANAGEMENT SYSTEM — CLEAN SOURCE PACKAGE

Structure
- client/: React + Vite frontend
- server/: Express + Node.js backend
- MongoDB is configured through server/.env (create it locally from server/.env.example)

Local setup
1. Install Node.js LTS.
2. In server/, run: npm install
3. Copy server/.env.example to server/.env and set MONGODB_URI and JWT_SECRET.
4. In server/, run: npm start
5. In client/, run: npm install
6. Copy client/.env.example to client/.env and set VITE_API_URL=http://localhost:5000/api
7. In client/, run: npm run dev

Notes
- Never upload .env files, credentials, or node_modules to Google Classroom or a public repository.
- Purchase Orders are available in the sidebar. Generate auto-restock is restricted to admin accounts by the backend. Receiving an order updates stock once and records movements.
- Run end-to-end tests against your own MongoDB instance before claiming every workflow is verified.
