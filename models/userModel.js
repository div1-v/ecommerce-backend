const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    dob:{
       type:Date
    },
    name: {
      type: String,
      required: [true, "Please enter user name"],
      minLength: [3, "Name should have more than 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Please enter user email"],
    },

    password: {
      type: String,
      required: [true, "Please enter password"],
      minLength: [6, "Password should have more than 5 characters"],
    },

    imagePath: {
      type: String,
    },

    age: {
      type: Number,
      required:true
    },

    isAdmin: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    cart: [
      {
        quantity: {
          type: Number,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    orders: [
      {
        products: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    ],

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },

  { timestamps: true }
);



userSchema.methods.getJWTToken = function () {
 
  return jwt.sign({ id: this._id , email:this.email}, process.env.SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model("User", userSchema);
