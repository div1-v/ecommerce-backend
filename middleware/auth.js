const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const decoded = await jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({email:decoded.email});
    //console.log(user);
    req.userId=user._id;
    next();

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};