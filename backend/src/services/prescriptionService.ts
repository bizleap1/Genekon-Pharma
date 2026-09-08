import { eq, desc } from "drizzle-orm";
import { db, prescriptions, orders, users, orderStatusHistory, products, orderItems } from "../db";
import { Prescription } from "../db/schema/prescriptions";
import { cloudinaryService } from "./cloudinaryService";
import { logger } from "../utils/logger";

export const prescriptionService = {
  /**
   * Upload and persist prescription document for user
   */
  async uploadPrescription(
    userId: string,
    file: Express.Multer.File,
    metadata?: {
      doctorName?: string;
      patientName?: string;
      orderId?: string;
    }
  ): Promise<Prescription> {
    const uploadResult = await cloudinaryService.uploadPrescriptionDocument(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const [created] = await db
      .insert(prescriptions)
      .values({
        userId,
        orderId: metadata?.orderId || null,
        fileUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        doctorName: metadata?.doctorName || null,
        patientName: metadata?.patientName || null,
        status: "PENDING",
      })
      .returning();

    // If linked to an active order, attach prescription to order
    if (metadata?.orderId) {
      await db
        .update(orders)
        .set({ prescriptionId: created.id, updatedAt: new Date() })
        .where(eq(orders.id, metadata.orderId));
    }

    return created;
  },

  /**
   * Get all prescriptions belonging to a customer
   */
  async getUserPrescriptions(userId: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .orderBy(desc(prescriptions.createdAt));
  },

  /**
   * Get all prescriptions pending pharmacist verification (Admin only)
   */
  async getPendingPrescriptions(): Promise<any[]> {
    const pending = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.status, "PENDING"))
      .orderBy(desc(prescriptions.createdAt));

    const userIds = pending.map((p) => p.userId);
    const dbUsers = await db.select().from(users);
    const userMap = new Map(dbUsers.map((u) => [u.id, u]));

    return pending.map((p) => ({
      ...p,
      user: userMap.get(p.userId) || null,
    }));
  },

  /**
   * Pharmacist review: Approve or Reject a prescription
   */
  async reviewPrescription(
    prescriptionId: string,
    adminUserId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ): Promise<Prescription> {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId))
      .limit(1);

    if (!prescription) {
      throw new Error("Prescription not found");
    }

    const [updated] = await db
      .update(prescriptions)
      .set({
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || "Ineligible prescription" : null,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(prescriptions.id, prescriptionId))
      .returning();

    // Check if prescription is linked to an order
    const linkedOrderId = prescription.orderId;
    let targetOrder = null;
    if (linkedOrderId) {
      const [o] = await db.select().from(orders).where(eq(orders.id, linkedOrderId)).limit(1);
      targetOrder = o;
    } else {
      const [o] = await db.select().from(orders).where(eq(orders.prescriptionId, prescriptionId)).limit(1);
      targetOrder = o;
    }

    if (targetOrder) {
      if (status === "APPROVED") {
        // If order was waiting on verification, advance to CONFIRMED and deduct inventory stock
        if (targetOrder.orderStatus === "PENDING_VERIFICATION") {
          // 1. Deduct stock if not already deducted
          if (!targetOrder.stockDeducted) {
            const items = await db
              .select()
              .from(orderItems)
              .where(eq(orderItems.orderId, targetOrder.id));

            for (const item of items) {
              const [p] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
              if (p) {
                const newStock = Math.max(0, p.stockQuantity - item.quantity);
                await db
                  .update(products)
                  .set({ stockQuantity: newStock, updatedAt: new Date() })
                  .where(eq(products.id, p.id));
              }
            }
          }

          // 2. Update order to CONFIRMED
          await db
            .update(orders)
            .set({
              orderStatus: "CONFIRMED",
              stockDeducted: true,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, targetOrder.id));

          // 3. Append history
          await db.insert(orderStatusHistory).values({
            orderId: targetOrder.id,
            status: "CONFIRMED",
            notes: "Prescription verified and approved by clinical pharmacist. Order confirmed.",
            updatedBy: adminUserId,
          });

          logger.info(`Order ${targetOrder.orderNumber} confirmed after prescription approval`);
        }
      } else if (status === "REJECTED") {
        // Log rejection into order history
        await db.insert(orderStatusHistory).values({
          orderId: targetOrder.id,
          status: targetOrder.orderStatus,
          notes: `Prescription review rejected: ${rejectionReason || "Invalid or unreadable document"}. Customer action required.`,
          updatedBy: adminUserId,
        });
      }
    }

    return updated;
  },
};
