import { eq, and, sql, desc, or, ilike } from "drizzle-orm";
import { db, users, orders, userAddresses } from "../db";
import { activityLogService } from "./activityLogService";
import { logger } from "../utils/logger";

export const adminCustomerService = {
  /**
   * 1. List customers with aggregate order count & lifetime spending metrics
   */
  async listCustomers(query: { page?: number; limit?: number; search?: string; status?: "active" | "blocked" }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(users.role, "CUSTOMER")];

    if (query.status === "active") {
      conditions.push(eq(users.isActive, true));
    } else if (query.status === "blocked") {
      conditions.push(eq(users.isActive, false));
    }

    if (query.search) {
      const s = `%${query.search.trim()}%`;
      conditions.push(or(ilike(users.name, s), ilike(users.email, s), ilike(users.phone, s)));
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    // Query customers with subqueries for orders count and lifetime spending
    const customerRecords = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
        ordersCount: sql<number>`coalesce((select count(*)::int from orders o where o.user_id = users.id), 0)`,
        totalSpent: sql<string>`coalesce((select sum(total_amount)::text from orders o where o.user_id = users.id and o.payment_status in ('SUCCESS', 'PAID')), '0.00')`,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      customers: customerRecords.map((c) => ({
        ...c,
        totalSpent: parseFloat(c.totalSpent),
      })),
      pagination: {
        page,
        limit,
        total: countResult?.count || 0,
        totalPages: Math.ceil((countResult?.count || 0) / limit),
      },
    };
  },

  /**
   * 2. View customer details, saved delivery addresses, and past order history
   */
  async getCustomerDetails(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.role, "CUSTOMER")))
      .limit(1);

    if (!user) {
      throw new Error("Customer not found");
    }

    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, user.id));

    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    const totalSpent = customerOrders
      .filter((o) => o.paymentStatus === "SUCCESS" || o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        profileDetails: user.profileDetails,
        createdAt: user.createdAt,
      },
      stats: {
        totalOrders: customerOrders.length,
        totalSpent,
      },
      addresses,
      orders: customerOrders,
    };
  },

  /**
   * 3. Block or unblock a customer account
   */
  async toggleUserBlock(adminId: string, userId: string, isBlocked: boolean, reason?: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "ADMIN") {
      throw new Error("Cannot block an administrator account");
    }

    const nextIsActive = !isBlocked;

    const [updatedUser] = await db
      .update(users)
      .set({
        isActive: nextIsActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Log admin activity
    await activityLogService.log({
      adminId,
      action: isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
      module: "CUSTOMERS",
      targetId: user.id,
      details: {
        customerName: user.name,
        email: user.email,
        reason: reason || (isBlocked ? "Blocked by admin" : "Reactivated by admin"),
      },
    });

    logger.info(`Admin ${adminId} ${isBlocked ? "blocked" : "unblocked"} user ${user.name} (${user.id})`);

    return {
      success: true,
      message: isBlocked ? "User account blocked successfully" : "User account unblocked successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        isActive: updatedUser.isActive,
      },
    };
  },
};
