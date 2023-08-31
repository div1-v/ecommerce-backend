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
const ResponseHandler = require("../utils/responseHandler");
const sharp = require("sharp");

// SIGNUP USER
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
    throw new ErrorHandler("User already exist", constants.FORBIDDEN);
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
    constants.SUCCESSFUL_SIGNUP,
    "SUCCESSFUL_SIGNUP",
    user,
    res
  );
  response.getResponse();
});

// LOGIN USER
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
    throw new ErrorHandler("Incorrect Password", constants.FORBIDDEN);
  }

  const token = await jwt.sign(
    { email: user.email, userId: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "8h" }
  );

  const response = new ResponseHandler(
    constants.OK,
    constants.SUCCESSFUL_LOGIN,
    "SUCCESSFUL_LOGIN",
    { userId: user._id, token },
    res
  );

  response.getResponse();
});

// LOGOUT USER
exports.postLogout = tryCatch(async (req, res, next) => {
  const user = await User.findById({ _id: req.userId });
  const token = await jwt.sign(
    { email: user.email, userId: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "1s" }
  );

  const response = new ResponseHandler(
    constants.OK,
    constants.SUCCESSFUL_LOGOUT,
    "SUCCESSFUL_LOGOUT",
    { token: token },
    res
  );
  response.getResponse();
});

// UPDATE A USER
exports.updateUser = tryCatch(async (req, res, next) => {
  const userId = req.userId;
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    throw new ErrorHandler(errors.array()[0].msg, constants.UNPROCESSED_ENTITY);
  }

  const user = await User.findById({ _id: userId });
  const name = req.body.name ?? user.name;
  let newEmail = req.body.email;

  let email = user.email;
  if (newEmail == email) {
    throw new ErrorHandler(
      "New Email cannot be same as old one",
      constants.BAD_REQUEST
    );
  }
  if (!newEmail) newEmail = email;
  let imagePath = user.imagePath;

  if (req.file) {
    imagePath = req.file.path;

    //resize image
    let img = `./${req.file.path}`;
    let newimg = `uploads/resized-${req.file.filename}`;
    sharp(img).resize(400, 400).toFile(newimg);

    if (user.imagePath) {
      deleteImage(user.imagePath);
      deleteImage(`uploads/${user.imagePath.substring(16)}`);
    }

    imagePath = newimg;
  }
  email=newEmail
  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { name, email, imagePath } },
    { new: true }
  );

  const response = new ResponseHandler(
    constants.CREATED,
    constants.USER_UPDATE,
    "USER_UPDATE",
    { updatedUser },
    res
  );
  response.getResponse();
});

// MAKE ADMIN
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
  if (!toBeAdminUser) {
    throw new ErrorHandler("No user found with this Id", constants.NOT_FOUND);
  }
  if (toBeAdminUser.isAdmin == 1) {
    throw new ErrorHandler("User is already an admin", constants.OK);
  }
  toBeAdminUser.isAdmin = 1;

  await toBeAdminUser.save();

  const response = new ResponseHandler(
    constants.OK,
    constants.CHANGE_TO_ADMIN,
    "CHANGE_TO_ADMIN",
    toBeAdminUser,
    res
  );
  response.getResponse();
});

//FORGOT PASSWORD
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

  const response = new ResponseHandler(
    constants.OK,
    constants.FORGOT_PASSWORD,
    "FOORGOT_PASSWORD",
    { resetToken },
    res
  );
  response.getResponse();
});

//RESET PASSWORD
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

  const response = new ResponseHandler(
    constants.CREATED,
    constants.PASSWORD_CHANGED,
    "PASSWORD_CHANGED",
    {},
    res
  );
  response.getResponse();
});

//DELETE USER ACCOUNT
// exports.deleteAccount = tryCatch(async (req, res, next) => {
//   const userId = req.userId;

//   const user = await User.findById({ _id: userId });
//   user.isDeleted =1;
//   await user.save();

//   const response = new ResponseHandler(
//     constants.OK,
//     constants.DELETE_ACCOUNT,
//     "DELETE_ACCOUNT",
//     {},
//     res
//   );
//   response.getResponse();
// });
