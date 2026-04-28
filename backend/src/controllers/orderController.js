const orderService = require('../services/orderService');

async function placeOrder(req, res) {
  try {
    const order = await orderService.placeOrder(req.user.userId, req.body);
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to place order' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await orderService.getMyOrders(req.user.userId);
    res.json({ orders });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch orders' });
  }
}

async function getRestaurantOrders(req, res) {
  try {
    const orders = await orderService.getRestaurantOrders(req.params.restaurantId, req.user.userId);
    res.json({ orders });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch orders' });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.orderId, req.user.userId, req.user.role);
    res.json({ order });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch order' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const result = await orderService.updateOrderStatus(
      req.params.orderId, req.body.status, req.user.userId, req.user.role
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${result.customerId}`).emit('order_status_changed', {
        order_id: result.orderId,
        new_status: result.newStatus,
        message: `Your order status has been updated to: ${result.newStatus}`,
      });
    }

    res.json({ message: `Order status updated to ${result.newStatus}`, order_id: result.orderId, new_status: result.newStatus });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to update order status' });
  }
}

async function reorder(req, res) {
  try {
    const order = await orderService.reorder(req.params.orderId, req.user.userId);
    res.status(201).json({ message: 'Order placed successfully (reorder)', order });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to reorder' });
  }
}

module.exports = { placeOrder, getMyOrders, getRestaurantOrders, getOrderById, updateOrderStatus, reorder };
