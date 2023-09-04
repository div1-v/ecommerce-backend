const express = require("express");
require("dotenv").config();
const constants = require("./config/constants");
const connectDatabase = require("./config/database");

const app = express();

app.use(express.json());

connectDatabase();

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const orderRoute = require("./routes/orderRoute");

app.use("/auth", userRoute);
app.use("/admin", productRoute);
app.use("/admin", orderRoute);

app.use("/", (req, res) => {
  res.status(constants.BAD_REQUEST).json({
    meta: {
      success: false,
      message: "Invalid Route",
    },
  });
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || constants.SERVER_ERROR).json({
    meta: {
      success: false,
      message: error.message || constants.INTERNAL_SERVER_ERROR,
      statusCode: error.statusCode || constants.SERVER_ERROR,
    },
  });
});


app.listen(constants.PORT, () => {
  console.log(`Server is running on PORT ${constants.PORT}`);
});
