const mongoose = require("mongoose");
const { MONGO_URL } = require("./constants");

const connectDatabase = () => {
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDatabase;
