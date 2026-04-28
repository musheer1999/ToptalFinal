const db = require('../config/database');

const BASE_SELECT = `
  SELECT r.id, r.name, r.description, r.cuisine, r.latitude, r.longitude,
         r.owner_id, u.email AS owner_email, r.created_at
  FROM restaurants r
  JOIN users u ON r.owner_id = u.id
`;

async function findAll() {
  const result = await db.query(`${BASE_SELECT} ORDER BY r.created_at DESC`);
  return result.rows;
}

async function findById(id) {
  const result = await db.query(`${BASE_SELECT} WHERE r.id = $1`, [id]);
  return result.rows[0] || null;
}

async function findByOwnerId(ownerId) {
  const result = await db.query(
    'SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY created_at DESC',
    [ownerId]
  );
  return result.rows;
}

async function create({ name, description, cuisine, latitude, longitude, ownerId }) {
  const result = await db.query(`
    INSERT INTO restaurants (name, description, cuisine, latitude, longitude, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [name, description || null, cuisine || null, latitude || null, longitude || null, ownerId]);
  return result.rows[0];
}

async function update(id, { name, description, cuisine, latitude, longitude }) {
  const result = await db.query(`
    UPDATE restaurants
    SET
      name        = COALESCE($1, name),
      description = COALESCE($2, description),
      cuisine     = COALESCE($3, cuisine),
      latitude    = COALESCE($4, latitude),
      longitude   = COALESCE($5, longitude)
    WHERE id = $6
    RETURNING *
  `, [name, description, cuisine, latitude, longitude, id]);
  return result.rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM restaurants WHERE id = $1', [id]);
}

module.exports = { findAll, findById, findByOwnerId, create, update, remove };
