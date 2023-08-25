const Product = require("../models/productModel");
const User = require("../models/userModel");
const sendMail = require('../utils/sendEmail');
const errorHandler = require('../utils/errorHandler')
const {tryCatch} = require('../middleware/asyncError');

exports.createOrder = tryCatch(async (req, res, next) => {
   const userId= req.userId;

    const user =await User.findById(userId).populate('cart.product');
   

    let totalCost = user.cart.reduce((total, cartItem)=>{
         return total+ (cartItem.product.price * cartItem.quantity);
    },0);
   
   const orderData={
      name: user.name,
      email:user.email,
      totalCost:totalCost
   }

  await sendMail( orderData , "Order Details");

  user.cart =[];
  user.save();
  console.log("d");
  res.status(200).json({
     success:true,
     message:"Your order has been placed. Check your email for more details"
  })

})