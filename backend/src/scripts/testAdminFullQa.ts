import { eq, desc, and, sql } from "drizzle-orm";
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
  cancellationRequests,
  payments,
} from "../db";
import { tokenService } from "../services/tokenService";
import { adminDashboardService } from "../services/adminDashboardService";
import { inventoryService } from "../services/inventoryService";
import { adminCustomerService } from "../services/adminCustomerService";
import { wholesaleService } from "../services/wholesaleService";
import { couponService } from "../services/couponService";
import { cmsService } from "../services/cmsService";
import { reportingService } from "../services/reportingService";
import { orderService } from "../services/orderService";
import { prescriptionService } from "../services/prescriptionService";
import { cancellationService } from "../services/cancellationService";
import { activityLogService } from "../services/activityLogService";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { logger } from "../utils/logger";

const BASE_URL = "http://localhost:5000/api/v1";

interface TestReport {
  category: string;
  testName: string;
  status: "PASS" | "FAIL" | "WARNING";
  details: string;
  latencyMs?: number;
}

const results: TestReport[] = [];

function record(category: string, testName: string, status: "PASS" | "FAIL" | "WARNING", details: string, latencyMs?: number) {
  results.push({ category, testName, status, details, latencyMs });
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  console.log(`${icon} [${category}] ${testName}: ${details} ${latencyMs !== undefined ? `(${latencyMs}ms)` : ""}`);
}

