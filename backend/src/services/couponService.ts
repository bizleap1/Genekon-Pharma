import { eq, desc, and } from "drizzle-orm";
import { db, coupons } from "../db";
import { activityLogService } from "./activityLogService";
import { logger } from "../utils/logger";

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  expiryDate: string;
}

export interface UpdateCouponInput {
  description?: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiryDate?: string;
  isActive?: boolean;
}

export const couponService = {
  /**
   * 1. List all coupons
   */
  async listCoupons() {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  },

  /**
   * 2. Create coupon
   */
  async createCoupon(adminId: string, input: CreateCouponInput) {
    const cleanCode = input.code.trim().toUpperCase();

    const [existing] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, cleanCode))
      .limit(1);

    if (existing) {
      throw new Error(`Coupon code '${cleanCode}' already exists`);
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code: cleanCode,
        description: input.description || null,
        discountType: input.discountType,
        discountValue: input.discountValue.toFixed(2),
        minOrderValue: input.minOrderValue ? input.minOrderValue.toFixed(2) : "0.00",
        maxDiscount: input.maxDiscount ? input.maxDiscount.toFixed(2) : null,
        usageLimit: input.usageLimit || null,
        usageCount: 0,
        isActive: true,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        expiryDate: new Date(input.expiryDate),
      })
      .returning();

    await activityLogService.log({
      adminId,
      action: "COUPON_CREATED",
      module: "COUPONS",
      targetId: created.id,
      details: { code: created.code, discountValue: created.discountValue, discountType: created.discountType },
    });

    logger.info(`Coupon ${created.code} created by admin ${adminId}`);
    return created;
  },

  /**
   * 3. Update coupon
   */
  async updateCoupon(adminId: string, id: string, input: UpdateCouponInput) {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const updateData: any = { updatedAt: new Date() };
    if (input.description !== undefined) updateData.description = input.description;
    if (input.discountType !== undefined) updateData.discountType = input.discountType;
    if (input.discountValue !== undefined) updateData.discountValue = input.discountValue.toFixed(2);
    if (input.minOrderValue !== undefined) updateData.minOrderValue = input.minOrderValue.toFixed(2);
    if (input.maxDiscount !== undefined) updateData.maxDiscount = input.maxDiscount ? input.maxDiscount.toFixed(2) : null;
    if (input.usageLimit !== undefined) updateData.usageLimit = input.usageLimit;
    if (input.expiryDate !== undefined) updateData.expiryDate = new Date(input.expiryDate);
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const [updated] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();

    await activityLogService.log({
      adminId,
      action: "COUPON_UPDATED",
      module: "COUPONS",
      targetId: updated.id,
      details: updateData,
    });

    return updated;
  },

  /**
   * 4. Toggle coupon active status
   */
  async toggleCouponStatus(adminId: string, id: string, isActive: boolean) {
    const [updated] = await db
      .update(coupons)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();

    if (!updated) {
      throw new Error("Coupon not found");
    }

    await activityLogService.log({
      adminId,
      action: isActive ? "COUPON_ENABLED" : "COUPON_DISABLED",
      module: "COUPONS",
      targetId: id,
      details: { code: updated.code, isActive },
    });

    return updated;
  },

  /**
   * 5. Delete coupon
   */
  async deleteCoupon(adminId: string, id: string) {
    const [deleted] = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    if (!deleted) {
      throw new Error("Coupon not found");
    }

    await activityLogService.log({
      adminId,
      action: "COUPON_DELETED",
      module: "COUPONS",
      targetId: id,
      details: { code: deleted.code },
    });

    return { success: true, message: `Coupon ${deleted.code} deleted successfully` };
  },

  /**
   * 6. Validate and apply coupon against an order amount
   */
  async validateCoupon(code: string, cartTotal: number) {
    const cleanCode = code.trim().toUpperCase();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, cleanCode))
      .limit(1);

    if (!coupon || !coupon.isActive) {
      throw new Error("Invalid or inactive coupon code");
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      throw new Error("This coupon has expired");
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      throw new Error("This coupon is not yet active");
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error("Coupon usage limit has been reached");
    }

    const minOrder = Number(coupon.minOrderValue);
    if (cartTotal < minOrder) {
      throw new Error(`Minimum order value of ₹${minOrder} required for this coupon`);
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      const calculated = (cartTotal * Number(coupon.discountValue)) / 100;
      discount = coupon.maxDiscount ? Math.min(calculated, Number(coupon.maxDiscount)) : calculated;
    } else {
      discount = Math.min(cartTotal, Number(coupon.discountValue));
    }

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountAmount: discount,
      discountType: coupon.discountType,
    };
  },
};
