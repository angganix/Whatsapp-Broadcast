const multer = require("multer");
const path = require("path");
const dayjs = require("dayjs");

// determining upload location
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../uploads"));
  },
  filename: async function (req, file, callback) {
    callback(
      null,
      `${file.originalname?.split(".")[0]}-${dayjs().format(
        "YYYYMMDDHHmmss"
      )}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
};