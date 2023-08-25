const Product = require("../models/productModel");
const User = require("../models/userModel");
const sendMail = require('../utils/sendEmail');

exports.createOrder = async (req, res, next) => {
    const userId= req.userId;

    const user =await User.findById(userId);

    
     
    await sendMail(user);



   res.status(200).json({
      success:true,
      message:"Your order has been placed. Check your email for more details"
   })
 
};
