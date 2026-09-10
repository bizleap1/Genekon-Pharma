import { eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db, products } from "../db";
import { Product } from "../db/schema/products";
import { logger } from "../utils/logger";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const productResolver = {
  /**
   * Resolves a single product by UUID, slug, SKU, or name
   */
  async resolveProduct(identifier: string, nameFallback?: string): Promise<Product | null> {
    if (!identifier && !nameFallback) return null;

    const cleanId = (identifier || "").trim();
    const cleanName = (nameFallback || "").trim();

    // 1. If it's a valid UUID, query by primary key
    if (cleanId && UUID_REGEX.test(cleanId)) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, cleanId))
        .limit(1);

      if (product) return product;
    }

    // 2. Query by slug
    if (cleanId && cleanId.length > 2) {
      const [bySlug] = await db
        .select()
        .from(products)
        .where(eq(products.slug, cleanId))
        .limit(1);

      if (bySlug) return bySlug;
    }

    // 3. Query by SKU
    if (cleanId && cleanId.length > 2) {
      const [bySku] = await db
        .select()
        .from(products)
        .where(eq(products.sku, cleanId))
        .limit(1);

      if (bySku) return bySku;
    }

    // 4. Query by exact or case-insensitive Name
    const targetName = cleanName || cleanId;
    if (targetName && targetName.length > 2) {
      // Direct ilike match
      const [byName] = await db
        .select()
        .from(products)
        .where(ilike(products.name, targetName))
        .limit(1);

      if (byName) return byName;

      // Partial fuzzy search if exact name didn't hit
      const [byFuzzy] = await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${targetName}%`))
        .limit(1);

      if (byFuzzy) return byFuzzy;

      // Composition match as fallback
      const [byComposition] = await db
        .select()
        .from(products)
        .where(ilike(products.composition, `%${targetName}%`))
        .limit(1);

      if (byComposition) return byComposition;
    }

    return null;
  },

  /**
   * Resolves a list of cart / order items to their authoritative database Product records.
   * Returns a Map where key = original productId passed in, value = Product.
   */
  async resolveProducts(
    items: Array<{ productId: string; name?: string }>
  ): Promise<Map<string, Product>> {
    const resultMap = new Map<string, Product>();
    if (!items || items.length === 0) return resultMap;

    // Separate valid UUIDs from non-UUIDs for bulk querying
    const uuidMap = new Map<string, { productId: string; name?: string }>();
    const nonUuidItems: Array<{ productId: string; name?: string }> = [];

    for (const item of items) {
      const cleanId = (item.productId || "").trim();
      if (UUID_REGEX.test(cleanId)) {
        uuidMap.set(cleanId, item);
      } else {
        nonUuidItems.push(item);
      }
    }

    // Bulk fetch UUIDs
    if (uuidMap.size > 0) {
      const uuidList = Array.from(uuidMap.keys());
      const dbRecords = await db
        .select()
        .from(products)
        .where(inArray(products.id, uuidList));

      for (const p of dbRecords) {
        resultMap.set(p.id, p);
      }
    }

    // Resolve non-UUID items individually or by name/slug
    for (const item of nonUuidItems) {
      const resolved = await this.resolveProduct(item.productId, item.name);
      if (resolved) {
        resultMap.set(item.productId, resolved);
      } else {
        logger.warn(`Could not resolve product for identifier '${item.productId}' (name: '${item.name}')`);
      }
    }

    return resultMap;
  },
};
