const express = require('express');

const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.route('/order').post( isAuthenticated, orderController.createOrder)


module.exports = router;