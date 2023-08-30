const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { tryCatch } = require("./asyncError");
const ErrorHandler = require("../utils/errorHandler");
const { UNAUTHORISED, SECRET_KEY } = require("../config/constants");

exports.isAuthenticated = tryCatch(async (req, res, next) => {
  
  const  token  = req.headers.token;
 
  if (!token) {
    throw new ErrorHandler("Please login first", UNAUTHORISED);
  }

  const decoded = await jwt.verify(token, SECRET_KEY);

  const user = await User.findOne({email:decoded.email});
 
  req.userId=user._id;
  next();

});

exports.isAdmin = tryCatch(async(req,res,next)=>{
    const userId= req.userId;
    
    const user = await User.findById({_id:userId});
    if(user.isAdmin){
      next();
    }else{
      throw new ErrorHandler("You are not admin", UNAUTHORISED);
    }
})
















