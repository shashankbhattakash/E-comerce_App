const Order = require("../../models/Order");

// Get all orders (Admin)
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("cartItems.productId")
      .sort({ orderDate: -1 });

    if (!orders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get order details by ID (Admin)
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("cartItems.productId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
      data: updatedOrder,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
