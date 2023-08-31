const fs = require("fs");
const path = require("path");

const deleteImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => new Error("An error occured while deleting image"));
};

module.exports = deleteImage;
