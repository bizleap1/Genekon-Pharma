import { Product } from "./product";

export interface ComparisonPairConfig {
  id: string;
  title: string;          // e.g. "Blood Pressure Care", "Telmisartan 40mg"
  subtitle?: string;       // e.g. "Trusted treatment. Greater savings."
  category?: string;
  iconName?: "heart" | "pill" | "activity" | "shield" | "sparkles" | "thermometer";
  referenceProductId: string;
  alternativeProductId: string;
  isActive?: boolean;
  order?: number;
}

export interface ResolvedComparison {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  iconName?: string;
  referenceProduct: Product;
  alternativeProduct: Product;
  savingsPercent: number | null;
  referenceUnitPrice: string | null;
  alternativeUnitPrice: string | null;
}
