import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { APIError } from '../types';

export class AppError extends Error implements APIError {
  public readonly status: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let status = 500;
  let message = 'Internal Server Error';
  let code: string | undefined;

  if (error instanceof AppError) {
    status = error.status;
    message = error.message;
    code = error.code;
  }
  else if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
  }
  else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }
  else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    status = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ENTRY';
  }
  else if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }
  else if (error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }
  else if (error.name === 'ValidationError' && (error as any).isJoi) {
    status = 400;
    message = (error as any).details[0].message;
    code = 'VALIDATION_ERROR';
  }
  else if (process.env.NODE_ENV === 'development') {
    message = error.message;
  }

  logger.error('Request Error', {
    message: error.message,
    stack: error.stack,
    status,
    code,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  const errorResponse: any = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.path = req.path;
    errorResponse.method = req.method;
  }

  if (code) {
    errorResponse.code = code;
  }

  res.status(status).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

export const validationError = (message: string): AppError => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

export const authorizationError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const forbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const notFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

export const conflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

export const rateLimitError = (message: string = 'Too many requests'): AppError => {
  return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
};


export const serverError = (message: string = 'Internal server error'): AppError => {
  return new AppError(message, 500, 'INTERNAL_ERROR');
}; 