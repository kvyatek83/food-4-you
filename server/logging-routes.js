const express = require('express');
const { logger } = require('./logger-service');
const { verifyToken } = require('./auth-service');

const router = express.Router();

// Client logging endpoint - for Angular and Android
router.post('/client-log', verifyToken, (req, res) => {
  try {
    const { source, level, message, meta = {} } = req.body;

    // Validate required fields
    if (!source || !level || !message) {
      return res.status(400).json({
        error: 'Missing required fields: source, level, message'
      });
    }

    // Validate log level
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        error: 'Invalid log level. Must be one of: error, warn, info, debug'
      });
    }

    // Add request context to meta
    const enrichedMeta = {
      ...meta,
      correlationId: req.correlationId,
      userId: req.userId,
      userRole: req.userRole,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    // Log the client event
    logger.logClientEvent(source, level, message, enrichedMeta);

    res.status(200).json({
      success: true,
      message: 'Log recorded successfully',
      correlationId: req.correlationId
    });

  } catch (error) {
    logger.logApiError(req, error, 500);
    res.status(500).json({
      error: 'Failed to record log',
      message: error.message
    });
  }
});

// Batch logging endpoint for multiple logs at once
router.post('/client-logs/batch', verifyToken, (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({
        error: 'logs must be a non-empty array'
      });
    }

    if (logs.length > 100) {
      return res.status(400).json({
        error: 'Maximum 100 logs per batch'
      });
    }

    const results = [];
    const validLevels = ['error', 'warn', 'info', 'debug'];

    logs.forEach((logEntry, index) => {
      try {
        const { source, level, message, meta = {} } = logEntry;

        // Validate each log entry
        if (!source || !level || !message) {
          results.push({
            index,
            success: false,
            error: 'Missing required fields: source, level, message'
          });
          return;
        }

        if (!validLevels.includes(level)) {
          results.push({
            index,
            success: false,
            error: 'Invalid log level'
          });
          return;
        }

        // Add request context to meta
        const enrichedMeta = {
          ...meta,
          correlationId: req.correlationId,
          userId: req.userId,
          userRole: req.userRole,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          batchIndex: index
        };

        // Log the client event
        logger.logClientEvent(source, level, message, enrichedMeta);

        results.push({
          index,
          success: true
        });

      } catch (error) {
        results.push({
          index,
          success: false,
          error: error.message
        });
      }
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info('Batch logging completed', {
      totalLogs: logs.length,
      successCount,
      failureCount,
      correlationId: req.correlationId
    });

    res.status(200).json({
      success: true,
      message: `Processed ${logs.length} logs`,
      results,
      summary: {
        total: logs.length,
        successful: successCount,
        failed: failureCount
      },
      correlationId: req.correlationId
    });

  } catch (error) {
    logger.logApiError(req, error, 500);
    res.status(500).json({
      error: 'Failed to process batch logs',
      message: error.message
    });
  }
});

// Health check endpoint for logging service
router.get('/health', (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    logger.debug('Logging health check', {
      correlationId: req.correlationId,
      environment: isProduction ? 'production' : 'development'
    });

    res.status(200).json({
      success: true,
      service: 'logging',
      environment: isProduction ? 'production' : 'development',
      cloudWatchEnabled: isProduction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.logApiError(req, error, 500);
    res.status(500).json({
      error: 'Logging service health check failed',
      message: error.message
    });
  }
});

module.exports = router; 