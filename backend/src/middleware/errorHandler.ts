import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError' || (err.message && (err.message.includes('PDF') || err.message.includes('file type') || err.message.includes('Path traversal')))) {
    statusCode = 400;
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
