const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

class LoggerService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logger = this.createLogger();
  }

  createLogger() {
    const transports = [];

    if (this.isProduction) {
      // CloudWatch transport for production
      transports.push(
        new WinstonCloudWatch({
          logGroupName: 'food-4-you-app',
          logStreamName: () => {
            const date = new Date().toISOString().split('T')[0];
            return `app-${date}`;
          },
          awsRegion: process.env.AWS_REGION || 'sa-east-1',
          messageFormatter: ({ level, message, timestamp, ...meta }) => {
            return JSON.stringify({
              timestamp,
              level,
              message,
              ...meta
            });
          },
          retentionInDays: 30, // Keep logs for 30 days
          uploadRate: 2000, // Upload every 2 seconds
          errorHandler: (err) => {
            console.error('CloudWatch logging error:', err);
          }
        })
      );
    } else {
      // Console transport for development
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          )
        })
      );
    }

    return winston.createLogger({
      level: this.isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      defaultMeta: {
        service: 'food-4-you-backend',
        environment: this.isProduction ? 'production' : 'development'
      }
    });
  }

  // Logging methods
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      ...meta,
      error: {
        message: error.message,
        stack: error.stack,
        ...error
      }
    } : meta;
    this.logger.error(message, errorMeta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Utility methods
  generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  logApiRequest(req, res, duration) {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      correlationId: req.correlationId,
      userId: req.userId,
      userRole: req.userRole,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    if (res.statusCode >= 400) {
      this.error('API Request Failed', null, meta);
    } else {
      this.info('API Request Completed', meta);
    }
  }

  logApiError(req, error, statusCode = 500) {
    this.error('API Error', error, {
      method: req.method,
      url: req.url,
      status: statusCode,
      correlationId: req.correlationId,
      userId: req.userId,
      userRole: req.userRole
    });
  }

  logDatabaseOperation(operation, table, data = {}, duration = null) {
    this.info('Database Operation', {
      operation,
      table,
      duration: duration ? `${duration}ms` : null,
      recordCount: Array.isArray(data) ? data.length : 1,
      ...data
    });
  }

  logAuthEvent(event, userId, success, details = {}) {
    this.info('Authentication Event', {
      event,
      userId,
      success,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  logPrinterEvent(event, printerIp, success, details = {}) {
    this.info('Printer Event', {
      event,
      printerIp,
      success,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  logClientEvent(source, level, message, meta = {}) {
    const logMethod = this[level] || this.info;
    logMethod.call(this, `[${source}] ${message}`, {
      source,
      clientTimestamp: meta.timestamp,
      ...meta
    });
  }
}

const loggerService = new LoggerService();

// Middleware for request correlation and timing
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  req.correlationId = loggerService.generateCorrelationId();
  
  // Log request start
  loggerService.debug('Request Started', {
    method: req.method,
    url: req.url,
    correlationId: req.correlationId
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    loggerService.logApiRequest(req, res, duration);
    originalEnd.apply(this, args);
  };

  next();
};

module.exports = {
  logger: loggerService,
  requestLoggingMiddleware
}; 