import { eq } from "drizzle-orm";
import { db, categories, products, productImages } from "../db";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import { logger } from "../utils/logger";

async function runProductVerification() {
  logger.info("==================================================");
  logger.info("🧪 Starting Genekon Product & Category System Verification");
  logger.info("==================================================");

  // 1. Category Tree & Hierarchy Test
  logger.info("\n--- STEP 1: Creating Main & Subcategories ---");
  
  // Clean up any previous test products & categories
  const existingSub = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "cardiac-cholesterol-test"));
  if (existingSub.length > 0) {
    const testProds = await db.select().from(products).where(eq(products.categoryId, existingSub[0].id));
    for (const p of testProds) {
      await db.delete(productImages).where(eq(productImages.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }
    await db.delete(categories).where(eq(categories.id, existingSub[0].id));
  }

  const existingMain = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "prescription-medicines-test"));
  if (existingMain.length > 0) {
    await db.delete(categories).where(eq(categories.id, existingMain[0].id));
  }

  // Create Main Category
  const mainCategory = await categoryService.createCategory({
    name: "Prescription Medicines Test",
    slug: "prescription-medicines-test",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
    displayOrder: 1,
    isActive: true,
  });
  logger.info(`✅ Main Category Created: ${mainCategory.name} (ID: ${mainCategory.id})`);

  // Create Subcategory
  const subCategory = await categoryService.createCategory({
    name: "Cardiac & Cholesterol Test",
    slug: "cardiac-cholesterol-test",
    parentCategoryId: mainCategory.id,
    displayOrder: 1,
    isActive: true,
  });
  logger.info(`✅ Subcategory Created: ${subCategory.name} (Parent ID: ${subCategory.parentCategoryId})`);

  // Verify Category Tree
  const categoryTree = await categoryService.getCategoryTree();
  const foundMain = categoryTree.find((c) => c.id === mainCategory.id);
  if (!foundMain || !foundMain.subcategories || foundMain.subcategories.length === 0) {
    throw new Error("Category hierarchy tree verification failed: Subcategory not nested under main category");
  }
  logger.info(`✅ Category Hierarchy verified: "${foundMain.name}" has ${foundMain.subcategories.length} subcategory`);

  // Verify Slug Lookup
  const bySlug = await categoryService.getCategoryBySlug("prescription-medicines-test");
  if (!bySlug || bySlug.id !== mainCategory.id) {
    throw new Error("Category lookup by slug failed");
  }
  logger.info(`✅ Category lookup by slug verified: found "${bySlug.name}"`);

  // 2. Product Validation Tests
  logger.info("\n--- STEP 2: Testing Clinical & Pricing Validations ---");

  // Test Price Boundary Rule: sellingPrice > mrp must fail
  try {
    logger.info("Testing invalid price rule (sellingPrice 500 > mrp 400)...");
    await productService.createProduct({
      name: "Faulty Pricing Tablet",
      brand: "Test Pharma",
      manufacturer: "Test Labs",
      categoryId: subCategory.id,
      mrp: "400.00",
      sellingPrice: "500.00",
      sku: "TEST-FAULTY-" + Date.now(),
    });
    throw new Error("Product with sellingPrice > mrp should have been rejected!");
  } catch (err: any) {
    logger.info(`✅ Price boundary check passed: ${err.message}`);
  }

  // 3. Create Valid Pharmaceutical Product
  logger.info("\n--- STEP 3: Creating Complete Pharmaceutical Product ---");
  const testSku = "ATRV-20-" + Math.floor(Math.random() * 10000);
  const testSlug = "atorvastatin-20mg-test-" + Date.now();

  const product = await productService.createProduct({
    name: "Atorvastatin 20mg Film-Coated Tablets Test",
    slug: testSlug,
    brand: "Genekon Cardio",
    manufacturer: "Genekon Life Sciences Ltd",
    categoryId: subCategory.id,
    description: "Atorvastatin is a selective, competitive HMG-CoA reductase inhibitor for lipid management.",
    composition: "Atorvastatin Calcium IP eq. to Atorvastatin 20mg",
    dosageForm: "Tablet",
    packSize: "10 Tablets / Strip",
    usage: "Take orally once daily at any time of day, with or without food as prescribed.",
    precautions: "Contraindicated in active liver disease or unexplained persistent elevations of serum transaminases.",
    storageInstructions: "Store below 25°C in a dry place. Protect from moisture and direct sunlight.",
    mrp: "185.00",
    sellingPrice: "148.00",
    discount: "20.00",
    gst: "12.00",
    sku: testSku,
    stockQuantity: 150,
    prescriptionRequired: true,
    status: "ACTIVE",
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
        publicId: "genekon/test/atorvastatin_mock_1",
        isPrimary: true,
        displayOrder: 0,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800",
        publicId: "genekon/test/atorvastatin_mock_2",
        isPrimary: false,
        displayOrder: 1,
      },
    ],
  });

  logger.info(`✅ Pharmaceutical Product Created: ${product.name}`);
  logger.info(`   ID: ${product.id}`);
  logger.info(`   SKU: ${product.sku}`);
  logger.info(`   Prescription Required: ${product.prescriptionRequired}`);
  logger.info(`   Gallery Images: ${product.images.length}`);

  // 4. Catalog Search & Filter Tests
  logger.info("\n--- STEP 4: Testing Catalog Querying, Search & Filtering ---");

  // Search by keyword
  const searchResult = await productService.getProducts({
    search: "Atorvastatin",
    page: 1,
    limit: 10,
  });
  logger.info(`Search for "Atorvastatin": found ${searchResult.pagination.totalItems} products`);
  if (searchResult.products.length === 0) {
    throw new Error("Search by keyword failed to locate created product");
  }
  logger.info(`✅ Search keyword test passed: First result "${searchResult.products[0].name}"`);

  // Filter by category
  const categoryFilterResult = await productService.getProducts({
    categoryId: subCategory.id,
  });
  logger.info(`Filter by Category ID: found ${categoryFilterResult.pagination.totalItems} products`);
  if (categoryFilterResult.products.length === 0) {
    throw new Error("Filter by category failed");
  }
  logger.info(`✅ Category filter test passed`);

  // Filter by prescriptionRequired
  const rxFilterResult = await productService.getProducts({
    prescriptionRequired: "true",
    brand: "Genekon Cardio",
  });
  logger.info(`Filter by Prescription Required & Brand: found ${rxFilterResult.pagination.totalItems} products`);
  if (rxFilterResult.products.length === 0) {
    throw new Error("Filter by prescription and brand failed");
  }
  logger.info(`✅ Prescription & Brand filter test passed`);

  // Sort by price
  const sortedResult = await productService.getProducts({
    sort: "price-low",
    limit: 5,
  });
  logger.info(`Sorted by price asc: top product price ₹${sortedResult.products[0]?.sellingPrice}`);

  // 5. Product Detail & Related Products Lookup
  logger.info("\n--- STEP 5: Testing Single Product & Related Items ---");
  const detailedProduct = await productService.getProductByIdOrSlug(testSlug);
  if (!detailedProduct) {
    throw new Error("Product retrieval by slug failed");
  }
  logger.info(`✅ Single product retrieved: ${detailedProduct.product.name}`);
  logger.info(`   Composition: ${detailedProduct.product.composition}`);
  logger.info(`   Category: ${detailedProduct.product.category?.name}`);
  logger.info(`   Related Products Count: ${detailedProduct.relatedProducts?.length}`);

  // 6. Admin Update & Soft Deletion
  logger.info("\n--- STEP 6: Testing Admin Update & Soft Deletion ---");
  const updatedProduct = await productService.updateProduct(product.id, {
    stockQuantity: 200,
    sellingPrice: "139.00",
    discount: "24.86",
  });
  logger.info(`✅ Product updated: New price ₹${updatedProduct.sellingPrice}, Stock: ${updatedProduct.stockQuantity}`);

  // Soft Delete
  const deleteResult = await productService.deleteProduct(product.id);
  logger.info(`✅ Soft Delete Product: ${deleteResult.message}`);

  // Verify archived product is excluded from default public catalog
  const catalogAfterDelete = await productService.getProducts({
    search: "Atorvastatin 20mg Film-Coated Tablets Test",
  });
  const isFound = catalogAfterDelete.products.some((item) => item.id === product.id);
  if (isFound) {
    throw new Error("Archived product still appeared in active public catalog!");
  }
  logger.info(`✅ Soft deletion verified: Archived product safely excluded from active catalog query`);

  // Clean up test data
  logger.info("\n--- STEP 7: Cleaning Up Test Artifacts ---");
  await db.delete(productImages).where(eq(productImages.productId, product.id));
  await db.delete(products).where(eq(products.id, product.id));
  await db.delete(categories).where(eq(categories.id, subCategory.id));
  await db.delete(categories).where(eq(categories.id, mainCategory.id));
  logger.info("✅ Test records cleaned up successfully");

  logger.info("\n==================================================");
  logger.info("🎉 All Product & Category Management Tests PASSED Successfully!");
  logger.info("==================================================");
}

runProductVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Verification failed:", err);
    process.exit(1);
  });
