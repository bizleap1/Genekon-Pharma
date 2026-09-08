import { eq, and, desc, sql, or } from "drizzle-orm";
import {
  db,
  orders,
  users,
  orderStatusHistory,
  payments,
  adminActivityLogs,
  cancellationRequests,
} from "../db";
import { orderService } from "./orderService";
import { emailNotificationService } from "./emailNotificationService";
import { logger } from "../utils/logger";
import { CancellationRequest } from "../db/schema/cancellationRequests";

export interface SubmitCancellationInput {
  reason: string;
  details?: string;
}

export interface ReviewCancellationInput {
  decision: "APPROVE" | "REJECT";
  comment?: string;
}

export const cancellationService = {
  /**
   * 1. Customer submits an order cancellation request
   * Strict validation: Only allowed before PACKED status
   */
  async submitRequest(
    userId: string,
    orderIdOrNumber: string,
    input: SubmitCancellationInput
  ): Promise<CancellationRequest> {
    // 1. Fetch order by UUID or order number
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          or(eq(orders.id, orderIdOrNumber), eq(orders.orderNumber, orderIdOrNumber)),
          eq(orders.userId, userId)
        )
      )
      .limit(1);

    if (!order) {
      throw new Error("Order not found or you are not authorized to cancel it");
    }

    // 2. Strict status cut-off rule: ONLY allowed before PACKED
    const nonCancellableStatuses = ["PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      throw new Error(
        `Order cannot be cancelled once it is ${order.orderStatus.toLowerCase()}. Cancellation is only allowed before packing and dispatch.`
      );
    }

    // 3. Prevent duplicate active pending requests
    const [existingPending] = await db
      .select()
      .from(cancellationRequests)
      .where(
        and(
          eq(cancellationRequests.orderId, order.id),
          eq(cancellationRequests.status, "PENDING")
        )
      )
      .limit(1);

    if (existingPending) {
      throw new Error("A cancellation request for this order is already pending admin review");
    }

    // 4. Create cancellation request record
    const [request] = await db
      .insert(cancellationRequests)
      .values({
        orderId: order.id,
        userId,
        reason: input.reason,
        details: input.details || null,
        status: "PENDING",
      })
      .returning();

    // 5. Append event to order history timeline
    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: order.orderStatus,
      notes: `Cancellation request submitted by customer: "${input.reason}"`,
      updatedBy: userId,
    });

    // 6. Asynchronously dispatch acknowledgement email
    (async () => {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user && user.email) {
          await emailNotificationService.sendCancellationRequestReceivedEmail(
            order,
            input.reason,
            { name: user.name, email: user.email }
          );
        }
      } catch (err) {
        logger.error(`Failed to send cancellation request email for order ${order.orderNumber}:`, err);
      }
    })();

    logger.info(`Cancellation request created for order ${order.orderNumber} by user ${userId}`);
    return request;
  },

  /**
   * 2. Retrieve cancellation request for a specific order
   */
  async getRequestForOrder(orderIdOrNumber: string, userId?: string): Promise<CancellationRequest | null> {
    const [order] = await db
      .select()
      .from(orders)
      .where(or(eq(orders.id, orderIdOrNumber), eq(orders.orderNumber, orderIdOrNumber)))
      .limit(1);

    if (!order) return null;

    if (userId && order.userId !== userId) {
      throw new Error("Unauthorized to view this order's cancellation status");
    }

    const [request] = await db
      .select()
      .from(cancellationRequests)
      .where(eq(cancellationRequests.orderId, order.id))
      .orderBy(desc(cancellationRequests.createdAt))
      .limit(1);

    return request || null;
  },

  /**
   * 3. Admin: List all cancellation requests with pagination & status filters
   */
  async listAdminRequests(query: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(cancellationRequests.status, query.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cancellationRequests)
      .where(whereClause);

    const records = await db
      .select({
        id: cancellationRequests.id,
        orderId: cancellationRequests.orderId,
        userId: cancellationRequests.userId,
        reason: cancellationRequests.reason,
        details: cancellationRequests.details,
        status: cancellationRequests.status,
        adminComment: cancellationRequests.adminComment,
        reviewedAt: cancellationRequests.reviewedAt,
        createdAt: cancellationRequests.createdAt,
        orderNumber: orders.orderNumber,
        orderTotal: orders.totalAmount,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        customerName: users.name,
        customerEmail: users.email,
        customerPhone: users.phone,
      })
      .from(cancellationRequests)
      .innerJoin(orders, eq(cancellationRequests.orderId, orders.id))
      .innerJoin(users, eq(cancellationRequests.userId, users.id))
      .where(whereClause)
      .orderBy(desc(cancellationRequests.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      requests: records,
      pagination: {
        total: countResult?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((countResult?.count || 0) / limit) || 1,
      },
    };
  },

  /**
   * 4. Admin: Review and Approve or Reject cancellation request
   * - If Approve: Cancel order, replenish inventory stock, process/mark refund, notify customer.
   * - If Reject: Keep order active, record reason, notify customer.
   */
  async reviewRequest(
    adminId: string,
    requestId: string,
    input: ReviewCancellationInput
  ) {
    const [request] = await db
      .select()
      .from(cancellationRequests)
      .where(eq(cancellationRequests.id, requestId))
      .limit(1);

    if (!request) {
      throw new Error("Cancellation request not found");
    }

    if (request.status !== "PENDING") {
      throw new Error(`Cancellation request has already been reviewed with status: ${request.status}`);
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, request.orderId))
      .limit(1);

    if (!order) {
      throw new Error("Associated order not found");
    }

    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);

    if (input.decision === "APPROVE") {
      // 1. Update Cancellation Request
      const [updatedRequest] = await db
        .update(cancellationRequests)
        .set({
          status: "APPROVED",
          adminComment: input.comment || "Approved by dispensary administrator.",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(cancellationRequests.id, requestId))
        .returning();

      // 2. Replenish Inventory Stock if deducted
      if (order.stockDeducted) {
        await orderService.restoreInventoryStock(order.id);
      }

      // 3. Financial Refund Handling
      let refundText = "";
      const isPaid = order.paymentStatus === "SUCCESS" || order.paymentStatus === "PAID";
      if (isPaid) {
        // Mark payment status as REFUNDED
        await db
          .update(orders)
          .set({
            orderStatus: "CANCELLED",
            paymentStatus: "REFUNDED",
            stockDeducted: false,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        // Update payment table entry
        await db
          .update(payments)
          .set({
            status: "REFUNDED",
            updatedAt: new Date(),
          })
          .where(eq(payments.orderId, order.id));

        refundText = `Full refund of ₹${Number(order.totalAmount).toFixed(2)} initiated to original payment source. Expected within 3-5 business days.`;
      } else {
        // Unpaid or Cash on Delivery
        await db
          .update(orders)
          .set({
            orderStatus: "CANCELLED",
            stockDeducted: false,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        refundText = "Order was Cash on Delivery (COD); no payment was collected.";
      }

      // 4. Log to order history timeline
      await db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: "CANCELLED",
        notes: `Cancellation request approved by dispensary admin. ${input.comment || ""}. Refund note: ${refundText}`,
        updatedBy: adminId,
      });

      // 5. Log in admin activity logs
      await db.insert(adminActivityLogs).values({
        adminId,
        action: "APPROVE_ORDER_CANCELLATION",
        module: "ORDERS",
        targetId: order.id,
        details: {
          requestId,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          reason: request.reason,
          adminComment: input.comment,
        },
      });

      // 6. Send Approval & Refund notification email
      const custEmail = customer?.email;
      if (custEmail) {
        (async () => {
          try {
            await emailNotificationService.sendCancellationApprovedEmail(
              order,
              { name: customer.name || "Customer", email: custEmail },
              refundText
            );
          } catch (err) {
            logger.error(`Failed to send cancellation approved email:`, err);
          }
        })();
      }

      logger.info(`Order ${order.orderNumber} cancelled and request approved by admin ${adminId}`);
      return { request: updatedRequest, orderStatus: "CANCELLED", refundText };
    } else {
      // Decision is REJECT
      const [updatedRequest] = await db
        .update(cancellationRequests)
        .set({
          status: "REJECTED",
          adminComment: input.comment || "Cancellation request declined by dispensary administration.",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(cancellationRequests.id, requestId))
        .returning();

      // Log to order history timeline
      await db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: order.orderStatus,
        notes: `Cancellation request declined by dispensary admin: "${input.comment || "Disapproved"}"`,
        updatedBy: adminId,
      });

      // Log in admin activity logs
      await db.insert(adminActivityLogs).values({
        adminId,
        action: "REJECT_ORDER_CANCELLATION",
        module: "ORDERS",
        targetId: order.id,
        details: {
          requestId,
          orderNumber: order.orderNumber,
          reason: request.reason,
          adminComment: input.comment,
        },
      });

      // Send rejection notification email
      const custEmail = customer?.email;
      if (custEmail) {
        (async () => {
          try {
            await emailNotificationService.sendCancellationRejectedEmail(
              order,
              { name: customer.name || "Customer", email: custEmail },
              input.comment
            );
          } catch (err) {
            logger.error(`Failed to send cancellation rejected email:`, err);
          }
        })();
      }

      logger.info(`Cancellation request for order ${order.orderNumber} rejected by admin ${adminId}`);
      return { request: updatedRequest, orderStatus: order.orderStatus };
    }
  },
};
