const mongoose= require('mongoose');
const Product= require('../models/productModel')

const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    imagePath: {
      type: String,
      required:true
    },

    cart: [
        {
          quantity: {
            type: Number,
            
          },
          product:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
          }
        }
      ]
} ,{timestamps:true})

module.exports= mongoose.model('User', userSchema);