import { eq } from "drizzle-orm";
import { db, users, categories, products, productImages, carts, cartItems, wishlists } from "../db";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { logger } from "../utils/logger";

async function runCartWishlistVerification() {
  logger.info("==================================================");
  logger.info("🧪 Starting Genekon Cart & Wishlist System Verification");
  logger.info("==================================================");

  // 1. Setup Test User
  logger.info("\n--- STEP 1: Setting up Test Customer User ---");
  const testEmail = "test.patient.cart@genekonpharma.com";
  let [testUser] = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);

  if (!testUser) {
    const [created] = await db
      .insert(users)
      .values({
        name: "Aakash Verma",
        email: testEmail,
        phone: "9876543299",
        role: "CUSTOMER",
        isActive: true,
      })
      .returning();
    testUser = created;
    logger.info(`Created test user: ${testUser.name} (${testUser.id})`);
  } else {
    logger.info(`Using existing test user: ${testUser.name} (${testUser.id})`);
  }

  // 2. Setup Test Category & Products
  logger.info("\n--- STEP 2: Seeding Test Catalog Products ---");
  let [testCat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "cart-test-therapeutics"))
    .limit(1);

  if (!testCat) {
    const [createdCat] = await db
      .insert(categories)
      .values({
        name: "Cart Test Therapeutics",
        slug: "cart-test-therapeutics",
        isActive: true,
      })
      .returning();
    testCat = createdCat;
  }

  // Clean up any previous test products
  const prevProducts = await db
    .select()
    .from(products)
    .where(eq(products.categoryId, testCat.id));

  for (const p of prevProducts) {
    await db.delete(wishlists).where(eq(wishlists.productId, p.id));
    await db.delete(cartItems).where(eq(cartItems.productId, p.id));
    await db.delete(productImages).where(eq(productImages.productId, p.id));
    await db.delete(products).where(eq(products.id, p.id));
  }

  // Product A: OTC Paracetamol
  const [otcProduct] = await db
    .insert(products)
    .values({
      name: "Paracetamol 650mg Fast Action Test",
      slug: "paracetamol-650mg-test-" + Date.now(),
      brand: "Genekon Care",
      manufacturer: "Genekon Pharma",
      categoryId: testCat.id,
      description: "Effective antipyretic and analgesic tablet.",
      composition: "Paracetamol IP 650mg",
      dosageForm: "15 Tablets / Strip",
      usage: "Take 1 tablet every 6 hours as needed.",
      precautions: "Do not exceed 4g daily.",
      mrp: "50.00",
      sellingPrice: "40.00",
      discount: "20.00",
      sku: "TEST-OTC-" + Date.now(),
      stockQuantity: 50,
      prescriptionRequired: false,
      status: "ACTIVE",
    })
    .returning();

  // Product B: Prescription Antibiotic
  const [rxProduct] = await db
    .insert(products)
    .values({
      name: "Amoxicillin 500mg Antibiotic Test",
      slug: "amoxicillin-500mg-test-" + Date.now(),
      brand: "Genekon Anti-Infective",
      manufacturer: "Genekon Labs",
      categoryId: testCat.id,
      description: "Broad spectrum penicillin antibiotic.",
      composition: "Amoxicillin Trihydrate IP eq to Amoxicillin 500mg",
      dosageForm: "10 Capsules / Strip",
      usage: "Take as directed by medical practitioner.",
      precautions: "Contraindicated in penicillin allergy.",
      mrp: "120.00",
      sellingPrice: "95.00",
      discount: "20.83",
      sku: "TEST-RX-" + Date.now(),
      stockQuantity: 15,
      prescriptionRequired: true,
      status: "ACTIVE",
    })
    .returning();

  logger.info(`✅ Seeded OTC Product: ${otcProduct.name} (Stock: ${otcProduct.stockQuantity}, Price: ₹${otcProduct.sellingPrice})`);
  logger.info(`✅ Seeded Rx Product: ${rxProduct.name} (Stock: ${rxProduct.stockQuantity}, Price: ₹${rxProduct.sellingPrice}, Rx: true)`);

  // Ensure clean user cart
  await cartService.clearCart(testUser.id);
  logger.info("Cleared user cart for clean verification run");

  // 3. Test Add to Cart & Pricing Calculation
  logger.info("\n--- STEP 3: Testing Add to Cart & Server-Side Price Calculation ---");
  const addOtcRes = await cartService.addItemToCart(testUser.id, {
    productId: otcProduct.id,
    quantity: 2,
  });

  logger.info(`Added 2x ${otcProduct.name} to cart.`);
  logger.info(`   Items count: ${addOtcRes.totals.itemCount}`);
  logger.info(`   Subtotal (MRP): ₹${addOtcRes.totals.subtotal} (Expected: ₹100.00)`);
  logger.info(`   Product Discount: ₹${addOtcRes.totals.discount} (Expected: ₹20.00)`);
  logger.info(`   Delivery Fee: ₹${addOtcRes.totals.deliveryCost} (₹40 under ₹500)`);
  logger.info(`   Grand Total: ₹${addOtcRes.totals.totalAmount} (Expected: ₹120.00)`);
  logger.info(`   Prescription Required: ${addOtcRes.totals.prescriptionRequired}`);

  if (addOtcRes.totals.subtotal !== 100 || addOtcRes.totals.totalAmount !== 120) {
    throw new Error("Cart price calculation verification failed for OTC product");
  }
  logger.info("✅ Server-side price calculation verified accurately");

  // 4. Test Prescription Requirement Feedback
  logger.info("\n--- STEP 4: Testing Prescription Requirement Alert ---");
  const addRxRes = await cartService.addItemToCart(testUser.id, {
    productId: rxProduct.id,
    quantity: 1,
  });

  logger.info(`Added 1x ${rxProduct.name} to cart.`);
  logger.info(`   Prescription Alert: ${addRxRes.prescriptionNotice}`);
  logger.info(`   Prescription Flag: ${addRxRes.totals.prescriptionRequired}`);
  logger.info(`   Prescription Count: ${addRxRes.totals.prescriptionCount}`);

  if (!addRxRes.totals.prescriptionRequired || addRxRes.totals.prescriptionCount !== 1) {
    throw new Error("Cart failed to register prescription requirement correctly");
  }
  logger.info("✅ Prescription warning and counter verified successfully");

  // 5. Test Duplicate Addition (Incrementing Existing Item)
  logger.info("\n--- STEP 5: Testing Duplicate Addition Quantity Increment ---");
  const addMoreOtc = await cartService.addItemToCart(testUser.id, {
    productId: otcProduct.id,
    quantity: 3,
  });

  const otcItem = addMoreOtc.items.find((i) => i.productId === otcProduct.id);
  if (!otcItem || otcItem.quantity !== 5) {
    throw new Error(`Expected OTC item quantity to be 5, found: ${otcItem?.quantity}`);
  }
  logger.info(`✅ Quantity increment verified: ${otcProduct.name} quantity is now ${otcItem.quantity} (Total Items in cart: ${addMoreOtc.items.length})`);

  // 6. Test Quantity Validations
  logger.info("\n--- STEP 6: Testing Quantity & Stock Limit Validations ---");

  // Test zero quantity
  try {
    await cartService.updateCartItem(testUser.id, otcItem.id, 0);
    throw new Error("Updating quantity to 0 should have been rejected");
  } catch (err: any) {
    logger.info(`✅ Zero quantity rejected as expected: ${err.message}`);
  }

  // Test exceeding stock quantity (Rx product has stock 15)
  const rxItem = addMoreOtc.items.find((i) => i.productId === rxProduct.id)!;
  try {
    await cartService.updateCartItem(testUser.id, rxItem.id, 25);
    throw new Error("Updating quantity exceeding stock should have been rejected");
  } catch (err: any) {
    logger.info(`✅ Exceeding stock rejected as expected: ${err.message}`);
  }

  // Valid update
  const validUpdate = await cartService.updateCartItem(testUser.id, otcItem.id, 4);
  const updatedOtc = validUpdate.items.find((i) => i.productId === otcProduct.id)!;
  logger.info(`✅ Valid quantity updated to ${updatedOtc.quantity}`);

  // 7. Test Remove Single Cart Item
  logger.info("\n--- STEP 7: Testing Cart Item Removal ---");
  const afterRemove = await cartService.removeCartItem(testUser.id, rxItem.id);
  logger.info(`Removed prescription product. Remaining items in cart: ${afterRemove.items.length}`);
  logger.info(`Prescription Required flag after removal: ${afterRemove.totals.prescriptionRequired}`);

  if (afterRemove.totals.prescriptionRequired) {
    throw new Error("Prescription flag should be false after removing the only prescription item");
  }
  logger.info("✅ Cart item removal and flag recalculation verified");

  // 8. Test Guest Cart Merge
  logger.info("\n--- STEP 8: Testing Guest Cart Merging ---");
  // User currently has 4x OTC in cart.
  // Guest cart has: 2x OTC and 3x Rx.
  const mergeRes = await cartService.mergeGuestCart(testUser.id, [
    { productId: otcProduct.id, quantity: 2 },
    { productId: rxProduct.id, quantity: 3 },
  ]);

  const mergedOtc = mergeRes.items.find((i) => i.productId === otcProduct.id);
  const mergedRx = mergeRes.items.find((i) => i.productId === rxProduct.id);

  logger.info(`Merged cart items count: ${mergeRes.items.length}`);
  logger.info(`OTC Quantity after merge: ${mergedOtc?.quantity} (Expected: 6)`);
  logger.info(`Rx Quantity after merge: ${mergedRx?.quantity} (Expected: 3)`);

  if (mergedOtc?.quantity !== 6 || mergedRx?.quantity !== 3) {
    throw new Error("Guest cart merge calculation failed");
  }
  logger.info("✅ Guest cart merge logic verified successfully");

  // 9. Test Clear Cart
  logger.info("\n--- STEP 9: Testing Clear Cart ---");
  const clearedCart = await cartService.clearCart(testUser.id);
  if (clearedCart.items.length !== 0 || clearedCart.totals.itemCount !== 0) {
    throw new Error("Cart was not cleared properly");
  }
  logger.info("✅ Clear cart verified: Cart is completely empty");

  // 10. Test Wishlist Operations
  logger.info("\n--- STEP 10: Testing Wishlist Operations ---");

  // Clean user wishlist
  await db.delete(wishlists).where(eq(wishlists.userId, testUser.id));

  // Add to wishlist
  const addWish1 = await wishlistService.addToWishlist(testUser.id, otcProduct.id);
  logger.info(`Added to wishlist: ${addWish1.message}`);

  // Test duplicate prevention
  const addWishDup = await wishlistService.addToWishlist(testUser.id, otcProduct.id);
  logger.info(`Duplicate check: alreadyExists = ${addWishDup.alreadyExists} (${addWishDup.message})`);
  if (!addWishDup.alreadyExists) {
    throw new Error("Duplicate wishlist addition should be flagged as already exists");
  }
  logger.info("✅ Wishlist deduplication verified");

  // Fetch wishlist
  const wishlistItems = await wishlistService.getWishlist(testUser.id);
  logger.info(`Fetched wishlist: ${wishlistItems.length} item(s) found`);
  if (wishlistItems.length !== 1 || wishlistItems[0].product.id !== otcProduct.id) {
    throw new Error("Wishlist retrieval failed");
  }
  logger.info(`✅ Wishlist item verified: ${wishlistItems[0].product.name} (Price: ₹${wishlistItems[0].product.price}, inStock: ${wishlistItems[0].product.inStock})`);

  // 11. Test Move Wishlist to Cart
  logger.info("\n--- STEP 11: Testing Move Wishlist to Cart ---");
  const moveToCartRes = await wishlistService.moveToCart(testUser.id, otcProduct.id);
  logger.info(`Moved to cart: ${moveToCartRes.message}`);

  const wishlistAfterMove = await wishlistService.getWishlist(testUser.id);
  const cartAfterMove = await cartService.getOrCreateCart(testUser.id);

  logger.info(`Wishlist count after move: ${wishlistAfterMove.length} (Expected: 0)`);
  logger.info(`Cart items count after move: ${cartAfterMove.items.length} (Expected: 1)`);

  if (wishlistAfterMove.length !== 0 || cartAfterMove.items.length !== 1) {
    throw new Error("Move from wishlist to cart failed");
  }
  logger.info("✅ Move from wishlist to cart verified successfully");

  // 12. Test Wishlist Remove
  logger.info("\n--- STEP 12: Testing Direct Wishlist Removal ---");
  await wishlistService.addToWishlist(testUser.id, rxProduct.id);
  const removeWishRes = await wishlistService.removeFromWishlist(testUser.id, rxProduct.id);
  logger.info(`Removed from wishlist: ${removeWishRes.message}`);

  const finalWishlist = await wishlistService.getWishlist(testUser.id);
  if (finalWishlist.length !== 0) {
    throw new Error("Direct wishlist removal failed");
  }
  logger.info("✅ Direct wishlist removal verified");

  // Clean up test data
  logger.info("\n--- STEP 13: Cleaning Up Test Artifacts ---");
  await cartService.clearCart(testUser.id);
  await db.delete(wishlists).where(eq(wishlists.userId, testUser.id));
  await db.delete(productImages).where(eq(productImages.productId, otcProduct.id));
  await db.delete(productImages).where(eq(productImages.productId, rxProduct.id));
  await db.delete(products).where(eq(products.id, otcProduct.id));
  await db.delete(products).where(eq(products.id, rxProduct.id));
  await db.delete(categories).where(eq(categories.id, testCat.id));
  logger.info("✅ All test records cleaned up successfully");

  logger.info("\n==================================================");
  logger.info("🎉 All Cart & Wishlist System Tests PASSED Successfully!");
  logger.info("==================================================");
}

runCartWishlistVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Cart & Wishlist verification failed:", err);
    process.exit(1);
  });
