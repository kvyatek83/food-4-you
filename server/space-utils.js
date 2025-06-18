const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      let item = req.body.item;

      if (typeof item === "string") {
        item = JSON.parse(item);
      }

      const folder = req.body.category
        ? "categories"
        : item
        ? `items/${item.categoryId}`
        : "default-folder";
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

const deleteFolder = async (folderPath) => {
  // Ensure the folder path ends with a trailing slash
  const prefix = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;

  try {
    // List all objects in the folder
    const listedObjects = await s3
      .listObjectsV2({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: prefix,
      })
      .promise();

    if (listedObjects.Contents.length === 0) {
      return;
    }

    // Create an array of objects to delete
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
      },
    };

    // Delete the batch of objects
    await s3.deleteObjects(deleteParams).promise();

    // If there are more objects to delete (S3 returns max 1000 at a time)
    if (listedObjects.IsTruncated) {
      await deleteFolder(folderPath);
    }
  } catch (error) {
    console.error(`Error deleting folder ${folderPath}:`, error);
    throw error;
  }
};

module.exports = {
  s3,
  upload,
  deleteImage,
  deleteFolder,
};
