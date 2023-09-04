const express = require("express");

const orderController = require("../controllers/orderController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { orderValidation } = require("../middleware/validation");

const router = express.Router();

router
  .route("/order")
  .post(isAuthenticated, orderValidation(), orderController.createOrder); // order all products in cart  ------All User

router
  .route("/order/:id")
  .post(isAuthenticated, isAdmin, orderController.postDeliverOrder) //deliver an order ------Admin
  .get(isAuthenticated, orderController.getSingleOrder); //get single order by order id

router.route("/orders").get(isAuthenticated, orderController.getAllOrders); //get all orders ---------All user

module.exports = router;
