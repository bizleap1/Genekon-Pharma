import { desc, eq, and } from "drizzle-orm";
import { db, adminActivityLogs, users } from "../db";
import { logger } from "../utils/logger";

export interface LogActionParams {
  adminId: string;
  action: string;
  module: string;
  targetId?: string;
  details?: Record<string, any>;
}

export const activityLogService = {
  /**
   * Log an administrative action
   */
  async log(params: LogActionParams) {
    try {
      const [entry] = await db
        .insert(adminActivityLogs)
        .values({
          adminId: params.adminId,
          action: params.action,
          module: params.module,
          targetId: params.targetId || null,
          details: params.details || null,
        })
        .returning();

      logger.info(`[ADMIN_AUDIT] Admin ${params.adminId} performed ${params.action} on ${params.module} (${params.targetId || "N/A"})`);
      return entry;
    } catch (err) {
      logger.error("Failed to write admin activity log:", err);
      // Non-blocking: Do not fail primary admin operation if audit logging encounters an issue
      return null;
    }
  },

  /**
   * Fetch paginated activity logs
   */
  async getLogs(query: { page?: number; limit?: number; module?: string; adminId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (query.module) conditions.push(eq(adminActivityLogs.module, query.module));
    if (query.adminId) conditions.push(eq(adminActivityLogs.adminId, query.adminId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select({
        log: adminActivityLogs,
        admin: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(adminActivityLogs)
      .leftJoin(users, eq(adminActivityLogs.adminId, users.id))
      .where(whereClause)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      logs: logs.map((l) => ({
        ...l.log,
        admin: l.admin,
      })),
      page,
      limit,
    };
  },
};
