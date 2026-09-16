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
    id: "cmp-diabetes-glimepiride",
    title: "Glimepiride 2mg",
    subtitle: "Trusted treatment. Greater savings.",
    category: "Diabetes Management",
    iconName: "activity",
    referenceProductId: "f050f0a2-09d4-4c40-af4b-b5d1870bac53", // Amaryl 2 (₹90)
    alternativeProductId: "9a0248e7-7f6f-4f6b-9b09-4976d9e4819b", // Glimepiride 2 (₹45)
    order: 1,
    isActive: true,
  },
  {
    id: "cmp-gastro-pantoprazole",
    title: "Pantoprazole 40mg",
    subtitle: "Rapid relief from acidity & heartburn.",
    category: "Gastro Care",
    iconName: "pill",
    referenceProductId: "3eaeadd7-42f5-4f7b-b0e3-2993e74ac244", // Pan 40 (₹70)
    alternativeProductId: "12ce9d31-4e7d-41c3-addc-353445346ef1", // Pantop 40 (₹65)
    order: 2,
    isActive: true,
  },
  {
    id: "cmp-cardiac-amlodipine",
    title: "Amlodipine 5mg",
    subtitle: "Blood pressure regulation with trusted efficacy.",
    category: "Blood Pressure Care",
    iconName: "heart",
    referenceProductId: "ca795324-eba0-42be-b46f-30f82f329d28", // Amlokind 5 (₹20)
    alternativeProductId: "09c4fa12-746f-4b33-9be9-e6e7953049fc", // Stamlo 5 (₹18)
    order: 3,
    isActive: true,
  },
  {
    id: "cmp-antibiotic-amoxycillin",
    title: "Amoxycillin 500mg",
    subtitle: "Broad-spectrum bacterial infection care.",
    category: "Antibiotic Therapy",
    iconName: "shield",
    referenceProductId: "3a4f6cf7-7977-4ee4-b63a-7a8e0f9b69bb", // Novamox 500 (₹50)
    alternativeProductId: "0d473479-7c37-4d94-b2fc-21bf26e792e3", // Amoxil 500 (₹45)
    order: 4,
    isActive: true,
  },
  {
    id: "cmp-pain-paracetamol",
    title: "Paracetamol 500mg",
    subtitle: "Gentle fever & headache management.",
    category: "Pain & Fever Care",
    iconName: "thermometer",
    referenceProductId: "f077fd54-2dba-4179-ba45-4be8ef6dd602", // Crocin 500 (₹20)
    alternativeProductId: "e828fc62-0941-4770-9ee2-eb9c59f0f9b4", // Calpol 500 (₹15)
    order: 5,
    isActive: true,
  },
  {
    id: "cmp-wellness-vitamind3",
    title: "Vitamin D3 60,000 IU",
    subtitle: "Immune and high-absorption bone support.",
    category: "Vitamins & Supplements",
    iconName: "sparkles",
    referenceProductId: "7eb0c7b3-e54b-48e3-8153-40f822003d8f", // Uprise D3 (₹60)
    alternativeProductId: "91249739-2ffa-4156-8e7e-9c43b961688b", // Calcirol Sachet (₹30)
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

  // Index by id, legacyId, and slug for robust lookups
  productList.forEach((p) => {
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
