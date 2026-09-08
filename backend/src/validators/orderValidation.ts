import { z } from "zod";

export const createOrderSchema = z.object({
  deliveryAddressId: z.string().uuid("A valid delivery address ID is required"),
  prescriptionId: z.string().uuid("Invalid prescription ID format").optional(),
  paymentMethod: z
    .enum(["COD", "ONLINE", "UPI", "CARD", "NETBANKING"])
    .optional()
    .default("COD"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING_VERIFICATION",
    "PLACED",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const reviewPrescriptionSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED") {
        return !!data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting a prescription",
      path: ["rejectionReason"],
    }
  );

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ReviewPrescriptionInput = z.infer<typeof reviewPrescriptionSchema>;
