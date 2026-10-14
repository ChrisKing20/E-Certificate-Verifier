import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError' || (err.message && (err.message.includes('PDF') || err.message.includes('file type') || err.message.includes('Path traversal')))) {
    statusCode = 400;
  }

  // MongoDB duplicate-key safety net: E11000 errors that slip past controller handling
  if ((err.code === 11000 || err.name === 'MongoServerError') && statusCode === 500) {
    statusCode = 409;
    const keyPattern = err.keyPattern || {};
    if (keyPattern.fileHash) {
      message = 'This exact certificate PDF has already been registered.';
    } else if (keyPattern.institutionId || keyPattern.recipientEmail || keyPattern.eventName) {
      message = 'A certificate for this recipient, event, date, type, and department has already been issued by this institution.';
    } else if (keyPattern.certificateId) {
      message = 'A certificate with this ID already exists.';
    } else {
      message = 'Duplicate entry detected. This record already exists.';
    }
  }

  if (statusCode >= 500) {
    console.error('❌ Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};
