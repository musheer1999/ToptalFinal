// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// This file defines the URL endpoints for authentication.
// Each route connects a URL + HTTP method → a controller function.
//
// Base URL: /api/auth  (defined in server.js)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

// Import our controller functions
const { register, login, getMe } = require('../controllers/authController');

// Import auth middleware (to protect /me route)
const { authMiddleware } = require('../middleware/authMiddleware');

// ─── ROUTE DEFINITIONS ────────────────────────────────────────

// POST /api/auth/register — Create new account
// No middleware needed — anyone can register
router.post('/register', register);

// POST /api/auth/login — Login existing user
// No middleware needed — anyone can try to login
router.post('/login', login);

// GET /api/auth/me — Get current user's info
// Protected route — only logged-in users can access
// authMiddleware runs first, then getMe
router.get('/me', authMiddleware, getMe);

// Export the router so server.js can use it
module.exports = router;
