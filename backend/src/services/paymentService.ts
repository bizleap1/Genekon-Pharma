import { eq, and, desc, sql, or } from "drizzle-orm";
import {
  db,
  orders,
  payments,
  orderItems,
  orderStatusHistory,
  products,
  users,
} from "../db";
import { Payment } from "../db/schema/payments";
import { Order } from "../db/schema/orders";
import { razorpayService } from "./razorpayService";
import { emailNotificationService } from "./emailNotificationService";
import {
  VerifyPaymentInput,
  RefundPaymentInput,
  AdminPaymentQueryInput,
} from "../validators/paymentValidator";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const paymentService = {
  /**
   * 1. Create Razorpay order authoritatively from database order total
   */
  async createPaymentOrder(userId: string, orderId: string) {
    // Authoritatively fetch order from DB by either UUID id or orderNumber
    const [order] = await db
      .select()
      .from(orders)
      .where(or(eq(orders.id, orderId), eq(orders.orderNumber, orderId)))
      .limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    // Ownership check
    if (order.userId !== userId) {
      throw new Error("You are not authorized to pay for this order");
    }

    // Guard against double payment
    if (order.paymentStatus === "SUCCESS" || order.paymentStatus === "PAID") {
      throw new Error("This order has already been paid for");
    }

    if (order.orderStatus === "CANCELLED") {
      throw new Error("Cannot make payment for a cancelled order");
    }

    // Amount strictly calculated from database (zero-trust client)
    const amountNumber = Number(order.totalAmount);
    const amountPaise = Math.round(amountNumber * 100);

    // Call Razorpay API to generate live gateway order
    const rzOrder = await razorpayService.createOrder({
      amountPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
    });

    // Check if an existing payment record exists for this order
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    let savedPayment: Payment;

    if (existingPayment && existingPayment.status === "PENDING") {
      const [updated] = await db
        .update(payments)
        .set({
          razorpayOrderId: rzOrder.id,
          amount: order.totalAmount,
          paymentMethod: order.paymentMethod === "COD" ? "ONLINE" : order.paymentMethod,
          status: "PENDING",
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id))
        .returning();
      savedPayment = updated;
    } else {
      const [created] = await db
        .insert(payments)
        .values({
          orderId: order.id,
          razorpayOrderId: rzOrder.id,
          amount: order.totalAmount,
          currency: "INR",
          paymentMethod: order.paymentMethod === "COD" ? "ONLINE" : order.paymentMethod,
          status: "PENDING",
        })
        .returning();
      savedPayment = created;
    }

    return {
      paymentId: savedPayment.id,
      razorpayOrderId: rzOrder.id,
      amount: amountNumber,
      amountPaise,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  },

  /**
   * 2. Verify Razorpay payment signature & confirm order
   */
  async verifyPayment(userId: string, input: VerifyPaymentInput) {
    const [order] = await db
      .select()
      .from(orders)
      .where(or(eq(orders.id, input.orderId), eq(orders.orderNumber, input.orderId)))
      .limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("You are not authorized to verify this payment");
    }

    // 1. Cryptographic HMAC-SHA256 signature verification
    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    });

    // Find latest payment record
    const [paymentRecord] = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.razorpayOrderId, input.razorpayOrderId),
          eq(payments.orderId, input.orderId)
        )
      )
      .orderBy(desc(payments.createdAt))
      .limit(1);

    if (!isValid) {
      logger.warn(`Invalid Razorpay signature for order ${order.orderNumber} (Payment: ${input.razorpayPaymentId})`);
      if (paymentRecord) {
        await db
          .update(payments)
          .set({
            status: "FAILED",
            failureReason: "Invalid cryptographic payment signature",
            razorpayPaymentId: input.razorpayPaymentId,
            razorpaySignature: input.razorpaySignature,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, paymentRecord.id));
      }

      // Fetch user info to send payment failed alert
      const [user] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      if (user && user.email) {
        emailNotificationService.sendPaymentFailedEmail(order, {
          name: user.name,
          email: user.email,
        }).catch((e) => logger.error("Failed to send payment failed email", e));
      }

      throw new Error("Payment signature verification failed. Transaction flagged as invalid.");
    }

    // 2. Mark Payment as SUCCESS
    let updatedPayment: Payment;
    if (paymentRecord) {
      const [updated] = await db
        .update(payments)
        .set({
          status: "SUCCESS",
          razorpayOrderId: input.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          failureReason: null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id))
        .returning();
      updatedPayment = updated;
    } else {
      const [created] = await db
        .insert(payments)
        .values({
          orderId: order.id,
          razorpayOrderId: input.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          amount: order.totalAmount,
          currency: "INR",
          paymentMethod: "ONLINE",
          status: "SUCCESS",
        })
        .returning();
      updatedPayment = created;
    }

    // 3. Update Order Status
    // If order was PLACED, advance to CONFIRMED.
    // If PENDING_VERIFICATION (prescription medicines), keep status until pharmacist clinical review.
    const shouldConfirm = order.orderStatus === "PLACED";
    const nextOrderStatus = shouldConfirm ? "CONFIRMED" : order.orderStatus;

    // Deduct stock if transitioning to CONFIRMED and not yet deducted
    let stockDeducted = order.stockDeducted;
    if (shouldConfirm && !order.stockDeducted) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of items) {
        await db
          .update(products)
          .set({
            stockQuantity: sql`GREATEST(0, ${products.stockQuantity} - ${item.quantity})`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
      stockDeducted = true;
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        paymentStatus: "SUCCESS",
        orderStatus: nextOrderStatus,
        stockDeducted,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))
      .returning();

    // 4. Append History Timeline
    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: nextOrderStatus,
      notes: `Payment of ₹${order.totalAmount} verified via Razorpay (Payment ID: ${input.razorpayPaymentId}). ${
        shouldConfirm ? "Order confirmed and inventory committed." : "Prescription verification pending."
      }`,
      updatedBy: userId,
    });

    // 5. Send Transactional Confirmation & Receipt Emails via Resend
    try {
      const [user] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

      if (user && user.email) {
        const customerInfo = { name: user.name, email: user.email };
        // Dispatch receipt and confirmation
        await Promise.allSettled([
          emailNotificationService.sendPaymentReceiptEmail(updatedOrder, updatedPayment, customerInfo),
          emailNotificationService.sendOrderPlacedConfirmation(updatedOrder, items, customerInfo),
        ]);
      }
    } catch (emailErr) {
      logger.error("Failed to send payment receipt email:", emailErr);
    }

    logger.info(`Successfully verified payment ${input.razorpayPaymentId} for order ${order.orderNumber}`);

    return {
      success: true,
      message: "Payment verified and order confirmed successfully",
      payment: updatedPayment,
      order: updatedOrder,
    };
  },

  /**
   * 3. Handle Razorpay Webhooks (payment.captured, payment.failed, order.paid)
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    // 1. Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.error("Razorpay webhook signature verification failed");
      throw new Error("Invalid webhook signature");
    }

    // 2. Parse event payload
    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType = event.event;
    logger.info(`Processing Razorpay webhook event: ${eventType}`);

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload.payment?.entity;
      if (!paymentEntity) return { status: "ignored_no_entity" };

      const rzPaymentId = paymentEntity.id;
      const rzOrderId = paymentEntity.order_id;
      const orderIdFromNotes = paymentEntity.notes?.orderId;

      // Find order
      let order: Order | undefined;
      if (orderIdFromNotes) {
        [order] = await db.select().from(orders).where(eq(orders.id, orderIdFromNotes)).limit(1);
      }
      if (!order && rzOrderId) {
        const [paymentRec] = await db
          .select()
          .from(payments)
          .where(eq(payments.razorpayOrderId, rzOrderId))
          .limit(1);
        if (paymentRec) {
          [order] = await db.select().from(orders).where(eq(orders.id, paymentRec.orderId)).limit(1);
        }
      }

      if (!order) {
        logger.warn(`Webhook: Could not find order for Razorpay payment ${rzPaymentId}`);
        return { status: "order_not_found" };
      }

      // Idempotency check
      if (order.paymentStatus === "SUCCESS" || order.paymentStatus === "PAID") {
        logger.info(`Webhook: Order ${order.orderNumber} already marked as paid.`);
        return { status: "already_processed" };
      }

      // Update payment record
      await db
        .update(payments)
        .set({
          status: "SUCCESS",
          razorpayPaymentId: rzPaymentId,
          razorpayOrderId: rzOrderId || undefined,
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, order.id));

      // Advance order status
      const shouldConfirm = order.orderStatus === "PLACED";
      const nextOrderStatus = shouldConfirm ? "CONFIRMED" : order.orderStatus;

      let stockDeducted = order.stockDeducted;
      if (shouldConfirm && !order.stockDeducted) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        for (const item of items) {
          await db
            .update(products)
            .set({
              stockQuantity: sql`GREATEST(0, ${products.stockQuantity} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
        stockDeducted = true;
      }

      const [updatedOrder] = await db
        .update(orders)
        .set({
          paymentStatus: "SUCCESS",
          orderStatus: nextOrderStatus,
          stockDeducted,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id))
        .returning();

      await db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: nextOrderStatus,
        notes: `Webhook payment capture confirmed via Razorpay (Payment ID: ${rzPaymentId})`,
      });

      // Send emails
      const [user] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      if (user && user.email) {
        const [paymentRec] = await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1);
        if (paymentRec) {
          emailNotificationService.sendPaymentReceiptEmail(updatedOrder, paymentRec, {
            name: user.name,
            email: user.email,
          }).catch((e) => logger.error("Webhook email error", e));
        }
      }

      return { status: "success", orderNumber: order.orderNumber };
    }

    if (eventType === "payment.failed") {
      const paymentEntity = event.payload.payment?.entity;
      if (!paymentEntity) return { status: "ignored" };

      const rzPaymentId = paymentEntity.id;
      const rzOrderId = paymentEntity.order_id;
      const errorDesc = paymentEntity.error_description || paymentEntity.error_reason || "Payment failed";

      // Mark payment failed in DB
      if (rzOrderId) {
        await db
          .update(payments)
          .set({
            status: "FAILED",
            razorpayPaymentId: rzPaymentId,
            failureReason: errorDesc,
            updatedAt: new Date(),
          })
          .where(eq(payments.razorpayOrderId, rzOrderId));
      }

      logger.info(`Webhook: Payment failed for ${rzPaymentId}: ${errorDesc}. Order remains pending for retry.`);
      return { status: "payment_failed_recorded" };
    }

    return { status: "unhandled_event" };
  },

  /**
   * 4. Retry Payment for an existing pending/failed order
   */
  async retryPayment(userId: string, orderId: string) {
    return this.createPaymentOrder(userId, orderId);
  },

  /**
   * 5. Initiate Refund via Razorpay API (Admin only)
   */
  async initiateRefund(adminId: string, input: RefundPaymentInput) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, input.paymentId))
      .limit(1);

    if (!payment) {
      throw new Error("Payment record not found");
    }

    if (payment.status !== "SUCCESS" && payment.status !== "PAID") {
      throw new Error(`Cannot refund a payment with status '${payment.status}'`);
    }

    if (!payment.razorpayPaymentId) {
      throw new Error("Razorpay Payment ID is missing on this record; cannot refund online");
    }

    const refundAmount = input.amount ? input.amount : Number(payment.amount);
    const refundAmountPaise = Math.round(refundAmount * 100);

    // Call Razorpay Refund API
    const rzRefund = await razorpayService.createRefund({
      paymentId: payment.razorpayPaymentId,
      amountPaise: refundAmountPaise,
      notes: {
        reason: input.reason,
        adminId,
        paymentId: payment.id,
      },
    });

    // Update payment record
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: "REFUNDED",
        refundId: rzRefund.id,
        refundAmount: refundAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning();

    // Update order payment status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        paymentStatus: "REFUNDED",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, payment.orderId))
      .returning();

    // Append timeline
    await db.insert(orderStatusHistory).values({
      orderId: payment.orderId,
      status: updatedOrder.orderStatus,
      notes: `Payment refund of ₹${refundAmount.toFixed(2)} processed via Razorpay (Refund ID: ${rzRefund.id}). Reason: ${input.reason}`,
      updatedBy: adminId,
    });

    logger.info(`Refund of ₹${refundAmount.toFixed(2)} completed for payment ${payment.id} (Refund ID: ${rzRefund.id})`);

    return {
      success: true,
      message: "Refund processed successfully",
      refund: rzRefund,
      payment: updatedPayment,
    };
  },

  /**
   * 6. Fetch payment details by orderId (Customer or Admin)
   */
  async getPaymentByOrderId(orderId: string, userId?: string, isAdmin = false) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      throw new Error("Order not found");
    }

    if (!isAdmin && userId && order.userId !== userId) {
      throw new Error("You are not authorized to view payments for this order");
    }

    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(desc(payments.createdAt));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      payments: paymentRecords,
    };
  },

  /**
   * 7. Admin: List and filter all payments
   */
  async listAdminPayments(query: AdminPaymentQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (query.status) {
      conditions.push(eq(payments.status, query.status));
    }

    if (query.paymentMethod) {
      conditions.push(eq(payments.paymentMethod, query.paymentMethod));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments)
      .where(whereClause);

    const total = countResult?.count || 0;

    const records = await db
      .select({
        payment: payments,
        order: {
          id: orders.id,
          orderNumber: orders.orderNumber,
          orderStatus: orders.orderStatus,
          userId: orders.userId,
          deliveryAddressSnapshot: orders.deliveryAddressSnapshot,
        },
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      payments: records.map((r) => ({
        ...r.payment,
        order: r.order,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * 8. Record COD payment record
   */
  async recordCodPayment(orderId: string, amount: string) {
    const [created] = await db
      .insert(payments)
      .values({
        orderId,
        amount,
        currency: "INR",
        paymentMethod: "COD",
        status: "PENDING",
      })
      .returning();
    return created;
  },
};
