import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { sql } from "./config/database";

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 Genekon Authentication Backend running on port ${env.PORT}`);
  logger.info(`👉 Healthcheck: http://localhost:${env.PORT}/api/v1/health`);
  logger.info(`👉 Environment: ${env.NODE_ENV}`);

  // Test database connection to Neon
  try {
    const result = await sql`SELECT 1 as connected;`;
    if (result && result.length > 0) {
      logger.info(`✅ Successfully connected to Neon PostgreSQL Database`);
    }
  } catch (dbError: any) {
    logger.warn(`⚠️ Neon database probe warning: ${dbError.message}`);
  }
});

// Graceful termination
const shutdown = (signal: string) => {
  logger.info(`${signal} received: closing Genekon HTTP server gracefully`);
  server.close(() => {
    logger.info("HTTP server closed cleanly");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
