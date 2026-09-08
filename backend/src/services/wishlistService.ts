import { eq, and, or } from "drizzle-orm";
import { db, wishlists, products, productImages } from "../db";
import { WishlistItem } from "../db/schema/wishlist";
import { cartService, CartResponse } from "./cartService";

export interface WishlistItemWithProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    manufacturer: string;
    dosageForm: string;
    mrp: number;
    price: number;
    discount: number;
    stockQuantity: number;
    inStock: boolean;
    prescriptionRequired: boolean;
    image: string;
  };
}

export const wishlistService = {
  /**
   * Get all wishlisted products for user with current pricing & stock status
   */
  async getWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
    const rawItems = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(wishlists.createdAt);

    if (rawItems.length === 0) {
      return [];
    }

    const productIds = rawItems.map((item) => item.productId);

    // Fetch products
    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "ACTIVE"));

    const productMap = new Map();
    dbProducts.forEach((p) => productMap.set(p.id, p));

    // Fetch images
    const images = await db.select().from(productImages);
    const imageMap = new Map<string, string>();
    images.forEach((img) => {
      if (!imageMap.has(img.productId) || img.isPrimary) {
        imageMap.set(img.productId, img.imageUrl);
      }
    });

    const results: WishlistItemWithProduct[] = [];

    for (const item of rawItems) {
      const p = productMap.get(item.productId);
      if (!p) continue; // Skip archived or deleted products

      results.push({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          manufacturer: p.manufacturer,
          dosageForm: p.dosageForm,
          mrp: Number(p.mrp),
          price: Number(p.sellingPrice),
          discount: Number(p.discount),
          stockQuantity: p.stockQuantity,
          inStock: p.stockQuantity > 0 && p.status === "ACTIVE",
          prescriptionRequired: p.prescriptionRequired,
          image: imageMap.get(p.id) || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        },
      });
    }

    return results;
  },

  /**
   * Add a product to the user's wishlist (idempotent, prevents duplicates)
   */
  async addToWishlist(
    userId: string,
    productId: string
  ): Promise<{ message: string; item: WishlistItem; alreadyExists: boolean }> {
    // 1. Verify product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.status !== "ACTIVE") {
      throw new Error("This product is currently inactive and cannot be saved");
    }

    // 2. Check existing
    const [existing] = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing) {
      return {
        message: "Product is already in your wishlist",
        item: existing,
        alreadyExists: true,
      };
    }

    // 3. Insert new item
    const [created] = await db
      .insert(wishlists)
      .values({
        userId,
        productId,
      })
      .returning();

    return {
      message: "Product added to wishlist successfully",
      item: created,
      alreadyExists: false,
    };
  },

  /**
   * Remove a product from the user's wishlist by productId or wishlist record id
   */
  async removeFromWishlist(
    userId: string,
    productIdOrId: string
  ): Promise<{ message: string; removed: boolean }> {
    const deleted = await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          or(eq(wishlists.productId, productIdOrId), eq(wishlists.id, productIdOrId))
        )
      )
      .returning();

    return {
      message: deleted.length > 0 ? "Product removed from wishlist" : "Product was not in wishlist",
      removed: deleted.length > 0,
    };
  },

  /**
   * Move item from wishlist directly to cart
   */
  async moveToCart(
    userId: string,
    productId: string
  ): Promise<{ message: string; cart: CartResponse; prescriptionNotice?: string }> {
    // 1. Add to cart
    const cartResult = await cartService.addItemToCart(userId, { productId, quantity: 1 });

    // 2. Remove from wishlist
    await this.removeFromWishlist(userId, productId);

    return {
      message: "Item moved to cart successfully",
      cart: cartResult,
      prescriptionNotice: cartResult.prescriptionNotice,
    };
  },

  /**
   * Synchronize guest local wishlist product IDs with authenticated user
   */
  async syncWishlist(userId: string, productIds: string[]): Promise<WishlistItemWithProduct[]> {
    for (const productId of productIds) {
      try {
        await this.addToWishlist(userId, productId);
      } catch {
        // Ignore inactive or non-existent products in batch sync
      }
    }

    return this.getWishlist(userId);
  },
};
