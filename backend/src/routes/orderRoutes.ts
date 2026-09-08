import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { uploadPrescriptionDoc } from "../middleware/upload";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  reviewPrescriptionSchema,
} from "../validators/orderValidation";

const router = Router();

// All order operations require authentication
router.use(authenticateUser);

// ================= CUSTOMER ROUTES =================
router.post("/", validateRequest(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getCustomerOrders);

// Prescription Upload & Review
router.post(
  "/prescriptions/upload",
  uploadPrescriptionDoc.single("file"),
  orderController.uploadPrescription
);
router.get("/prescriptions/mine", orderController.getUserPrescriptions);

// Single Order Operations
router.get("/:id", orderController.getOrderById);
router.post("/:id/cancel", orderController.cancelOrder);
router.post("/:id/reorder", orderController.reorder);

// ================= ADMIN DISPENSARY ROUTES =================
router.get("/admin/all", authorizeRole("ADMIN"), orderController.getAdminOrders);
router.put(
  "/admin/:id/status",
  authorizeRole("ADMIN"),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);
router.get(
  "/admin/prescriptions/pending",
  authorizeRole("ADMIN"),
  orderController.getPendingPrescriptions
);
router.put(
  "/admin/prescriptions/:prescriptionId/review",
  authorizeRole("ADMIN"),
  validateRequest(reviewPrescriptionSchema),
  orderController.reviewPrescription
);

export default router;
