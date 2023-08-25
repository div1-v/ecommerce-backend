const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const deleteImage = require("../utils/imageDelete");

// signup user
exports.postSignup = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.send("Incomplete Data");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  await user.save();
  res.send(user);
};

// login user
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Email does not exist",
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Incorrect password",
    });
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
};

// logout user
exports.postLogout = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
    .json({
      success: true,
      message: "Logged out",
    });
};

// update a user
exports.updateUser = async (req, res, next) => {
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
    updatedUser,
  });
};

//reset password

exports.resetPassword = (req,res,next)=>{
   
}