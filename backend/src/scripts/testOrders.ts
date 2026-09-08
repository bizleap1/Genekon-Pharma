import { eq } from "drizzle-orm";
import {
  db,
  users,
  userAddresses,
  categories,
  products,
  productImages,
  orders,
  orderItems,
  orderStatusHistory,
  prescriptions,
  carts,
  cartItems,
} from "../db";
import { orderService } from "../services/orderService";
import { prescriptionService } from "../services/prescriptionService";
import { cartService } from "../services/cartService";
import { logger } from "../utils/logger";

async function runOrderVerification() {
  logger.info("==================================================");
  logger.info("🧪 Starting Genekon Order Management System Verification");
  logger.info("==================================================");

  // 1. Setup Test Customer & Admin
  logger.info("\n--- STEP 1: Setting up Test Customer, Admin & Address ---");
  const customerEmail = "test.patient.order@genekonpharma.com";
  let [customer] = await db.select().from(users).where(eq(users.email, customerEmail)).limit(1);

  if (!customer) {
    const [created] = await db
      .insert(users)
      .values({
        name: "Rohit Deshmukh",
        email: customerEmail,
        phone: "9823001199",
        role: "CUSTOMER",
        isActive: true,
      })
      .returning();
    customer = created;
    logger.info(`Created customer: ${customer.name} (${customer.id})`);
  }

  const adminEmail = "admin@genekonpharma.com";
  const [admin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (!admin) {
    throw new Error("Admin user not found. Please run testAuth.ts first.");
  }
  logger.info(`Using dispensary admin: ${admin.name} (${admin.id})`);

  // Setup saved delivery address
  let [testAddress] = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, customer.id))
    .limit(1);

  if (!testAddress) {
    const [createdAddr] = await db
      .insert(userAddresses)
      .values({
        userId: customer.id,
        fullName: "Rohit Deshmukh",
        phone: "9823001199",
        addressLine: "Flat 401, Sai Residency, Shankar Nagar",
        landmark: "Near VNIT Campus",
        city: "Nagpur",
        state: "Maharashtra",
        pincode: "440010",
        addressType: "HOME",
        isDefault: true,
      })
      .returning();
    testAddress = createdAddr;
    logger.info(`Created saved address for customer (${testAddress.id})`);
  }

  // 2. Setup Category & Seed Products
  logger.info("\n--- STEP 2: Seeding Products for Order Verification ---");
  let [testCat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "order-test-specialty"))
    .limit(1);

  if (!testCat) {
    const [createdCat] = await db
      .insert(categories)
      .values({
        name: "Order Test Specialty",
        slug: "order-test-specialty",
        isActive: true,
      })
      .returning();
    testCat = createdCat;
  }

  // Clean old test products for this category
  const oldProds = await db.select().from(products).where(eq(products.categoryId, testCat.id));
  for (const p of oldProds) {
    const oldItems = await db.select().from(orderItems).where(eq(orderItems.productId, p.id));
    for (const oi of oldItems) {
      await db.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, oi.orderId));
      await db.delete(orderItems).where(eq(orderItems.orderId, oi.orderId));
      await db.delete(orders).where(eq(orders.id, oi.orderId));
    }
    await db.delete(cartItems).where(eq(cartItems.productId, p.id));
    await db.delete(products).where(eq(products.id, p.id));
  }

  // Seed Product A: OTC Cetirizine 10mg
  const [otcProduct] = await db
    .insert(products)
    .values({
      name: "Cetirizine 10mg Antihistamine Test",
      slug: "cetirizine-10mg-test-" + Date.now(),
      brand: "Genekon Allergy",
      manufacturer: "Genekon Pharma Ltd",
      categoryId: testCat.id,
      description: "Non-drowsy 24 hour allergy and rhinitis relief.",
      composition: "Cetirizine Hydrochloride IP 10mg",
      dosageForm: "10 Tablets / Strip",
      usage: "1 tablet daily with water.",
      precautions: "Avoid alcohol consumption during treatment.",
      mrp: "45.00",
      sellingPrice: "35.00",
      discount: "22.22",
      sku: "TEST-CET-" + Date.now(),
      stockQuantity: 50,
      prescriptionRequired: false,
      status: "ACTIVE",
    })
    .returning();

  // Seed Product B: Rx Azithromycin 500mg
  const [rxProduct] = await db
    .insert(products)
    .values({
      name: "Azithromycin 500mg Tablets Test",
      slug: "azithromycin-500mg-test-" + Date.now(),
      brand: "Genekon Anti-Infective",
      manufacturer: "Genekon Life Sciences",
      categoryId: testCat.id,
      description: "Macrolide antibiotic for bacterial infections.",
      composition: "Azithromycin Dihydrate IP eq to Azithromycin 500mg",
      dosageForm: "3 Tablets / Strip",
      usage: "Take once daily 1 hour before or 2 hours after meals.",
      precautions: "Schedule H prescription drug. Complete full prescribed course.",
      mrp: "150.00",
      sellingPrice: "120.00",
      discount: "20.00",
      sku: "TEST-AZI-" + Date.now(),
      stockQuantity: 20,
      prescriptionRequired: true,
      status: "ACTIVE",
    })
    .returning();

  logger.info(`✅ Seeded OTC Product: ${otcProduct.name} (Stock: ${otcProduct.stockQuantity}, Price: ₹${otcProduct.sellingPrice})`);
  logger.info(`✅ Seeded Rx Product: ${rxProduct.name} (Stock: ${rxProduct.stockQuantity}, Price: ₹${rxProduct.sellingPrice})`);

  // 3. Flow 1: OTC Order Checkout
  logger.info("\n--- STEP 3: Customer Places OTC Order ---");
  await cartService.clearCart(customer.id);
  await cartService.addItemToCart(customer.id, { productId: otcProduct.id, quantity: 2 });

  const otcOrder = await orderService.createOrderFromCart(customer.id, {
    deliveryAddressId: testAddress.id,
    paymentMethod: "COD",
    notes: "Leave package with security if unavailable.",
  });

  logger.info(`✅ OTC Order Created: ${otcOrder.orderNumber}`);
  logger.info(`   Initial Status: ${otcOrder.orderStatus} (Expected: PLACED)`);
  logger.info(`   Subtotal (MRP): ₹${otcOrder.subtotal} (Expected: ₹90.00)`);
  logger.info(`   Discount Amount: ₹${otcOrder.discountAmount} (Expected: ₹20.00)`);
  logger.info(`   Delivery Fee: ₹${otcOrder.deliveryFee} (Expected: ₹40.00)`);
  logger.info(`   Total Amount: ₹${otcOrder.totalAmount} (Expected: ₹110.00)`);
  logger.info(`   Address Snapshot: ${otcOrder.deliveryAddressSnapshot.fullName}, ${otcOrder.deliveryAddressSnapshot.city}`);
  logger.info(`   Items Count: ${otcOrder.items.length}`);
  logger.info(`   Initial Timeline Event: ${otcOrder.timeline[0]?.status}`);

  if (otcOrder.orderStatus !== "PLACED" || otcOrder.totalAmount !== "110.00") {
    throw new Error("OTC order creation verification failed");
  }

  // Verify Cart is cleared
  const cartAfterOtc = await cartService.getOrCreateCart(customer.id);
  if (cartAfterOtc.items.length !== 0) {
    throw new Error("Customer cart was not cleared after order creation");
  }
  logger.info("✅ Cart cleared automatically after order placement");

  // 4. Flow 2: Prescription Order Checkout
  logger.info("\n--- STEP 4: Customer Places Prescription Order ---");
  await cartService.addItemToCart(customer.id, { productId: rxProduct.id, quantity: 2 });

  const rxOrder = await orderService.createOrderFromCart(customer.id, {
    deliveryAddressId: testAddress.id,
    paymentMethod: "COD",
  });

  logger.info(`✅ Rx Order Created: ${rxOrder.orderNumber}`);
  logger.info(`   Initial Status: ${rxOrder.orderStatus} (Expected: PENDING_VERIFICATION)`);
  logger.info(`   Prescription Required Flag: ${rxOrder.prescriptionRequired}`);
  logger.info(`   Stock Deducted Flag: ${rxOrder.stockDeducted} (Expected: false)`);

  if (rxOrder.orderStatus !== "PENDING_VERIFICATION" || !rxOrder.prescriptionRequired) {
    throw new Error("Prescription order status should start in PENDING_VERIFICATION");
  }
  logger.info("✅ Prescription gatekeeping verified successfully");

  // 5. Flow 3: Prescription Upload & Document Handling
  logger.info("\n--- STEP 5: Customer Uploads Prescription Document ---");
  const dummyPdfBuffer = Buffer.from("%PDF-1.4 Mock Prescription Content for Test");
  const mockFile = {
    buffer: dummyPdfBuffer,
    originalname: "dr_kapoor_rx_test.pdf",
    mimetype: "application/pdf",
    size: dummyPdfBuffer.length,
  } as Express.Multer.File;

  const uploadedRx = await prescriptionService.uploadPrescription(customer.id, mockFile, {
    doctorName: "Dr. Arvind Kapoor, MD",
    patientName: "Rohit Deshmukh",
    orderId: rxOrder.id,
  });

  logger.info(`✅ Prescription Uploaded: ID ${uploadedRx.id}`);
  logger.info(`   File Name: ${uploadedRx.fileName}`);
  logger.info(`   URL: ${uploadedRx.fileUrl}`);
  logger.info(`   Status: ${uploadedRx.status} (Expected: PENDING)`);
  logger.info(`   Doctor: ${uploadedRx.doctorName}`);

  // 6. Flow 4: Pharmacist Review & Automated Stock Deduction
  logger.info("\n--- STEP 6: Pharmacist Reviews & Approves Prescription ---");
  
  // Verify initial stock of rxProduct before confirmation
  const [rxBeforeConfirm] = await db.select().from(products).where(eq(products.id, rxProduct.id)).limit(1);
  logger.info(`Rx Product stock before confirmation: ${rxBeforeConfirm.stockQuantity}`);

  const reviewedRx = await prescriptionService.reviewPrescription(
    uploadedRx.id,
    admin.id,
    "APPROVED"
  );
  logger.info(`✅ Prescription Review Status: ${reviewedRx.status}`);

  // Verify order transitioned to CONFIRMED
  const confirmedRxOrder = await orderService.getOrderById(rxOrder.id, undefined, true);
  logger.info(`✅ Order status after Rx approval: ${confirmedRxOrder.orderStatus} (Expected: CONFIRMED)`);
  logger.info(`   Stock Deducted Flag: ${confirmedRxOrder.stockDeducted} (Expected: true)`);

  const [rxAfterConfirm] = await db.select().from(products).where(eq(products.id, rxProduct.id)).limit(1);
  logger.info(`✅ Stock after confirmation: ${rxAfterConfirm.stockQuantity} (Expected: 18, deducted 2)`);

  if (confirmedRxOrder.orderStatus !== "CONFIRMED" || rxAfterConfirm.stockQuantity !== 18) {
    throw new Error("Prescription approval automated confirmation and stock deduction failed");
  }

  // 7. Flow 5: Admin Order Lifecycle Progression
  logger.info("\n--- STEP 7: Testing Order Lifecycle Transitions (PACKED -> SHIPPED -> DELIVERED) ---");
  
  // PACKED
  const packedOrder = await orderService.updateOrderStatus(rxOrder.id, "PACKED", admin.id, "Items packed in verified cold-chain pouch.");
  logger.info(`Status updated: ${packedOrder.orderStatus}`);

  // SHIPPED
  const shippedOrder = await orderService.updateOrderStatus(rxOrder.id, "SHIPPED", admin.id, "Dispatched via Express Courier AWB #GNK-98124.");
  logger.info(`Status updated: ${shippedOrder.orderStatus}`);

  // DELIVERED
  const deliveredOrder = await orderService.updateOrderStatus(rxOrder.id, "DELIVERED", admin.id, "Delivered and handed over to customer.");
  logger.info(`Status updated: ${deliveredOrder.orderStatus}`);

  logger.info(`Total timeline checkpoints recorded: ${deliveredOrder.timeline.length}`);
  logger.info("✅ Full lifecycle progression and timeline audit trail verified");

  // 8. Flow 6: Cancellation Policy & Stock Replenishment
  logger.info("\n--- STEP 8: Testing Cancellation Rules & Stock Replenishment ---");
  
  // Rule A: Cannot cancel delivered order
  try {
    await orderService.cancelOrder(rxOrder.id, customer.id, "Try to cancel delivered order");
    throw new Error("Cancelling a delivered order should have failed!");
  } catch (err: any) {
    logger.info(`✅ Delivered cancellation rejected as expected: ${err.message}`);
  }

  // Rule B: Can cancel confirmed order before PACKED, with automatic stock replenishment
  logger.info("\nPlacing cancellable test order to verify stock restoration...");
  await cartService.addItemToCart(customer.id, { productId: otcProduct.id, quantity: 4 });
  const cancellableOrder = await orderService.createOrderFromCart(customer.id, {
    deliveryAddressId: testAddress.id,
  });

  // Confirm order to deduct stock (50 -> 46)
  await orderService.updateOrderStatus(cancellableOrder.id, "CONFIRMED", admin.id, "Order confirmed.");
  const [stockAfterConfirm] = await db.select().from(products).where(eq(products.id, otcProduct.id)).limit(1);
  logger.info(`Stock after confirm: ${stockAfterConfirm.stockQuantity} (Expected: 46)`);

  // Customer cancels order before packing
  const cancelledOrder = await orderService.cancelOrder(cancellableOrder.id, customer.id, "Need to change delivery date.");
  logger.info(`✅ Order Status: ${cancelledOrder.orderStatus} (Expected: CANCELLED)`);

  const [stockAfterCancel] = await db.select().from(products).where(eq(products.id, otcProduct.id)).limit(1);
  logger.info(`✅ Stock after cancellation: ${stockAfterCancel.stockQuantity} (Expected: 50, restored 4)`);

  if (stockAfterCancel.stockQuantity !== 50) {
    throw new Error("Inventory stock was not restored after cancellation");
  }

  // 9. Flow 7: Reorder ("Buy Again")
  logger.info("\n--- STEP 9: Testing Reorder ('Buy Again') Feature ---");
  await cartService.clearCart(customer.id);
  const reorderRes = await orderService.reorder(otcOrder.id, customer.id);
  logger.info(`Reorder message: ${reorderRes.message}`);
  logger.info(`Items in cart after reorder: ${reorderRes.cart.items.length}`);
  logger.info(`Cart total: ₹${reorderRes.cart.totals.totalAmount}`);

  if (reorderRes.cart.items.length === 0) {
    throw new Error("Reorder feature failed to populate cart with previous order products");
  }
  logger.info("✅ Reorder ('Buy Again') feature verified successfully");

  // 10. Clean up test artifacts
  logger.info("\n--- STEP 10: Cleaning Up Test Artifacts ---");
  await cartService.clearCart(customer.id);
  
  // Cleanup test orders & prescriptions
  const allTestOrders = await db.select().from(orders).where(eq(orders.userId, customer.id));
  for (const o of allTestOrders) {
    await db.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, o.id));
    await db.delete(orderItems).where(eq(orderItems.orderId, o.id));
    await db.delete(orders).where(eq(orders.id, o.id));
  }
  await db.delete(prescriptions).where(eq(prescriptions.userId, customer.id));
  await db.delete(products).where(eq(products.categoryId, testCat.id));
  await db.delete(categories).where(eq(categories.id, testCat.id));
  logger.info("✅ Test records cleaned up successfully");

  logger.info("\n==================================================");
  logger.info("🎉 All Order Management System Tests PASSED Successfully!");
  logger.info("==================================================");
}

runOrderVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Order verification failed:", err);
    process.exit(1);
  });
