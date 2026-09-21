import { ComparisonPairConfig, ResolvedComparison } from "@/types/comparison";
import { Product } from "@/types/product";
import { ALL_PRODUCTS } from "@/data/products";

/**
 * Curated comparison pairs configuration.
 * Contains only identifiers and clinical categorization.
 * Ready for future Admin Panel CRUD integration.
 */
export const COMPARISON_PAIRS_CONFIG: ComparisonPairConfig[] = [
  {
    id: "cmp-pain-paracetamol",
    title: "Paracetamol 500mg",
    subtitle: "Gentle fever & headache management.",
    category: "Pain & Fever Care",
    iconName: "thermometer",
    referenceProductId: "crocin-500", // Crocin 500
    alternativeProductId: "calpol-500", // Calpol 500
    order: 1,
    isActive: true,
  },
  {
    id: "cmp-pain-ibuprofen",
    title: "Ibuprofen + Paracetamol",
    subtitle: "Effective dual-action pain relief.",
    category: "Pain & Fever Care",
    iconName: "pill",
    referenceProductId: "combiflam", // Combiflam
    alternativeProductId: "flexon", // Flexon
    order: 2,
    isActive: true,
  },
  {
    id: "cmp-pain-diclofenac",
    title: "Diclofenac Sodium",
    subtitle: "Strong relief for joint and muscle pain.",
    category: "Pain & Fever Care",
    iconName: "activity",
    referenceProductId: "voveran-sr", // Voveran SR
    alternativeProductId: "voveran", // Voveran
    order: 3,
    isActive: true,
  },
  {
    id: "cmp-pain-aceclofenac",
    title: "Aceclofenac + Paracetamol",
    subtitle: "Targeted inflammation & pain care.",
    category: "Pain & Fever Care",
    iconName: "shield",
    referenceProductId: "zerodol-sp", // Zerodol-SP
    alternativeProductId: "zerodol-p", // Zerodol-P
    order: 4,
    isActive: true,
  },
  {
    id: "cmp-headache",
    title: "Headache Relief",
    subtitle: "Fast-acting headache relief solutions.",
    category: "Pain & Fever Care",
    iconName: "sparkles",
    referenceProductId: "saridon", // Saridon
    alternativeProductId: "disprin", // Disprin
    order: 5,
    isActive: true,
  },
  {
    id: "cmp-pain-dolo",
    title: "Paracetamol 650mg",
    subtitle: "Advanced fever reduction.",
    category: "Pain & Fever Care",
    iconName: "heart",
    referenceProductId: "dolo-650", // Dolo 650
    alternativeProductId: "crocin-advance", // Crocin Advance
    order: 6,
    isActive: true,
  },
];

/**
 * Safely calculates unit price based on pack size number.
 * e.g., price = 45, packSize = "strip of 15" -> "₹3.00 / Unit"
 */
export function calculateUnitPrice(price: number, packSize?: string): string | null {
  if (!price || price <= 0 || !packSize) return null;

  // Extract count from strings like "strip of 15", "Pack of 30", "10 Tablets", "1 unit"
  const match = packSize.match(/\b(\d+)\b/);
  if (!match) return null;

  const count = parseInt(match[1], 10);
  if (!count || count <= 0 || count > 1000) return null;

  const unitCost = price / count;
  return `₹${unitCost.toFixed(2)} / Unit`;
}

/**
 * Calculates dynamic savings percentage:
 * ((referencePrice - alternativePrice) / referencePrice) * 100
 */
export function calculateSavingsPercent(
  referencePrice?: number,
  alternativePrice?: number
): number | null {
  if (
    referencePrice === undefined ||
    alternativePrice === undefined ||
    referencePrice <= 0 ||
    alternativePrice <= 0 ||
    referencePrice <= alternativePrice
  ) {
    return null;
  }

  const raw = ((referencePrice - alternativePrice) / referencePrice) * 100;
  return Math.round(raw);
}

/**
 * Maps configured comparison pairs against the catalog.
 * Strict pharmacy safety: skips any pair where products are missing or invalid.
 */
export function getResolvedComparisons(
  productList: Product[] = ALL_PRODUCTS
): ResolvedComparison[] {
  const productMap = new Map<string, Product>();

  // Combine static fallback products with live products. 
  // Live products come later in the array to overwrite static ones with live prices.
  const combinedProducts = [...ALL_PRODUCTS, ...productList];

  // Index by id, legacyId, and slug for robust lookups
  combinedProducts.forEach((p) => {
    if (p.id) productMap.set(p.id, p);
    if (p.legacyId) productMap.set(p.legacyId, p);
    if (p.slug) productMap.set(p.slug, p);
  });

  const resolved: ResolvedComparison[] = [];

  const activeConfigs = [...COMPARISON_PAIRS_CONFIG]
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const config of activeConfigs) {
    const ref = productMap.get(config.referenceProductId);
    const alt = productMap.get(config.alternativeProductId);

    if (!ref || !alt) {
      continue;
    }

    const refPrice = Number(ref.sellingPrice || ref.price || ref.mrp);
    const altPrice = Number(alt.sellingPrice || alt.price || alt.mrp);

    const savingsPercent = calculateSavingsPercent(refPrice, altPrice);
    const referenceUnitPrice = calculateUnitPrice(refPrice, ref.packSize || ref.dosageForm);
    const alternativeUnitPrice = calculateUnitPrice(altPrice, alt.packSize || alt.dosageForm);

    resolved.push({
      id: config.id,
      title: config.title || alt.composition || alt.name,
      subtitle: config.subtitle,
      category: config.category || alt.category,
      iconName: config.iconName,
      referenceProduct: ref,
      alternativeProduct: alt,
      savingsPercent,
      referenceUnitPrice,
      alternativeUnitPrice,
    });
  }

  return resolved;
}
