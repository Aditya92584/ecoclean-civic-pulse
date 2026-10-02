/**
 * ============================================================================
 * EcoPulse Full-Stack Backend Server (server.js - ES Module)
 * Compatible with "type": "module" in package.json and Node.js 22/24+
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// -------------------------------------------------------------
// MongoDB Atlas Connection & In-Memory Fallback State
// -------------------------------------------------------------
let isMongoConnected = false;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })
    .then(() => {
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully.');
    })
    .catch((err) => {
      console.warn('⚠️ MongoDB Atlas connection failed, running in-memory mode:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('ℹ️ No MONGODB_URI provided in environment. Using in-memory store.');
}

// -------------------------------------------------------------
// Mongoose Schemas & Models
// -------------------------------------------------------------
const IssueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In-Progress', 'Resolved'], default: 'Pending' },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    photoUrl: { type: String, default: '' },
    reporterName: { type: String, default: 'Anonymous Citizen' },
    reporterPhone: { type: String, default: '' },
    assignedWorker: { type: String, default: null },
    resolvedAt: { type: String, default: null },
    timeline: [
      {
        phase: { type: String, required: true },
        timestamp: { type: String, required: true },
        note: { type: String, default: '' },
        actor: { type: String, default: 'System' },
      },
    ],
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Citizen', 'Staff', 'Admin'], default: 'Citizen' },
    zone: { type: String, default: 'Central Metro Zone' },
  },
  { timestamps: true }
);

const Issue = mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// In-Memory Seed Storage (Fallback when MongoDB is disconnected)
let inMemoryIssues = [
  {
    id: 'WASTE-2026-001',
    category: 'Overflowing Bin',
    description: 'Public waste bin overflow at Central Metro Station. Trash spilling onto pedestrian walkway.',
    severity: 'Medium',
    status: 'In-Progress',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Central Station Exit 2, Connaught Place',
      landmark: 'Near Ticket Counter',
    },
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Aarav Mehta',
    reporterPhone: '+91 98765 43210',
    assignedWorker: 'Green Route 4 (Elena Rostova)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        phase: 'Issue Reported',
        timestamp: new Date().toISOString(),
        note: 'Reported by citizen with photo evidence.',
        actor: 'Citizen',
      },
      {
        phase: 'Dispatch Assigned',
        timestamp: new Date().toISOString(),
        note: 'Assigned to Green Route 4 crew.',
        actor: 'Admin Dispatch',
      },
    ],
  },
  {
    id: 'WASTE-2026-002',
    category: 'Illegal Dumping',
    description: 'Bulk construction debris dumped on open ground near school lane.',
    severity: 'Critical',
    status: 'Pending',
    location: {
      lat: 28.6289,
      lng: 77.2195,
      address: 'Lane 4, Model Town Extension',
      landmark: 'Behind City Convent School',
    },
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Priya Sharma',
    reporterPhone: '+91 98111 22334',
    assignedWorker: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    timeline: [
      {
        phase: 'Issue Reported',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        note: 'Urgent priority marked by citizen.',
        actor: 'Citizen',
      },
    ],
  },
];

let inMemoryUsers = [
  {
    id: 'u-admin-1',
    name: 'Elena Rostova',
    email: 'admin@ecopulse.gov',
    password: 'password123',
    role: 'Admin',
    zone: 'Headquarters Dispatch',
  },
  {
    id: 'u-staff-1',
    name: 'Marcus Vance',
    email: 'staff@ecopulse.gov',
    password: 'password123',
    role: 'Staff',
    zone: 'North Riverfront & Metro Hub',
  },
];

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: isMongoConnected ? 'mongodb' : 'in-memory',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/issues
app.get('/api/issues', async (req, res) => {
  try {
    const { status, severity, category, search } = req.query;

    if (isMongoConnected) {
      const query = {};
      if (status && status !== 'All') query.status = status;
      if (severity && severity !== 'All') query.severity = severity;
      if (category && category !== 'All') query.category = category;
      if (search) {
        query.$or = [
          { id: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { 'location.address': { $regex: search, $options: 'i' } },
        ];
      }
      const issues = await Issue.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: issues.length, data: issues, source: 'mongodb' });
    }

    let filtered = [...inMemoryIssues];
    if (status && status !== 'All') filtered = filtered.filter((i) => i.status === status);
    if (severity && severity !== 'All') filtered = filtered.filter((i) => i.severity === severity);
    if (category && category !== 'All') filtered = filtered.filter((i) => i.category === category);
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.location.address.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, count: filtered.length, data: filtered, source: 'in-memory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/issues
app.post('/api/issues', async (req, res) => {
  try {
    const { category, description, severity = 'Medium', location, photoUrl = '', reporterName = 'Anonymous Citizen', reporterPhone = '' } = req.body;
    if (!category || !description || !location || !location.address) {
      return res.status(400).json({ success: false, error: 'category, description, and location are required' });
    }

    const uniqueId = `WASTE-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const newIssueData = {
      id: uniqueId,
      category,
      description,
      severity,
      status: 'Pending',
      location: {
        lat: Number(location.lat) || 28.6139,
        lng: Number(location.lng) || 77.2090,
        address: location.address,
        landmark: location.landmark || '',
      },
      photoUrl,
      reporterName,
      reporterPhone,
      assignedWorker: null,
      resolvedAt: null,
      timeline: [
        {
          phase: 'Issue Reported',
          timestamp: nowIso,
          note: 'Civic complaint submitted with GPS location and photo evidence.',
          actor: reporterName,
        },
      ],
    };

    if (isMongoConnected) {
      const created = await Issue.create(newIssueData);
      return res.status(201).json({ success: true, data: created, source: 'mongodb' });
    }

    inMemoryIssues.unshift(newIssueData);
    res.status(201).json({ success: true, data: newIssueData, source: 'in-memory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/issues/:id
app.patch('/api/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedWorker, note } = req.body;
    const nowIso = new Date().toISOString();

    if (isMongoConnected) {
      const issue = await Issue.findOne({ id });
      if (!issue) return res.status(404).json({ success: false, error: 'Issue not found' });

      if (status) issue.status = status;
      if (assignedWorker !== undefined) issue.assignedWorker = assignedWorker;
      if (status === 'Resolved') issue.resolvedAt = nowIso;

      if (status) {
        issue.timeline.push({
          phase: status === 'Resolved' ? 'Cleared & Resolved' : status === 'In-Progress' ? 'Dispatched to Crew' : 'Pending Review',
          timestamp: nowIso,
          note: note || `Status updated to ${status}.`,
          actor: 'Municipal Dispatch',
        });
      }
      await issue.save();
      return res.json({ success: true, data: issue, source: 'mongodb' });
    }

    const idx = inMemoryIssues.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Issue not found' });

    const item = inMemoryIssues[idx];
    if (status) item.status = status;
    if (assignedWorker !== undefined) item.assignedWorker = assignedWorker;
    if (status === 'Resolved') item.resolvedAt = nowIso;
    item.updatedAt = nowIso;
    if (status) {
      item.timeline.push({
        phase: status === 'Resolved' ? 'Cleared & Resolved' : status === 'In-Progress' ? 'Dispatched to Crew' : 'Pending Review',
        timestamp: nowIso,
        note: note || `Status updated to ${status}.`,
        actor: 'Municipal Dispatch',
      });
    }
    res.json({ success: true, data: item, source: 'in-memory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stats
app.get('/api/stats', async (_req, res) => {
  try {
    if (isMongoConnected) {
      const total = await Issue.countDocuments();
      const resolved = await Issue.countDocuments({ status: 'Resolved' });
      const pending = await Issue.countDocuments({ status: 'Pending' });
      const inProgress = await Issue.countDocuments({ status: 'In-Progress' });
      return res.json({ success: true, data: { total, resolved, pending, inProgress } });
    }
    const total = inMemoryIssues.length;
    const resolved = inMemoryIssues.filter((i) => i.status === 'Resolved').length;
    const pending = inMemoryIssues.filter((i) => i.status === 'Pending').length;
    const inProgress = inMemoryIssues.filter((i) => i.status === 'In-Progress').length;
    res.json({ success: true, data: { total, resolved, pending, inProgress } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth Routes: Register & Login
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Citizen', zone = 'Central Zone' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email, and password are required' });
    }
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const exists = await User.findOne({ email: cleanEmail });
      if (exists) return res.status(409).json({ success: false, error: 'User with this email already registered. Please click "Sign In".' });
      const user = await User.create({ id: `usr-${Date.now()}`, name, email: cleanEmail, password, role, zone });
      const userPayload = { id: user.id || user._id, name: user.name, email: user.email, role: user.role, zone: user.zone };
      return res.status(201).json({ success: true, user: userPayload, data: userPayload, source: 'mongodb' });
    }

    if (inMemoryUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ success: false, error: 'User with this email already registered. Please click "Sign In".' });
    }
    const newUser = { id: `usr-${Date.now()}`, name, email: cleanEmail, password, role, zone };
    inMemoryUsers.push(newUser);
    return res.status(201).json({ success: true, user: newUser, data: newUser, source: 'in-memory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      const user = await User.findOne({ email: cleanEmail, password });
      if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password. If you are new, please switch to Register.' });
      const userPayload = { id: user.id || user._id, name: user.name, email: user.email, role: user.role, zone: user.zone };
      return res.json({ success: true, user: userPayload, data: userPayload, source: 'mongodb' });
    }

    const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password. If you are new, please switch to Register.' });
    return res.json({ success: true, user, data: user, source: 'in-memory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Geocoding Proxy Routes
app.get('/api/geocode/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Query parameter q required' });

    const lowerQ = String(q).toLowerCase();
    // Direct instant resolution for Yashoda Nagar Kanpur
    if (lowerQ.includes('yashoda')) {
      return res.json({
        success: true,
        data: [
          {
            lat: 26.4255,
            lng: 80.3452,
            displayName: 'Yashoda Nagar, Kanpur, Uttar Pradesh, 208011, India',
            streetAddress: 'Yashoda Nagar Bypass Road',
            areaLandmark: 'Yashoda Nagar, Kanpur'
          }
        ]
      });
    }

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`;
    const resp = await fetch(searchUrl, {
      headers: { 'User-Agent': 'EcoPulse Civic Dispatch/1.0' }
    });
    if (!resp.ok) return res.status(502).json({ success: false, error: 'Search failed' });
    const list = await resp.json();
    const results = list.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      streetAddress: item.name || item.display_name.split(',')[0],
      areaLandmark: item.address
        ? [item.address.suburb || item.address.neighbourhood, item.address.city || item.address.town].filter(Boolean).join(', ')
        : 'Municipal Area'
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);

    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const response = await fetch(osmUrl, {
      headers: { 'User-Agent': 'EcoPulse Civic Dispatch/1.0' },
    });
    if (!response.ok) return res.status(502).json({ success: false, error: 'Geocoding service error' });

    const data = await response.json();
    const addr = data.address || {};

    // Yashoda Nagar vs Naubasta intelligent boundary check (Pincode 208011 is Yashoda Nagar)
    const isYashodaNagar =
      addr.postcode === '208011' ||
      (nLat >= 26.412 && nLat <= 26.442 && nLng >= 80.332 && nLng <= 80.368);

    let resolvedSuburb = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || '';
    if (isYashodaNagar) {
      resolvedSuburb = 'Yashoda Nagar';
    }

    const road = addr.road || addr.street || addr.pedestrian || resolvedSuburb || '';
    const houseNumber = addr.house_number ? `${addr.house_number} ` : '';
    let street = `${houseNumber}${road}`.trim() || data.name || `${nLat.toFixed(4)}, ${nLng.toFixed(4)}`;
    
    if (isYashodaNagar && !street.toLowerCase().includes('yashoda')) {
      street = `${street ? `${street}, ` : ''}Yashoda Nagar`;
    }

    const city = addr.city || addr.town || 'Kanpur';
    const landmark = [resolvedSuburb, city].filter(Boolean).join(', ') || (isYashodaNagar ? 'Yashoda Nagar, Kanpur' : 'Municipal Area');

    res.json({
      success: true,
      data: {
        formattedAddress: isYashodaNagar ? `${street}, Yashoda Nagar, ${city}` : data.display_name,
        streetAddress: street,
        areaLandmark: landmark,
        city: city,
        state: addr.state || 'Uttar Pradesh',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/geocode/ip', async (_req, res) => {
  try {
    const resp = await fetch('https://ipwho.is/');
    if (resp.ok) {
      const d = await resp.json();
      if (d && d.success !== false && d.latitude && d.longitude) {
        return res.json({
          success: true,
          data: {
            lat: Number(d.latitude),
            lng: Number(d.longitude),
            streetAddress: `${d.city || 'Central'}, ${d.region || ''}`.trim(),
            areaLandmark: `${d.region || d.city || 'Metropolitan'}, ${d.country || ''}`.trim(),
            city: d.city || '',
            region: d.region || '',
            country: d.country || '',
          },
        });
      }
    }
  } catch (e) {
    console.warn('ip location fallback error:', e);
  }
  res.json({
    success: true,
    data: {
      lat: 28.6139,
      lng: 77.2090,
      streetAddress: '14 Market Street, Sector 4',
      areaLandmark: 'Central Civic District',
      city: 'New Delhi',
      region: 'Delhi',
      country: 'India',
    },
  });
});

// Production Static Serving for Built Vite React App
app.use(express.static(path.resolve(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server running at http://0.0.0.0:${PORT}`);
  console.log(`   Database Mode: ${isMongoConnected ? 'MongoDB Atlas' : 'In-Memory Array'}`);
});
