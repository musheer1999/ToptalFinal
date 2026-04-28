const db = require('../config/database');

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create(email, hashedPassword, role) {
  const result = await db.query(
    'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
    [email, hashedPassword, role]
  );
  return result.rows[0];
}

async function findAllCustomers(ownerId) {
  const result = await db.query(`
    SELECT DISTINCT
      u.id,
      u.email,
      u.role,
      u.created_at,
      CASE WHEN bu.user_id IS NOT NULL THEN true ELSE false END AS is_blocked
    FROM users u
    LEFT JOIN blocked_users bu
      ON bu.user_id = u.id
      AND bu.restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = $1)
    WHERE u.role = 'customer'
    ORDER BY u.created_at DESC
  `, [ownerId]);
  return result.rows;
}

async function blockUser(userId, restaurantId) {
  await db.query(`
    INSERT INTO blocked_users (user_id, restaurant_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, restaurant_id) DO NOTHING
  `, [userId, restaurantId]);
}

async function unblockUser(userId, restaurantId) {
  await db.query(
    'DELETE FROM blocked_users WHERE user_id = $1 AND restaurant_id = $2',
    [userId, restaurantId]
  );
}

module.exports = { findByEmail, findById, create, findAllCustomers, blockUser, unblockUser };
