const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
  },

  imagePath: {
    type: String,
    required:[true, "Please add an image"],
  },

  price: {
    type: Number,
    required: [true, "Please enter product price"],
  },

  creator:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },

  description: {
    type: String,
    required: [true, "Please enter description"],
  },
}, {timestamps:true})

module.exports = mongoose.model("Product", productSchema);
