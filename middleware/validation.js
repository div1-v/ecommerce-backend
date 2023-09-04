const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { UNPROCESSED_ENTITY } = require("../config/constants");
const ErrorHandler = require("../utils/errorHandler");

exports.signupValidation = () => {
  return [
    body("email")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter email")
      .isEmail()
      .withMessage("Please enter valid email")
      .toLowerCase(),

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
      .isLength({ min: 6, max: 20 })
      .withMessage("Password should be more than 5 characters")
      .custom((value) => {
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) ||  !/[0-9]/.test(value) || !/[!@#$%^&*]/.test(value)){
           return false;
        }
        return true;

      })
      .withMessage("Password must contain atleast 1 lowercase, 1 uppercase, 1 numeric and 1 special character"),

    body("dob")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter date of birth")
      .custom((dob) => {
        let date = dob.split("/");

        if (
          date.length != 3 ||
          date[0].length != 2 ||
          date[1].length != 2 ||
          date[2].length != 4
        ) {
          return false;
        }
        return true;
      })
      .withMessage("Please enter valid date of birth"),
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
      .withMessage("Please enter valid email")
      .toLowerCase(),

    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter password")
      .isLength({ min: 6, max: 20 })
      .withMessage("Password should be more than 5 characters")
      .custom((value) => {
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) ||  !/[0-9]/.test(value) || !/[!@#$%^&*]/.test(value)){
           return false;
        }
        return true;

      })
      .withMessage("Password must contain atleast 1 lowercase, 1 uppercase, 1 numeric and 1 special character"),
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
      .withMessage("Price should be atleast 1 character long")
      .isNumeric()
      .withMessage("Price can only contain numbers"),

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
      .withMessage("Price should be atleast 1 character long")
      .isNumeric()
      .withMessage("Price can only contain numbers"),

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
      .withMessage("Please enter valid email")
      .toLowerCase(),
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
      .withMessage("PinCode can only contain numbers")
      .isLength({ min: 3 })
      .withMessage("Pincode should be more than 2 characters long"),
  ];
};

exports.resetPasswordValidation = () => {
  return [
    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter password")
      .isLength({ min: 6, max: 20 })
      .withMessage("Password should be more than 5 characters")
      .custom((value) => {
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) ||  !/[0-9]/.test(value) || !/[!@#$%^&*]/.test(value)){
           return false;
        }
        return true;

      })
      .withMessage("Password must contain atleast 1 lowercase, 1 uppercase, 1 numeric and 1 special character"),
  ];
};

exports.validationError = (req) => {
  const errors = validationResult(req);

  if (errors.array().length > 0) {
    throw new ErrorHandler(errors.array()[0].msg, UNPROCESSED_ENTITY);
  }
};
