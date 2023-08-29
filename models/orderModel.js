const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDelivered: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    cost: {
      type: Number,
      required: true,
    },

    address: {
      city: {
        type: String,
        required: true
      },
      pinCode: {
        type: Number,
        required:true
      },
    },

    products: [
      {
        quantity: {
          type: Number,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
