export interface CustomerProfile {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: "Female" | "Male" | "Other";
  avatar: string;
}

export interface CustomerOrder {
  id: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Cash on Delivery" | "Refunded" | "Cancelled";
  deliveryStatus: "Delivered" | "Shipped" | "Confirmed" | "Processing" | "Cancelled";
  currentStep: number; // 0 to 5
  estimatedDelivery?: string;
  deliveredDate?: string;
  courier?: string;
  awbNumber?: string;
  deliveryAddress: string;
  cancellationRequest?: any;
  items: {
    id: string;
    name: string;
    brand: string;
    variant: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    image: string;
  }[];
  priceBreakdown: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
}

export interface CustomerPrescription {
  id: string;
  doctorName: string;
  clinicName: string;
  patientName: string;
  uploadDate: string;
  validUntil: string;
  status: "Verified & Active" | "Under Pharmacist Review" | "Action Required";
  statusColor: string;
  medicinesCount: number;
  fileName: string;
  fileSize: string;
}

export interface CustomerAddress {
  id: string;
  type: "Home" | "Work" | "Clinic";
  name: string;
  phone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "order" | "offer" | "health";
  read: boolean;
  actionUrl?: string;
}

export const MOCK_CUSTOMER: CustomerProfile = {
  name: "Prerna Sharma",
  phone: "9370102691",
  email: "prerna.sharma@gmail.com",
  dateOfBirth: "1994-08-14",
  gender: "Female",
  avatar: "PS",
};

export const MOCK_ORDERS: CustomerOrder[] = [
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
      discount: 206,
      deliveryFee: 40,
      total: 1207,
    },
  },
  {
    id: "GNK-76192",
    date: "Aug 18, 2026",
    totalAmount: 385,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    currentStep: 5,
    deliveredDate: "Aug 20, 2026",
    courier: "Genekon Local Dispatch",
    awbNumber: "GNK-LOC-71822",
    deliveryAddress: "Flat 402, Green Valley Apartments, Katol Road, Nagpur, Maharashtra - 440013",
    items: [
      {
        id: "prod-13",
        name: "Authentic Chyawanprash Special",
        brand: "Dabur",
        variant: "1 kg",
        price: 385,
        originalPrice: 450,
        quantity: 1,
        image: "/images/categories/cat-ayurveda-v2.jpg",
      },
    ],
    priceBreakdown: {
      subtotal: 450,
      discount: 65,
      deliveryFee: 0,
      total: 385,
    },
  },
  {
    id: "GNK-65410",
    date: "Jul 02, 2026",
    totalAmount: 1199,
    paymentMethod: "Credit Card (HDFC Bank)",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    currentStep: 5,
    deliveredDate: "Jul 04, 2026",
    courier: "BlueDart Express",
    awbNumber: "BD-99124-GEN",
    deliveryAddress: "Flat 402, Green Valley Apartments, Katol Road, Nagpur, Maharashtra - 440013",
    items: [
      {
        id: "prod-5",
        name: "Accu-Chek Blood Glucose Strips",
        brand: "Accu-Chek",
        variant: "50 Strips",
        price: 1199,
        originalPrice: 1350,
        quantity: 1,
        image: "/images/products/accu-chek-strips-v2.jpg",
      },
    ],
    priceBreakdown: {
      subtotal: 1350,
      discount: 151,
      deliveryFee: 0,
      total: 1199,
    },
  },
];

export const MOCK_PRESCRIPTIONS: CustomerPrescription[] = [
  {
    id: "RX-4482",
    doctorName: "Dr. A. K. Deshmukh, MD (Medicine)",
    clinicName: "Nagpur Chest & General Clinic",
    patientName: "Prerna Sharma",
    uploadDate: "Sep 05, 2026",
    validUntil: "Dec 05, 2026",
    status: "Verified & Active",
    statusColor: "bg-[#EDF7E9] text-[#447719]",
    medicinesCount: 3,
    fileName: "Prescription_Sept2026.pdf",
    fileSize: "1.4 MB",
  },
  {
    id: "RX-3190",
    doctorName: "Dr. Sunita Kulkarni, MD (Dermatology)",
    clinicName: "Skin Care Centre, Dhantoli",
    patientName: "Prerna Sharma",
    uploadDate: "Aug 12, 2026",
    validUntil: "Feb 12, 2027",
    status: "Verified & Active",
    statusColor: "bg-[#EDF7E9] text-[#447719]",
    medicinesCount: 2,
    fileName: "Derma_Prescription_Aug.jpg",
    fileSize: "840 KB",
  },
  {
    id: "RX-1102",
    doctorName: "Dr. V. R. Joshi, MBBS",
    clinicName: "Family Health Polyclinic",
    patientName: "Prerna Sharma",
    uploadDate: "May 20, 2026",
    validUntil: "Expired",
    status: "Action Required",
    statusColor: "bg-[#FFF4E5] text-[#D97706]",
    medicinesCount: 1,
    fileName: "Clinic_Consult_May26.pdf",
    fileSize: "2.1 MB",
  },
];

export const MOCK_ADDRESSES: CustomerAddress[] = [
  {
    id: "addr-1",
    type: "Home",
    name: "Prerna Sharma",
    phone: "9370102691",
    addressLine: "Flat 402, Green Valley Apartments, Katol Road",
    locality: "Gittikhadan",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440013",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Work",
    name: "Prerna Sharma",
    phone: "9370102691",
    addressLine: "Office 301, Tech Park, IT Park Road",
    locality: "Parsodi",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440022",
    isDefault: false,
  },
];

export const MOCK_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: "notif-1",
    title: "Order Shipped (GNK-89241)",
    message: "Your package containing Cetaphil Cleanser & Multivitamins has been handed over to Genekon Express. Expected tomorrow by 4:00 PM.",
    timestamp: "2 hours ago",
    category: "order",
    read: false,
    actionUrl: "/account/orders/GNK-89241",
  },
  {
    id: "notif-2",
    title: "Prescription Verified Successfully",
    message: "Licensed Pharmacist has verified Dr. Deshmukh's prescription (RX-4482). You can now order refills in 1 click.",
    timestamp: "Yesterday",
    category: "order",
    read: false,
    actionUrl: "/account/prescriptions",
  },
  {
    id: "notif-3",
    title: "Exclusive 20% Discount with GENEKON20",
    message: "Enjoy flat 20% savings on health supplements & medical diagnostics this week. Use code GENEKON20 at checkout.",
    timestamp: "3 days ago",
    category: "offer",
    read: true,
    actionUrl: "/offers",
  },
  {
    id: "notif-4",
    title: "Health Tip: Seasonal Immunity Boosters",
    message: "Read our pharmacist advice on Vitamin C, Zinc, and daily hydration during seasonal weather transitions.",
    timestamp: "5 days ago",
    category: "health",
    read: true,
    actionUrl: "/",
  },
];
