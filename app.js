require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./server/database-utils");

const cron = require("node-cron");
const { uploadDatabaseToS3 } = require("./server/backup-utils");
const cleanupService = require("./server/cleanup-service");

const { logger, requestLoggingMiddleware } = require("./server/logger-service");

const generalRoutes = require("./server/general-routes");
const adminRoutes = require("./server/admin-routes");
const travelerRoutes = require("./server/traveler-routes");
const loggingRoutes = require("./server/logging-routes");

const app = express();

// Add request logging middleware early in the pipeline
app.use(express.static(__dirname + "/dist/food-4-you/browser"));
app.use(bodyParser.json());
app.use(requestLoggingMiddleware);

// Add logging routes
app.use("/api/logs", loggingRoutes);

app.use("/api", generalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/traveler", travelerRoutes);

app.get("/*", (req, res) =>
  res.sendFile(path.join(__dirname + "/dist/food-4-you/browser/index.html"))
);

logger.info("Application starting", {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3311,
  backupTime: process.env.BACKUP_TIME || "0 0 * * *",
  backupTimezone: process.env.BACKUP_TIMEZONE || "America/New_York",
  cleanupDaysOld: process.env.CLEANUP_DAYS_OLD || 40,
  cleanupIntervalHours: process.env.CLEANUP_INTERVAL_HOURS || 24
});

// Start cleanup service
const cleanupDaysOld = parseInt(process.env.CLEANUP_DAYS_OLD) || 40;
const cleanupIntervalHours = parseInt(process.env.CLEANUP_INTERVAL_HOURS) || 24;

cleanupService.start(cleanupDaysOld, cleanupIntervalHours);
logger.info("Order cleanup service started", {
  daysOld: cleanupDaysOld,
  intervalHours: cleanupIntervalHours
});

cron.schedule(
  process.env.BACKUP_TIME || "0 0 * * *",
  async () => {
    logger.info("Starting database backup");
    try {
      await uploadDatabaseToS3();
      logger.info("Database backup completed successfully");
    } catch (error) {
      logger.error("Database backup failed", error);
    }
  },
  {
    timezone: process.env.BACKUP_TIMEZONE || "America/New_York",
  }
);

// Global error handler
app.use((error, req, res, next) => {
  logger.logApiError(req, error, 500);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    correlationId: req.correlationId
  });
});

(async () => {
  try {
    await db.syncModels(); // Ensure models are created and synced
    logger.info("Database models synced successfully");

    const port = process.env.PORT || 3311;
    app.listen(port, () => {
      const message = `Server is running on port ${port}`;
      console.log(message);
      logger.info("Server started successfully", { port });
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
