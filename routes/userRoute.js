const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../utils/imageUpload");

const router = express.Router();
const userController = require("../controllers/userController");
const { signupValidation ,loginValidation} = require("../middleware/validation");

//User Routes
router.route("/signup").post( signupValidation() , userController.postSignup);
router.route("/login").post( loginValidation(),  userController.postLogin);
router.route("/logout").post(isAuthenticated, userController.postLogout);
router.route("/user").put(isAuthenticated, upload, userController.updateUser);  //update user

router.route("/new-password").put(userController.resetPassword);  //forget password

module.exports = router;
