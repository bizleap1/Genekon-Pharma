import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { env } from "./config/env";

export const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Root Information
app.get("/", (_req, res) => {
  res.json({
    name: "Genekon Pharmacy & Wholesale Backend API",
    version: "1.0.0",
    documentation: "/api/v1/health",
  });
});

// Mount API v1
app.use("/api/v1", routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);
