import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found on Genekon API server`,
    404,
    "ROUTE_NOT_FOUND"
  );
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  logger.error(`Unhandled error: ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error occurred. Please contact support."
      : err.message || "Internal server error";

  return sendError(res, message, statusCode, err.code || "SERVER_ERROR");
};
