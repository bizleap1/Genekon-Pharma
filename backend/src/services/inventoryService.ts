import { eq, and, sql, desc, lte, gte } from "drizzle-orm";
import {
  db,
  products,
  inventoryBatches,
  inventoryLogs,
  users,
} from "../db";
import { activityLogService } from "./activityLogService";
import { logger } from "../utils/logger";

export interface CreateBatchInput {
  productId: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate: string;
  quantity: number;
  mrp?: number;
  costPrice?: number;
}

export interface AdjustStockInput {
  productId: string;
  batchId?: string;
  changeType: "PURCHASE_RECEIPT" | "SALE_DEDUCTION" | "MANUAL_ADJUSTMENT" | "DAMAGE_EXPIRY" | "RETURN_RESTOCK";
  quantityChanged: number; // positive or negative
  reason: string;
}

export const inventoryService = {
  /**
   * 1. List inventory overview with status & batches
   */
  async getInventory(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (query.status) {
      conditions.push(eq(inventoryBatches.status, query.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventoryBatches)
      .where(whereClause);

    const batches = await db
      .select({
        batch: inventoryBatches,
        product: {
          id: products.id,
          name: products.name,
          sku: products.sku,
          brand: products.brand,
          totalStock: products.stockQuantity,
        },
      })
      .from(inventoryBatches)
      .leftJoin(products, eq(inventoryBatches.productId, products.id))
      .where(whereClause)
      .orderBy(inventoryBatches.expiryDate)
      .limit(limit)
      .offset(offset);

    // Dynamic stock status determination
    const now = new Date();
    const enriched = batches.map((b) => {
      let currentStatus = b.batch.status;
      if (new Date(b.batch.expiryDate) < now) {
        currentStatus = "EXPIRED";
      } else if (b.batch.quantity <= 0) {
        currentStatus = "OUT_OF_STOCK";
      } else if (b.batch.quantity <= 20) {
        currentStatus = "LOW_STOCK";
      } else {
        currentStatus = "IN_STOCK";
      }

      return {
        ...b.batch,
        status: currentStatus,
        product: b.product,
      };
    });

    return {
      batches: enriched,
      pagination: {
        page,
        limit,
        total: countResult?.count || 0,
        totalPages: Math.ceil((countResult?.count || 0) / limit),
      },
    };
  },

  /**
   * 2. Register new physical medication batch & increment product stock
   */
  async createBatch(adminId: string, input: CreateBatchInput) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.productId))
      .limit(1);

    if (!product) {
      throw new Error("Product not found");
    }

    const expiryDate = new Date(input.expiryDate);
    const manufacturingDate = input.manufacturingDate ? new Date(input.manufacturingDate) : null;
    const now = new Date();

    let status = "IN_STOCK";
    if (expiryDate < now) {
      status = "EXPIRED";
    } else if (input.quantity <= 0) {
      status = "OUT_OF_STOCK";
    } else if (input.quantity <= 20) {
      status = "LOW_STOCK";
    }

    // Insert batch
    const [batch] = await db
      .insert(inventoryBatches)
      .values({
        productId: product.id,
        batchNumber: input.batchNumber.trim().toUpperCase(),
        manufacturingDate,
        expiryDate,
        quantity: input.quantity,
        initialQuantity: input.quantity,
        mrp: input.mrp ? input.mrp.toFixed(2) : product.mrp,
        costPrice: input.costPrice ? input.costPrice.toFixed(2) : null,
        status,
      })
      .returning();

    // Increment aggregate product stockQuantity
    const previousQuantity = product.stockQuantity;
    const newQuantity = previousQuantity + input.quantity;

    await db
      .update(products)
      .set({
        stockQuantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(eq(products.id, product.id));

    // Record audit log in inventory_logs
    await db.insert(inventoryLogs).values({
      productId: product.id,
      batchId: batch.id,
      changeType: "PURCHASE_RECEIPT",
      previousQuantity,
      quantityChanged: input.quantity,
      newQuantity,
      reason: `New batch ${batch.batchNumber} received into physical inventory`,
      updatedBy: adminId,
    });

    // Record Admin Audit Log
    await activityLogService.log({
      adminId,
      action: "BATCH_CREATED",
      module: "INVENTORY",
      targetId: batch.id,
      details: {
        productName: product.name,
        batchNumber: batch.batchNumber,
        quantity: input.quantity,
        expiryDate: batch.expiryDate,
      },
    });

    logger.info(`Batch ${batch.batchNumber} created for product '${product.name}' (Stock: ${previousQuantity} -> ${newQuantity})`);
    return batch;
  },

  /**
   * 3. Adjust stock quantity (Add / Reduce / Damaged / Return) & log movement
   */
  async adjustStock(adminId: string, input: AdjustStockInput) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.productId))
      .limit(1);

    if (!product) {
      throw new Error("Product not found");
    }

    const previousQuantity = product.stockQuantity;
    const newQuantity = Math.max(0, previousQuantity + input.quantityChanged);

    // Update product stock
    await db
      .update(products)
      .set({
        stockQuantity: newQuantity,
        status: newQuantity === 0 ? "OUT_OF_STOCK" : "ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(products.id, product.id));

    // If batchId provided, adjust batch quantity too
    if (input.batchId) {
      const [batch] = await db
        .select()
        .from(inventoryBatches)
        .where(eq(inventoryBatches.id, input.batchId))
        .limit(1);

      if (batch) {
        const newBatchQty = Math.max(0, batch.quantity + input.quantityChanged);
        let batchStatus = batch.status;
        if (new Date(batch.expiryDate) < new Date()) {
          batchStatus = "EXPIRED";
        } else if (newBatchQty === 0) {
          batchStatus = "OUT_OF_STOCK";
        } else if (newBatchQty <= 20) {
          batchStatus = "LOW_STOCK";
        } else {
          batchStatus = "IN_STOCK";
        }

        await db
          .update(inventoryBatches)
          .set({
            quantity: newBatchQty,
            status: batchStatus,
            updatedAt: new Date(),
          })
          .where(eq(inventoryBatches.id, batch.id));
      }
    }

    // Write audit log to inventory_logs
    const [logEntry] = await db
      .insert(inventoryLogs)
      .values({
        productId: product.id,
        batchId: input.batchId || null,
        changeType: input.changeType,
        previousQuantity,
        quantityChanged: input.quantityChanged,
        newQuantity,
        reason: input.reason,
        updatedBy: adminId,
      })
      .returning();

    // Log admin activity
    await activityLogService.log({
      adminId,
      action: "INVENTORY_ADJUSTED",
      module: "INVENTORY",
      targetId: product.id,
      details: {
        productName: product.name,
        changeType: input.changeType,
        quantityChanged: input.quantityChanged,
        previousQuantity,
        newQuantity,
        reason: input.reason,
      },
    });

    return {
      product: {
        id: product.id,
        name: product.name,
        previousStock: previousQuantity,
        currentStock: newQuantity,
      },
      log: logEntry,
    };
  },

  /**
   * 4. Expiry Management: Retrieve batches expiring within specified day window (e.g. 30 or 90 days)
   */
  async getExpiringProducts(days = 30) {
    const now = new Date();
    const thresholdDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const expiringBatches = await db
      .select({
        batch: inventoryBatches,
        product: {
          id: products.id,
          name: products.name,
          sku: products.sku,
          brand: products.brand,
          manufacturer: products.manufacturer,
          dosageForm: products.dosageForm,
        },
      })
      .from(inventoryBatches)
      .leftJoin(products, eq(inventoryBatches.productId, products.id))
      .where(
        and(
          lte(inventoryBatches.expiryDate, thresholdDate),
          sql`${inventoryBatches.quantity} > 0`
        )
      )
      .orderBy(inventoryBatches.expiryDate);

    const categorized = expiringBatches.map((b) => {
      const isExpired = new Date(b.batch.expiryDate) < now;
      const daysRemaining = Math.ceil(
        (new Date(b.batch.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...b.batch,
        product: b.product,
        isExpired,
        daysRemaining: Math.max(0, daysRemaining),
        clinicalRiskLevel: isExpired ? "EXPIRED_HAZARD" : daysRemaining <= 30 ? "HIGH_PRIORITY_DISPATCH" : "MONITOR",
      };
    });

    return {
      windowDays: days,
      count: categorized.length,
      expiringBatches: categorized,
    };
  },

  /**
   * 5. Low Stock Alert System: Retrieve products below safety threshold
   */
  async getLowStockAlerts(threshold = 20) {
    const lowStockList = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.status, "ACTIVE"),
          sql`${products.stockQuantity} <= ${threshold}`
        )
      )
      .orderBy(products.stockQuantity);

    return {
      threshold,
      count: lowStockList.length,
      products: lowStockList.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        currentStock: p.stockQuantity,
        status: p.stockQuantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
        prescriptionRequired: p.prescriptionRequired,
      })),
    };
  },

  /**
   * 6. Retrieve paginated stock movement audit trail
   */
  async getInventoryLogs(query: { page?: number; limit?: number; productId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (query.productId) {
      conditions.push(eq(inventoryLogs.productId, query.productId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select({
        log: inventoryLogs,
        productName: products.name,
        sku: products.sku,
        adminName: users.name,
      })
      .from(inventoryLogs)
      .leftJoin(products, eq(inventoryLogs.productId, products.id))
      .leftJoin(users, eq(inventoryLogs.updatedBy, users.id))
      .where(whereClause)
      .orderBy(desc(inventoryLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      logs,
      page,
      limit,
    };
  },
};
