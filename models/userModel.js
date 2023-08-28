const mongoose = require("mongoose");
const Product = require("../models/productModel");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    imagePath: {
      type: String,
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

module.exports = mongoose.model("User", userSchema);
