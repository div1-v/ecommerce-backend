const User = require("../models/userModel");
const sendMail = require("../utils/sendEmail");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const Order = require("../models/orderModel");
const template = require("../templates/email");
const constants = require("../config/constants");
const ResponseHandler = require("../utils/responseHandler");
const { validationError } = require("../middleware/validation");

//CREATE AN ORDER
exports.createOrder = tryCatch(async (req, res, next) => {
  validationError(req);

  const userId = req.userId;
  
  const user = await User.findById({ _id: userId }).populate("cart.product");

  if (user.cart.length == 0) {
    throw new ErrorHandler( constants.EMPTY_CART, constants.NOT_FOUND);
  }
  const city = req.body.city;
  const pinCode = req.body.pinCode;

  let totalCost = user.cart.reduce((total, cartItem) => {
    return total + cartItem.product.price * cartItem.quantity;
  }, 0);

  const emailTemplate = template.orderConfirmationEmail;
  const orderMailInfo = {
    name: user.name,
    email: user.email,
    totalCost: totalCost,
    emailTemplate,
  };

  const orderData = {
    user: userId,
    products: user.cart,
    cost: totalCost,
    address: {
      city,
      pinCode,
    },
  };

  await sendMail(orderMailInfo, "Order Details");

  const order = await Order.create(orderData);

  user.cart = [];
  await user.save();

  const response = new ResponseHandler(
    constants.OK,
    constants.ORDER_CREATED,
    "ORDER_CREATED",
    order,
    res
  );
  response.getResponse();
});

//DELIVER THE ORDER
exports.postDeliverOrder = tryCatch(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findById({ _id: orderId });
  const user = await User.findById({ _id: req.userId });

  if (!order) {
    throw new ErrorHandler(
      constants.ORDER_NOT_FOUND,
      constants.NOT_FOUND
    );
  }

  if (order.isDelivered == 1) {
    throw new ErrorHandler(
      constants.ORDER_ALREADY_DELIVERED,
      constants.BAD_REQUEST
    );
  }
  order.isDelivered = Number(1);

  await order.save();

  const emailTemplate = template.orderDeliveredEmail;

  const mailData = {
    email: user.email,
    name: user.name,
    orderId: order._id,
    emailTemplate,
  };
  await sendMail(mailData, "Order Delivered");

  const response = new ResponseHandler(
    constants.OK,
    constants.ORDER_DELIVER,
    "ORDER_DELIVER",
    order,
    res
  );
  response.getResponse();
});

//GET ALL ORDERS
exports.getAllOrders = tryCatch(async (req, res, next) => {
  const orders = await Order.find({ user: req.userId });

  if (orders.length == 0) {
    throw new ErrorHandler(
      constants.NO_ORDERS,
      constants.NOT_FOUND
    );
  }

  const response = new ResponseHandler(
    constants.OK,
    constants.PRODUCT_FOUND,
    "PRODUCT_FOUND",
    orders,
    res
  );
  response.getResponse();
});

//GET SINGLE ORDER
exports.getSingleOrder = tryCatch(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById({ _id: orderId }).populate(
    "products.product"
  );
  if (!order) {
    throw new ErrorHandler(constants.ORDER_NOT_FOUND, constants.NOT_FOUND);
  }

  const response = new ResponseHandler(
    constants.OK,
    constants.PRODUCT_FOUND,
    "PRODUCT_FOUND",
    order,
    res
  );
  response.getResponse();
});
