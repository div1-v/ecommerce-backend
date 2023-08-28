const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { errorHandler } = require("./utils/errorHandler");

const connectDatabase = require("./config/database");
const app = express();

app.use(express.json());
app.use(cookieParser());

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const orderRoute = require("./routes/orderRoute");

app.use("/auth", userRoute);
app.use("/admin", productRoute);
app.use("/admin", orderRoute);

app.use('/', (req,res)=>{
    res.status(400).json({
        message:"Invalid Route"
    })
})

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    statusCode: error.statusCode,
  });
});

connectDatabase();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on PORT ${process.env.PORT}`);
});
