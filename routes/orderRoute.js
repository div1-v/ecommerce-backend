const express = require('express');

const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.route('/order').post( isAuthenticated, orderController.createOrder)    // order a product  --All User

router.route('/order/:id').post(isAuthenticated, orderController.postDeliverOrder);  //deliver an order --All user

router.route('/orders').get(isAuthenticated , orderController.getAllOrders);  //get all orders --All user


module.exports = router;