"use client";

import { useQuery } from "../useQuery";
import { PHARMACY_COUPONS, PROMO_BANNERS, BANK_OFFERS, OfferBannerData, BankOffer } from "@/data/offers";
import { CouponCode } from "@/types/cart";

export function useOffersQuery() {
  return useQuery<OfferBannerData[]>(
    ["offers", "banners"],
    async () => {
      // Future API: return await apiClient.get<OfferBannerData[]>("/offers");
      return PROMO_BANNERS;
    },
    { staleTime: 300000 }
  );
}

export function useCouponsQuery() {
  return useQuery<CouponCode[]>(
    ["offers", "coupons"],
    async () => {
      return PHARMACY_COUPONS;
    },
    { staleTime: 300000 }
  );
}

export function useBankOffersQuery() {
  return useQuery<BankOffer[]>(
    ["offers", "banks"],
    async () => {
      return BANK_OFFERS;
    },
    { staleTime: 300000 }
  );
}
