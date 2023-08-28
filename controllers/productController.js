const Product = require("../models/productModel");
const deleteImage = require("../utils/imageDelete");
const Feature = require("../utils/features");
const User = require("../models/userModel");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const { validationResult } = require("express-validator");
const constants = require("../config/constants");

//get all products
exports.getProducts = tryCatch(async (req, res, next) => {
  const perPage = 2;
  const page = req.query.page;
  if (!page) page = 1;
  const totalProduct = await Product.countDocuments();

  const products = await Product.find()
    .skip((page - 1) * perPage)
    .limit(perPage);

  const feature = new Feature(products, req.query);
  feature.sort();
  const filteredProducts = feature.search();

  if (filteredProducts.length == 0) {
    return new ErrorHandler();
  }
  res.status(constants.OK).json({ filteredProducts });
});

//get single product
exports.getProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    return new ErrorHandler("Product not found", constants.NOT_FOUND);
  }

  res.status(constants.OK).json({ product });
});
// create a product
exports.postProduct = tryCatch(async (req, res, next) => {
  const errors = validationResult(req);
  
  if(errors.array().length>0){
    throw new ErrorHandler(errors.array()[0].msg, constants.UNPROCESSED_ENTITY );
  }
  
  const name = req.body.name;
  if(!req.file){
     throw new ErrorHandler("Please add a product image", constants.UNPROCESSED_ENTITY);
  }
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
  res.status(constants.OK).json({
    message: "Product created",
    product,
  });
});

//delete a product
exports.deleteProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    throw new ErrorHandler("Invalid Id", constants.BAD_REQUEST);
  }

  if (product.creator.toString() != req.userId.toString()) {
    throw new ErrorHandler("Only creator of the product can delete", constants.UNAUTHORISED );
  }

  await Product.deleteOne({ _id: productId });
  await deleteImage(product.imagePath);

  res.status(constants.OK).json({
    message: "Product deleted Successfully",
  });
});

// update a product
exports.updateProduct = tryCatch(async (req, res, next) => {

  const errors = validationResult(req);
  
  console.log(errors.array()[0]);
  if(errors.array().length>0){
    throw new ErrorHandler(errors.array()[0].msg, constants.UNPROCESSED_ENTITY );
  }
  
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    return new ErrorHandler("Invalid Id", constants.BAD_REQUEST);
  }

  const name = req.body.name ?? product.name;
  const imagePath = req.file.path ?? product.imagePath;
  if (req.file.path && product.imagePath) {
    deleteImage(product.imagePath);
  }
  const price = req.body.price ?? product.price;
  const description = req.body.description ?? product.description;

  const updatedProduct = new Product({ name, imagePath, price, description });

  await Product.findByIdAndUpdate(
    { _id: productId },
    { name, imagePath, price, description }
  );

  res.status(constants.OK).json({
    message: "Product updated successfully",
    updatedProduct,
  });
});

// Add product to cart
exports.addToCart = tryCatch(async (req, res, next) => {
  const productId = req.params.id;
  const product = Product.findById({ _id: productId });
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

  res.status(constants.OK).json({
    message: "Successfully added to cart",
    user,
  });
});
