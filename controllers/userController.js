const User = require("../models/userModel");
const deleteImage = require("../utils/imageDelete");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");
const template = require("../templates/email");
const constants = require("../config/constants");
const ResponseHandler = require("../utils/responseHandler");
const sharp = require("sharp");
const { encryptPassword } = require("../middleware/auth");
const { validationError } = require("../middleware/validation");

// SIGNUP USER
exports.postSignup = tryCatch(async (req, res, next) => {
  validationError(req);
  const { dob, name, email, password } = req.body;
  let date= dob.split('/');
  
  let dateOfBirth = new Date(date[2], date[1] - 1, date[0]);
  let curDate = Date.now();

  let years = (parseInt((curDate - dateOfBirth) / (1000 * 60 * 60 * 24 * 365.2425), 10));
  //console.log(dateOfBirth, curDate, diffDays);
  
  const count = await User.countDocuments();
  let isAdmin = 0;
  if (count == 0) {
    isAdmin = 1;
  }

  const userData = await User.findOne({ email });
  if (userData) {
    throw new ErrorHandler(constants.USER_EXIST, constants.FORBIDDEN);
  }

  const hashedPassword = await encryptPassword(password);
  const user = new User({
    dob:dateOfBirth,
    age:years,
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
  validationError(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler(constants.EMAIL_NOT_FOUND, constants.NOT_FOUND);
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    throw new ErrorHandler(constants.INCORRECT_PASSWORD, constants.FORBIDDEN);
  }

  const token = await user.getJWTToken();

  await user.save();

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
  const response = new ResponseHandler(
    constants.OK,
    constants.SUCCESSFUL_LOGOUT,
    "SUCCESSFUL_LOGOUT",
    { token: "" },
    res
  );
  response.getResponse();
});

// UPDATE A USER
exports.updateUser = tryCatch(async (req, res, next) => {
  const userId = req.userId;
  validationError(req);

  const user = await User.findById({ _id: userId });
  const name = req.body.name ?? user.name;
  let newEmail = req.body.email;

  let email = user.email;
  if (newEmail == email) {
    throw new ErrorHandler(constants.SAME_EMAIL_ERROR, constants.BAD_REQUEST);
  }

  const userwithnewEmail = await User.findOne({ email: newEmail });

  if (userwithnewEmail) {
    throw new ErrorHandler(constants.USER_EXIST, constants.UNPROCESSED_ENTITY);
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
  email = newEmail;
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
    throw new ErrorHandler(constants.NOT_ADMIN, constants.UNAUTHORISED);
  }
  const toBeAdminUserId = req.params.id;
  const toBeAdminUser = await User.findById({ _id: toBeAdminUserId });
  if (!toBeAdminUser) {
    throw new ErrorHandler(constants.USER_NOT_EXIST, constants.NOT_FOUND);
  }
  if (toBeAdminUser.isAdmin == 1) {
    throw new ErrorHandler(constants.ALREADY_ADMIN, constants.OK);
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
    throw new ErrorHandler(constants.USER_NOT_EXIST, constants.NOT_FOUND);
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
  validationError(req);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new ErrorHandler(constants.INVALID_TOKEN, constants.BAD_REQUEST);
  }
  const password = req.body.password;

  const hashedPassword = await encryptPassword(password);
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
