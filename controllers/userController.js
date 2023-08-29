const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const deleteImage = require("../utils/imageDelete");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const { validationResult } = require("express-validator");
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");
const template = require("../templates/email");
const constants = require("../config/constants");
const { NOTFOUND } = require("dns");
const ResponseHandler = require("../utils/responseHandler");

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

  const response = new ResponseHandler(
    constants.CREATED,
    constants.SUCCESSFULL_SIGNUP,
    "SUCCESSFULL_SIGNUP",
    user,res
  );
  response.getResponse();
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

  const response =new ResponseHandler(
    constants.OK,
    constants.SUCCESSFUL_LOGIN,
    "SUCCESSFUL_LOGIN",
    { userId: user._id, token },res
  );
   
  response.getResponse();
  // res
  //   .status(response.statusCode)
  //   .cookie("token", token)
  //   .json(response.getResponse());
});

// logout user
exports.postLogout = tryCatch(async (req, res, next) => {

  const response =new ResponseHandler(
    constants.OK,
    constants.SUCCESSFUL_LOGOUT,
    "SUCCESSFUL_LOGOUT",
    {},res
  );
  response.getResponse();
  // res
  //   .status(response.statusCode)
  //   .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
  //   .json( response.getResponse());
});

// update a user
exports.updateUser = tryCatch(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById({ _id: userId });
  const name = req.body.name ?? user.name;
  const email = user.email;
  let imagePath = user.imagePath;

  if (req.file) {
   
    imagePath = req.file.path;
    if (user.imagePath) {
      deleteImage(user.imagePath);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { name, email, imagePath } },
    { new: true }
  );

  const response = new ResponseHandler(constants.CREATED,constants.USER_UPDATE,"USER_UPDATE",updatedUser,res);
  response.getResponse();
});

//Make admin
exports.makeAdmin = tryCatch(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById({ _id: userId });
  if (!user.isAdmin) {
    throw new ErrorHandler(
      "Only admin can change user status",
      constants.UNAUTHORISED
    );
  }
  const toBeAdminUserId = req.params.id;
  const toBeAdminUser = await User.findById({ _id: toBeAdminUserId });
  toBeAdminUser.isAdmin = 1;

  await toBeAdminUser.save();

  const response = new ResponseHandler(constants.OK, constants.CHANGE_TO_ADMIN,"CHANGE_TO_ADMIN",toBeAdminUser,res)
  response.getResponse();
});

//forget password

exports.forgetPassword = tryCatch(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler(
      "No User found with this email",
      constants.NOT_FOUND
    );
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  user.resetPasswordToken = resetToken;

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const emailTemplate = template.resetPasswordEmail;
  const emailData = {
    name: user.name,
    email,
    emailTemplate,
    resetToken,
  };
  await sendMail(emailData, "Forget password");

  const response = new ResponseHandler(constants.OK,constants.FORGOT_PASSWORD,"FOORGOT_PASSWORD",resetToken,res)
  response.getResponse();
});

//Reset Password
exports.resetPassword = tryCatch(async (req, res, next) => {
  const resetPasswordToken = req.params.token;

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new ErrorHandler("This token is not valid", constants.BAD_REQUEST);
  }
  const password = req.body.password;
  if (!password) {
    throw new ErrorHandler(
      "Please enter password",
      constants.UNPROCESSED_ENTITY
    );
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  
  const response = new ResponseHandler(constants.CREATED,constants.PASSWORD_CHANGED,"PASSWORD_CHANGED",{},res);
  response.getResponse();
});

//Delete User Account
exports.deleteAccount = tryCatch(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById({ _id: userId });
  await user.remove();

  const response = new ResponseHandler(constants.OK,constants.DELETE_ACCOUNT,"DELETE_ACCOUNT",{},res)
  response.getResponse();
});
