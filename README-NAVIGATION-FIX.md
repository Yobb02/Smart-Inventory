# Smart Inventory System — Direct Dashboard Navigation Fix

This patch is based on the supplied MERN project. The change is limited to the frontend route definitions and the Inventory menu path; business logic, API calls, models, and styling are retained.

## Start the correct project

1. Extract this ZIP into a new folder.
2. Close any old terminals running Vite for previous copies of this project. In each old Vite terminal, press `Ctrl+C`.
3. Open this extracted folder in VS Code.
4. Terminal 1:
   ```powershell
   cd server
   npm install
   npm run dev
   ```
5. Terminal 2:
   ```powershell
   cd client
   npm install
   npm run dev -- --port 5173 --strictPort
   ```
6. Open the URL Vite prints (normally `http://localhost:5173`).

If port 5173 is already occupied, Vite will fail with `--strictPort` instead of silently serving another port. Close the old Vite process before retrying. Do not start the client from an older folder.

## Expected navigation

After signing in, `/` renders Dashboard. The menu routes to `/inventory`, `/products`, `/suppliers`, `/movements`, `/alerts`, and `/reports` using React Router without a manual refresh.
