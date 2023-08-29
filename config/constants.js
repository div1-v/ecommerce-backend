module.exports = {
  //status codes
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORISED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSED_ENTITY: 422,
  TO_MANY_REQUEST: 429,
  SERVER_ERROR: 500,

  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,

  SECRET_KEY: process.env.SECRET_KEY,

  EMAIL: process.env.EMAIL,

  //response strings

  SUCCESSFUL_SIGNUP: "User SignedUp Successfully",
  SUCCESSFUL_LOGIN : "Logged in Successfully",
  SUCCESSFUL_LOGOUT: "Logged out Successfully",
  USER_UPDATE : "User has been updated successfully",
  CHANGE_TO_ADMIN: "SuccessFully changed to admin",
  FORGOT_PASSWORD :"An email with reset password link has been sent",
  PASSWORD_CHANGED: "Password changed successfully",
  DELETE_ACCOUNT :"User account deleted successfully",
  DELETE_PRODUCT :"Product deleted successfully",
  PRODUCT_CREATED : "Product created successfully",
  PRODUCT_UPDATE: "Product updated successfully",
  CART_ADD: "Product successfully added to cart",
  PRODUCT_FOUND:"Product found",
  ORDER_CREATED: "Your order has been placed. Check your email for more details",
  ORDER_DELIVER:"Your order has been delivered"

  

  
};
