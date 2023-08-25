const Product = require("../models/productModel");
const deleteImage = require("../utils/imageDelete");
const Feature = require("../utils/features");
const User = require("../models/userModel");
const { tryCatch } = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");

//get all products
exports.getProducts = tryCatch(async (req, res, next) => {
  const perPage = 2;
  const page = req.query.page;
  if (!page) page = 1;
  const totalProduct = await Product.countDocuments();

  const products = await Product.find()
    .skip((page - 1) * perPage)
    .limit(perPage);

  // console.log(req.userId);

  const feature = new Feature(products, req.query.sortByPrice, req.query.name);
  feature.sort();
  const filteredProducts = feature.search();

  if (filteredProducts.length == 0) {
    return new ErrorHandler();
  }
  res.status(200).json({filteredProducts});
});

//get single product
exports.getProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    return new ErrorHandler("Product not found", 404);
  }

  res.status(200).json({ product });
});
// create a product
exports.postProduct = tryCatch(async (req, res, next) => {
  const name = req.body.name;
  const imagePath = req.file.path;
  const price = req.body.price;
  const description = req.body.description;

  console.log(imagePath);
  const product = new Product({
    name,
    imagePath,
    price,
    description,
  });

  await product.save();
  res.status(200).json({
    message: "Product created",
    product,
  });
});

//delete a product
exports.deleteProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });
  console.log(product);
  if (!product) {
    return new ErrorHandler("Invalid Id", 404);
  }

  await Product.deleteOne({ _id: productId });
  await deleteImage(product.imagePath);

  res.status(200).json({
    message: "Product deleted",
  });
});

// update a product
exports.updateProduct = tryCatch(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    return new ErrorHandler("Invalid Id", 404);
  }

  const name = req.body.name ?? product.name;
  const imagePath = req.file.path ?? product.imagePath;
  if (req.file.path) {
    deleteImage(product.imagePath);
  }
  const price = req.body.price ?? product.price;
  const description = req.body.description ?? product.description;

  const updatedProduct = new Product({ name, imagePath, price, description });

  await Product.findByIdAndUpdate(
    { _id: productId },
    { name, imagePath, price, description }
  );

  res.status(200).json({
    message: "Product updated successfully",
    updatedProduct,
  });
});

// Add product to cart
exports.addToCart = tryCatch(async (req, res, next) => {
  const productId = req.params.id;
  if (!req.userId) {
    return new ErrorHandler("Login is first to add to cart", 401);
  }

  const newCartItem = {
    product: productId,
    quantity: 1,
  };
  const user = await User.findById(req.userId);

  const isAddedToCart = await user.cart.find(
    (cart) => cart.product.toString() === productId.toString()
  );

  if (isAddedToCart) {
    user.cart.forEach((cart) => {
      if (cart.product.toString() === productId.toString())
        (cart.quantity = cart.quantity + 1), (cart.product = productId);
    });
  } else {
    user.cart.push(newCartItem);
  }
  await user.save();

  res.status(200).json({
    message: "Successfully added to cart",
    product,
  });
});
