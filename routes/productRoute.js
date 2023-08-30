const express = require("express");
const upload = require("../utils/imageUpload");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

const productController = require("../controllers/productController");
const { productValidation } = require("../middleware/validation");

router
  .route("/product/new")
  .post(isAuthenticated,isAdmin, upload, productValidation(), productController.postProduct);    //add product  --Admin

router
  .route("/product/:id")
  .get( isAuthenticated, productController.getProduct)   // get a single product  --All User

  .post(isAuthenticated, productController.addToCart)   //add to cart    --All user

  .put(isAuthenticated, isAdmin, upload, productController.updateProduct)   // update product   --Admin

  .delete(isAuthenticated,isAdmin, productController.deleteProduct);    // delete product     --Admin

router.route("/products").get(isAuthenticated, productController.getProducts);  // get all products   --All user


module.exports = router;
