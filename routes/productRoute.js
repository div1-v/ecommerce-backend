const express = require("express");
const upload = require("../utils/imageUpload");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();
const productController = require("../controllers/productController");

router
  .route("/product/new")
  .post(isAuthenticated, upload, productController.postProduct);

router
  .route("/product/:id")
  .get( isAuthenticated, productController.getProduct)
  .post(isAuthenticated, productController.addToCart)
  .put(isAuthenticated, upload, productController.updateProduct)
  .delete(isAuthenticated, productController.deleteProduct);

router.route("/products").get(isAuthenticated, productController.getProducts);


module.exports = router;
