import { eq, and, or, ilike, gte, lte, gt, desc, asc, sql, count } from "drizzle-orm";
import { db, products, productImages, categories, Product, ProductImage, Category } from "../db";
import { generateSlug } from "./categoryService";
import { cloudinaryService } from "./cloudinaryService";
import { logger } from "../utils/logger";

export interface ProductWithDetails extends Product {
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: ProductImage[];
  stockStatus: "In Stock" | "Out of Stock";
  inStock: boolean;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  prescriptionRequired?: string;
  inStock?: string;
  sort?: "price-low" | "price-high" | "latest" | "popularity";
  includeAllStatus?: boolean; // For admin console
}

export const productService = {
  /**
   * Helper to format product with stock status
   */
  formatProduct(p: Product, imgs: ProductImage[] = [], cat?: any): ProductWithDetails {
    const inStock = p.stockQuantity > 0 && p.status === "ACTIVE";
    return {
      ...p,
      category: cat || null,
      images: imgs,
      inStock,
      stockStatus: inStock ? "In Stock" : "Out of Stock",
    };
  },

  /**
   * Get filtered, paginated products for customer or admin
   */
  async getProducts(params: ProductFilterParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    // Conditions builder
    const conditions = [];

    // Filter by status (customers only see ACTIVE)
    if (!params.includeAllStatus) {
      conditions.push(eq(products.status, "ACTIVE"));
    } else {
      conditions.push(sql`${products.status} != 'ARCHIVED'`);
    }

    // Category Slug resolving
    if (params.categorySlug) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, params.categorySlug))
        .limit(1);

      if (cat) {
        // Also check if this category has subcategories, and include products from all subcategories
        const subCats = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.parentCategoryId, cat.id));

        const catIds = [cat.id, ...subCats.map((s) => s.id)];
        conditions.push(
          or(...catIds.map((cid) => eq(products.categoryId, cid)))
        );
      }
    } else if (params.categoryId) {
      conditions.push(eq(products.categoryId, params.categoryId));
    }

    // Brand filter
    if (params.brand) {
      conditions.push(eq(products.brand, params.brand));
    }

    // Price range filters
    if (params.minPrice !== undefined) {
      conditions.push(gte(products.sellingPrice, params.minPrice.toString()));
    }
    if (params.maxPrice !== undefined) {
      conditions.push(lte(products.sellingPrice, params.maxPrice.toString()));
    }

    // Minimum discount filter
    if (params.minDiscount !== undefined) {
      conditions.push(gte(products.discount, params.minDiscount.toString()));
    }

    // Prescription required filter
    if (params.prescriptionRequired !== undefined) {
      conditions.push(eq(products.prescriptionRequired, params.prescriptionRequired === "true"));
    }

    // In Stock filter
    if (params.inStock === "true") {
      conditions.push(gt(products.stockQuantity, 0));
    }

    // Clinical / Text Search (case-insensitive across name, brand, composition)
    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(products.name, searchTerm),
          ilike(products.brand, searchTerm),
          ilike(products.composition, searchTerm),
          ilike(products.manufacturer, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting builder
    let orderByClause;
    switch (params.sort) {
      case "price-low":
        orderByClause = asc(products.sellingPrice);
        break;
      case "price-high":
        orderByClause = desc(products.sellingPrice);
        break;
      case "latest":
        orderByClause = desc(products.createdAt);
        break;
      case "popularity":
      default:
        orderByClause = desc(products.rating);
        break;
    }

    // 1. Get total matching items
    const [countResult] = await db
      .select({ total: count() })
      .from(products)
      .where(whereClause);

    const totalItems = Number(countResult?.total || 0);
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Fetch paginated products with category info
    const productRows = await db
      .select({
        product: products,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // 3. Batch fetch product gallery images
    const productIds = productRows.map((r) => r.product.id);
    let allImages: ProductImage[] = [];

    if (productIds.length > 0) {
      allImages = await db
        .select()
        .from(productImages)
        .where(
          or(...productIds.map((pid) => eq(productImages.productId, pid)))
        )
        .orderBy(asc(productImages.displayOrder));
    }

    const formattedProducts = productRows.map(({ product, categoryName, categorySlug }) => {
      const images = allImages.filter((img) => img.productId === product.id);
      return this.formatProduct(product, images, {
        id: product.categoryId,
        name: categoryName || "Medicines",
        slug: categorySlug || "medicines",
      });
    });

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get single product by UUID or Slug (with gallery and related products)
   */
  async getProductByIdOrSlug(identifier: string): Promise<{
    product: ProductWithDetails;
    relatedProducts: ProductWithDetails[];
  } | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    const [row] = await db
      .select({
        product: products,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          isUuid ? eq(products.id, identifier) : eq(products.slug, identifier),
          sql`${products.status} != 'ARCHIVED'`
        )
      )
      .limit(1);

    if (!row) return null;

    // Fetch images for this product
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, row.product.id))
      .orderBy(asc(productImages.displayOrder));

    const productFormatted = this.formatProduct(row.product, images, {
      id: row.product.categoryId,
      name: row.categoryName,
      slug: row.categorySlug,
    });

    // Fetch 4 related products from the same category
    const relatedRows = await db
      .select({
        product: products,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.categoryId, row.product.categoryId),
          eq(products.status, "ACTIVE"),
          sql`${products.id} != ${row.product.id}`
        )
      )
      .limit(4);

    const relatedIds = relatedRows.map((r) => r.product.id);
    let relatedImages: ProductImage[] = [];

    if (relatedIds.length > 0) {
      relatedImages = await db
        .select()
        .from(productImages)
        .where(
          or(...relatedIds.map((pid) => eq(productImages.productId, pid)))
        );
    }

    const relatedFormatted = relatedRows.map(({ product, categoryName, categorySlug }) => {
      const imgs = relatedImages.filter((img) => img.productId === product.id);
      return this.formatProduct(product, imgs, {
        id: product.categoryId,
        name: categoryName,
        slug: categorySlug,
      });
    });

    return {
      product: productFormatted,
      relatedProducts: relatedFormatted,
    };
  },

  /**
   * Admin: Create product
   /**
   * Admin: Create product with category verification, SKU check, and clinical defaults
   */
  async createProduct(data: any): Promise<ProductWithDetails> {
    const slug = data.slug || generateSlug(data.name);

    // 1. Check duplicate SKU
    const [existingSku] = await db
      .select()
      .from(products)
      .where(eq(products.sku, data.sku))
      .limit(1);

    if (existingSku) {
      throw new Error(`Product with SKU '${data.sku}' already exists`);
    }

    // 2. Check duplicate Slug
    const [existingSlug] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingSlug) {
      throw new Error(`Product with slug '${slug}' already exists`);
    }

    // 3. Verify category exists (UUID or name/slug lookup)
    const isUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let category: Category | undefined;
    if (data.categoryId && isUuidRegex.test(data.categoryId)) {
      const [found] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);
      category = found;
    }
    if (!category && data.categoryId) {
      const [found] = await db
        .select()
        .from(categories)
        .where(or(ilike(categories.name, data.categoryId), ilike(categories.slug, data.categoryId)))
        .limit(1);
      category = found;
    }
    if (!category) {
      const [fallback] = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .limit(1);
      category = fallback;
    }

    if (!category) {
      throw new Error("Specified category does not exist and no active category available");
    }

    // 4. Validate Price Integrity (sellingPrice <= mrp)
    const mrp = Number(data.mrp);
    const sellingPrice = Number(data.sellingPrice);
    if (sellingPrice > mrp) {
      throw new Error("Selling price cannot exceed Maximum Retail Price (MRP)");
    }

    // Compute automatic discount percentage if not provided
    const discount =
      data.discount !== undefined
        ? Number(data.discount)
        : mrp > 0
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : 0;

    // 5. Intelligent clinical & packaging defaults
    const brand = data.brand || "Genekon Healthcare";
    const manufacturer = data.manufacturer || brand || "Genekon Pharmaceuticals Pvt Ltd";
    const composition = data.composition || data.name;
    const dosageForm = data.dosageForm || "10 Tablets / Strip";
    const description =
      data.description ||
      `${data.name} is a high-grade pharmaceutical formulation manufactured by ${manufacturer} for therapeutic care.`;
    const usage =
      data.usage ||
      "Take as directed by your physician or follow packaging instructions carefully. Swallow whole with water.";
    const precautions =
      data.precautions ||
      "Keep out of reach of children. Consult a healthcare professional prior to use if pregnant, nursing, or have a chronic medical condition.";
    const storageInstructions =
      data.storageInstructions || "Store below 25°C in a cool and dry place away from direct sunlight.";

    // Helper for matching pharma imagery
    const getStandardImage = (form: string, catName: string = "") => {
      const f = (form + " " + catName).toLowerCase();
      if (f.includes("syrup") || f.includes("liquid") || f.includes("suspension") || f.includes("cough"))
        return "/images/products/genekon-syrup-bottle.jpg";
      if (f.includes("capsule")) return "/images/products/genekon-capsules-bottle.jpg";
      if (
        f.includes("ointment") ||
        f.includes("cream") ||
        f.includes("gel") ||
        f.includes("skin") ||
        f.includes("derm")
      )
        return "/images/products/genekon-ointment-tube.jpg";
      if (f.includes("inhaler") || f.includes("respiratory") || f.includes("asthma"))
        return "/images/products/genekon-inhaler-device.jpg";
      if (f.includes("drop") || f.includes("eye") || f.includes("ear") || f.includes("nasal"))
        return "/images/products/genekon-eye-drops.jpg";
      if (f.includes("powder") || f.includes("protein") || f.includes("sachet") || f.includes("ayurved"))
        return "/images/products/genekon-health-powder.jpg";
      if (f.includes("device") || f.includes("monitor") || f.includes("meter") || f.includes("diagnostic"))
        return "/images/products/genekon-diagnostic-device.jpg";
      return "/images/products/genekon-tablets-pack.jpg";
    };

    // 6. Insert product
    const [created] = await db
      .insert(products)
      .values({
        name: data.name,
        slug,
        brand,
        manufacturer,
        categoryId: category.id,
        description,
        composition,
        dosageForm,
        usage,
        precautions,
        storageInstructions,
        mrp: mrp.toFixed(2),
        sellingPrice: sellingPrice.toFixed(2),
        discount: discount.toFixed(2),
        gst: (data.gst !== undefined ? Number(data.gst) : 12).toFixed(2),
        sku: data.sku,
        stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : 50,
        prescriptionRequired: Boolean(data.prescriptionRequired),
        status: data.status || "ACTIVE",
        rating: "4.50",
        reviewCount: 0,
      })
      .returning();

    // 7. Insert initial images
    const createdImages: ProductImage[] = [];
    const imageList: Array<{ url: string; isPrimary: boolean }> = [];

    if (data.image && typeof data.image === "string") {
      imageList.push({ url: data.image, isPrimary: true });
    }

    if (data.images) {
      if (Array.isArray(data.images)) {
        data.images.forEach((img: any, idx: number) => {
          const u = typeof img === "string" ? img : img.imageUrl || img.url;
          if (u && !imageList.some((item) => item.url === u)) {
            imageList.push({ url: u, isPrimary: imageList.length === 0 || img.isPrimary });
          }
        });
      } else if (typeof data.images === "string" && !imageList.some((item) => item.url === data.images)) {
        imageList.push({ url: data.images, isPrimary: imageList.length === 0 });
      }
    }

    // If still no images provided, assign default pharmaceutical packaging photo
    if (imageList.length === 0) {
      imageList.push({
        url: getStandardImage(dosageForm, category.name),
        isPrimary: true,
      });
    }

    for (let i = 0; i < imageList.length; i++) {
      const img = imageList[i];
      const [insertedImg] = await db
        .insert(productImages)
        .values({
          productId: created.id,
          imageUrl: img.url,
          altText: created.name,
          isPrimary: img.isPrimary || i === 0,
          displayOrder: i,
        })
        .returning();
      createdImages.push(insertedImg);
    }

    return this.formatProduct(created, createdImages, {
      id: category.id,
      name: category.name,
      slug: category.slug,
    });
  },

  /**
   * Admin: Update product
   */
  async updateProduct(id: string, data: any): Promise<ProductWithDetails> {
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!existing) {
      throw new Error("Product not found");
    }

    // Check SKU conflict
    if (data.sku && data.sku !== existing.sku) {
      const [dupSku] = await db.select().from(products).where(eq(products.sku, data.sku)).limit(1);
      if (dupSku) throw new Error(`Product with SKU '${data.sku}' already exists`);
    }

    // Check Slug conflict
    const slug = data.slug || (data.name ? generateSlug(data.name) : undefined);
    if (slug && slug !== existing.slug) {
      const [dupSlug] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
      if (dupSlug) throw new Error(`Product with slug '${slug}' already exists`);
    }

    // Validate category if provided
    let resolvedCategoryId = existing.categoryId;
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const isUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let cat: Category | undefined;
      if (isUuidRegex.test(data.categoryId)) {
        const [found] = await db.select().from(categories).where(eq(categories.id, data.categoryId)).limit(1);
        cat = found;
      }
      if (!cat) {
        const [found] = await db
          .select()
          .from(categories)
          .where(or(ilike(categories.name, data.categoryId), ilike(categories.slug, data.categoryId)))
          .limit(1);
        cat = found;
      }
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    // Price validation
    const mrp = data.mrp !== undefined ? Number(data.mrp) : Number(existing.mrp);
    const sellingPrice =
      data.sellingPrice !== undefined ? Number(data.sellingPrice) : Number(existing.sellingPrice);

    if (sellingPrice > mrp) {
      throw new Error("Selling price cannot exceed Maximum Retail Price (MRP)");
    }

    const [updated] = await db
      .update(products)
      .set({
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
        ...(data.brand && { brand: data.brand }),
        ...(data.manufacturer && { manufacturer: data.manufacturer }),
        ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
        ...(data.description && { description: data.description }),
        ...(data.composition && { composition: data.composition }),
        ...(data.dosageForm && { dosageForm: data.dosageForm }),
        ...(data.usage && { usage: data.usage }),
        ...(data.precautions && { precautions: data.precautions }),
        ...(data.storageInstructions && { storageInstructions: data.storageInstructions }),
        ...(data.mrp !== undefined && { mrp: mrp.toFixed(2) }),
        ...(data.sellingPrice !== undefined && { sellingPrice: sellingPrice.toFixed(2) }),
        ...(data.discount !== undefined && { discount: Number(data.discount).toFixed(2) }),
        ...(data.gst !== undefined && { gst: Number(data.gst).toFixed(2) }),
        ...(data.sku && { sku: data.sku }),
        ...(data.stockQuantity !== undefined && { stockQuantity: Number(data.stockQuantity) }),
        ...(data.prescriptionRequired !== undefined && {
          prescriptionRequired: Boolean(data.prescriptionRequired),
        }),
        ...(data.status && { status: data.status }),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    // If an image URL is supplied, update or insert primary image
    const newImageUrl = data.image || (Array.isArray(data.images) && typeof data.images[0] === "string" ? data.images[0] : undefined);
    if (newImageUrl) {
      const [existingPrimary] = await db
        .select()
        .from(productImages)
        .where(and(eq(productImages.productId, id), eq(productImages.isPrimary, true)))
        .limit(1);

      if (existingPrimary) {
        await db
          .update(productImages)
          .set({ imageUrl: newImageUrl, altText: updated.name })
          .where(eq(productImages.id, existingPrimary.id));
      } else {
        await db.insert(productImages).values({
          productId: id,
          imageUrl: newImageUrl,
          altText: updated.name,
          isPrimary: true,
          displayOrder: 0,
        });
      }
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.displayOrder));

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, updated.categoryId))
      .limit(1);

    return this.formatProduct(updated, images, category);
  },

  /**
   * Admin: Soft Delete product (sets status to ARCHIVED)
   */
  async deleteProduct(id: string): Promise<{ id: string; message: string }> {
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!existing) {
      throw new Error("Product not found");
    }

    // Soft delete to protect historical order records
    await db
      .update(products)
      .set({ status: "ARCHIVED", updatedAt: new Date() })
      .where(eq(products.id, id));

    return { id, message: "Product archived successfully" };
  },

  /**
   * Admin: Upload multiple gallery images to Cloudinary and link to product
   */
  async uploadProductImages(
    productId: string,
    files: Express.Multer.File[]
  ): Promise<ProductImage[]> {
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

    if (!product) {
      throw new Error("Product not found");
    }

    // Get current image count for display order
    const existingImages = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    const uploadedImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadResult = await cloudinaryService.uploadImage(
        file.buffer,
        `genekon/products/${product.slug}`
      );

      const isFirst = existingImages.length === 0 && i === 0;

      const [record] = await db
        .insert(productImages)
        .values({
          productId,
          imageUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          altText: `${product.name} Photo ${existingImages.length + i + 1}`,
          displayOrder: existingImages.length + i,
          isPrimary: isFirst,
        })
        .returning();

      uploadedImages.push(record);
    }

    return uploadedImages;
  },

  /**
   * Admin: Delete product image
   */
  async deleteProductImage(imageId: string): Promise<{ id: string; message: string }> {
    const [image] = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, imageId))
      .limit(1);

    if (!image) {
      throw new Error("Image not found");
    }

    if (image.publicId) {
      await cloudinaryService.deleteImage(image.publicId);
    }

    await db.delete(productImages).where(eq(productImages.id, imageId));

    return { id: imageId, message: "Image removed successfully" };
  },
};
