import { OrderStatus, PaymentStatus } from "./order";
import { StockStatus } from "./product";
import { WholesaleBusinessType, WholesaleAppStatus } from "./wholesale";

export interface AdminMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  mrp: number;
  sellingPrice: number;
  stockQuantity: number;
  reservedQuantity: number;
  prescriptionRequired: boolean;
  status: "Active" | "Low Stock" | "Out of Stock" | "Draft";
  composition?: string;
  gstRate?: number;
  lastUpdated: string;
}

export interface AdminOrderItem {
  name: string;
  brand: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  batchNumber: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  orderDate: string;
  itemCount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: AdminOrderItem[];
}

export type AdminPrescriptionStatus =
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Information Requested";

export interface AdminPrescription {
  id: string;
  customerName: string;
  customerPhone: string;
  doctorName: string;
  clinicName: string;
  uploadDate: string;
  fileName: string;
  fileSize: string;
  status: AdminPrescriptionStatus;
  notes?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "Retail" | "Wholesale";
  city: string;
  totalOrders: number;
  totalSpend: number;
  registeredDate: string;
  status: "Active" | "Blocked";
}

export interface AdminWholesaleApp {
  id: string;
  businessName: string;
  ownerName: string;
  businessType: WholesaleBusinessType;
  gstNumber: string;
  drugLicenseNumber: string;
  phone: string;
  email: string;
  city: string;
  monthlyExpectedVolume: string;
  applicationDate: string;
  status: WholesaleAppStatus;
}

export interface AdminCoupon {
  id?: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  redemptionsCount: number;
  status: "Active" | "Expired" | "Scheduled";
}
