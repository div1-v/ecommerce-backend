const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user: {
    type: Schema.type.ObjectId,
    ref: "User",
    required:true
  },

  products: [
    {
      quantity: {
        type: Number,
        required:true
      },
      product:{
        type:Schema.type.ObjectId,
        ref:'Product',
        required:true
      }
    }
  ]

}, {timestamps:true})

module.exports = mongoose.model('Order', orderSchema);