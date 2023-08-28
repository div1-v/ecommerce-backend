const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const deleteImage = require("../utils/imageDelete");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const { validationResult } = require("express-validator");
const sendMail = require("../utils/sendEmail");
const crypto = require('crypto');
const template = require('../templates/email');
const constants = require('../config/constants');
const { NOTFOUND } = require("dns");

// signup user
exports.postSignup = tryCatch(async (req, res, next) => {
  const errors = validationResult(req);

  const { name, email, password } = req.body;
  if (errors.array().length > 0) {
    throw new ErrorHandler(errors.array()[0].msg, constants.UNPROCESSED_ENTITY);
  }
  const count = await User.countDocuments();
  let isAdmin = 0;
  if (count == 0) {
    isAdmin = 1;
  }

  const userData = await User.findOne({ email });
  if (userData) {
    throw new ErrorHandler("User already exist", constants.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    isAdmin: isAdmin,
  });

  await user.save();
  res.status(constants.CREATED).json({
    message: "User Signedup Successfully",
    user,
  });
});

// login user
exports.postLogin = tryCatch(async (req, res, next) => {
  
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    throw new ErrorHandler(errors.array()[0].msg, constants.UNAUTHORISED);
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("Email does not exist", constants.NOT_FOUND);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new ErrorHandler("Incorrect Password", constants.BAD_REQUEST);
  }

  const token = await jwt.sign(
    { email: user.email, userId: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "8h" }
  );

  res.status(constants.OK).cookie("token", token).json({
    token,
    userId: user._id,
  });
});

// logout user
exports.postLogout = tryCatch(async (req, res, next) => {
  res
    .status(constants.OK)
    .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
    .json({
      success: true,
      message: "Logged out",
    });
});

// update a user
exports.updateUser = tryCatch(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById({ _id: userId });
  const name = req.body.name ?? user.name;
  const email = user.email;
  const imagePath = req.file.path ?? user.imagePath;
  if (req.file.path && user.imagePath) {
    deleteImage(user.imagePath);
  }

  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { name, email, imagePath } },
    { new: true }
  );

  res.status(constants.CREATED).json({
    message: "User updated",
    updatedUser,
  });
});

//Make admin
exports.makeAdmin = tryCatch(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById({ userId });
  if (!user.isAdmin) {
    throw new ErrorHandler("Only admin can change user status", constants.UNAUTHORISED);
  }
  const toBeAdminUserId = req.params.id;
  const toBeAdminUser = await User.findById({ toBeAdminUserId });
  toBeAdminUser.isAdmin = 1;

  await toBeAdminUser.save();

  res.status(constants.OK).json({
    message: "Successfully changed to admin",
    toBeAdminUser,
  });
});

//forget password

exports.forgetPassword = tryCatch(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new ErrorHandler("No User found with this email", constants.NOT_FOUNDOUND);
  }
  
  const resetToken = crypto.randomBytes(20).toString("hex");
 
  // Hashing and adding resetPasswordToken to userSchema
  user.resetPasswordToken = resetToken;
  
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();
  
  const emailTemplate = template.resetPasswordEmail;
  const emailData = {
      name:user.name,
      email,
      emailTemplate,
      resetToken
      
  }
   await sendMail(emailData, "Forget password");

   res.status(constants.OK).json({
    success:true,
    message:"An email with reset password link has been sent",
    resetToken
   })
});

//Reset Password
exports.resetPassword = tryCatch(async (req, res, next) => {
  const resetPasswordToken = req.params.token;

  const user =await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new ErrorHandler("This token is not valid", constants.BAD_REQUEST);
  }
  const password = req.body.password;
  if (!password) {
    throw new ErrorHandler("Please enter password", constants.UNPROCESSED_ENTITY);
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  
  await user.save();

  res.status(constants.CREATED).json({
    success: true,
    message: "Password changed successfully",
  });
});
