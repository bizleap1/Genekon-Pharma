import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import { prescriptionService } from "../services/prescriptionService";
import { cancellationService } from "../services/cancellationService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const orderController = {
  /**
   * POST /api/v1/orders
   * Customer: Checkout and place order from cart
   */
  async createOrder(req: Request, res: Response) {
    try {
      const order = await orderService.createOrderFromCart(req.user!.id, req.body);
      const message = order.prescriptionRequired
        ? "Order placed successfully. Prescription verification is pending."
        : "Order placed successfully.";
      return sendSuccess(res, order, message, 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to place order", 400);
    }
  },

  /**
   * GET /api/v1/orders
   * Customer: List customer's own orders
   */
  async getCustomerOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getCustomerOrders(req.user!.id, req.query as any);
      return sendSuccess(res, orders, "Orders retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve orders", 400);
    }
  },

  /**
   * GET /api/v1/orders/:id
   * Customer / Admin: Get order by ID or order number
   */
  async getOrderById(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const isAdmin = req.user?.role === "ADMIN";
      const order = await orderService.getOrderById(
        orderId,
        isAdmin ? undefined : req.user!.id,
        isAdmin
      );
      return sendSuccess(res, order, "Order retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve order", 404);
    }
  },

  /**
   * POST /api/v1/orders/:id/cancel
   * Policy guard: Direct cancellation is disabled
   */
  async cancelOrder(_req: Request, res: Response) {
    return sendError(
      res,
      "Direct order cancellation is disabled. Please submit a cancellation request for dispensary admin review.",
      400
    );
  },

  /**
   * POST /api/v1/orders/:id/cancel-request
   * Customer: Submit order cancellation request for dispensary review
   */
  async requestCancellation(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const { reason, details } = req.body;
      const request = await cancellationService.submitRequest(req.user!.id, orderId, {
        reason,
        details,
      });
      return sendSuccess(res, request, "Cancellation request submitted for admin review", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to submit cancellation request", 400);
    }
  },

  /**
   * GET /api/v1/orders/:id/cancel-request
   * Customer / Admin: Retrieve cancellation request status for this order
   */
  async getCancellationRequest(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const request = await cancellationService.getRequestForOrder(
        orderId,
        req.user!.role === "ADMIN" ? undefined : req.user!.id
      );
      return sendSuccess(res, request, "Cancellation request retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve cancellation request", 400);
    }
  },

  /**
   * POST /api/v1/orders/:id/reorder
   * Customer: "Buy Again" - re-add available items from past order into cart
   */
  async reorder(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const result = await orderService.reorder(orderId, req.user!.id);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to reorder items", 400);
    }
  },

  /**
   * POST /api/v1/orders/prescriptions/upload
   * Customer: Upload prescription document (JPG, PNG, PDF)
   */
  async uploadPrescription(req: Request, res: Response) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return sendError(res, "No prescription document was provided for upload", 400);
      }

      const { doctorName, patientName, orderId } = req.body;
      const prescription = await prescriptionService.uploadPrescription(req.user!.id, file, {
        doctorName,
        patientName,
        orderId,
      });

      return sendSuccess(res, prescription, "Prescription uploaded successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to upload prescription", 400);
    }
  },

  /**
   * GET /api/v1/orders/prescriptions/mine
   * Customer: List all uploaded prescriptions
   */
  async getUserPrescriptions(req: Request, res: Response) {
    try {
      const list = await prescriptionService.getUserPrescriptions(req.user!.id);
      return sendSuccess(res, list, "Prescriptions retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve prescriptions", 400);
    }
  },

  // ================= ADMIN APIS =================

  /**
   * GET /api/v1/orders/admin/all
   * Admin: List all orders with filters
   */
  async getAdminOrders(req: Request, res: Response) {
    try {
      const result = await orderService.getAdminOrders(req.query as any);
      return sendSuccess(res, result, "Admin orders retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve admin orders", 400);
    }
  },

  /**
   * PUT /api/v1/orders/admin/:id/status
   * Admin: Update order status & manage stock
   */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const { status, notes } = req.body;
      const updated = await orderService.updateOrderStatus(orderId, status, req.user!.id, notes);
      return sendSuccess(res, updated, `Order status updated to ${status}`);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update order status", 400);
    }
  },

  /**
   * GET /api/v1/orders/admin/prescriptions/pending
   * Admin: List pending prescriptions awaiting clinical pharmacist review
   */
  async getPendingPrescriptions(_req: Request, res: Response) {
    try {
      const list = await prescriptionService.getPendingPrescriptions();
      return sendSuccess(res, list, "Pending prescriptions retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve pending prescriptions", 400);
    }
  },

  /**
   * PUT /api/v1/orders/admin/prescriptions/:prescriptionId/review
   * Admin: Approve or Reject a prescription
   */
  async reviewPrescription(req: Request, res: Response) {
    try {
      const prescriptionId = req.params.prescriptionId as string;
      const { status, rejectionReason } = req.body;
      const result = await prescriptionService.reviewPrescription(
        prescriptionId,
        req.user!.id,
        status,
        rejectionReason
      );
      return sendSuccess(res, result, `Prescription marked as ${status}`);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to review prescription", 400);
    }
  },

  /**
   * GET /api/v1/orders/admin/cancellations
   * Admin: List cancellation requests with filters & pagination
   */
  async getAdminCancellationRequests(req: Request, res: Response) {
    try {
      const result = await cancellationService.listAdminRequests(req.query as any);
      return sendSuccess(res, result, "Cancellation requests retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve cancellation requests", 400);
    }
  },

  /**
   * PUT /api/v1/orders/admin/cancellations/:id/review
   * Admin: Review cancellation request (Approve or Reject)
   */
  async reviewCancellationRequest(req: Request, res: Response) {
    try {
      const requestId = req.params.id as string;
      const { decision, comment } = req.body;
      const result = await cancellationService.reviewRequest(req.user!.id, requestId, {
        decision,
        comment,
      });
      return sendSuccess(
        res,
        result,
        `Cancellation request ${decision === "APPROVE" ? "approved" : "rejected"} successfully`
      );
    } catch (error: any) {
      return sendError(res, error.message || "Failed to review cancellation request", 400);
    }
  },
};

