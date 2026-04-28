const db = require('../config/database');

async function findByCustomerId(customerId) {
  const result = await db.query(`
    SELECT
      o.id, o.status, o.subtotal, o.discount, o.tip, o.total, o.created_at,
      r.name AS restaurant_name, r.id AS restaurant_id,
      c.code AS coupon_code
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    LEFT JOIN coupons c ON o.coupon_id = c.id
    WHERE o.customer_id = $1
    ORDER BY o.created_at DESC
  `, [customerId]);
  return result.rows;
}

async function findByRestaurantId(restaurantId) {
  const result = await db.query(`
    SELECT
      o.id, o.status, o.subtotal, o.discount, o.tip, o.total, o.created_at,
      u.email AS customer_email,
      c.code AS coupon_code
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN coupons c ON o.coupon_id = c.id
    WHERE o.restaurant_id = $1
    ORDER BY o.created_at DESC
  `, [restaurantId]);
  return result.rows;
}

async function findById(orderId) {
  const result = await db.query(`
    SELECT
      o.*,
      r.name AS restaurant_name,
      u.email AS customer_email,
      c.code AS coupon_code
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN coupons c ON o.coupon_id = c.id
    WHERE o.id = $1
  `, [orderId]);
  return result.rows[0] || null;
}

// Used by updateOrderStatus — needs owner_id for access check
async function findWithOwner(orderId) {
  const result = await db.query(`
    SELECT o.*, r.owner_id
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = $1
  `, [orderId]);
  return result.rows[0] || null;
}

async function findByIdAndCustomer(orderId, customerId) {
  const result = await db.query(
    'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
    [orderId, customerId]
  );
  return result.rows[0] || null;
}

async function findItemsByOrderId(orderId) {
  const result = await db.query(`
    SELECT
      oi.id, oi.quantity, oi.price,
      m.name AS meal_name, m.description AS meal_description
    FROM order_items oi
    JOIN meals m ON oi.meal_id = m.id
    WHERE oi.order_id = $1
  `, [orderId]);
  return result.rows;
}

async function findStatusHistory(orderId) {
  const result = await db.query(
    'SELECT status, changed_at FROM order_status_history WHERE order_id = $1 ORDER BY changed_at ASC',
    [orderId]
  );
  return result.rows;
}

async function findOriginalOrderItems(orderId) {
  const result = await db.query(`
    SELECT oi.meal_id, oi.quantity, m.price, m.name
    FROM order_items oi
    JOIN meals m ON oi.meal_id = m.id
    WHERE oi.order_id = $1
  `, [orderId]);
  return result.rows;
}

// runner must be a transaction client
async function isBlocked(customerId, restaurantId, runner) {
  const result = await runner.query(
    'SELECT id FROM blocked_users WHERE user_id = $1 AND restaurant_id = $2',
    [customerId, restaurantId]
  );
  return result.rows.length > 0;
}

async function createOrder(client, { customerId, restaurantId, couponId, subtotal, discount, tip, total }) {
  const result = await client.query(`
    INSERT INTO orders (customer_id, restaurant_id, coupon_id, subtotal, discount, tip, total, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'Placed')
    RETURNING *
  `, [customerId, restaurantId, couponId, subtotal, discount, tip, total]);
  return result.rows[0];
}

async function createOrderItem(client, { orderId, meal_id, quantity, price }) {
  await client.query(`
    INSERT INTO order_items (order_id, meal_id, quantity, price)
    VALUES ($1, $2, $3, $4)
  `, [orderId, meal_id, quantity, price]);
}

async function createStatusHistory(client, orderId, status) {
  await client.query(
    'INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)',
    [orderId, status]
  );
}

async function updateStatus(orderId, status) {
  await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
  await db.query(
    'INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)',
    [orderId, status]
  );
}

module.exports = {
  findByCustomerId,
  findByRestaurantId,
  findById,
  findWithOwner,
  findByIdAndCustomer,
  findItemsByOrderId,
  findStatusHistory,
  findOriginalOrderItems,
  isBlocked,
  createOrder,
  createOrderItem,
  createStatusHistory,
  updateStatus,
};
