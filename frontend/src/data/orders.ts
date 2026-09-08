/**
 * Standardized Orders Data Store
 * Contains customer order histories, tracking events, and dispensary admin dispatches.
 */

import { CustomerOrder } from "./customer";
import { AdminOrder, ADMIN_ORDERS } from "./adminData";
import { PlacedOrder } from "@/types/order";

export { ADMIN_ORDERS };
export type { AdminOrder, CustomerOrder };

export const CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: "GNK-89241",
    date: "Sep 06, 2026",
    totalAmount: 1207,
    paymentMethod: "UPI (Google Pay)",
    paymentStatus: "Paid",
    deliveryStatus: "Shipped",
    currentStep: 4,
    estimatedDelivery: "Tomorrow, Sep 08 by 4:00 PM",
    courier: "Genekon Express Delivery",
    awbNumber: "GNK-EXP-90214",
    deliveryAddress: "Flat 402, Green Valley Apartments, Katol Road, Nagpur, Maharashtra - 440013",
    items: [
      {
        id: "prod-4",
        name: "Cetaphil Gentle Skin Cleanser",
        brand: "Cetaphil",
        variant: "500 ml",
        price: 475,
        originalPrice: 579,
        quantity: 1,
        image: "/images/products/cetaphil-cleanser-v2.jpg",
      },
      {
        id: "prod-3",
        name: "Dr. Morepen Digital Thermometer",
        brand: "Dr. Morepen",
        variant: "1 Unit",
        price: 299,
        originalPrice: 330,
        quantity: 1,
        image: "/images/products/dr-morepen-thermometer-v2.jpg",
      },
      {
        id: "prod-2",
        name: "HealthKart Multivitamin Tablets",
        brand: "HealthKart",
        variant: "60 Tablets",
        price: 599,
        originalPrice: 699,
        quantity: 1,
        image: "/images/products/healthkart-multivitamin-v2.jpg",
      },
    ],
    priceBreakdown: {
      subtotal: 1373,
      discount: 216,
      deliveryFee: 50,
      total: 1207,
    },
  },
  {
    id: "GNK-87103",
    date: "Aug 28, 2026",
    totalAmount: 849,
    paymentMethod: "Credit Card (HDFC)",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    currentStep: 5,
    deliveredDate: "Aug 30, 2026 at 2:15 PM",
    courier: "Genekon Cold-Chain Logistics",
    awbNumber: "GNK-CC-87103",
    deliveryAddress: "Flat 402, Green Valley Apartments, Katol Road, Nagpur, Maharashtra - 440013",
    items: [
      {
        id: "prod-1",
        name: "Cipla Paracetamol 500 mg",
        brand: "Cipla",
        variant: "10 Tablets",
        price: 32,
        originalPrice: 40,
        quantity: 2,
        image: "/images/products/cipla-paracetamol-v2.jpg",
      },
      {
        id: "prod-5",
        name: "Dabur Chyawanprash 2X Immunity",
        brand: "Dabur",
        variant: "1 kg",
        price: 385,
        originalPrice: 450,
        quantity: 2,
        image: "/images/products/dabur-chyawanprash-v2.jpg",
      },
    ],
    priceBreakdown: {
      subtotal: 980,
      discount: 131,
      deliveryFee: 0,
      total: 849,
    },
  },
  {
    id: "GNK-82450",
    date: "Aug 12, 2026",
    totalAmount: 2450,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    currentStep: 5,
    deliveredDate: "Aug 14, 2026 at 11:40 AM",
    courier: "BlueDart Pharma Priority",
    awbNumber: "BD-82450912",
    deliveryAddress: "Apex Healthcare Clinic, Ramdaspeth, Nagpur, Maharashtra - 440010",
    items: [
      {
        id: "prod-7",
        name: "Omron Blood Pressure Monitor HEM-7120",
        brand: "Omron",
        variant: "1 Unit",
        price: 2199,
        originalPrice: 2490,
        quantity: 1,
        image: "/images/products/omron-bp-monitor-v2.jpg",
      },
      {
        id: "prod-1",
        name: "Cipla Paracetamol 500 mg",
        brand: "Cipla",
        variant: "10 Tablets",
        price: 32,
        originalPrice: 40,
        quantity: 5,
        image: "/images/products/cipla-paracetamol-v2.jpg",
      },
    ],
    priceBreakdown: {
      subtotal: 2690,
      discount: 240,
      deliveryFee: 0,
      total: 2450,
    },
  },
];
