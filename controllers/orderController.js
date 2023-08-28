const Product = require("../models/productModel");
const User = require("../models/userModel");
const sendMail = require("../utils/sendEmail");

const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const Order = require("../models/orderModel");
const template = require('../templates/email');
const constants = require('../config/constants');

//create an order
exports.createOrder = tryCatch(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById({ _id: userId }).populate("cart.product");

  if (user.cart.length == 0) {
    throw new ErrorHandler("Your cart is empty", constants.NOT_FOUND);
  }

  let totalCost = user.cart.reduce((total, cartItem) => {
    return total + cartItem.product.price * cartItem.quantity;
  }, 0);

  const emailTemplate = template.orderConfirmationEmail;
  const orderMailInfo = {
    name: user.name,
    email: user.email,
    totalCost: totalCost,
    emailTemplate
  };

  const orderData = {
    user: userId,
    products: user.cart,
    cost: totalCost,
  };

  await sendMail(orderMailInfo, "Order Details");

  const order = await Order.create(orderData);

  user.cart = [];
  await user.save();

  res.status(constants.OK).json({
    success: true,
    message: "Your order has been placed. Check your email for more details",
    order,
  });
});

//deliver the order
exports.postDeliverOrder = tryCatch(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findById({ _id: orderId });
  const user = await User.findById({ _id: req.userId });

  if (!order) {
    throw new ErrorHandler("Order with orderId does not exist", constants.NOT_FOUND);
  }

  if (order.isDelivered == 1) {
    throw new ErrorHandler("Order has already been delivered", constants.BAD_REQUEST);
  }
  order.isDelivered = Number(1);

  await order.save();

  const emailTemplate= template.orderDeliveredEmail;

  const mailData = {
    email: user.email,
    name: user.name,
    orderId: order._id,
    emailTemplate
  };
  await sendMail(mailData, "Order Delivered");

  res.status(constants.OK).json({
    success: true,
    order,
  });
});

//get all orders
exports.getAllOrders = tryCatch(async (req, res, next) => {
  const orders = await Order.find({ user: req.userId });

  if (!orders) {
    throw new ErrorHandler("You have not ordered anything yet", constants.NOT_FOUND);
  }

  res.status(constants.OK).json({
    success: true,
    orders,
  });
});
