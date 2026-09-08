import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role_enum", [
  "CUSTOMER",
  "WHOLESALE_PARTNER",
  "ADMIN",
]);

export const addressTypeEnum = pgEnum("address_type_enum", [
  "HOME",
  "WORK",
  "CLINIC",
  "OTHER",
]);

export const rxStatusEnum = pgEnum("rx_status_enum", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const wholesaleStatusEnum = pgEnum("wholesale_status_enum", [
  "PENDING_VERIFICATION",
  "APPROVED",
  "REJECTED",
]);

export const wholesaleBusinessTypeEnum = pgEnum("wholesale_business_type_enum", [
  "RETAIL_PHARMACY",
  "CLINIC_NURSING_HOME",
  "HOSPITAL",
  "DISTRIBUTOR",
]);

export const productStatusEnum = pgEnum("product_status_enum", [
  "ACTIVE",
  "DRAFT",
  "ARCHIVED",
  "OUT_OF_STOCK",
]);

export const orderStatusEnum = pgEnum("order_status_enum", [
  "PENDING_VERIFICATION",
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status_enum", [
  "PENDING",
  "SUCCESS",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

export const paymentMethodEnum = pgEnum("payment_method_enum", [
  "COD",
  "ONLINE",
  "UPI",
  "CARD",
  "NETBANKING",
]);

export const cancellationStatusEnum = pgEnum("cancellation_status_enum", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

