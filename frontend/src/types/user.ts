export type UserRole = "customer" | "wholesale" | "admin";

export interface UserAddress {
  id: string;
  name: string;
  fullName?: string;
  phone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "clinic" | "other";
  isDefault?: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  mobile: string;
  phone?: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "Female" | "Male" | "Other" | string;
  address?: string;
  city?: string;
  pincode?: string;
  businessName?: string;
  businessType?: string;
  gstNumber?: string;
  addresses?: UserAddress[];
}
