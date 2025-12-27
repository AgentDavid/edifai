import { Request, Response, NextFunction } from "express";
import SystemError from "../models/SystemError";

export const errorLogger = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only log 500 errors or errors without a status (assumed 500)
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    try {
      await SystemError.create({
        message: err.message || "Unknown Error",
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        status: "OPEN",
      });
      console.error("System Error Logged:", err.message);
    } catch (loggingError) {
      console.error("Failed to log system error:", loggingError);
    }
  }

  next(err);
};
