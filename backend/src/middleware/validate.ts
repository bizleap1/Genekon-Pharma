import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { sendError } from "../utils/apiResponse";

export const validateRequest =
  (schema: ZodTypeAny, source: "body" | "query" | "params" = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = await schema.parseAsync(req[source]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        return sendError(
          res,
          firstError?.message || "Validation failed",
          422,
          "VALIDATION_ERROR",
          error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }))
        );
      }
      return sendError(res, "Invalid request data", 400);
    }
  };
