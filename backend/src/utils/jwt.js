// ─────────────────────────────────────────────────────────────
// JWT TOKEN HELPER
// This file has helper functions to create and verify JWT tokens.
// JWT = JSON Web Token — used for user authentication.
//
// How it works:
//   1. User logs in → we create a token with their ID inside
//   2. User sends token with every request → we verify it
//   3. If valid → allow the request. If invalid → reject.
// ─────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ─── CREATE A TOKEN ───────────────────────────────────────────
// When a user registers or logs in, we create a token for them.
// The token contains: { userId, role } — encrypted with our secret.
// Only our server can verify it (because only we know the secret).
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },              // Data to put inside the token (payload)
    process.env.JWT_SECRET,        // Our secret key (from .env)
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // Token expires in 7 days
  );
}

// ─── VERIFY A TOKEN ───────────────────────────────────────────
// When a request comes in with a token, we verify it's valid.
// If valid → returns the data inside the token (userId, role)
// If invalid → throws an error
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Export both functions so other files can use them
module.exports = { generateToken, verifyToken };
