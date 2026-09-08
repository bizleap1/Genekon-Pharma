export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...args);
  },
  security: (event: string, details: unknown) => {
    console.warn(`[SECURITY_EVENT] [${new Date().toISOString()}] ${event}`, details);
  },
};
