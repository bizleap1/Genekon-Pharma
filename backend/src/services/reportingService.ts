import { sql, desc, eq, and } from "drizzle-orm";
import { db, orders, orderItems, products, users, wholesaleProfiles } from "../db";

export const reportingService = {
  /**
   * 1. Sales Reports (Daily, Weekly, Monthly)
   */
  async getSalesReport(period: "daily" | "weekly" | "monthly" = "daily") {
    let dateFormat = "YYYY-MM-DD";
    let interval = "30 days";

    if (period === "weekly") {
      dateFormat = "IYYY-IW"; // ISO Year & Week
      interval = "12 weeks";
    } else if (period === "monthly") {
      dateFormat = "YYYY-MM";
      interval = "12 months";
    }

    const salesTrend = await db.execute(sql`
      SELECT 
        to_char(created_at, ${sql.raw(`'${dateFormat}'`)}) AS period,
        COUNT(*)::int AS orders_count,
        COALESCE(SUM(total_amount), 0)::float AS total_revenue,
        COALESCE(SUM(discount_amount), 0)::float AS total_discount,
        COALESCE(SUM(delivery_fee), 0)::float AS total_delivery_fee,
        ROUND(COALESCE(AVG(total_amount), 0)::numeric, 2)::float AS average_order_value
      FROM orders
      WHERE payment_status IN ('SUCCESS', 'PAID')
        AND created_at >= NOW() - ${sql.raw(`INTERVAL '${interval}'`)}
      GROUP BY 1
      ORDER BY period ASC;
    `);

    // Aggregate totals
    const [aggregates] = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(case when payment_status in ('SUCCESS', 'PAID') then total_amount else 0 end), 0)::text`,
        totalOrders: sql<number>`count(*)::int`,
        paidOrders: sql<number>`count(case when payment_status in ('SUCCESS', 'PAID') then 1 end)::int`,
      })
      .from(orders);

    return {
      period,
      summary: {
        totalRevenue: parseFloat(aggregates?.totalRevenue || "0"),
        totalOrders: aggregates?.totalOrders || 0,
        paidOrders: aggregates?.paidOrders || 0,
      },
      trend: salesTrend.rows || [],
    };
  },

  /**
   * 2. Product Performance Reports (Best Sellers vs Low Performing)
   */
  async getProductReport() {
    // Best selling products
    const bestSellers = await db.execute(sql`
      SELECT 
        oi.product_id,
        oi.product_name_snapshot,
        oi.sku_snapshot,
        SUM(oi.quantity)::int AS total_units_sold,
        SUM(oi.price * oi.quantity)::float AS total_revenue,
        COUNT(DISTINCT oi.order_id)::int AS order_count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.payment_status IN ('SUCCESS', 'PAID')
      GROUP BY oi.product_id, oi.product_name_snapshot, oi.sku_snapshot
      ORDER BY total_units_sold DESC
      LIMIT 10;
    `);

    // Low performing products (Active with stock, but low or 0 orders in last 30 days)
    const lowPerforming = await db.execute(sql`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.brand,
        p.stock_quantity,
        p.selling_price::float,
        COALESCE(sales.units_sold, 0)::int AS units_sold_30d
      FROM products p
      LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) AS units_sold
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY oi.product_id
      ) sales ON sales.product_id = p.id
      WHERE p.status = 'ACTIVE'
        AND p.stock_quantity > 0
        AND COALESCE(sales.units_sold, 0) <= 2
      ORDER BY sales.units_sold ASC, p.stock_quantity DESC
      LIMIT 10;
    `);

    return {
      bestSellers: bestSellers.rows || [],
      lowPerforming: lowPerforming.rows || [],
    };
  },

  /**
   * 3. Customer Growth & Retention Report
   */
  async getCustomerReport() {
    // New users registration by month
    const userGrowth = await db.execute(sql`
      SELECT 
        to_char(created_at, 'YYYY-MM') AS month,
        COUNT(*)::int AS new_users_count
      FROM users
      WHERE role = 'CUSTOMER'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY to_char(created_at, 'YYYY-MM')
      ORDER BY month ASC;
    `);

    // Repeat vs One-time customers
    const customerRetention = await db.execute(sql`
      WITH customer_orders AS (
        SELECT user_id, COUNT(*)::int AS orders_count
        FROM orders
        WHERE payment_status IN ('SUCCESS', 'PAID')
        GROUP BY user_id
      )
      SELECT 
        COUNT(CASE WHEN orders_count = 1 THEN 1 END)::int AS one_time_buyers,
        COUNT(CASE WHEN orders_count > 1 THEN 1 END)::int AS repeat_buyers,
        COUNT(*)::int AS total_purchasing_customers
      FROM customer_orders;
    `);

    const retentionRow: any = customerRetention.rows[0] || {};
    const totalBuyers = retentionRow.total_purchasing_customers || 0;
    const repeatBuyers = retentionRow.repeat_buyers || 0;
    const repeatRate = totalBuyers > 0 ? ((repeatBuyers / totalBuyers) * 100).toFixed(1) : "0.0";

    return {
      userGrowth: userGrowth.rows || [],
      retention: {
        oneTimeBuyers: retentionRow.one_time_buyers || 0,
        repeatBuyers,
        totalPurchasingCustomers: totalBuyers,
        repeatRatePercent: parseFloat(repeatRate),
      },
    };
  },

  /**
   * 4. Wholesale Analytics Report
   */
  async getWholesaleReport() {
    const [partnerCounts] = await db
      .select({
        totalPartners: sql<number>`count(*)::int`,
        activePartners: sql<number>`count(case when status = 'APPROVED' then 1 end)::int`,
        pendingVerification: sql<number>`count(case when status = 'PENDING_VERIFICATION' then 1 end)::int`,
        totalCreditAllocated: sql<string>`coalesce(sum(credit_limit), 0)::text`,
        totalOutstanding: sql<string>`coalesce(sum(outstanding_amount), 0)::text`,
      })
      .from(wholesaleProfiles);

    return {
      partners: {
        total: partnerCounts?.totalPartners || 0,
        active: partnerCounts?.activePartners || 0,
        pending: partnerCounts?.pendingVerification || 0,
        totalCreditAllocated: parseFloat(partnerCounts?.totalCreditAllocated || "0"),
        totalOutstanding: parseFloat(partnerCounts?.totalOutstanding || "0"),
      },
    };
  },
};
