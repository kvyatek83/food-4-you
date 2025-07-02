const db = require('./database-utils');

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.interval = null;
  }

  // Start the cleanup service
  start(daysOld = 40, runIntervalHours = 24) {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    this.isRunning = true;
    this.daysOld = daysOld;
    this.runIntervalHours = runIntervalHours;

    // Schedule the first run
    this.scheduleNextRun();

    console.log(`[${new Date().toISOString()}] Cleanup service started - will delete orders older than ${daysOld} days every ${runIntervalHours} hours`);

    // Run immediately if it's the first time
    this.runCleanup();
  }

  // Stop the cleanup service
  stop() {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log(`[${new Date().toISOString()}] Cleanup service stopped`);
  }

  // Schedule the next cleanup run
  scheduleNextRun() {
    if (!this.isRunning) return;

    const now = new Date();
    this.nextRun = new Date(now.getTime() + (this.runIntervalHours * 60 * 60 * 1000));
    
    const timeUntilNextRun = this.nextRun.getTime() - now.getTime();
    
    this.interval = setTimeout(() => {
      this.runCleanup();
    }, timeUntilNextRun);

    console.log(`[${new Date().toISOString()}] Next cleanup scheduled for: ${this.nextRun.toISOString()}`);
  }

  // Run the cleanup process
  async runCleanup() {
    if (!this.isRunning) return;

    try {
      console.log(`[${new Date().toISOString()}] Starting scheduled cleanup (orders older than ${this.daysOld} days)`);
      
      const result = await db.deleteOldOrders(this.daysOld);
      
      this.lastRun = new Date();
      
      console.log(`[${new Date().toISOString()}] Scheduled cleanup completed: ${result.message}`);
      
      // Schedule the next run
      this.scheduleNextRun();
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled cleanup failed:`, error);
      
      // Try again in 1 hour if it fails
      setTimeout(() => {
        this.runCleanup();
      }, 60 * 60 * 1000);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      daysOld: this.daysOld,
      runIntervalHours: this.runIntervalHours
    };
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

module.exports = cleanupService; 