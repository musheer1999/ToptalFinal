// ─────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// Middleware = code that runs BEFORE the route handler.
// This one checks if the user is logged in (has valid token).
//
// Usage in routes:
//   router.get('/orders', authMiddleware, getOrders);
//   ↑ authMiddleware runs first. Only if valid → getOrders runs.
// ─────────────────────────────────────────────────────────────

const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  try {
    // ─── STEP 1: Get the token from request headers ─────────
    // Frontend sends token like: "Authorization: Bearer eyJhbGc..."
    // We split by space to get just the token part
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please login.' });
    }

    const token = authHeader.split(' ')[1]; // Get the part after "Bearer "

    // ─── STEP 2: Verify the token ───────────────────────────
    // If invalid/expired → this throws an error
    // If valid → returns { userId, role }
    const decoded = verifyToken(token);

    // ─── STEP 3: Attach user info to the request ────────────
    // Now ALL route handlers can access req.user.userId and req.user.role
    req.user = decoded;

    // ─── STEP 4: Continue to the next function ──────────────
    // next() = "this middleware is done, move on"
    next();

  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
}

// ─── OWNER-ONLY MIDDLEWARE ────────────────────────────────────
// Some routes should only be accessible by restaurant owners
// (like adding meals, managing coupons, etc.)
// Use this AFTER authMiddleware to check if user's role is 'owner'
function ownerOnlyMiddleware(req, res, next) {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied. Only restaurant owners can do this.' });
  }
  next();
}

// ─── CUSTOMER-ONLY MIDDLEWARE ─────────────────────────────────
// Some routes should only be for customers (like placing orders)
function customerOnlyMiddleware(req, res, next) {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied. Only customers can do this.' });
  }
  next();
}

module.exports = { authMiddleware, ownerOnlyMiddleware, customerOnlyMiddleware };
