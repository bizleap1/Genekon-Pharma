/**
 * Standardized Users & Personas Data Store
 * Supports Customer, Wholesale B2B, and Admin personas.
 */

import { UserProfile, UserRole, UserAddress } from "@/types/user";

export const MOCK_CUSTOMER_USER: UserProfile = {
  name: "Prerna Sharma",
  phone: "9370102691",
  mobile: "9370102691",
  email: "prerna.sharma@example.com",
  role: "customer",
  avatar: "/images/avatars/user-default.png",
  dateOfBirth: "1994-08-14",
  gender: "Female",
};

export const MOCK_WHOLESALE_USER: UserProfile = {
  name: "Apex Healthcare & Polyclinic",
  phone: "9822345678",
  mobile: "9822345678",
  email: "purchase@apexhealthcare.in",
  role: "wholesale",
  avatar: "/images/avatars/wholesale-default.png",
  gender: "Other",
};

export const MOCK_ADMIN_USER: UserProfile = {
  name: "Dr. Shreya Meshram",
  phone: "9822001122",
  mobile: "9822001122",
  email: "admin@genekonpharma.com",
  role: "admin",
  avatar: "/images/avatars/admin-default.png",
  gender: "Female",
};

export const MOCK_USER_ADDRESSES: UserAddress[] = [
  {
    id: "addr-1",
    type: "home",
    name: "Prerna Sharma",
    fullName: "Prerna Sharma",
    phone: "9370102691",
    addressLine: "Flat 402, Green Valley Apartments, Katol Road",
    landmark: "Near Little Flower School",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440013",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "work",
    name: "Prerna Sharma",
    fullName: "Prerna Sharma",
    phone: "9370102691",
    addressLine: "Tech Park, Wing B, 4th Floor, MIDC IT Zone",
    landmark: "Opposite Tech Mahindra",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440022",
    isDefault: false,
  },
];

export const MOCK_USERS_LIST: Record<UserRole, UserProfile> = {
  customer: MOCK_CUSTOMER_USER,
  wholesale: MOCK_WHOLESALE_USER,
  admin: MOCK_ADMIN_USER,
};
