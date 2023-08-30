const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const upload = require("../utils/imageUpload");

const router = express.Router();
const userController = require("../controllers/userController");
const {
  signupValidation,
  loginValidation,
} = require("../middleware/validation");

//User Routes
router.route("/signup").post( signupValidation(), userController.postSignup); //signup
router.route("/login").post( loginValidation(), userController.postLogin); //login
router.route("/logout").post(isAuthenticated, userController.postLogout); //logout

router.route("/user").put(isAuthenticated, upload, userController.updateUser)  //update user
      // .delete(isAuthenticated, userController.deleteAccount);              //Delete User Account

router
  .route("/password/new")
  .post(userController.forgetPassword)  // forget password
  
router.route('/password/:token').put(userController.resetPassword);  //reset Password

router.route("/:id").put(isAuthenticated, isAdmin, userController.makeAdmin); //make an user admin


module.exports = router;
