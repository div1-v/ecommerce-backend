const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const deleteImage = require("../utils/imageDelete");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const {validationResult} = require('express-validator')

// signup user
exports.postSignup = tryCatch(async (req, res, next) => {
  const errors = validationResult(req);
  const { name, email, password } = req.body;
  

  if(errors){
    throw new ErrorHandler(errors.array()[0].msg, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  await user.save();
  res.status(201).json({ 
    message: "User Signedup Successfully",
    user
   });
});

// login user
exports.postLogin = tryCatch(async (req, res, next) => {
  const errors = validationResult(req);
  if(errors){
    throw new ErrorHandler(errors.array()[0].msg, 400);
  }
  
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
     throw new ErrorHandler("Email does not exist", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
     throw new ErrorHandler("Incorrect Password", 401);
  }

  const token = await jwt.sign(
    { email: user.email, userId: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "8h" }
  );

  res.status(200).cookie("token", token).json({
    token,
    userId: user._id,
  });
});

// logout user
exports.postLogout = tryCatch(async (req, res, next) => {
  res
    .status(200)
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
  if (req.file.path) {
    deleteImage(user.imagePath);
  }

  const updatedUser = await new User({ name, email, imagePath });

  await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { name, email, imagePath } }
  );

  res.status(200).json({
    message:"User updated",
    updatedUser,
  });
});

//reset password

exports.resetPassword = (req, res, next) => {};
