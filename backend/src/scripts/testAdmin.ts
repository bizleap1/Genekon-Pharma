import { eq, desc } from "drizzle-orm";
import {
  db,
  users,
  userAddresses,
  categories,
  products,
  orders,
  orderItems,
  prescriptions,
  wholesaleProfiles,
  inventoryBatches,
  inventoryLogs,
  coupons,
  cmsBanners,
  adminActivityLogs,
} from "../db";
import { authService } from "../services/authService";
import { tokenService } from "../services/tokenService";
import { adminDashboardService } from "../services/adminDashboardService";
import { inventoryService } from "../services/inventoryService";
import { adminCustomerService } from "../services/adminCustomerService";
import { wholesaleService } from "../services/wholesaleService";
import { couponService } from "../services/couponService";
import { cmsService } from "../services/cmsService";
import { reportingService } from "../services/reportingService";
import { orderService } from "../services/orderService";
import { cartService } from "../services/cartService";
import { prescriptionService } from "../services/prescriptionService";
import { activityLogService } from "../services/activityLogService";
import { logger } from "../utils/logger";

async function runAdminVerification() {
  logger.info("==================================================");
  logger.info("🛡️ Starting Genekon Admin Management System Verification");
  logger.info("==================================================");

  // 1. Admin Authentication & RBAC Guard
  logger.info("\n--- STEP 1: Admin Authentication & RBAC Security Barrier ---");
  const adminEmail = "admin@genekonpharma.com";
  let [admin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (!admin) {
    const [created] = await db
      .insert(users)
      .values({
        name: "Dr. Shreya Meshram (Super Admin)",
        email: adminEmail,
        phone: "9000000001",
        passwordHash: "$2a$10$wEkgvW4W3B298eXm5x7z7.eQp2p1yC1eA9xT9n5jJ4oM7K6z8/mGi",
        role: "ADMIN",
        isActive: true,
      })
      .returning();
    admin = created;
  }
  logger.info(`Admin Account Verified: ${admin.name} (${admin.email}, Role: ${admin.role})`);

  const { accessToken: adminToken } = await tokenService.generateAuthTokens(admin);
  const decodedAdmin = tokenService.verifyAccessToken(adminToken);
  if (decodedAdmin.role !== "ADMIN") {
    throw new Error("Admin token role mismatch!");
  }
  logger.info("✅ Admin access token generated and cryptographic signature verified");

  // Verify Customer RBAC blockage
  const customerEmail = "customer.barrier.test@genekonpharma.com";
  let [customer] = await db.select().from(users).where(eq(users.email, customerEmail)).limit(1);
  if (!customer) {
    const [createdCust] = await db
      .insert(users)
      .values({
        name: "Suresh Patil",
        email: customerEmail,
        phone: "9123456789",
        role: "CUSTOMER",
        isActive: true,
      })
      .returning();
    customer = createdCust;
  }
  const { accessToken: customerToken } = await tokenService.generateAuthTokens(customer);
  const decodedCustomer = tokenService.verifyAccessToken(customerToken);
  if (decodedCustomer.role === "ADMIN") {
    throw new Error("Security Alert: Customer token granted ADMIN privileges!");
  }
  logger.info(`✅ RBAC Barrier verified: Customer token correctly tagged with role '${decodedCustomer.role}'`);

  // 2. Dashboard Statistics
  logger.info("\n--- STEP 2: Executive Dashboard Metrics API ---");
  const dashboard = await adminDashboardService.getDashboardStats();
  logger.info("Dashboard Statistics:", dashboard.summary);
  if (typeof dashboard.summary.totalCustomers !== "number" || typeof dashboard.summary.totalRevenue !== "number") {
    throw new Error("Invalid dashboard statistics structure!");
  }
  logger.info(`✅ Executive Dashboard aggregated successfully (Revenue: ₹${dashboard.summary.totalRevenue.toFixed(2)}, Active Products: ${dashboard.summary.totalProducts})`);

  // 3. Product Management (Create, Update, Status)
  logger.info("\n--- STEP 3: Product Management Workflow ---");
  let [testCategory] = await db.select().from(categories).limit(1);
  if (!testCategory) {
    const [createdCat] = await db
      .insert(categories)
      .values({
        name: "Antibiotics & Anti-Infectives",
        slug: "antibiotics-anti-infectives-admin",
      })
      .returning();
    testCategory = createdCat;
  }

  const testSku = `ADM-PRD-${Date.now().toString().slice(-4)}`;
  const [testProduct] = await db
    .insert(products)
    .values({
      name: "Ciprofloxacin 500mg Tablets USP",
      slug: `ciprofloxacin-500mg-${Date.now()}`,
      sku: testSku,
      brand: "Cipla Health",
      manufacturer: "Cipla Ltd",
      categoryId: testCategory.id,
      description: "Broad-spectrum antibacterial medication for acute infections.",
      composition: "Ciprofloxacin Hydrochloride IP eq. to Ciprofloxacin 500mg",
      usage: "As directed by the registered medical practitioner.",
      precautions: "Do not take with dairy products or antacids simultaneously.",
      mrp: "120.00",
      sellingPrice: "98.00",
      discount: "18.33",
      gst: "12.00",
      stockQuantity: 40,
      dosageForm: "10 Tablets",
      prescriptionRequired: true,
      status: "ACTIVE",
    })
    .returning();

  logger.info(`✅ Created Product: ${testProduct.name} (SKU: ${testProduct.sku}, Stock: ${testProduct.stockQuantity})`);

  // Update product price
  const [updatedProduct] = await db
    .update(products)
    .set({
      sellingPrice: "92.00",
      updatedAt: new Date(),
    })
    .where(eq(products.id, testProduct.id))
    .returning();
  logger.info(`✅ Updated Product Price: ₹${updatedProduct.sellingPrice}`);

  // 4. Pharmaceutical Inventory & Batch Management (FEFO & Expiry)
  logger.info("\n--- STEP 4: Inventory Batch & FEFO Expiry Management ---");
  
  // Create near-expiry batch (15 days out)
  const nearExpiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  const batch1 = await inventoryService.createBatch(admin.id, {
    productId: testProduct.id,
    batchNumber: `BATCH-EXP-15D-${Date.now().toString().slice(-4)}`,
    manufacturingDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: nearExpiryDate,
    quantity: 25,
    mrp: 120,
    costPrice: 70,
  });
  logger.info(`✅ Batch 1 Registered: ${batch1.batchNumber} (Qty: ${batch1.quantity}, Expiry in 15d)`);

  // Create normal batch (180 days out)
  const normalExpiryDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
  const batch2 = await inventoryService.createBatch(admin.id, {
    productId: testProduct.id,
    batchNumber: `BATCH-NORM-${Date.now().toString().slice(-4)}`,
    manufacturingDate: new Date().toISOString(),
    expiryDate: normalExpiryDate,
    quantity: 100,
    mrp: 120,
    costPrice: 65,
  });
  logger.info(`✅ Batch 2 Registered: ${batch2.batchNumber} (Qty: ${batch2.quantity}, Expiry in 180d)`);

  // Check product stock after batch creation
  const [productAfterBatches] = await db.select().from(products).where(eq(products.id, testProduct.id)).limit(1);
  logger.info(`✅ Product Total Stock after Batches: ${productAfterBatches.stockQuantity} units`);

  // Run Expiry Check (30 days window)
  const expiringWithin30 = await inventoryService.getExpiringProducts(30);
  logger.info(`Expiring products within 30 days: found ${expiringWithin30.count} batch(es)`);
  const foundNearExpiry = expiringWithin30.expiringBatches.find((b) => b.batchNumber === batch1.batchNumber);
  if (!foundNearExpiry) {
    throw new Error("Expiring batch was not detected in 30-day window!");
  }
  logger.info(`✅ FEFO Regulatory Check: Batch ${batch1.batchNumber} flagged with risk '${foundNearExpiry.clinicalRiskLevel}' (${foundNearExpiry.daysRemaining} days remaining)`);

  // Stock Adjustment & Audit Log
  logger.info("\n--- STEP 5: Physical Stock Adjustment & Audit Trail ---");
  const adjustResult = await inventoryService.adjustStock(admin.id, {
    productId: testProduct.id,
    batchId: batch1.id,
    changeType: "DAMAGE_EXPIRY",
    quantityChanged: -5,
    reason: "Damaged packaging during transit audit",
  });
  logger.info(`Stock Adjusted: ${adjustResult.product.previousStock} -> ${adjustResult.product.currentStock}`);
  logger.info(`Inventory Log ID: ${adjustResult.log.id} (${adjustResult.log.changeType}: ${adjustResult.log.quantityChanged})`);

  // Query inventory audit logs
  const logsResult = await inventoryService.getInventoryLogs({ productId: testProduct.id });
  logger.info(`✅ Inventory Audit Trail: ${logsResult.logs.length} movement log(s) verified`);

  // Low stock query
  const lowStockAlerts = await inventoryService.getLowStockAlerts(200);
  logger.info(`✅ Low Stock Alerts query verified: ${lowStockAlerts.count} product(s) flagged below threshold 200`);

  // 6. Order Management & Progression
  logger.info("\n--- STEP 6: Dispensary Order Management Lifecycle ---");
  // Setup delivery address
  let [address] = await db.select().from(userAddresses).where(eq(userAddresses.userId, customer.id)).limit(1);
  if (!address) {
    const [createdAddr] = await db
      .insert(userAddresses)
      .values({
        userId: customer.id,
        fullName: customer.name,
        phone: customer.phone || "9123456789",
        addressLine: "Plot 12, Medical Square",
        city: "Nagpur",
        state: "Maharashtra",
        pincode: "440009",
        addressType: "HOME",
      })
      .returning();
    address = createdAddr;
  }

  await cartService.clearCart(customer.id);
  await cartService.addItemToCart(customer.id, { productId: testProduct.id, quantity: 2 });
  const adminTestOrder = await orderService.createOrderFromCart(customer.id, {
    deliveryAddressId: address.id,
    paymentMethod: "COD",
    notes: "Dispensary review test order",
  });
  logger.info(`Order Placed: ${adminTestOrder.orderNumber} (Status: ${adminTestOrder.orderStatus})`);

  // Admin advances order: CONFIRMED -> PACKED -> SHIPPED -> DELIVERED
  const confirmed = await orderService.updateOrderStatus(adminTestOrder.id, "CONFIRMED", admin.id, "Pharmacist confirmed clinical dosage");
  logger.info(`Status -> ${confirmed.orderStatus}`);

  const packed = await orderService.updateOrderStatus(adminTestOrder.id, "PACKED", admin.id, "Insulated cold packaging complete");
  logger.info(`Status -> ${packed.orderStatus}`);

  const shipped = await orderService.updateOrderStatus(adminTestOrder.id, "SHIPPED", admin.id, "Handed over to Express Courier");
  logger.info(`Status -> ${shipped.orderStatus}`);

  const delivered = await orderService.updateOrderStatus(adminTestOrder.id, "DELIVERED", admin.id, "Delivered to patient doorstep");
  logger.info(`✅ Status -> ${delivered.orderStatus}`);

  // 7. Prescription Review
  logger.info("\n--- STEP 7: Pharmacist Prescription Approval Workflow ---");
  const [prescription] = await db
    .insert(prescriptions)
    .values({
      userId: customer.id,
      orderId: adminTestOrder.id,
      fileUrl: "https://res.cloudinary.com/hsufdlap/raw/upload/v1/prescriptions/admin_test_rx.pdf",
      publicId: "prescriptions/admin_test_rx",
      fileName: "dr_sharma_rx.pdf",
      fileSize: 450000,
      mimeType: "application/pdf",
      doctorName: "Dr. K. Sharma, MD",
      patientName: "Suresh Patil",
      status: "PENDING",
    })
    .returning();
  logger.info(`Uploaded Prescription: ${prescription.id} (Status: ${prescription.status})`);

  const rxReview = await prescriptionService.reviewPrescription(
    prescription.id,
    admin.id,
    "APPROVED",
    "Prescription validated against medical council registry"
  );
  logger.info(`✅ Prescription Review Status: ${rxReview.status} (Reviewed by: ${rxReview.reviewedBy})`);

  // 8. Customer Management & Account Blocking
  logger.info("\n--- STEP 8: Customer Management & Account Lockout ---");
  const customerList = await adminCustomerService.listCustomers({ page: 1, limit: 10 });
  logger.info(`Customers List: ${customerList.customers.length} customer(s) found`);

  const customerDetails = await adminCustomerService.getCustomerDetails(customer.id);
  logger.info(`Customer Profile: ${customerDetails.customer.name}, Total Orders: ${customerDetails.stats.totalOrders}`);

  // Block customer
  const blockResult = await adminCustomerService.toggleUserBlock(admin.id, customer.id, true, "Compliance audit review");
  logger.info(`✅ Block Action: ${blockResult.message} (isActive: ${blockResult.user.isActive})`);

  // Verify blocked customer cannot access authenticated features
  let blockedBlocked = false;
  try {
    const [reloadedUser] = await db.select().from(users).where(eq(users.id, customer.id)).limit(1);
    if (!reloadedUser || !reloadedUser.isActive) {
      blockedBlocked = true;
    }
  } catch (err) {
    blockedBlocked = true;
  }
  if (!blockedBlocked) {
    throw new Error("Customer was not marked as deactivated!");
  }
  logger.info("✅ Account lockout confirmed: Customer isActive is false");

  // Unblock customer
  const unblockResult = await adminCustomerService.toggleUserBlock(admin.id, customer.id, false, "Reinstated after review");
  logger.info(`✅ Unblock Action: ${unblockResult.message} (isActive: ${unblockResult.user.isActive})`);

  // 9. Wholesale Partner Application Review & Approval
  logger.info("\n--- STEP 9: Wholesale Partner Onboarding & Approval ---");
  const timestamp = Date.now().toString().slice(-4);
  const wholesaleApplicantEmail = `partner.pharmacy.${timestamp}@genekonpharma.com`;
  const [wholesaleUser] = await db
    .insert(users)
    .values({
      name: `Rajesh Gupta ${timestamp}`,
      email: wholesaleApplicantEmail,
      phone: `98200${timestamp}`,
      role: "CUSTOMER",
      isActive: true,
    })
    .returning();

  const wholesaleApplication = await wholesaleService.registerPartner(wholesaleUser.id, {
    businessName: "Gupta LifeCare Pharmacy Pvt Ltd",
    ownerName: "Rajesh Gupta",
    businessType: "RETAIL_PHARMACY",
    gstNumber: "27AABCG1234F1Z5",
    drugLicenseNumber: "MH-WZ-20B-189920",
    phone: "9820011223",
    email: wholesaleApplicantEmail,
    address: "Shop 4, Market Yard, Pune",
  });
  logger.info(`Application Submitted: ${wholesaleApplication.businessName} (Status: ${wholesaleApplication.status})`);

  // Admin approves wholesale application
  const approvalResult = await wholesaleService.reviewApplication(admin.id, wholesaleApplication.id, {
    decision: "APPROVED",
    creditLimit: 150000,
  });
  logger.info(`✅ Wholesale Review: ${approvalResult.message}`);
  logger.info(`- Partner Status: ${approvalResult.profile.status}`);
  logger.info(`- Credit Limit: ₹${approvalResult.profile.creditLimit}`);

  const [elevatedUser] = await db.select().from(users).where(eq(users.id, wholesaleUser.id)).limit(1);
  if (elevatedUser.role !== "WHOLESALE_PARTNER") {
    throw new Error(`Role elevation failed! Expected WHOLESALE_PARTNER, got ${elevatedUser.role}`);
  }
  logger.info(`✅ Role Elevation verified: User role automatically updated to '${elevatedUser.role}'`);

  // 10. Coupon Management & CMS Banners
  logger.info("\n--- STEP 10: Coupon Engine & CMS Marketing Banners ---");
  const couponCode = `SAVE20_${Date.now().toString().slice(-4)}`;
  const coupon = await couponService.createCoupon(admin.id, {
    code: couponCode,
    description: "Flat 20% discount on all wellness orders",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 500,
    maxDiscount: 200,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  logger.info(`✅ Created Coupon: ${coupon.code} (${coupon.discountValue}% off, Min: ₹${coupon.minOrderValue})`);

  // Test Coupon Calculation
  const couponValidation = await couponService.validateCoupon(couponCode, 800);
  logger.info(`Coupon Validation on ₹800 Cart: Discount = ₹${couponValidation.discountAmount}`);
  if (couponValidation.discountAmount !== 160) {
    throw new Error(`Coupon calculation error! Expected 160, got ${couponValidation.discountAmount}`);
  }

  // Create CMS Banner
  const banner = await cmsService.createBanner(admin.id, {
    title: "Monsoon Healthcare Essentials - Up to 40% Off",
    subtitle: "Authentic medicines and doctor-approved health supplements",
    imageUrl: "https://res.cloudinary.com/hsufdlap/image/upload/v1/banners/monsoon_promo.webp",
    targetUrl: "/categories/immunity-boosters",
    section: "HOMEPAGE_HERO",
    displayOrder: 1,
  });
  logger.info(`✅ CMS Banner Created: '${banner.title}' (Section: ${banner.section}, Order: ${banner.displayOrder})`);

  // 11. Business Intelligence Reports
  logger.info("\n--- STEP 11: Business Intelligence Reports ---");
  const salesReport = await reportingService.getSalesReport("daily");
  logger.info(`- Sales Report: ${salesReport.trend.length} time interval(s) computed`);

  const productReport = await reportingService.getProductReport();
  logger.info(`- Product Report: ${productReport.bestSellers.length} best seller(s), ${productReport.lowPerforming.length} low performing product(s)`);

  const customerReport = await reportingService.getCustomerReport();
  logger.info(`- Customer Retention: ${customerReport.retention.totalPurchasingCustomers} total buyers (${customerReport.retention.repeatRatePercent}% repeat rate)`);

  const wholesaleReport = await reportingService.getWholesaleReport();
  logger.info(`- Wholesale Analytics: ${wholesaleReport.partners.active} active partner(s), Total Credit: ₹${wholesaleReport.partners.totalCreditAllocated}`);
  logger.info("✅ All 4 Business Intelligence reports generated successfully!");

  // 12. Admin Activity Audit Logs
  logger.info("\n--- STEP 12: Admin Activity Audit Logs ---");
  const auditLogs = await activityLogService.getLogs({ limit: 10 });
  logger.info(`Total Recent Activity Logs in DB: ${auditLogs.logs.length}`);
  if (auditLogs.logs.length === 0) {
    throw new Error("No admin activity logs found!");
  }
  logger.info(`✅ Latest Audit Log: [${auditLogs.logs[0].action}] on ${auditLogs.logs[0].module} by ${auditLogs.logs[0].admin?.name || "Admin"}`);

  logger.info("\n==================================================");
  logger.info("🎉 ALL ADMIN MANAGEMENT MODULE TESTS PASSED SUCCESSFULLY!");
  logger.info("==================================================");
}

runAdminVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("❌ Admin Verification failed:", err);
    process.exit(1);
  });
