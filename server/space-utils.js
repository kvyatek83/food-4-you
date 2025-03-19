const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = req.body.category ? "categories" : "default-folder";
      const uniqueFilename = `${folder}/${uuidv4()}${path.extname(
        file.originalname
      )}`;
      cb(null, uniqueFilename);
    },
  }),
});

const deleteImage = async (imagePath) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imagePath,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  upload,
  deleteImage,
};
