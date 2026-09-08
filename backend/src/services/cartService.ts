import { eq, and } from "drizzle-orm";
import { db, carts, cartItems, products, productImages } from "../db";
import { Cart, CartItem as DbCartItem } from "../db/schema/cart";
import { Product } from "../db/schema/products";

export interface EnrichedCartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  brand: string;
  manufacturer: string;
  dosageForm: string;
  mrp: number;
  price: number;
  discount: number;
  quantity: number;
  stockQuantity: number;
  inStock: boolean;
  prescriptionRequired: boolean;
  image: string;
  itemTotal: number;
  itemSavings: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryCost: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  totalAmount: number;
  prescriptionRequired: boolean;
  prescriptionCount: number;
}

export interface CartResponse {
  cartId: string;
  userId: string;
  items: EnrichedCartItem[];
  totals: CartTotals;
  notice?: string;
}

export const cartService = {
  /**
   * Get or automatically create active shopping cart for user
   */
  async getOrCreateCart(userId: string): Promise<CartResponse> {
    // 1. Locate existing cart
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);

    if (!cart) {
      const [created] = await db
        .insert(carts)
        .values({ userId })
        .returning();
      cart = created;
    }

    return this.buildCartResponse(cart);
  },

  /**
   * Add a product to the user's cart
   */
  async addItemToCart(
    userId: string,
    input: { productId: string; quantity: number }
  ): Promise<CartResponse & { prescriptionNotice?: string }> {
    const { productId, quantity } = input;
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // 1. Validate product existence and status
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.status !== "ACTIVE") {
      throw new Error("This product is currently unavailable");
    }

    if (product.stockQuantity < quantity) {
      throw new Error(`Only ${product.stockQuantity} unit(s) available in stock`);
    }

    // 2. Ensure cart exists
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      const [created] = await db.insert(carts).values({ userId }).returning();
      cart = created;
    }

    // 3. Check if product already exists in user's cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
      .limit(1);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        throw new Error(
          `Cannot add more. Requested total (${newQuantity}) exceeds available stock of ${product.stockQuantity} units`
        );
      }

      await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          price: product.sellingPrice,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: product.id,
        quantity,
        price: product.sellingPrice,
      });
    }

    const updatedCart = await this.buildCartResponse(cart);

    let prescriptionNotice: string | undefined;
    if (product.prescriptionRequired) {
      prescriptionNotice =
        "Prescription required for this product. You will be requested to upload a valid prescription during checkout.";
    }

    return {
      ...updatedCart,
      prescriptionNotice,
    };
  },

  /**
   * Update quantity of an item in the cart
   */
  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartResponse> {
    if (quantity < 1) {
      throw new Error("Quantity cannot be zero or negative. Use remove to delete item.");
    }

    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const [item] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);

    if (!item) {
      throw new Error("Cart item not found");
    }

    // Validate stock
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);

    if (!product || product.status !== "ACTIVE") {
      throw new Error("Product is currently unavailable");
    }

    if (quantity > product.stockQuantity) {
      throw new Error(`Requested quantity exceeds available stock (${product.stockQuantity} units available)`);
    }

    await db
      .update(cartItems)
      .set({
        quantity,
        price: product.sellingPrice,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId));

    return this.buildCartResponse(cart);
  },

  /**
   * Remove single product item from user's cart
   */
  async removeCartItem(userId: string, itemId: string): Promise<CartResponse> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      throw new Error("Cart not found");
    }

    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));

    return this.buildCartResponse(cart);
  },

  /**
   * Clear all items in user's cart (e.g. after order placement)
   */
  async clearCart(userId: string): Promise<CartResponse> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      return this.getOrCreateCart(userId);
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return this.buildCartResponse(cart);
  },

  /**
   * Merge guest local cart items into database user cart
   */
  async mergeGuestCart(
    userId: string,
    guestItems: Array<{ productId: string; quantity: number }>
  ): Promise<CartResponse> {
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      const [created] = await db.insert(carts).values({ userId }).returning();
      cart = created;
    }

    for (const guestItem of guestItems) {
      if (guestItem.quantity < 1) continue;

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, guestItem.productId))
        .limit(1);

      if (!product || product.status !== "ACTIVE" || product.stockQuantity <= 0) {
        continue; // Skip out-of-stock or deleted products safely
      }

      const [existing] = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, product.id)))
        .limit(1);

      if (existing) {
        const combinedQty = existing.quantity + guestItem.quantity;
        const clampedQty = Math.min(combinedQty, product.stockQuantity);
        if (clampedQty > 0) {
          await db
            .update(cartItems)
            .set({
              quantity: clampedQty,
              price: product.sellingPrice,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existing.id));
        }
      } else {
        const initialQty = Math.min(guestItem.quantity, product.stockQuantity);
        if (initialQty > 0) {
          await db.insert(cartItems).values({
            cartId: cart.id,
            productId: product.id,
            quantity: initialQty,
            price: product.sellingPrice,
          });
        }
      }
    }

    return this.buildCartResponse(cart);
  },

  /**
   * Helper to build fully calculated cart response with authoritative pricing
   */
  async buildCartResponse(cart: Cart): Promise<CartResponse> {
    // 1. Fetch raw items
    const rawItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .orderBy(cartItems.createdAt);

    if (rawItems.length === 0) {
      return {
        cartId: cart.id,
        userId: cart.userId,
        items: [],
        totals: {
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          couponDiscount: 0,
          deliveryCost: 0,
          freeDeliveryThreshold: 500,
          amountNeededForFreeDelivery: 500,
          totalAmount: 0,
          prescriptionRequired: false,
          prescriptionCount: 0,
        },
      };
    }

    // 2. Fetch associated products
    const productIds = rawItems.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "ACTIVE"));

    const productMap = new Map<string, Product>();
    dbProducts.forEach((p) => productMap.set(p.id, p));

    // 3. Fetch primary images
    const images = await db.select().from(productImages);
    const imageMap = new Map<string, string>();
    images.forEach((img) => {
      if (!imageMap.has(img.productId) || img.isPrimary) {
        imageMap.set(img.productId, img.imageUrl);
      }
    });

    // 4. Enrich items and calculate prices
    const enrichedItems: EnrichedCartItem[] = [];
    let subtotal = 0;
    let totalSellingPrice = 0;
    let itemCount = 0;
    let prescriptionCount = 0;

    for (const item of rawItems) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      const mrp = Number(product.mrp);
      const sellingPrice = Number(product.sellingPrice);
      const discount = Number(product.discount);
      const itemTotal = sellingPrice * item.quantity;
      const itemMrpTotal = mrp * item.quantity;
      const itemSavings = Math.max(0, itemMrpTotal - itemTotal);

      subtotal += itemMrpTotal;
      totalSellingPrice += itemTotal;
      itemCount += item.quantity;

      if (product.prescriptionRequired) {
        prescriptionCount += item.quantity;
      }

      enrichedItems.push({
        id: item.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        manufacturer: product.manufacturer,
        dosageForm: product.dosageForm,
        mrp,
        price: sellingPrice,
        discount,
        quantity: item.quantity,
        stockQuantity: product.stockQuantity,
        inStock: product.stockQuantity >= item.quantity && product.status === "ACTIVE",
        prescriptionRequired: product.prescriptionRequired,
        image: imageMap.get(product.id) || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        itemTotal: Number(itemTotal.toFixed(2)),
        itemSavings: Number(itemSavings.toFixed(2)),
      });
    }

    const freeDeliveryThreshold = 500;
    const discount = Math.max(0, subtotal - totalSellingPrice);
    const deliveryCost = totalSellingPrice >= freeDeliveryThreshold || totalSellingPrice === 0 ? 0 : 40;
    const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalSellingPrice);
    const totalAmount = totalSellingPrice + deliveryCost;

    return {
      cartId: cart.id,
      userId: cart.userId,
      items: enrichedItems,
      totals: {
        itemCount,
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        couponDiscount: 0,
        deliveryCost,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery: Number(amountNeededForFreeDelivery.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        prescriptionRequired: prescriptionCount > 0,
        prescriptionCount,
      },
    };
  },
};
