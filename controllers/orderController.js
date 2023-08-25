const Product = require("../models/productModel");
const User = require("../models/userModel");
const sendMail = require('../utils/sendEmail');
const errorHandler = require('../utils/errorHandler')
const {tryCatch} = require('../middleware/asyncError');

exports.createOrder = tryCatch(async (req, res, next) => {
   const userId= req.userId;

   const user =await User.findById(userId);
   console.log(user);

  // await sendMail(user);

  res.status(200).json({
     success:true,
     message:"Your order has been placed. Check your email for more details"
  })

})