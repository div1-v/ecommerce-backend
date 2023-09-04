const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { tryCatch } = require("./asyncError");
const ErrorHandler = require("../utils/errorHandler");
const { UNAUTHORISED, SECRET_KEY, NOT_LOGGEDIN } = require("../config/constants");
const bcrypt = require('bcrypt');

exports.isAuthenticated = tryCatch(async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    throw new ErrorHandler(NOT_LOGGEDIN, UNAUTHORISED);
  }

  const decoded = await jwt.verify(token, SECRET_KEY);

  const user = await User.findOne({ email: decoded.email });
  if (!user) throw new ErrorHandler(NOT_LOGGEDIN, UNAUTHORISED);
  req.userId = user._id;
  next();
});

exports.isAdmin = tryCatch(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById({ _id: userId });
  if (user.isAdmin) {
    next();
  } else {
    throw new ErrorHandler("You are not admin", UNAUTHORISED);
  }
});

exports.encryptPassword =async (password)=>{
  return await bcrypt.hash(password, 12)
}