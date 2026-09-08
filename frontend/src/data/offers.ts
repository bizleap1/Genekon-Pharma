/**
 * Standardized Offers, Coupons & Promo Deals Data Store
 */

import { CouponCode } from "@/types/cart";

export interface OfferBannerData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  couponCode: string;
  validUntil: string;
  category: "all" | "medicines" | "vitamins" | "devices" | "personal-care";
  terms: string[];
  gradient: string;
}

export interface BankOffer {
  id: string;
  bankName: string;
  logo: string;
  discount: string;
  minSpend: number;
  code: string;
  description: string;
}

export const PHARMACY_COUPONS: CouponCode[] = [
  {
    code: "GENEKON20",
    discountType: "Percentage",
    discountValue: 20,
    minOrderValue: 499,
    maxDiscount: 300,
    description: "Get 20% OFF on all medicines & health essentials (Min Order ₹499)",
  },
  {
    code: "FIRSTMED",
    discountType: "Fixed",
    discountValue: 150,
    minOrderValue: 699,
    description: "Flat ₹150 OFF on your first healthcare order (Min Order ₹699)",
  },
  {
    code: "BULK500",
    discountType: "Fixed",
    discountValue: 500,
    minOrderValue: 2999,
    description: "Flat ₹500 OFF on wellness & bulk medicine packs (Min Order ₹2,999)",
  },
  {
    code: "MONSOON10",
    discountType: "Percentage",
    discountValue: 10,
    minOrderValue: 299,
    maxDiscount: 100,
    description: "10% OFF on monsoon immunity and OTC remedies (Min Order ₹299)",
  },
  {
    code: "SENIORCARE",
    discountType: "Percentage",
    discountValue: 25,
    minOrderValue: 999,
    maxDiscount: 500,
    description: "Special 25% OFF on chronic disease maintenance medications (Min Order ₹999)",
  },
];

export const PROMO_BANNERS: OfferBannerData[] = [
  {
    id: "offer-1",
    badge: "Limited Period",
    title: "Flat 20% OFF on All Prescription Medicines",
    subtitle: "Upload your valid doctor's prescription and get instant verified doorstep dispatch.",
    couponCode: "GENEKON20",
    validUntil: "30 Sep 2026",
    category: "medicines",
    terms: ["Applicable on orders above ₹499", "Max discount ₹300", "Valid once per verified patient"],
    gradient: "from-[#14304A] to-[#1E4366]",
  },
  {
    id: "offer-2",
    badge: "Immunity Booster",
    title: "Up to 35% OFF on Vitamins & Nutritional Supplements",
    subtitle: "Certified multivitamin blends, fish oils, calcium, and protein formulations.",
    couponCode: "BULK500",
    validUntil: "15 Oct 2026",
    category: "vitamins",
    terms: ["Applicable on select wellness brands", "Free cold-chain shipping included"],
    gradient: "from-[#559620] to-[#3B6A14]",
  },
  {
    id: "offer-3",
    badge: "New Patient Welcome",
    title: "Flat ₹150 OFF on Your Very First Medicine Order",
    subtitle: "Genuine branded drugs directly from licensed pharmaceutical warehouses.",
    couponCode: "FIRSTMED",
    validUntil: "31 Dec 2026",
    category: "all",
    terms: ["Minimum cart value ₹699", "New registered accounts only"],
    gradient: "from-[#1E3A24] to-[#14304A]",
  },
];

export const BANK_OFFERS: BankOffer[] = [
  {
    id: "bank-1",
    bankName: "HDFC Bank",
    logo: "HDFC",
    discount: "Flat 10% Instant Discount",
    minSpend: 1200,
    code: "HDFCMED10",
    description: "Applicable on HDFC Credit and Debit Cards every Wednesday.",
  },
  {
    id: "bank-2",
    bankName: "ICICI Bank",
    logo: "ICICI",
    discount: "Up to ₹200 Cashback",
    minSpend: 999,
    code: "ICICIHEALTH",
    description: "Get 5% cashback on Net Banking and iMobile UPI payments.",
  },
  {
    id: "bank-3",
    bankName: "UPI & RuPay",
    logo: "UPI",
    discount: "Extra ₹50 Instant Off",
    minSpend: 499,
    code: "UPIFAST50",
    description: "Zero transaction fee on all verified UPI and RuPay Debit transactions.",
  },
];
