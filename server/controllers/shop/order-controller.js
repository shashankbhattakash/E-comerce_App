const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Create new order (User)
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      orderDate,
      cartId,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-return`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "E-commerce payment",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Error creating PayPal payment",
        });
      }

      const newOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        status: "pending",
        paymentMethod,
        paymentStatus: "pending",
        totalAmount,
        orderDate,
      });

      await newOrder.save();

      const approvalURL = paymentInfo.links.find(
        (link) => link.rel === "approval_url"
      ).href;

      res.status(201).json({
        success: true,
        approvalURL,
        orderId: newOrder._id,
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Capture PayPal payment
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update payment info
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    // Deduct stock from products
    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      product.totalStock -= item.quantity;
      await product.save();
    }

    // Remove cart
    if (order.cartId) await Cart.findByIdAndDelete(order.cartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get all orders for a user
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate("cartItems.productId");

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

// Get order details by ID
const getOrderDetails = async (req, res) => {
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

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
