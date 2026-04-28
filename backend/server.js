// ─────────────────────────────────────────────────────────────
// SERVER ENTRY POINT
// This is the FIRST file that runs when we start the backend.
// It sets up Express, Socket.io (real-time notifications),
// connects to the database, and registers all API routes.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');          // Node.js built-in HTTP module
const { Server } = require('socket.io'); // Socket.io for real-time notifications
require('dotenv').config();

// Import database to trigger connection test
require('./src/config/database');

// ─── CREATE EXPRESS APP ──────────────────────────────────────
const app = express();

// ─── CREATE HTTP SERVER ──────────────────────────────────────
// We wrap Express in a raw HTTP server because Socket.io
// needs access to the HTTP server (not just Express)
const httpServer = http.createServer(app);

// ─── SETUP SOCKET.IO ─────────────────────────────────────────
// Socket.io enables REAL-TIME communication between server and client
// When an order status changes, we instantly notify the user
// without them needing to refresh the page
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins (in production, specify your frontend URL)
    methods: ['GET', 'POST'],
  },
});

// ─── SOCKET.IO CONNECTION HANDLER ────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Client joins their personal room using their user ID
  // This allows us to send notifications to specific users
  // Example: when order status changes, notify only THAT customer
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Client disconnects (closes app, loses internet, etc.)
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── MAKE io AVAILABLE THROUGHOUT THE APP ────────────────────
// We attach io to the Express app so controllers can use it
// Usage in controllers: req.app.get('io').to(`user_${id}`).emit(...)
app.set('io', io);

// ─── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());

// ─── TEST ROUTE ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🍔 Food Delivery API is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── HEALTH CHECK ────────────────────────────────────────────
// No auth required — used by the frontend to detect if the backend is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── ALL API ROUTES ──────────────────────────────────────────
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/restaurants', require('./src/routes/restaurantRoutes'));

// Meal routes are nested under restaurants
// e.g., /api/restaurants/1/meals
app.use('/api/restaurants/:restaurantId/meals', require('./src/routes/mealRoutes'));

// Coupon routes are also nested under restaurants
// e.g., /api/restaurants/1/coupons
app.use('/api/restaurants/:restaurantId/coupons', require('./src/routes/couponRoutes'));

app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

// ─── 404 HANDLER ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── ERROR HANDLER ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// ─── START SERVER ─────────────────────────────────────────────
// Note: we use httpServer.listen (not app.listen)
// because Socket.io needs the HTTP server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔔 Socket.io ready for real-time notifications`);
});
