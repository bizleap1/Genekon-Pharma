export type UserRole = "customer" | "wholesale" | "admin";

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "clinic";
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  city?: string;
  pincode?: string;
  businessName?: string;
  gstNumber?: string;
  addresses?: UserAddress[];
}
