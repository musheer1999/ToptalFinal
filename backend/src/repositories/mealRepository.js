const db = require('../config/database');

async function findByRestaurantId(restaurantId) {
  const result = await db.query(
    'SELECT * FROM meals WHERE restaurant_id = $1 ORDER BY created_at DESC',
    [restaurantId]
  );
  return result.rows;
}

// runner can be a transaction client or the default db pool
async function findById(mealId, restaurantId, runner = db) {
  const result = await runner.query(
    'SELECT * FROM meals WHERE id = $1 AND restaurant_id = $2',
    [mealId, restaurantId]
  );
  return result.rows[0] || null;
}

async function create({ name, description, price, type, restaurantId }) {
  const result = await db.query(`
    INSERT INTO meals (name, description, price, type, restaurant_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [name, description || null, price, type || null, restaurantId]);
  return result.rows[0];
}

async function update(mealId, { name, description, price, type }) {
  const result = await db.query(`
    UPDATE meals
    SET
      name        = COALESCE($1, name),
      description = COALESCE($2, description),
      price       = COALESCE($3, price),
      type        = COALESCE($4, type)
    WHERE id = $5
    RETURNING *
  `, [name || null, description || null, price ? parseFloat(price) : null, type || null, mealId]);
  return result.rows[0];
}

async function remove(mealId) {
  await db.query('DELETE FROM meals WHERE id = $1', [mealId]);
}

module.exports = { findByRestaurantId, findById, create, update, remove };
