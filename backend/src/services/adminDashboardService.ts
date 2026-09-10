import { eq, and, sql, desc, inArray } from "drizzle-orm";
import {
  db,
  users,
  products,
  orders,
  prescriptions,
  wholesaleProfiles,
  adminActivityLogs,
} from "../db";

export const adminDashboardService = {
  /**
   * Aggregate executive statistics for the Admin Dashboard (High performance unified query)
   */
  async getDashboardStats() {
    // Run summary aggregates and recent records concurrently via Promise.all
    const [summaryResult, recentOrders, recentActivities] = await Promise.all([
      db.execute(sql`
        SELECT
          (SELECT count(*)::int FROM users WHERE role = 'CUSTOMER') AS "totalCustomers",
          (SELECT count(*)::int FROM users WHERE role = 'WHOLESALE_PARTNER') AS "totalWholesalePartners",
          (SELECT count(*)::int FROM products WHERE status = 'ACTIVE') AS "totalProducts",
          (SELECT count(*)::int FROM orders) AS "totalOrders",
          (SELECT coalesce(sum(case when payment_status in ('SUCCESS', 'PAID') or (payment_method = 'COD' and order_status = 'DELIVERED') then total_amount else 0 end), 0)::text FROM orders) AS "totalRevenue",
          (SELECT count(*)::int FROM prescriptions WHERE status = 'PENDING') AS "pendingPrescriptions",
          (SELECT count(*)::int FROM products WHERE status = 'ACTIVE' AND stock_quantity <= 20) AS "lowStockProducts",
          (SELECT count(*)::int FROM wholesale_profiles WHERE status = 'PENDING_VERIFICATION') AS "pendingWholesaleApplications";
      `),
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          totalAmount: orders.totalAmount,
          orderStatus: orders.orderStatus,
          paymentStatus: orders.paymentStatus,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(5),
      db
        .select()
        .from(adminActivityLogs)
        .orderBy(desc(adminActivityLogs.createdAt))
        .limit(5),
    ]);

    const row = ((summaryResult as any).rows?.[0] || {}) as any;

    return {
      summary: {
        totalCustomers: Number(row.totalCustomers || 0),
        totalWholesalePartners: Number(row.totalWholesalePartners || 0),
        totalProducts: Number(row.totalProducts || 0),
        totalOrders: Number(row.totalOrders || 0),
        totalRevenue: parseFloat(row.totalRevenue || "0"),
        pendingPrescriptions: Number(row.pendingPrescriptions || 0),
        lowStockProducts: Number(row.lowStockProducts || 0),
        pendingWholesaleApplications: Number(row.pendingWholesaleApplications || 0),
      },
      recentOrders,
      recentActivities,
    };
  },
};
