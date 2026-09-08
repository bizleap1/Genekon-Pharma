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
   * Aggregate executive statistics for the Admin Dashboard
   */
  async getDashboardStats() {
    // 1. Total Customers
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "CUSTOMER"));

    // 2. Total Wholesale Partners
    const [wholesaleCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "WHOLESALE_PARTNER"));

    // 3. Total Active Products
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.status, "ACTIVE"));

    // 4. Total Orders & Revenue
    const [orderMetrics] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`coalesce(sum(case when payment_status in ('SUCCESS', 'PAID') then total_amount else 0 end), 0)::text`,
      })
      .from(orders);

    // 5. Pending Prescriptions
    const [prescriptionCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(prescriptions)
      .where(eq(prescriptions.status, "PENDING"));

    // 6. Low Stock Products (threshold: 20 units)
    const [lowStockCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(
        and(
          eq(products.status, "ACTIVE"),
          sql`${products.stockQuantity} <= 20`
        )
      );

    // 7. Pending Wholesale Applications
    const [pendingWholesale] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wholesaleProfiles)
      .where(eq(wholesaleProfiles.status, "PENDING_VERIFICATION"));

    // 8. Recent 5 Orders
    const recentOrders = await db
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
      .limit(5);

    // 9. Recent 5 Admin Activities
    const recentActivities = await db
      .select()
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(5);

    return {
      summary: {
        totalCustomers: customerCount?.count || 0,
        totalWholesalePartners: wholesaleCount?.count || 0,
        totalProducts: productCount?.count || 0,
        totalOrders: orderMetrics?.totalOrders || 0,
        totalRevenue: parseFloat(orderMetrics?.totalRevenue || "0"),
        pendingPrescriptions: prescriptionCount?.count || 0,
        lowStockProducts: lowStockCount?.count || 0,
        pendingWholesaleApplications: pendingWholesale?.count || 0,
      },
      recentOrders,
      recentActivities,
    };
  },
};