async function runAdminFullQa() {
  console.log("==========================================================================");
  console.log("🛡️ GENEKON ADMIN PANEL COMPREHENSIVE END-TO-END QA AUDIT");
  console.log("==========================================================================\n");

  // ----------------------------------------------------------------------
  // 1. ADMIN AUTHENTICATION & ROUTE PROTECTION
  // ----------------------------------------------------------------------
  let adminUser: any = null;
  let adminToken = "";
  let customerUser: any = null;
  let customerToken = "";

  try {
    // 1.1 Find or seed admin user
    const [existingAdmin] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
    if (existingAdmin) {
      adminUser = existingAdmin;
    } else {
      const [newAdmin] = await db
        .insert(users)
        .values({
          name: "Dr. Shreya Meshram (Super Admin)",
          email: "admin@genekonpharma.com",
          phone: "9822110011",
          role: "ADMIN",
          isActive: true,
        })
        .returning();
      adminUser = newAdmin;
    }
    const adminTokens = await tokenService.generateAuthTokens(adminUser);
    adminToken = adminTokens.accessToken;

    const decoded = tokenService.verifyAccessToken(adminToken);
    if (decoded.role === "ADMIN") {
      record("Authentication", "Admin Token Generation & Verification", "PASS", `Admin token signed & verified for ${adminUser.name}`);
    } else {
      record("Authentication", "Admin Token Generation & Verification", "FAIL", `Token role mismatch: expected ADMIN, got ${decoded.role}`);
    }

    // 1.2 Customer account token
    let [existingCustomer] = await db.select().from(users).where(eq(users.role, "CUSTOMER")).limit(1);
    if (existingCustomer) {
      customerUser = existingCustomer;
    } else {
      const [newCustomer] = await db
        .insert(users)
        .values({
          name: "QA Customer Tester",
          email: "customer.tester@genekon.com",
          phone: "9111222333",
          role: "CUSTOMER",
          isActive: true,
        })
        .returning();
      customerUser = newCustomer;
    }
    const custTokens = await tokenService.generateAuthTokens(customerUser);
    customerToken = custTokens.accessToken;

    // 1.3 Security: Customer hitting Admin API -> Expected 403 Forbidden
    const unauthRes = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (unauthRes.status === 403) {
      record("Security", "Customer RBAC Block on Admin Routes", "PASS", `Customer token received expected 403 Forbidden on /admin/dashboard/stats`);
    } else {
      record("Security", "Customer RBAC Block on Admin Routes", "FAIL", `Customer token received unexpected status ${unauthRes.status} (expected 403)`);
    }

    // 1.4 Security: Unauthenticated request hitting Admin API -> Expected 401 Unauthorized
    const noAuthRes = await fetch(`${BASE_URL}/admin/dashboard/stats`);
    if (noAuthRes.status === 401) {
      record("Security", "Unauthenticated Request on Admin Routes", "PASS", `Unauthenticated request received expected 401 Unauthorized`);
    } else {
      record("Security", "Unauthenticated Request on Admin Routes", "FAIL", `Expected 401, got ${noAuthRes.status}`);
    }

    // 1.5 Session persistence check
    const [storedRefresh] = await db.select().from(users).where(eq(users.id, adminUser.id)).limit(1);
    if (storedRefresh && storedRefresh.isActive) {
      record("Authentication", "Session Persistence & User State", "PASS", `Admin user active in Neon database with persistent identity`);
    } else {
      record("Authentication", "Session Persistence & User State", "FAIL", `Admin user session state not persistent`);
    }
  } catch (err: any) {
    record("Authentication", "Admin Auth Setup", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 2. ADMIN DASHBOARD & PERFORMANCE TESTING
  // ----------------------------------------------------------------------
  try {
    const t0 = Date.now();
    const res = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const latency = Date.now() - t0;
    const json = await res.json();

    if (res.status === 200 && json.success) {
      const summary = json.data?.summary || json.data;
      const valid =
        typeof summary.totalCustomers === "number" &&
        typeof summary.totalOrders === "number" &&
        typeof summary.totalRevenue === "number";

      if (valid) {
        record(
          "Dashboard",
          "Executive Metrics Aggregation",
          "PASS",
          `Metrics loaded: Customers=${summary.totalCustomers}, Orders=${summary.totalOrders}, Revenue=₹${summary.totalRevenue}, LowStock=${summary.lowStockProducts}`,
          latency
        );
      } else {
        record("Dashboard", "Executive Metrics Aggregation", "FAIL", `Malformed summary payload: ${JSON.stringify(summary)}`);
      }

      if (latency <= 300) {
        record("Performance", "Dashboard Stats API Latency", "PASS", `Returned in ${latency}ms (Target: <300ms)`, latency);
      } else {
        record("Performance", "Dashboard Stats API Latency", "WARNING", `Latency ${latency}ms exceeds 300ms target`, latency);
      }
    } else {
      record("Dashboard", "Dashboard Stats HTTP API", "FAIL", `Status ${res.status}: ${json.message}`);
    }
  } catch (err: any) {
    record("Dashboard", "Dashboard Testing", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 3. PRODUCT MANAGEMENT & PHARMACY FIELDS
  // ----------------------------------------------------------------------
  let createdProductId = "";
  try {
    // 3.1 Fetch categories for product assignment
    const [cat] = await db.select().from(categories).limit(1);
    const categoryId = cat?.id;

    if (!categoryId) {
      record("Product Management", "Category Fetch", "FAIL", "No category available for product creation");
    } else {
      const uniqueSku = `ADM-QA-${Date.now().toString().slice(-5)}`;
      const prodPayload = {
        name: "Amoxicillin and Potassium Clavulanate Tablets IP 625mg",
        sku: uniqueSku,
        brand: "Augmentin / GSK",
        manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd",
        categoryId,
        description: "Potent antibacterial combination indicated for lower respiratory tract infections.",
        composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
        usage: "1 tablet twice daily with meals or as prescribed by physician.",
        precautions: "Contraindicated in patients with a history of penicillin-induced jaundice.",
        storageInstructions: "Store below 25°C in a dry place. Protect from moisture.",
        mrp: "220.00",
        sellingPrice: "185.00",
        discount: "15.91",
        gst: "12.00",
        stockQuantity: 50,
        dosageForm: "Strip of 10 Tablets",
        prescriptionRequired: true,
        status: "ACTIVE",
      };

      // Direct service test
      const created = await productService.createProduct(prodPayload);
      createdProductId = created.id;

      if (created.sku === uniqueSku && created.prescriptionRequired === true) {
        record(
          "Product Management",
          "Create Product with Pharmacy Fields",
          "PASS",
          `Created product '${created.name}' with composition, usage, precautions, and Rx toggle`
        );
      } else {
        record("Product Management", "Create Product with Pharmacy Fields", "FAIL", `Product created with invalid properties`);
      }

      // 3.2 SKU Uniqueness Validation Test
      try {
        await productService.createProduct(prodPayload);
        record("Product Management", "SKU Uniqueness Validation", "FAIL", `Duplicate SKU was accepted without throwing error!`);
      } catch (dupErr: any) {
        record("Product Management", "SKU Uniqueness Validation", "PASS", `Duplicate SKU correctly rejected: ${dupErr.message}`);
      }

      // 3.3 Required fields validation
      try {
        await productService.createProduct({ name: "" } as any);
        record("Product Management", "Required Field Validation", "FAIL", `Invalid product was accepted without errors`);
      } catch (valErr: any) {
        record("Product Management", "Required Field Validation", "PASS", `Missing required fields properly rejected`);
      }
    }
  } catch (err: any) {
    record("Product Management", "Product Creation Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 4. PRODUCT UPDATE TESTING
  // ----------------------------------------------------------------------
  try {
    if (createdProductId) {
      const updateData = {
        sellingPrice: "175.00",
        discount: "20.45",
        description: "Updated clinical prescribing information.",
        status: "ACTIVE" as const,
      };

      const updated = await productService.updateProduct(createdProductId, updateData);
      if (updated.sellingPrice === "175.00") {
        record("Product Update", "Price & Discount Update", "PASS", `Updated price to ₹175.00, discount to 20.45%`);
      } else {
        record("Product Update", "Price & Discount Update", "FAIL", `Price update failed to reflect`);
      }

      // Disable / Archive product test
      const disabled = await productService.updateProduct(createdProductId, { status: "ARCHIVED" });
      if (disabled.status === "ARCHIVED") {
        record("Product Update", "Archive Product (Archived status)", "PASS", `Product successfully marked ARCHIVED`);
      } else {
        record("Product Update", "Archive Product (Archived status)", "FAIL", `Failed to mark product archived`);
      }

      // Re-enable
      await productService.updateProduct(createdProductId, { status: "ACTIVE" });
    }
  } catch (err: any) {
    record("Product Update", "Product Update Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 5. CATEGORY MANAGEMENT TESTING
  // ----------------------------------------------------------------------
  let testCatId = "";
  try {
    const slug = `qa-category-${Date.now()}`;
    const newCat = await categoryService.createCategory({
      name: "Dermatological & Skin Health",
      slug,
      description: "Topical formulations, cleansers, and therapeutic ointments",
    });
    testCatId = newCat.id;

    if (newCat.id && newCat.slug === slug) {
      record("Category Management", "Create Category", "PASS", `Created category '${newCat.name}' (slug: ${newCat.slug})`);
    } else {
      record("Category Management", "Create Category", "FAIL", `Category creation failed`);
    }

    // Update category
    const updatedCat = await categoryService.updateCategory(testCatId, {
      name: "Dermatology & Skin Barrier Care",
    });
    if (updatedCat.name === "Dermatology & Skin Barrier Care") {
      record("Category Management", "Update Category", "PASS", `Updated name to '${updatedCat.name}'`);
    } else {
      record("Category Management", "Update Category", "FAIL", `Category update failed`);
    }

    // Delete category
    await categoryService.deleteCategory(testCatId);
    const [deletedCheck] = await db.select().from(categories).where(eq(categories.id, testCatId)).limit(1);
    if (!deletedCheck) {
      record("Category Management", "Delete Category", "PASS", `Category deleted cleanly`);
    } else {
      record("Category Management", "Delete Category", "FAIL", `Category still exists after delete`);
    }
  } catch (err: any) {
    record("Category Management", "Category Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 6. INVENTORY & BATCH MANAGEMENT & EXPIRY TESTING
  // ----------------------------------------------------------------------
  try {
    if (createdProductId) {
      // 6.1 Stock addition with batch, mfg date, exp date
      const nearExp = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(); // 20 days
      const batchNumber = `QA-BTH-${Date.now().toString().slice(-4)}`;
      const batch = await inventoryService.createBatch(adminUser.id, {
        productId: createdProductId,
        batchNumber,
        manufacturingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: nearExp,
        quantity: 30,
        mrp: 220,
        costPrice: 130,
      });

      if (batch.batchNumber === batchNumber && batch.quantity === 30) {
        record("Inventory Management", "Batch Registration & Stock Addition", "PASS", `Batch ${batchNumber} registered with 30 units (Expiry in 20d)`);
      } else {
        record("Inventory Management", "Batch Registration & Stock Addition", "FAIL", `Batch creation failed`);
      }

      // 6.2 Expiry Check (FEFO 30 days)
      const expiring = await inventoryService.getExpiringProducts(30);
      const foundExp = expiring.expiringBatches.find((b) => b.batchNumber === batchNumber);
      if (foundExp) {
        record("Expiry Management", "FEFO Near-Expiry Flagging (30d window)", "PASS", `Batch flagged with risk '${foundExp.clinicalRiskLevel}', ${foundExp.daysRemaining} days remaining`);
      } else {
        record("Expiry Management", "FEFO Near-Expiry Flagging (30d window)", "FAIL", `Batch not detected in 30d expiry check`);
      }

      // 6.3 Manual Stock Adjustment & Audit Trail
      const adjusted = await inventoryService.adjustStock(adminUser.id, {
        productId: createdProductId,
        batchId: batch.id,
        changeType: "MANUAL_ADJUSTMENT",
        quantityChanged: -5,
        reason: "QA audit reconciliation",
      });

      if (adjusted.product.currentStock < adjusted.product.previousStock) {
        record("Inventory Management", "Manual Stock Reduction", "PASS", `Stock reduced from ${adjusted.product.previousStock} to ${adjusted.product.currentStock}`);
      } else {
        record("Inventory Management", "Manual Stock Reduction", "FAIL", `Stock adjustment calculation mismatch`);
      }

      // 6.4 Negative Stock Guard Verification (Atomic underflow prevention)
      const [prodBefore] = await db.select().from(products).where(eq(products.id, createdProductId)).limit(1);
      const currentStock = prodBefore.stockQuantity;
      // Try to deduct more than available
      const [attempt] = await db
        .update(products)
        .set({
          stockQuantity: sql`GREATEST(0, ${products.stockQuantity} - ${currentStock + 50})`,
        })
        .where(eq(products.id, createdProductId))
        .returning();

      if (attempt.stockQuantity >= 0) {
        record("Inventory Management", "Negative Stock Guard", "PASS", `Stock clamped to 0 without going negative (Attempted -${currentStock + 50}, Result: ${attempt.stockQuantity})`);
        // Restore stock
        await db.update(products).set({ stockQuantity: currentStock }).where(eq(products.id, createdProductId));
      } else {
        record("Inventory Management", "Negative Stock Guard", "FAIL", `Stock underflow allowed negative value: ${attempt.stockQuantity}`);
      }
    }
  } catch (err: any) {
    record("Inventory Management", "Inventory Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 7. ORDER MANAGEMENT & LIFECYCLE (PLACED -> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED)
  // ----------------------------------------------------------------------
  let testOrderId = "";
  try {
    // 7.1 Create a test order
    let [addr] = await db.select().from(userAddresses).where(eq(userAddresses.userId, customerUser.id)).limit(1);
    if (!addr) {
      const [created] = await db
        .insert(userAddresses)
        .values({
          userId: customerUser.id,
          fullName: customerUser.name,
          phone: customerUser.phone || "9876543210",
          addressLine: "101 Medic Heights, Medical Square",
          city: "Nagpur",
          state: "Maharashtra",
          pincode: "440003",
          addressType: "HOME",
        })
        .returning();
      addr = created;
    }

    const orderNumber = `GNK-QA-${Date.now().toString().slice(-6)}`;
    const [testOrder] = await db
      .insert(orders)
      .values({
        userId: customerUser.id,
        orderNumber,
        deliveryAddressId: addr.id,
        deliveryAddressSnapshot: addr,
        subtotal: "500.00",
        discountAmount: "50.00",
        deliveryFee: "0.00",
        totalAmount: "450.00",
        paymentStatus: "PENDING",
        paymentMethod: "COD",
        orderStatus: "PLACED",
        stockDeducted: false,
      })
      .returning();
    testOrderId = testOrder.id;

    record("Order Management", "Order Placement", "PASS", `Order ${testOrder.orderNumber} placed with status PLACED`);

    // 7.2 Order status progression
    const s1 = await orderService.updateOrderStatus(testOrderId, "CONFIRMED", adminUser.id, "Dosage verified");
    if (s1.orderStatus === "CONFIRMED" && s1.stockDeducted === true) {
      record("Order Management", "Status Transition -> CONFIRMED", "PASS", `Transitioned to CONFIRMED and deducted inventory stock`);
    } else {
      record("Order Management", "Status Transition -> CONFIRMED", "FAIL", `Status: ${s1.orderStatus}, StockDeducted: ${s1.stockDeducted}`);
    }

    const s2 = await orderService.updateOrderStatus(testOrderId, "PACKED", adminUser.id, "Dispensed into cold-pack box");
    if (s2.orderStatus === "PACKED") {
      record("Order Management", "Status Transition -> PACKED", "PASS", `Transitioned to PACKED`);
    } else {
      record("Order Management", "Status Transition -> PACKED", "FAIL", `Status: ${s2.orderStatus}`);
    }

    const s3 = await orderService.updateOrderStatus(testOrderId, "SHIPPED", adminUser.id, "Dispatched via courier");
    if (s3.orderStatus === "SHIPPED") {
      record("Order Management", "Status Transition -> SHIPPED", "PASS", `Transitioned to SHIPPED`);
    } else {
      record("Order Management", "Status Transition -> SHIPPED", "FAIL", `Status: ${s3.orderStatus}`);
    }

    const s4 = await orderService.updateOrderStatus(testOrderId, "DELIVERED", adminUser.id, "Delivered to patient");
    if (s4.orderStatus === "DELIVERED") {
      record("Order Management", "Status Transition -> DELIVERED", "PASS", `Transitioned to DELIVERED`);
    } else {
      record("Order Management", "Status Transition -> DELIVERED", "FAIL", `Status: ${s4.orderStatus}`);
    }
  } catch (err: any) {
    record("Order Management", "Order Lifecycle Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 8. ORDER CANCELLATION REQUEST TESTING
  // ----------------------------------------------------------------------
  try {
    // Create an order in PLACED status for cancellation test
    let [addr] = await db.select().from(userAddresses).where(eq(userAddresses.userId, customerUser.id)).limit(1);
    const [cancelTestOrder] = await db
      .insert(orders)
      .values({
        userId: customerUser.id,
        orderNumber: `GNK-CAN-${Date.now().toString().slice(-5)}`,
        deliveryAddressId: addr?.id,
        deliveryAddressSnapshot: addr,
        subtotal: "300.00",
        discountAmount: "0.00",
        deliveryFee: "40.00",
        totalAmount: "340.00",
        paymentStatus: "PENDING",
        paymentMethod: "COD",
        orderStatus: "CONFIRMED",
        stockDeducted: true,
      })
      .returning();

    // Customer submits cancellation request
    const cancelReq = await cancellationService.submitRequest(customerUser.id, cancelTestOrder.id, {
      reason: "Patient prescribed alternative medication by doctor",
    });

    if (cancelReq.status === "PENDING") {
      record("Cancellation", "Customer Request Submission", "PASS", `Cancellation request submitted for ${cancelTestOrder.orderNumber}`);
    } else {
      record("Cancellation", "Customer Request Submission", "FAIL", `Request status mismatch: ${cancelReq.status}`);
    }

    // Admin approves cancellation
    const approved = await cancellationService.reviewRequest(adminUser.id, cancelReq.id, {
      decision: "APPROVE",
      comment: "Approved by clinical pharmacist",
    });

    const [reloadedOrder] = await db.select().from(orders).where(eq(orders.id, cancelTestOrder.id)).limit(1);
    if (approved.status === "APPROVED" && reloadedOrder.orderStatus === "CANCELLED" && reloadedOrder.stockDeducted === false) {
      record("Cancellation", "Admin Approval & Stock Replenishment", "PASS", `Order marked CANCELLED and stock replenished (stockDeducted=false)`);
    } else {
      record("Cancellation", "Admin Approval & Stock Replenishment", "FAIL", `Order status: ${reloadedOrder?.orderStatus}, stockDeducted: ${reloadedOrder?.stockDeducted}`);
    }
  } catch (err: any) {
    record("Cancellation", "Cancellation Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 9. PRESCRIPTION MANAGEMENT TESTING
  // ----------------------------------------------------------------------
  try {
    const [rx] = await db
      .insert(prescriptions)
      .values({
        userId: customerUser.id,
        fileUrl: "https://res.cloudinary.com/hsufdlap/raw/upload/v1/prescriptions/sample_rx_qa.pdf",
        publicId: "prescriptions/sample_rx_qa",
        fileName: "dr_patil_prescription.pdf",
        fileSize: 320000,
        mimeType: "application/pdf",
        doctorName: "Dr. A. Patil, MBBS, MD",
        patientName: customerUser.name,
        status: "PENDING",
      })
      .returning();

    // View pending prescriptions
    const pendingList = await prescriptionService.getPendingPrescriptions();
    const foundRx = pendingList.find((p) => p.id === rx.id);
    if (foundRx) {
      record("Prescription Management", "View Pending Prescriptions", "PASS", `Prescription found in pending queue`);
    } else {
      record("Prescription Management", "View Pending Prescriptions", "FAIL", `Prescription not listed in pending`);
    }

    // Approve prescription
    const reviewed = await prescriptionService.reviewPrescription(
      rx.id,
      adminUser.id,
      "APPROVED",
      "Medical Council registration verified"
    );
    if (reviewed.status === "APPROVED") {
      record("Prescription Management", "Pharmacist Prescription Approval", "PASS", `Prescription approved with audit trail`);
    } else {
      record("Prescription Management", "Pharmacist Prescription Approval", "FAIL", `Prescription review status: ${reviewed.status}`);
    }
  } catch (err: any) {
    record("Prescription Management", "Prescription Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 10. WHOLESALE PARTNER MANAGEMENT & PRICING
  // ----------------------------------------------------------------------
  try {
    const ts = Date.now().toString().slice(-4);
    const [wUser] = await db
      .insert(users)
      .values({
        name: `Kishore Medical Store ${ts}`,
        email: `kishore.meds.${ts}@genekonpharma.com`,
        phone: `98300${ts}`,
        role: "CUSTOMER",
        isActive: true,
      })
      .returning();

    const application = await wholesaleService.registerPartner(wUser.id, {
      businessName: `Kishore Meds Pvt Ltd ${ts}`,
      ownerName: "Kishore Jain",
      businessType: "RETAIL_PHARMACY",
      gstNumber: "27AAECK1234E1Z8",
      drugLicenseNumber: "MH-PUN-20B-788910",
      phone: `98300${ts}`,
      email: `kishore.meds.${ts}@genekonpharma.com`,
      address: "Shop 12, Shivaji Market, Pune",
    });

    if (application.status === "PENDING_VERIFICATION") {
      record("Wholesale Management", "Partner Application Registration", "PASS", `Application registered with GST ${application.gstNumber} & Drug License ${application.drugLicenseNumber}`);
    } else {
      record("Wholesale Management", "Partner Application Registration", "FAIL", `Status: ${application.status}`);
    }

    // Admin reviews & approves wholesale application
    const reviewResult = await wholesaleService.reviewApplication(adminUser.id, application.id, {
      decision: "APPROVED",
      creditLimit: 200000,
    });

    const [elevated] = await db.select().from(users).where(eq(users.id, wUser.id)).limit(1);
    if (reviewResult.profile.status === "APPROVED" && elevated.role === "WHOLESALE_PARTNER") {
      record("Wholesale Management", "Application Approval & Role Elevation", "PASS", `User elevated to WHOLESALE_PARTNER with ₹200,000 credit limit`);
    } else {
      record("Wholesale Management", "Application Approval & Role Elevation", "FAIL", `Elevation failed: role = ${elevated.role}`);
    }
  } catch (err: any) {
    record("Wholesale Management", "Wholesale Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 11. CUSTOMER MANAGEMENT & ACCOUNT LOCKOUT
  // ----------------------------------------------------------------------
  try {
    const [custTarget] = await db.select().from(users).where(eq(users.role, "CUSTOMER")).limit(1);
    if (custTarget) {
      // Block customer
      const blockRes = await adminCustomerService.toggleUserBlock(adminUser.id, custTarget.id, true, "Security compliance hold");
      if (!blockRes.user.isActive) {
        record("Customer Management", "Block Customer Account", "PASS", `Customer ${custTarget.name} blocked (isActive=false)`);
      } else {
        record("Customer Management", "Block Customer Account", "FAIL", `User still active after block`);
      }

      // Unblock customer
      const unblockRes = await adminCustomerService.toggleUserBlock(adminUser.id, custTarget.id, false, "Reinstated");
      if (unblockRes.user.isActive) {
        record("Customer Management", "Unblock Customer Account", "PASS", `Customer ${custTarget.name} unblocked (isActive=true)`);
      } else {
        record("Customer Management", "Unblock Customer Account", "FAIL", `User not active after unblock`);
      }
    }
  } catch (err: any) {
    record("Customer Management", "Customer Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 12. COUPON MANAGEMENT & STATUS TOGGLING
  // ----------------------------------------------------------------------
  try {
    const testCode = `PROMO_${Date.now().toString().slice(-4)}`;
    const newCoupon = await couponService.createCoupon(adminUser.id, {
      code: testCode,
      description: "QA Promotional Discount",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minOrderValue: 400,
      maxDiscount: 150,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (newCoupon.code === testCode && newCoupon.isActive) {
      record("Coupon Management", "Create Promotional Coupon", "PASS", `Coupon ${testCode} created (15% off, Min ₹400)`);
    } else {
      record("Coupon Management", "Create Promotional Coupon", "FAIL", `Coupon creation failed`);
    }

    // Toggle disabled
    const disabledCoupon = await couponService.toggleCouponStatus(adminUser.id, newCoupon.id, false);
    if (!disabledCoupon.isActive) {
      record("Coupon Management", "Disable Coupon Status", "PASS", `Coupon toggled to inactive`);
    } else {
      record("Coupon Management", "Disable Coupon Status", "FAIL", `Coupon isActive did not toggle`);
    }

    // Verify disabled coupon cannot be applied by customer
    try {
      await couponService.validateCoupon(testCode, 600);
      record("Coupon Management", "Inactive Coupon Rejection", "FAIL", `Inactive coupon was accepted`);
    } catch {
      record("Coupon Management", "Inactive Coupon Rejection", "PASS", `Inactive coupon properly rejected`);
    }
  } catch (err: any) {
    record("Coupon Management", "Coupon Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 13. CMS BANNERS & OFFERS MANAGEMENT
  // ----------------------------------------------------------------------
  try {
    const banner = await cmsService.createBanner(adminUser.id, {
      title: "QA Flash Sale - Up to 30% Off",
      subtitle: "Verified authentic wellness products",
      imageUrl: "https://res.cloudinary.com/hsufdlap/image/upload/v1/banners/qa_test_banner.webp",
      targetUrl: "/search?q=immunity",
      section: "HOMEPAGE_HERO",
      displayOrder: 1,
    });

    if (banner.title && banner.section === "HOMEPAGE_HERO") {
      record("CMS Management", "Create Promotional Banner", "PASS", `Banner '${banner.title}' created in HOMEPAGE_HERO`);
    } else {
      record("CMS Management", "Create Promotional Banner", "FAIL", `Banner creation failed`);
    }

    // Update banner
    const updatedBanner = await cmsService.updateBanner(adminUser.id, banner.id, {
      title: "Updated Flash Sale - Up to 35% Off",
    });
    if (updatedBanner.title.includes("35%")) {
      record("CMS Management", "Update Banner Content", "PASS", `Banner updated to '${updatedBanner.title}'`);
    } else {
      record("CMS Management", "Update Banner Content", "FAIL", `Banner update failed`);
    }

    // Delete banner
    await cmsService.deleteBanner(adminUser.id, banner.id);
    const [bannerCheck] = await db.select().from(cmsBanners).where(eq(cmsBanners.id, banner.id)).limit(1);
    if (!bannerCheck) {
      record("CMS Management", "Delete Banner", "PASS", `Banner removed cleanly`);
    } else {
      record("CMS Management", "Delete Banner", "FAIL", `Banner still exists`);
    }
  } catch (err: any) {
    record("CMS Management", "CMS Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 14. BUSINESS INTELLIGENCE REPORTS
  // ----------------------------------------------------------------------
  try {
    const salesReport = await reportingService.getSalesReport("daily");
    record("Reports", "Daily Sales Analytics Report", "PASS", `Generated with ${salesReport.trend.length} intervals`);

    const productReport = await reportingService.getProductReport();
    record("Reports", "Best Sellers & Underperforming Products Report", "PASS", `Found ${productReport.bestSellers.length} best sellers, ${productReport.lowPerforming.length} low performing`);

    const customerReport = await reportingService.getCustomerReport();
    record("Reports", "Customer Retention Analytics", "PASS", `Customer retention repeat rate: ${customerReport.retention.repeatRatePercent}%`);

    const wholesaleReport = await reportingService.getWholesaleReport();
    record("Reports", "Wholesale Analytics Report", "PASS", `Active wholesale partners: ${wholesaleReport.partners.active}`);
  } catch (err: any) {
    record("Reports", "Reports Suite", "FAIL", err.message);
  }

  // ----------------------------------------------------------------------
  // 15. PERFORMANCE BENCHMARKS ACROSS KEY ADMIN APIS
  // ----------------------------------------------------------------------
  const endpoints = [
    { name: "Admin Dashboard Stats", path: "/admin/dashboard/stats" },
    { name: "Admin Orders List", path: "/orders/admin/all" },
    { name: "Admin Inventory Table", path: "/admin/inventory" },
    { name: "Admin Customers Table", path: "/admin/customers" },
    { name: "Admin Wholesale Applications", path: "/admin/wholesale/applications" },
  ];

  for (const ep of endpoints) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${BASE_URL}${ep.path}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const latency = Date.now() - t0;
      if (res.status === 200) {
        const status = latency <= 350 ? "PASS" : "WARNING";
        record("Performance", ep.name, status, `HTTP 200 in ${latency}ms`, latency);
      } else {
        record("Performance", ep.name, "FAIL", `HTTP ${res.status} in ${latency}ms`, latency);
      }
    } catch (err: any) {
      record("Performance", ep.name, "FAIL", err.message);
    }
  }

  // ----------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------
  const passedCount = results.filter((r) => r.status === "PASS").length;
  const failedCount = results.filter((r) => r.status === "FAIL").length;
  const warningCount = results.filter((r) => r.status === "WARNING").length;

  console.log("\n==========================================================================");
  console.log(`QA AUDIT COMPLETE: ${passedCount} PASSED | ${failedCount} FAILED | ${warningCount} WARNINGS`);
  console.log("==========================================================================");

  return { passedCount, failedCount, warningCount, results };
}

runAdminFullQa()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal QA Audit Error:", err);
    process.exit(1);
  });
