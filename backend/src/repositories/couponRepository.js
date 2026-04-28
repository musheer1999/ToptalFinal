const db = require('../config/database');

async function findByRestaurantId(restaurantId) {
  const result = await db.query(
    'SELECT * FROM coupons WHERE restaurant_id = $1 ORDER BY created_at DESC',
    [restaurantId]
  );
  return result.rows;
}

async function findById(couponId, restaurantId) {
  const result = await db.query(
    'SELECT * FROM coupons WHERE id = $1 AND restaurant_id = $2',
    [couponId, restaurantId]
  );
  return result.rows[0] || null;
}

// runner can be a transaction client or the default db pool
async function findByCode(code, restaurantId, runner = db) {
  const result = await runner.query(
    'SELECT * FROM coupons WHERE UPPER(code) = $1 AND restaurant_id = $2',
    [code.toUpperCase(), restaurantId]
  );
  return result.rows[0] || null;
}

async function create({ code, discountPercentage, restaurantId }) {
  const result = await db.query(`
    INSERT INTO coupons (code, discount_percentage, restaurant_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [code.toUpperCase(), discountPercentage, restaurantId]);
  return result.rows[0];
}

async function update(couponId, { code, discountPercentage }) {
  const result = await db.query(`
    UPDATE coupons
    SET
      code                = COALESCE($1, code),
      discount_percentage = COALESCE($2, discount_percentage)
    WHERE id = $3
    RETURNING *
  `, [code ? code.toUpperCase() : null, discountPercentage || null, couponId]);
  return result.rows[0];
}

async function remove(couponId) {
  await db.query('DELETE FROM coupons WHERE id = $1', [couponId]);
}

module.exports = { findByRestaurantId, findById, findByCode, create, update, remove };
