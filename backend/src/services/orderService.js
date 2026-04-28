const db = require('../config/database');
const orderRepo = require('../repositories/orderRepository');
const restaurantRepo = require('../repositories/restaurantRepository');
const couponRepo = require('../repositories/couponRepository');
const mealRepo = require('../repositories/mealRepository');

// Status flow rules — business logic lives here, not in the controller
const STATUS_TRANSITIONS = {
  'Placed':     { next: 'Processing', by: 'owner',    canCancel: true  },
  'Processing': { next: 'In Route',   by: 'owner',    canCancel: true  },
  'In Route':   { next: 'Delivered',  by: 'owner',    canCancel: false },
  'Delivered':  { next: 'Received',   by: 'customer', canCancel: false },
  'Received':   { next: null,         by: null,       canCancel: false },
  'Canceled':   { next: null,         by: null,       canCancel: false },
};

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function placeOrder(customerId, { restaurant_id, items, coupon_code, tip }) {
  if (!restaurant_id || !items || items.length === 0) {
    fail('Restaurant and at least one meal are required', 400);
  }

  const client = await db.connect();
  try {
    const restaurant = await restaurantRepo.findById(restaurant_id);
    if (!restaurant) fail('Restaurant not found', 404);

    const blocked = await orderRepo.isBlocked(customerId, restaurant_id, client);
    if (blocked) fail('You are blocked from ordering at this restaurant', 403);

    await client.query('BEGIN');

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.meal_id || !item.quantity || item.quantity < 1) {
        await client.query('ROLLBACK');
        fail('Each item needs meal_id and quantity (min 1)', 400);
      }

      const meal = await mealRepo.findById(item.meal_id, restaurant_id, client);
      if (!meal) {
        await client.query('ROLLBACK');
        fail(`Meal with id ${item.meal_id} not found in this restaurant`, 400);
      }

      subtotal += parseFloat(meal.price) * parseInt(item.quantity);
      validatedItems.push({
        meal_id: item.meal_id,
        quantity: parseInt(item.quantity),
        price: parseFloat(meal.price),
      });
    }

    let discount = 0;
    let couponId = null;

    if (coupon_code) {
      const coupon = await couponRepo.findByCode(coupon_code, restaurant_id, client);
      if (!coupon) {
        await client.query('ROLLBACK');
        fail('Invalid coupon code for this restaurant', 400);
      }
      couponId = coupon.id;
      discount = parseFloat(((subtotal * coupon.discount_percentage) / 100).toFixed(2));
    }

    const tipAmount = parseFloat(tip || 0);
    const total = parseFloat((subtotal - discount + tipAmount).toFixed(2));

    const order = await orderRepo.createOrder(client, {
      customerId,
      restaurantId: restaurant_id,
      couponId,
      subtotal: subtotal.toFixed(2),
      discount,
      tip: tipAmount,
      total,
    });

    for (const item of validatedItems) {
      await orderRepo.createOrderItem(client, { orderId: order.id, ...item });
    }

    await orderRepo.createStatusHistory(client, order.id, 'Placed');
    await client.query('COMMIT');

    return { ...order, items: validatedItems };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getMyOrders(customerId) {
  return orderRepo.findByCustomerId(customerId);
}

async function getRestaurantOrders(restaurantId, userId) {
  const restaurant = await restaurantRepo.findById(restaurantId);
  if (!restaurant) fail('Restaurant not found', 404);
  if (restaurant.owner_id !== userId) fail('You can only view orders for your own restaurant', 403);
  return orderRepo.findByRestaurantId(restaurantId);
}

async function getOrderById(orderId, userId, userRole) {
  const order = await orderRepo.findById(orderId);
  if (!order) fail('Order not found', 404);

  if (userRole === 'customer' && order.customer_id !== userId) {
    fail('You can only view your own orders', 403);
  }

  if (userRole === 'owner') {
    const restaurant = await restaurantRepo.findById(order.restaurant_id);
    if (restaurant.owner_id !== userId) fail('Access denied', 403);
  }

  const items = await orderRepo.findItemsByOrderId(orderId);
  const status_history = await orderRepo.findStatusHistory(orderId);

  return { ...order, items, status_history };
}

async function updateOrderStatus(orderId, status, userId, userRole) {
  if (!status) fail('Status is required', 400);

  const order = await orderRepo.findWithOwner(orderId);
  if (!order) fail('Order not found', 404);

  if (userRole === 'customer' && order.customer_id !== userId) {
    fail('You can only update your own orders', 403);
  }
  if (userRole === 'owner' && order.owner_id !== userId) {
    fail('You can only update orders for your own restaurant', 403);
  }

  const transition = STATUS_TRANSITIONS[order.status];

  if (status === 'Canceled') {
    if (!transition || !transition.canCancel) {
      fail(`Cannot cancel order with status: ${order.status}`, 400);
    }
  } else {
    if (!transition || transition.next !== status) {
      fail(`Invalid status transition from ${order.status} to ${status}`, 400);
    }
    if (transition.by === 'owner' && userRole !== 'owner') {
      fail(`Only the restaurant owner can change status to ${status}`, 403);
    }
    if (transition.by === 'customer' && userRole !== 'customer') {
      fail(`Only the customer can change status to ${status}`, 403);
    }
  }

  await orderRepo.updateStatus(orderId, status);

  // Return enough info for the controller to emit the socket event
  return { orderId, newStatus: status, customerId: order.customer_id };
}

async function reorder(orderId, customerId) {
  const client = await db.connect();
  try {
    const original = await orderRepo.findByIdAndCustomer(orderId, customerId);
    if (!original) fail('Original order not found', 404);

    const blocked = await orderRepo.isBlocked(customerId, original.restaurant_id, client);
    if (blocked) fail('You are blocked from ordering at this restaurant', 403);

    const originalItems = await orderRepo.findOriginalOrderItems(orderId);
    if (originalItems.length === 0) fail('Original order has no items', 400);

    let subtotal = 0;
    for (const item of originalItems) {
      subtotal += parseFloat(item.price) * parseInt(item.quantity);
    }
    const total = parseFloat(subtotal.toFixed(2));

    await client.query('BEGIN');

    const newOrder = await orderRepo.createOrder(client, {
      customerId,
      restaurantId: original.restaurant_id,
      couponId: null,
      subtotal: subtotal.toFixed(2),
      discount: 0,
      tip: 0,
      total,
    });

    for (const item of originalItems) {
      await orderRepo.createOrderItem(client, {
        orderId: newOrder.id,
        meal_id: item.meal_id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    await orderRepo.createStatusHistory(client, newOrder.id, 'Placed');
    await client.query('COMMIT');

    return newOrder;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  reorder,
};
