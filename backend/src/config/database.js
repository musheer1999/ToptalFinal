// ─────────────────────────────────────────────────────────────
// DATABASE CONNECTION
// This file creates a connection to our PostgreSQL database.
// We use "Pool" which manages multiple connections automatically.
// ─────────────────────────────────────────────────────────────

const { Pool } = require('pg');       // pg = PostgreSQL driver for Node.js
require('dotenv').config();            // Load variables from .env file

// Create a connection pool to the database
// A "pool" reuses connections instead of creating new ones every time
// This is much faster than connecting for each query
const pool = new Pool({
  host: process.env.DB_HOST,         // localhost
  port: process.env.DB_PORT,         // 5432
  database: process.env.DB_NAME,     // food_delivery
  user: process.env.DB_USER,         // postgres
  password: process.env.DB_PASSWORD, // your password
});

// Test the connection when the server starts
// This helps us catch connection problems early
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ PostgreSQL database connected successfully');
  release(); // Release the test connection back to the pool
});

// Export the pool so other files can use it to run queries
// Example usage in other files:
//   const db = require('./config/database');
//   const result = await db.query('SELECT * FROM users');
module.exports = pool;
