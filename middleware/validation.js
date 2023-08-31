const { body, check } = require("express-validator");

exports.signupValidation = () => {
  return [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter email")
      .isEmail()
      .withMessage("Please enter valid email"),

    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter name")
      .isString()
      .withMessage("Please enter only letters")
      .isLength({ min: 3, max: 20 })
      .withMessage("Name should be more than 2 characters"),

    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter password")
      .isLength({ min: 3, max: 20 })
      .withMessage("Password should be more than 2 characters"),
  ];
};

exports.loginValidation = () => {
  return [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter email")
      .isEmail()
      .withMessage("Please enter valid email"),

    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter password")
      .isLength({ min: 3, max: 20 })
      .withMessage("Password should be more than 2 characters"),
  ];
};

exports.productValidation = () => {
  return [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter name")
      .isString()
      .withMessage("Please enter only letters")
      .isLength({ min: 3, max: 20 })
      .withMessage("Name should be more than 2 characters"),

    body("price")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter price")
      .isLength({ min: 1, max: 80 })
      .withMessage("Price should be atleast 1 character long"),

    body("description")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter description")
      .isLength({ min: 5, max: 80 })
      .withMessage("Description should be more than 4 characters"),
  ];
};

exports.updateProductValidation = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isString()
      .withMessage("Name can only contain letters")
      .isLength({ min: 3, max: 20 })
      .withMessage("Name should be more than 2 characters"),

    body("price")
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage("Price should be atleast 1 character long"),

    body("imagePath")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Please add an image"),

    body("description")
      .optional()
      .trim()
      .isLength({ min: 5, max: 80 })
      .withMessage("Description should be more than 4 characters"),
  ];
};

exports.updateUserValidation = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isString()
      .withMessage("Name can only contain letters")
      .isLength({ min: 3, max: 20 })
      .withMessage("Name should be more than 2 characters"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Please enter valid email"),
  ];
};

exports.orderValidation = () => {
  return [
    body("city")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter city name")
      .isString()
      .withMessage("Name can only contain letters")
      .isLength({ min: 3, max: 20 })
      .withMessage("City name should be more than 2 characters"),

    body("pinCode")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter pinCode")
      .isNumeric()
      .withMessage("Please enter only numbers")
      .isLength({min:3})
      .withMessage("Pincode should be more than 2 characters long")
  ];
};
