const fs = require("fs");
const path = require("path");
const { s3 } = require("./space-utils");
require("dotenv").config();

const dbPath = path.join(__dirname, process.env.DB_PATH || "app.db"); // Your database path
const bucketName = process.env.AWS_S3_BUCKET; // Your S3 bucket name
const backupPrefix = "backups/"; // Folder name in S3 to store backups
const maxBackups = 3; // Maximum number of backups to keep

// Upload Database to S3
const uploadDatabaseToS3 = async () => {
  if (!fs.existsSync(dbPath)) {
    console.error("Database file does not exist, cannot perform backup.");
    return;
  }

  const fileStream = fs.createReadStream(dbPath);
  const newBackupKey = `${backupPrefix}backup-${Date.now()}-app.db`; // Unique key for the new backup

  console.log(`Preparing to upload: ${newBackupKey}`);

  // Upload new backup
  const uploadParams = {
    Bucket: bucketName,
    Key: newBackupKey,
    Body: fileStream,
  };

  try {
    const data = await s3.upload(uploadParams).promise(); // Correctly call upload method
    console.log(`Database backup uploaded successfully at ${data.Location}`);

    // Manage old backups
    await manageOldBackups();
  } catch (err) {
    console.error("Error uploading database to S3:", err);
  }
};

// Manage old backups
const manageOldBackups = async () => {
  try {
    const listedObjects = await s3
      .listObjectsV2({
        Bucket: bucketName,
        Prefix: backupPrefix,
      })
      .promise();

    // Check for existing backups
    if (listedObjects.Contents.length > maxBackups) {
      const backups = listedObjects.Contents.filter((obj) =>
        obj.Key.startsWith(backupPrefix)
      ).sort((a, b) => a.LastModified - b.LastModified);

      const itemsToDelete = backups.slice(0, backups.length - maxBackups);

      // Delete oldest backup(s)
      await Promise.all(
        itemsToDelete.map((item) => {
          return s3
            .deleteObject({ Bucket: bucketName, Key: item.Key })
            .promise();
        })
      );

      console.log(
        `Deleted old backups: `,
        itemsToDelete.map((item) => item.Key)
      );
    }
  } catch (error) {
    console.error(`Error managing old backups:`, error);
  }
};

// Function to list backups
const listBackups = async () => {
  try {
    const listedObjects = await s3
      .listObjectsV2({
        Bucket: bucketName,
        Prefix: backupPrefix,
      })
      .promise();

    const backups = listedObjects.Contents.filter((obj) =>
      obj.Key.startsWith(backupPrefix)
    ).map(({ Key, LastModified }) => ({
      Key,
      LastModified: LastModified.toISOString(),
    }));

    return backups;
  } catch (error) {
    console.error("Error listing backups:", error);
    throw error;
  }
};

// Function to download a specific backup
const downloadBackup = async (key) => {
  const backupLocalPath = path.join(__dirname, "restored-app.db"); // Local path for the restored backup
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  // Create a write stream to save the downloaded file
  const fileStream = fs.createWriteStream(backupLocalPath);
  // Pipe the download stream to the file
  s3.getObject(params).createReadStream().pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on("finish", () => {
      console.log(`Downloaded backup: ${key} to ${backupLocalPath}`);
      resolve();
    });
    fileStream.on("error", (error) => {
      console.error("Error downloading backup:", error);
      reject(error);
    });
  });
};

module.exports = {
  uploadDatabaseToS3,
  listBackups,
  downloadBackup,
};
