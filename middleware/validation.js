const { body , check} = require("express-validator");


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
      .isString()
      .withMessage("Please enter only letters")
      .isLength({ min: 3, max: 20 }),

    body("password")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter password")
      .isLength({ min: 3, max: 20 }),
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
      .isLength({ min: 3, max: 20 }),
  ];
};

exports.productValidation = ()=>{
  

  return [

    check("name")
      .trim()
      .not()
      .isEmpty()
      .isString()
      .withMessage("Please enter only letters")
      .isLength({ min: 3, max: 20 }),

    check("price")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter price"),

    check("imagePath")
      .not()
      .isEmpty()
      .withMessage("Please add an image"),

    check("description")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter description")
      .isLength({ min: 5, max: 80 }),
      
  ];
}