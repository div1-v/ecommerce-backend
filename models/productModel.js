const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  imagePath: {
    type: String,
    required:true,
  },

  price: {
    type: Number,
    required: true,
  },

  creator:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },

  description: {
    type: String,
    required: true,
  },
}, {timestamps:true})

module.exports = mongoose.model("Product", productSchema);
