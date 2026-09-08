import { Router } from "express";
import { paymentController } from "../controllers/paymentController";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createOrderPaymentSchema,
  verifyPaymentSchema,
  retryPaymentSchema,
  refundPaymentSchema,
  adminPaymentQuerySchema,
} from "../validators/paymentValidator";

const router = Router();

// ================= PUBLIC WEBHOOK ROUTE =================
// Note: Webhook does not use JWT auth; it is verified cryptographically via Razorpay HMAC signature
router.post("/webhook", paymentController.handleWebhook);

// ================= AUTHENTICATED ROUTES =================
router.use(authenticateUser);

// 1. Create Razorpay order from database order amount
router.post(
  "/create-order",
  validateRequest(createOrderPaymentSchema),
  paymentController.createOrder
);

// 2. Verify payment signature from client
router.post(
  "/verify",
  validateRequest(verifyPaymentSchema),
  paymentController.verifyPayment
);

// 3. Retry payment for an unpaid or failed order
router.post(
  "/retry",
  validateRequest(retryPaymentSchema),
  paymentController.retryPayment
);

// 4. Fetch payment details for a specific order
router.get("/order/:orderId", paymentController.getPaymentByOrderId);

// ================= ADMIN PAYMENT ROUTES =================
// 5. Admin: Full or partial refund
router.post(
  "/refund",
  authorizeRole("ADMIN"),
  validateRequest(refundPaymentSchema),
  paymentController.refundPayment
);

// 6. Admin: List and filter all payments
router.get(
  "/admin",
  authorizeRole("ADMIN"),
  validateRequest(adminPaymentQuerySchema, "query"),
  paymentController.listAdminPayments
);

export default router;
