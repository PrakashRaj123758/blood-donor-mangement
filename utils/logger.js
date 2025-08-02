const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data || null
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content);
  }

  info(message, data = null) {
    const logContent = this.formatMessage('INFO', message, data);
    console.log(`📝 [INFO] ${message}`);
    this.writeToFile('info.log', logContent);
  }

  error(message, error = null) {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : null;
    
    const logContent = this.formatMessage('ERROR', message, errorData);
    console.error(`❌ [ERROR] ${message}`, error ? error.stack : '');
    this.writeToFile('error.log', logContent);
  }

  warn(message, data = null) {
    const logContent = this.formatMessage('WARN', message, data);
    console.warn(`⚠️ [WARN] ${message}`);
    this.writeToFile('warn.log', logContent);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const logContent = this.formatMessage('DEBUG', message, data);
      console.log(`🔍 [DEBUG] ${message}`);
      this.writeToFile('debug.log', logContent);
    }
  }

  // API Request Logging
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };

      if (res.statusCode >= 400) {
        logger.error(`API Request Failed: ${req.method} ${req.url}`, logData);
      } else {
        logger.info(`API Request: ${req.method} ${req.url}`, logData);
      }
    });

    next();
  }

  // Database Operation Logging
  logDatabaseOperation(operation, collection, duration, success, error = null) {
    const logData = {
      operation,
      collection,
      duration: `${duration}ms`,
      success
    };

    if (success) {
      logger.info(`Database ${operation} on ${collection}`, logData);
    } else {
      logger.error(`Database ${operation} failed on ${collection}`, error);
    }
  }

  // Authentication Logging
  logAuthEvent(event, userId, success, details = null) {
    const logData = {
      event,
      userId,
      success,
      details
    };

    if (success) {
      logger.info(`Auth Event: ${event}`, logData);
    } else {
      logger.error(`Auth Event Failed: ${event}`, details);
    }
  }

  // Inventory Alert Logging
  logInventoryAlert(bloodType, currentStock, threshold, alertType) {
    const logData = {
      bloodType,
      currentStock,
      threshold,
      alertType
    };

    logger.warn(`Inventory Alert: ${alertType} for ${bloodType}`, logData);
  }

  // Get log statistics
  getLogStats() {
    const stats = {
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      recentErrors: []
    };

    try {
      const errorLogPath = path.join(this.logDir, 'error.log');
      if (fs.existsSync(errorLogPath)) {
        const errorLogs = fs.readFileSync(errorLogPath, 'utf8')
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line))
          .reverse()
          .slice(0, 10);

        stats.errorCount = errorLogs.length;
        stats.recentErrors = errorLogs;
      }
    } catch (error) {
      console.error('Error reading log stats:', error);
    }

    return stats;
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger; 