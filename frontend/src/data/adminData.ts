export type {
  AdminMetric,
  AdminProduct,
  AdminOrderItem,
  AdminOrder,
  AdminPrescriptionStatus,
  AdminPrescription,
  AdminCustomer,
  AdminWholesaleApp,
  AdminCoupon,
} from "@/types/admin";
import type {
  AdminProduct,
  AdminOrder,
  AdminPrescription,
  AdminCustomer,
  AdminWholesaleApp,
  AdminCoupon,
} from "@/types/admin";

export const ADMIN_METRICS = {
  totalRevenue: { title: "Total Revenue", value: "₹0", change: "0%", isPositive: true, period: "live" },
  totalOrders: { title: "Total Orders", value: "0", change: "0%", isPositive: true, period: "live" },
  totalCustomers: { title: "Active Patients & Buyers", value: "0", change: "0%", isPositive: true, period: "live" },
  wholesalePartners: { title: "Wholesale Partners", value: "0", change: "0 new", isPositive: true, period: "live" },
  lowStockCount: { title: "Low Stock Alerts", value: "0 Items", change: "Normal", isPositive: true, period: "buffer" },
  pendingPrescriptions: { title: "Pending Rx Verification", value: "0 Rx", change: "None", isPositive: true, period: "pharmacist queue" },
};

import { ALL_PRODUCTS } from "./products";

export const ADMIN_PRODUCTS: AdminProduct[] = ALL_PRODUCTS.map((p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  brand: p.brand,
  category: p.category,
  image: p.image || p.images?.[0] || "/images/products/genekon-tablets-pack.jpg",
  mrp: p.mrp,
  sellingPrice: p.sellingPrice,
  stockQuantity: p.stockQuantity,
  reservedQuantity: 0,
  prescriptionRequired: p.prescriptionRequired,
  status: (p.stockQuantity <= 0
    ? "Out of Stock"
    : p.stockQuantity <= 10
    ? "Low Stock"
    : "Active") as "Active" | "Low Stock" | "Out of Stock",
  composition: p.composition,
  gstRate: p.gst,
  lastUpdated: "Recently updated",
}));


export const ADMIN_ORDERS: AdminOrder[] = [];

export const ADMIN_PRESCRIPTIONS: AdminPrescription[] = [];

export const ADMIN_CUSTOMERS: AdminCustomer[] = [];

export const ADMIN_WHOLESALE_APPS: AdminWholesaleApp[] = [];

export const ADMIN_COUPONS: AdminCoupon[] = [
  {
    id: "cpn-1",
    code: "GENEKON20",
    discountType: "Percentage",
    discountValue: 20,
    minOrderValue: 499,
    maxDiscount: 300,
    expiryDate: "Dec 31, 2026",
    redemptionsCount: 0,
    status: "Active",
  },
];

export const SALES_CHART_DATA: Array<{ month: string; revenue: number; orders: number }> = [];

export const CATEGORY_PERFORMANCE_DATA: Array<{ name: string; percentage: number; color: string; revenue: string }> = [];
