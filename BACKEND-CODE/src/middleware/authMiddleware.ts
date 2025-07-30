import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MarkerUser } from '../models/User';
import { authorizationError } from './errorHandler';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw authorizationError('No token provided');
    }

    const token = authHeader.substring(7);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    const user = await MarkerUser.findById(decoded.userId);
    if (!user) {
      throw authorizationError('User not found');
    }

    req.user = {
      uid: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(authorizationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(authorizationError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET;
      
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
        const user = await MarkerUser.findById(decoded.userId);
        
        if (user) {
          req.user = {
            uid: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(authorizationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(authorizationError('Insufficient permissions'));
    }

    next();
  };
};

export const generateToken = (user: any): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    jwtSecret
  );
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hashedPassword);
}; 