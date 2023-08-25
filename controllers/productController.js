const Product = require("../models/productModel");
const deleteImage = require("../utils/imageDelete");
const Feature = require("../utils/features");
const User = require("../models/userModel");

//get all products
exports.getProducts = async (req, res, next) => {
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
    return res.send("No Products found");
  }
  res.send(filteredProducts);
};

//get single product
exports.getProduct = async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    return res.send("Invalid Id");
  }

  res.send(product);
};

// create a product
exports.postProduct = async (req, res, next) => {
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
  res.send(product);
};

//delete a product
exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });
  console.log(product);
  if (!product) {
    return res.send("Invalid Id");
  }

  await Product.deleteOne({ _id: productId });
  await deleteImage(product.imagePath);

  res.send("Product deleted");
};

// update a product
exports.updateProduct = async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById({ _id: productId });

  if (!product) {
    return res.send("Invalid Id");
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

  res.send(updatedProduct);
};

// Add product to cart
exports.addToCart = async (req, res, next) => {
  const productId = req.params.id;
  if (!req.userId) {
    return res.json({
      message: "Login first to add product to cart",
    });
  }

  const newCartItem = {
    product: productId,
    quantity: 1,
  };
  const user = await User.findById(req.userId);
 
  const isAddedToCart =await user.cart.find(
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

  res.send(user);
};
