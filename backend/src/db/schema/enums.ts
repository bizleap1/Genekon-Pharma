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
