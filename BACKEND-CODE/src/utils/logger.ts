import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
});

if (process.env.NODE_ENV === 'production') {
  logger.remove(logger.transports[0]);
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: logFormat,
    maxsize: 10485760,
    maxFiles: 10,
  }));
}

export const logStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export const loggerHelpers = {
  logRequest: (method: string, url: string, statusCode: number, responseTime: number, ip?: string): void => {
    logger.http('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logError: (error: Error, context?: Record<string, any>): void => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  logDatabaseOperation: (operation: string, collection: string, duration?: number, details?: Record<string, any>): void => {
    logger.info('Database Operation', {
      operation,
      collection,
      duration: duration ? `${duration}ms` : undefined,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  logSubmissionEvent: (submissionId: string, event: string, phase?: string, details?: Record<string, any>): void => {
    logger.info('Submission Event', {
      submissionId,
      event,
      phase,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  logAPICall: (service: string, endpoint: string, statusCode?: number, duration?: number, error?: string): void => {
    const level = error ? 'error' : 'info';
    logger.log(level, 'External API Call', {
      service,
      endpoint,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error,
      timestamp: new Date().toISOString(),
    });
  },

  logSecurityEvent: (event: string, ip?: string, userAgent?: string, details?: Record<string, any>): void => {
    logger.warn('Security Event', {
      event,
      ip,
      userAgent,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

export { logger }; 