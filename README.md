# EcoClean: Civic Waste & Incident Management Platform

A modern civic waste reporting, real-time incident tracking, and municipal admin dispatch dashboard built with React 19, Tailwind CSS, Node.js Express, and MongoDB Atlas with Mongoose.

---

## 🚀 Running Locally with VS Code

### Prerequisites
1. **Node.js**: Ensure Node.js (version 18 or 20+) is installed (`node -v`).
2. **VS Code**: Installed on your computer.
3. **Git** (optional): For version control.

---

### Step 1: Open the Project in VS Code
1. Extract the downloaded project folder to your preferred location (e.g. `~/Projects/ecoclean`).
2. Open VS Code:
   - Click **File > Open Folder...** and select the `ecoclean` folder.
   - Or open your terminal and run:
     ```bash
     code /path/to/ecoclean
     ```

---

### Step 2: Install Dependencies
Open the built-in terminal in VS Code (**Terminal > New Terminal** or `Ctrl + \`` / `Cmd + \``) and run:

```bash
npm install
```

---

### Step 3: Configure Environment Variables (Optional)
Copy `.env.example` to a new `.env` file:

```bash
cp .env.example .env
```

If you wish to connect to MongoDB Atlas, add your connection string in `.env`:
```env
PORT=3000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/ecoclean?retryWrites=true&w=majority"
```
*(Note: If `MONGODB_URI` is omitted, the server will automatically run with persistent in-memory arrays so you can develop immediately without setting up a database.)*

---

### Step 4: Start the Development Server
In your VS Code terminal, run:

```bash
npm run dev
```

The application will start on **`http://localhost:3000`**. Open this URL in any browser.

---

## 🛠 Available Scripts

- `npm run dev`: Runs the full-stack server (`server.ts` with Express API and Vite middleware).
- `npm run build`: Compiles the React application for production into `dist/`.
- `node server.js`: Runs the standalone Express backend server independently.
- `npm run lint`: Verifies TypeScript types without emitting code.

---

## 🌟 Application Features

1. **Report Waste Tab (`ReportIssue.tsx`)**:
   - 8 waste hazard categories with photo evidence upload (drag & drop).
   - Auto-detect coordinates with the Geolocation API.
   - Instant ticket generation (`WASTE-2026-XXX`).
2. **Incident Feed Tab (`IncidentFeed.tsx`)**:
   - Live complaint feed with status and severity filters.
   - Real-time verification timeline (*Reported &rarr; Triaged &rarr; Dispatched &rarr; Resolved*).
   - Detail modal with GPS coordinates and high-res image inspector.
3. **Admin Dashboard Tab (`AdminDashboard.tsx`)**:
   - Live stat cards with trend metrics.
   - Interactive data table with instant status transition and staff squad assignment dropdowns.
   - Geographic incident grid modal mapping all coordinates.
4. **Role-Based Authentication (`LoginModal.tsx`)**:
   - 1-click demo login buttons for **Citizen**, **Admin**, and **Sanitation Staff**.
   - Custom registration and sign-in tabs.
