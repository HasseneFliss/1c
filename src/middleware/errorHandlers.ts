import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    res.status(400).json({
      error: 'Validation failed',
      details: validationErrors
    });
    return;
  }

  // Custom application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(env.NODE_ENV === 'development' && { stack: error.stack })
    });
    return;
  }

  // Database errors
  if (error.message.includes('duplicate key')) {
    res.status(409).json({
      error: 'Resource already exists'
    });
    return;
  }

  if (error.message.includes('foreign key')) {
    res.status(400).json({
      error: 'Invalid reference to related resource'
    });
    return;
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    ...(env.NODE_ENV === 'development' && {
      message: error.message,
      stack: error.stack
    })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};