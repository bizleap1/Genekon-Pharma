import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {
  db,
  orders,
  orderItems,
  orderStatusHistory,
  prescriptions,
  products,
  productImages,
  userAddresses,
  users,
  cartItems,
  carts,
} from "../db";
import { Order, DeliveryAddressSnapshot } from "../db/schema/orders";
import { OrderItem } from "../db/schema/orderItems";
import { OrderStatusHistory } from "../db/schema/orderStatusHistory";
import { cartService } from "./cartService";
import { logger } from "../utils/logger";

export interface CreateOrderPayload {
  deliveryAddressId: string;
  prescriptionId?: string;
  paymentMethod?: "COD" | "ONLINE" | "UPI" | "CARD" | "NETBANKING";
  notes?: string;
}

export interface OrderDetailResponse extends Order {
  items: (OrderItem & { image?: string })[];
  timeline: OrderStatusHistory[];
  prescription?: any | null;
  customer?: { id: string; name: string; email: string | null; phone: string | null } | null;
}

export const orderService = {
  /**
   * Create new order from customer's active shopping cart
   */
  async createOrderFromCart(userId: string, input: CreateOrderPayload): Promise<OrderDetailResponse> {
    // 1. Validate delivery address
    const [address] = await db
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.id, input.deliveryAddressId), eq(userAddresses.userId, userId)))
      .limit(1);

    if (!address) {
      throw new Error("Invalid delivery address selected");
    }

    const deliveryAddressSnapshot: DeliveryAddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType,
    };

    // 2. Fetch user's cart
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      throw new Error("Your cart is empty. Add products before placing an order.");
    }

    const rawCartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    if (rawCartItems.length === 0) {
      throw new Error("Your cart is empty. Add products before placing an order.");
    }

    // 3. Fetch live products from database & perform authoritative checks
    const productIds = rawCartItems.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    let totalSellingPrice = 0;
    let hasPrescriptionItem = false;

    // Validate each cart item against live database record
    for (const item of rawCartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("A product in your cart is no longer available.");
      }
      if (product.status !== "ACTIVE") {
        throw new Error(`Product '${product.name}' is currently inactive.`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for '${product.name}'. Only ${product.stockQuantity} unit(s) available.`
        );
      }

      const itemMrpTotal = Number(product.mrp) * item.quantity;
      const itemSellingTotal = Number(product.sellingPrice) * item.quantity;

      subtotal += itemMrpTotal;
      totalSellingPrice += itemSellingTotal;

      if (product.prescriptionRequired) {
        hasPrescriptionItem = true;
      }
    }

    // Authoritative Price Engine
    const discountAmount = Math.max(0, subtotal - totalSellingPrice);
    const freeDeliveryThreshold = 500;
    const deliveryFee = totalSellingPrice >= freeDeliveryThreshold ? 0 : 40;
    const totalAmount = totalSellingPrice + deliveryFee;

    // Determine initial order status
    // If prescription items are present, the order must be verified by a pharmacist first
    const initialStatus = hasPrescriptionItem ? "PENDING_VERIFICATION" : "PLACED";

    // Generate unique order number (e.g. GNK-260908-1092)
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GNK-${timestamp}-${randomSuffix}`;

    // 4. Create Order
    const [createdOrder] = await db
      .insert(orders)
      .values({
        userId,
        orderNumber,
        deliveryAddressId: address.id,
        deliveryAddressSnapshot,
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paymentStatus: "PENDING",
        paymentMethod: input.paymentMethod || "COD",
        orderStatus: initialStatus,
        prescriptionRequired: hasPrescriptionItem,
        prescriptionId: input.prescriptionId || null,
        stockDeducted: false,
        notes: input.notes || null,
      })
      .returning();

    // 5. Create Order Items with historical snapshots
    for (const item of rawCartItems) {
      const product = productMap.get(item.productId)!;
      await db.insert(orderItems).values({
        orderId: createdOrder.id,
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        dosageFormSnapshot: product.dosageForm,
        quantity: item.quantity,
        price: product.sellingPrice,
        mrp: product.mrp,
        gstRate: product.gst,
        prescriptionRequired: product.prescriptionRequired,
      });
    }

    // 6. Link prescription if provided
    if (input.prescriptionId) {
      await db
        .update(prescriptions)
        .set({ orderId: createdOrder.id, updatedAt: new Date() })
        .where(eq(prescriptions.id, input.prescriptionId));
    }

    // 7. Append initial Timeline event
    const initialNotes = hasPrescriptionItem
      ? "Order placed with prescription medicine. Awaiting licensed pharmacist verification."
      : "Order placed successfully by customer.";

    await db.insert(orderStatusHistory).values({
      orderId: createdOrder.id,
      status: initialStatus,
      notes: initialNotes,
      updatedBy: userId,
    });

    // 8. Clear customer cart after checkout
    await cartService.clearCart(userId);

    logger.info(`Created order ${createdOrder.orderNumber} for user ${userId} (Status: ${initialStatus})`);

    return this.getOrderById(createdOrder.id, userId, true);
  },

  /**
   * Get single order details with historical item snapshots, address, timeline, and prescription
   */
  async getOrderById(orderId: string, userId?: string, isAdmin = false): Promise<OrderDetailResponse> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    // Authorization check
    if (!isAdmin && userId && order.userId !== userId) {
      throw new Error("You are not authorized to view this order");
    }

    // Fetch items
    const rawItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    // Fetch primary thumbnails
    const images = await db.select().from(productImages);
    const imageMap = new Map<string, string>();
    images.forEach((img) => {
      if (!imageMap.has(img.productId) || img.isPrimary) {
        imageMap.set(img.productId, img.imageUrl);
      }
    });

    const items = rawItems.map((item) => ({
      ...item,
      image: imageMap.get(item.productId) || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300",
    }));

    // Fetch timeline
    const timeline = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, order.id))
      .orderBy(orderStatusHistory.createdAt);

    // Fetch linked prescription if any
    let prescription = null;
    if (order.prescriptionId) {
      const [p] = await db.select().from(prescriptions).where(eq(prescriptions.id, order.prescriptionId)).limit(1);
      prescription = p || null;
    }

    // Fetch customer details if admin
    let customer = null;
    if (isAdmin) {
      const [u] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      if (u) {
        customer = { id: u.id, name: u.name, email: u.email, phone: u.phone };
      }
    }

    return {
      ...order,
      items,
      timeline,
      prescription,
      customer,
    };
  },

  /**
   * List customer orders with pagination
   */
  async getCustomerOrders(userId: string, page = 1, limit = 10): Promise<{ orders: any[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.userId, userId));

    const total = countResult?.count || 0;

    // Attach basic item summaries
    const enriched = [];
    for (const ord of userOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
      enriched.push({
        ...ord,
        itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
        itemsSummary: items.map((i) => i.productNameSnapshot).join(", "),
      });
    }

    return {
      orders: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Customer order cancellation with strict policy
   */
  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<OrderDetailResponse> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("You are not authorized to cancel this order");
    }

    if (["PACKED", "SHIPPED", "DELIVERED"].includes(order.orderStatus)) {
      throw new Error(`Order cannot be cancelled once it is ${order.orderStatus.toLowerCase()}`);
    }

    if (order.orderStatus === "CANCELLED") {
      throw new Error("Order is already cancelled");
    }

    // If stock was deducted, replenish it
    if (order.stockDeducted) {
      await this.restoreInventoryStock(order.id);
    }

    await db
      .update(orders)
      .set({
        orderStatus: "CANCELLED",
        stockDeducted: false,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: "CANCELLED",
      notes: reason ? `Cancelled by customer: ${reason}` : "Order cancelled by customer.",
      updatedBy: userId,
    });

    logger.info(`Order ${order.orderNumber} cancelled by customer ${userId}`);
    return this.getOrderById(order.id, userId, false);
  },

  /**
   * Reorder products from a past order into active cart ("Buy Again")
   */
  async reorder(orderId: string, userId: string): Promise<{ message: string; cart: any; unavailableItems: string[] }> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("Unauthorized to access this order");
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

    const unavailableItems: string[] = [];
    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product || product.status !== "ACTIVE" || product.stockQuantity <= 0) {
        unavailableItems.push(item.productNameSnapshot);
        continue;
      }

      const addQty = Math.min(item.quantity, product.stockQuantity);
      if (addQty > 0) {
        await cartService.addItemToCart(userId, {
          productId: product.id,
          quantity: addQty,
        });
      }
    }

    const updatedCart = await cartService.getOrCreateCart(userId);
    return {
      message: "Products from previous order added to your cart",
      cart: updatedCart,
      unavailableItems,
    };
  },

  /**
   * Admin: Update order status with inventory deduction/replenishment state machine
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: "PENDING_VERIFICATION" | "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    adminUserId: string,
    notes?: string
  ): Promise<OrderDetailResponse> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    let shouldDeductStock = false;
    let shouldRestoreStock = false;

    // Transition to CONFIRMED: deduct physical stock
    if (newStatus === "CONFIRMED" && !order.stockDeducted) {
      shouldDeductStock = true;
    }

    // Transition to CANCELLED: replenish stock if previously deducted
    if (newStatus === "CANCELLED" && order.stockDeducted) {
      shouldRestoreStock = true;
    }

    if (shouldDeductStock) {
      await this.deductInventoryStock(order.id);
    } else if (shouldRestoreStock) {
      await this.restoreInventoryStock(order.id);
    }

    await db
      .update(orders)
      .set({
        orderStatus: newStatus,
        stockDeducted: shouldDeductStock ? true : shouldRestoreStock ? false : order.stockDeducted,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: newStatus,
      notes: notes || `Order status updated to ${newStatus} by dispensary admin.`,
      updatedBy: adminUserId,
    });

    logger.info(`Admin ${adminUserId} updated order ${order.orderNumber} to ${newStatus}`);
    return this.getOrderById(order.id, undefined, true);
  },

  /**
   * Admin: Query all orders with dynamic filtering & pagination
   */
  async getAdminOrders(filters: {
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ orders: any[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = db.select().from(orders).$dynamic();

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(orders.orderStatus, filters.status as any));
    }
    if (filters.paymentStatus) {
      conditions.push(eq(orders.paymentStatus, filters.paymentStatus as any));
    }
    if (filters.search) {
      conditions.push(sql`${orders.orderNumber} ILIKE ${`%${filters.search}%`}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const orderList = await query
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const total = countResult?.count || 0;

    return {
      orders: orderList,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Helper: Deduct stock from products table on order confirmation
   */
  async deductInventoryStock(orderId: string): Promise<void> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (product) {
        if (product.stockQuantity < item.quantity) {
          logger.warn(`Stock underflow warning for product ${product.id} during order confirmation`);
        }
        const newQuantity = Math.max(0, product.stockQuantity - item.quantity);
        await db
          .update(products)
          .set({ stockQuantity: newQuantity, updatedAt: new Date() })
          .where(eq(products.id, product.id));
      }
    }
  },

  /**
   * Helper: Replenish stock to products table upon order cancellation
   */
  async restoreInventoryStock(orderId: string): Promise<void> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (product) {
        const newQuantity = product.stockQuantity + item.quantity;
        await db
          .update(products)
          .set({ stockQuantity: newQuantity, updatedAt: new Date() })
          .where(eq(products.id, product.id));
      }
    }
  },
};
