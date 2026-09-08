export type WholesaleBusinessType =
  | "Retail Pharmacy"
  | "Clinic / Nursing Home"
  | "Hospital"
  | "Distributor";

export type WholesaleAppStatus =
  | "Pending Verification"
  | "Approved"
  | "Rejected";

export interface WholesaleApplication {
  id: string;
  businessName: string;
  ownerName: string;
  contactPerson?: string;
  businessType: WholesaleBusinessType;
  gstNumber: string;
  drugLicenseNumber: string;
  phone: string;
  email: string;
  address?: string;
  city: string;
  state?: string;
  pincode?: string;
  monthlyExpectedVolume?: string;
  applicationDate?: string;
  appliedDate?: string;
  status: WholesaleAppStatus;
}
