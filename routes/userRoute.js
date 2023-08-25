const express = require("express");
const {isAuthenticated} = require('../middleware/auth')
const upload = require('../utils/imageUpload');

const router = express.Router();
const userController = require("../controllers/userController");

//User Routes
router.route("/signup").post(userController.postSignup);
router.route("/login").post(userController.postLogin);
router.route("/logout").post( isAuthenticated, userController.postLogout);
router.route('/user').put(isAuthenticated, upload, userController.updateUser);

router.route('/new-password').put( userController.resetPassword);

module.exports = router;
