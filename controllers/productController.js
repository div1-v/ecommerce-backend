const Product = require("../models/productModel");
const deleteImage = require("../utils/imageDelete");
const Feature = require("../utils/features");
const User = require("../models/userModel");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const { validationResult } = require("express-validator");
const constants = require("../config/constants");
const ResponseHandler = require("../utils/responseHandler");
const sharp = require("sharp");

// GET ALL PRODUCTS
exports.getProducts = tryCatch(async (req, res, next) => {
  const perPage = 2;
  let page = req.query.page;
  if (!page) page = 1;
  const totalProduct = await Product.countDocuments( { isDeleted: 0 });

  let products = await Product.find({ isDeleted:0 })
    .skip((page - 1) * perPage)
    .limit(perPage);
  
   
    const features = new Feature(products, req.query);
    features.search();
    const filteredProducts = features.sort();
    if(filteredProducts.length == 0) {
      throw new ErrorHandler("No Product found", 404);
    }
    

  const response = new ResponseHandler(
    constants.OK,
    constants.PRODUCT_FOUND,
    "PRODUCT_FOUND",
    filteredProducts,
    res
  );
  response.getResponse();
});

//GET SINGLE PRODUCT
exports.getProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findOne({ _id: productId, isDeleted:0});

  if (!product) {
    throw new ErrorHandler("Product not found", constants.NOT_FOUND);
  }

  const response = new ResponseHandler(
    constants.OK,
    constants.PRODUCT_FOUND,
    "PRODUCT_FOUND",
    product,
    res
  );
  response.getResponse();
});

// CREATE A PRODUCT
exports.postProduct = tryCatch(async (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.array().length > 0) {
    throw new ErrorHandler(errors.array()[0].msg, constants.UNPROCESSED_ENTITY);
  }

  const name = req.body.name;
  
  if (!req.file) {
    throw new ErrorHandler(
      "Please add a product image",
      constants.UNPROCESSED_ENTITY
    );
  }
  
  let img = `./${req.file.path}`;
  sharp(img).resize(400,400).toFile(`uploads/resized-${req.file.filename}`);
  
  
  const imagePath = req.file.path;

  const price = req.body.price;
  const description = req.body.description;

  const product = new Product({
    name,
    imagePath,
    price,
    description,
    creator: req.userId,
  });

  await product.save();

  const response = new ResponseHandler(
    constants.OK,
    constants.PRODUCT_CREATED,
    "PRODUCT_CREATED",
    product,
    res
  );
  response.getResponse();
});

//DELETE A PRODUCT 
exports.deleteProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    throw new ErrorHandler("Invalid Id", constants.BAD_REQUEST);
  }

  if (product.creator.toString() != req.userId.toString()) {
    throw new ErrorHandler(
      "Only creator of the product can delete",
      constants.UNAUTHORISED
    );
  }

  if(product.imagePath){
     deleteImage(product.imagePath);
     deleteImage(`uploads/${product.imagePath.substring(16)}`)
  }

  product.isDeleted =1;
  await product.save();

  const response = new ResponseHandler(
    constants.OK,
    constants.DELETE_PRODUCT,
    "DELETE_PRODUCT",
    {},
    res
  );
  response.getResponse();
});

// UPDATE A PRODUCT
exports.updateProduct = tryCatch(async (req, res, next) => {
  const errors = validationResult(req);
 
  
  if (errors.array().length > 0) {
    throw new ErrorHandler(errors.array()[0].msg, constants.UNPROCESSED_ENTITY);
  }

  const productId = req.params.id;

  const product = await Product.findOne({ _id: productId ,isDeleted:0});

  if (!product) {
    throw new ErrorHandler("Invalid Id", constants.BAD_REQUEST);
  }

  const name = req.body.name ?? product.name;
  let imagePath = product.imagePath;

  //work with file ,resize and delete old image
  if (req.file) {
    imagePath = req.file.path;
    let img = `./${req.file.path}`;
    sharp(img).resize(400,400).toFile(`uploads/resized-${req.file.filename}`);
    
    if (product.imagePath) {
      deleteImage(product.imagePath);
      deleteImage(`uploads/${product.imagePath.substring(16)}`)
    }
  }
  const price = req.body.price ?? product.price;
  const description = req.body.description ?? product.description;

  const updatedProduct = new Product({ name, imagePath, price, description });

  await Product.findByIdAndUpdate(
    { _id: productId },
    { name, imagePath, price, description }
  );

  const response = new ResponseHandler(
    constants.OK,
    constants.PRODUCT_UPDATE,
    "PRODUCT_UPDATE",
    updatedProduct,
    res
  );
  response.getResponse();
});

// ADD PRODUCT TO CART
exports.addToCart = tryCatch(async (req, res, next) => {
  const productId = req.params.id;
  const product =await Product.findOne({ _id: productId ,isDeleted:0});
  
  if (!product) {
    throw new ErrorHandler("Invalid Id", constants.BAD_REQUEST);
  }

  const userId = req.userId;

  const user = await User.findById({ _id: userId });

  const isAddedToCart = await user.cart.find(
    (cart) => cart.product.toString() === productId.toString()
  );

  if (isAddedToCart) {
    user.cart.forEach((cart) => {
      if (cart.product.toString() === productId.toString())
        (cart.quantity = cart.quantity + 1), (cart.product = productId);
    });
  } else {
    user.cart.push({ product: productId, quantity: 1 });
  }
  await user.save();

  const response = new ResponseHandler(
    constants.OK,
    constants.CART_ADD,
    "CART_ADD",
    user,
    res
  );

  response.getResponse();
});
