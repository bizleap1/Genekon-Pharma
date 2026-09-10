import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { db, categories, products, productImages, inventoryBatches } from "../db";
import { generateSlug } from "../services/categoryService";
import { logger } from "../utils/logger";

interface RawProductRow {
  name: string;
  category: string;
  composition: string;
  form: string;
  packSize: string;
  prescriptionRequired: boolean;
  priceRange: string;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function parsePriceRange(str: string): { low: number; high: number } {
  const excelDateMap: Record<string, { low: number; high: number }> = {
    "oct-15": { low: 10, high: 15 },
    "oct-20": { low: 10, high: 20 },
    "may-15": { low: 5, high: 15 },
    "dec-20": { low: 12, high: 20 },
    "dec-15": { low: 12, high: 15 },
  };

  const clean = str.trim().toLowerCase();
  if (excelDateMap[clean]) {
    return excelDateMap[clean];
  }

  const parts = clean
    .split("-")
    .map((p) => parseFloat(p.replace(/[^0-9.]/g, "")))
    .filter((p) => !isNaN(p));
  if (parts.length >= 2) {
    return { low: parts[0], high: parts[1] };
  } else if (parts.length === 1) {
    return { low: Math.round(parts[0] * 0.8), high: parts[0] };
  }
  return { low: 40, high: 50 };
}

function extractBrand(name: string): string {
  const firstWord = name.split(" ")[0].replace(/[^a-zA-Z0-9-]/g, "");
  return firstWord || "Genekon";
}

function getProductImage(form: string, category: string, name: string): string {
  const f = (form || "").toLowerCase();
  const c = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (c.includes("eye") || c.includes("ear") || n.includes("drop") || f.includes("drop")) {
    return "/images/products/genekon-eye-drops.jpg";
  }
  if (
    c.includes("diagnostic") ||
    f.includes("device") ||
    f.includes("meter") ||
    f.includes("monitor") ||
    n.includes("monitor") ||
    n.includes("glucometer")
  ) {
    return "/images/products/genekon-diagnostic-device.jpg";
  }
  if (f.includes("inhaler") || f.includes("respule") || f.includes("spray") || f.includes("rotacap")) {
    return "/images/products/genekon-inhaler-device.jpg";
  }
  if (
    f.includes("cream") ||
    f.includes("gel") ||
    f.includes("ointment") ||
    f.includes("lotion") ||
    f.includes("wash") ||
    f.includes("soap")
  ) {
    return "/images/products/genekon-ointment-tube.jpg";
  }
  if (
    f.includes("syrup") ||
    f.includes("suspension") ||
    f.includes("liquid") ||
    f.includes("gargle") ||
    f.includes("oil")
  ) {
    return "/images/products/genekon-syrup-bottle.jpg";
  }
  if (
    f.includes("powder") ||
    f.includes("jar") ||
    f.includes("paste") ||
    f.includes("churna") ||
    f.includes("tin") ||
    c.includes("nutrition")
  ) {
    return "/images/products/genekon-health-powder.jpg";
  }
  if (f.includes("capsule")) {
    return "/images/products/genekon-capsules-bottle.jpg";
  }
  return "/images/products/genekon-tablets-pack.jpg";
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Pain Relief & Fever": "/images/products/genekon-tablets-pack.jpg",
  "Cold, Cough & Flu": "/images/products/genekon-syrup-bottle.jpg",
  Antibiotics: "/images/products/genekon-tablets-pack.jpg",
  "Diabetes Care": "/images/products/genekon-tablets-pack.jpg",
  "Cardiac & Blood Pressure": "/images/products/genekon-tablets-pack.jpg",
  "Gastro & Digestive": "/images/products/genekon-syrup-bottle.jpg",
  "Vitamins & Supplements": "/images/products/genekon-capsules-bottle.jpg",
  "Allergy & Antihistamines": "/images/products/genekon-tablets-pack.jpg",
  "Skin Care & Dermatology": "/images/products/genekon-ointment-tube.jpg",
  "Antiseptics & First Aid": "/images/products/genekon-ointment-tube.jpg",
  "Women's Health": "/images/products/genekon-tablets-pack.jpg",
  "Respiratory & Asthma": "/images/products/genekon-inhaler-device.jpg",
  "Eye & Ear Care": "/images/products/genekon-eye-drops.jpg",
  "Oral Care": "/images/products/genekon-ointment-tube.jpg",
  "Baby Care": "/images/products/genekon-syrup-bottle.jpg",
  "Muscle & Joint Pain": "/images/products/genekon-ointment-tube.jpg",
  "Ayurvedic & Herbal": "/images/products/genekon-health-powder.jpg",
  "Sexual Wellness": "/images/products/genekon-tablets-pack.jpg",
  "Steroids & Anti-inflammatory": "/images/products/genekon-tablets-pack.jpg",
  "Nutrition & Health Drinks": "/images/products/genekon-health-powder.jpg",
  "Thyroid & Hormonal": "/images/products/genekon-tablets-pack.jpg",
  "Anemia & Iron Supplements": "/images/products/genekon-capsules-bottle.jpg",
  "Bone & Joint Health": "/images/products/genekon-tablets-pack.jpg",
  Deworming: "/images/products/genekon-tablets-pack.jpg",
  "Piles & Hemorrhoid Care": "/images/products/genekon-ointment-tube.jpg",
  "Diagnostic Devices & Health Monitors": "/images/products/genekon-diagnostic-device.jpg",
  "Personal Care & Hygiene": "/images/products/genekon-ointment-tube.jpg",
};

export async function seedCatalog363() {
  logger.info("==================================================");
  logger.info("🌱 Starting Genekon 363-Product & 27-Category Seed");
  logger.info("==================================================");

  // Find CSV file
  const candidateCsvPaths = [
    "C:/Users/prave/.gemini/antigravity-ide/brain/3ca824cd-d0a6-4f35-bae1-16ba5dfd40be/.user_uploaded/media_1789031000177.csv",
    path.join(__dirname, "../../../media_1789031000177.csv"),
    path.join(process.cwd(), "../media_1789031000177.csv"),
  ];

  let csvContent = "";
  for (const p of candidateCsvPaths) {
    if (fs.existsSync(p)) {
      csvContent = fs.readFileSync(p, "utf8");
      logger.info(`Found source CSV at: ${p}`);
      break;
    }
  }

  if (!csvContent) {
    throw new Error("Could not find media_1789031000177.csv in candidate paths");
  }

  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rawProducts: RawProductRow[] = [];
  const distinctCategories = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 7) continue;
    const [name, category, composition, form, packSize, rxRequired, priceRange] = cols;
    distinctCategories.add(category);
    rawProducts.push({
      name,
      category,
      composition,
      form,
      packSize,
      prescriptionRequired: rxRequired.toUpperCase() === "Y",
      priceRange,
    });
  }

  logger.info(`Parsed ${rawProducts.length} products across ${distinctCategories.size} categories.`);

  // 1. Upsert Categories
  logger.info("\n--- STEP 1: Upserting 27 Categories ---");
  const categoryMap = new Map<string, string>(); // categoryName -> categoryId
  let catIndex = 0;

  for (const catName of Array.from(distinctCategories)) {
    catIndex++;
    const slug = generateSlug(catName);
    const catImage = CATEGORY_IMAGE_MAP[catName] || "/images/products/genekon-tablets-pack.jpg";

    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing) {
      await db
        .update(categories)
        .set({
          name: catName,
          image: catImage,
          displayOrder: catIndex,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, existing.id));
      categoryMap.set(catName, existing.id);
      logger.info(`✓ Updated category: ${catName} (${slug})`);
    } else {
      const [created] = await db
        .insert(categories)
        .values({
          name: catName,
          slug,
          image: catImage,
          displayOrder: catIndex,
          isActive: true,
        })
        .returning();
      categoryMap.set(catName, created.id);
      logger.info(`✓ Created category: ${catName} (${slug})`);
    }
  }

  // 2. Upsert 363 Products
  logger.info("\n--- STEP 2: Upserting 363 Products with Packaging Images & Inventory Batches ---");
  const usedSlugs = new Set<string>();
  let insertedCount = 0;
  let updatedCount = 0;

  for (let idx = 0; idx < rawProducts.length; idx++) {
    const p = rawProducts[idx];
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) {
      logger.error(`Missing categoryId for ${p.category}`);
      continue;
    }

    const baseSlug = generateSlug(p.name);
    let uniqueSlug = baseSlug;
    if (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${generateSlug(p.category)}`;
    }
    if (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${idx + 1}`;
    }
    usedSlugs.add(uniqueSlug);

    const brand = extractBrand(p.name);
    const { low, high } = parsePriceRange(p.priceRange);
    const mrp = high || 50;
    const sellingPrice = low || Math.round(mrp * 0.85);
    const discount = Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100));
    const gst = p.category.includes("Diagnostic") ? 18 : 12;
    const isRx = p.prescriptionRequired;
    const img = getProductImage(p.form, p.category, p.name);
    const sku = `GNK-${baseSlug.slice(0, 10).toUpperCase()}-${idx + 101}`;
    const batchNumber = `GK-2026-${idx + 201}`;

    const description = `${p.name} (${p.composition}) is a pharmaceutical-grade formulation manufactured under strict GMP compliance by Genekon Pharmaceuticals. Indicated for ${p.category.toLowerCase()} applications, providing clinical efficacy and rapid bioavailability.`;
    const usage =
      p.form.toLowerCase().includes("tablet") || p.form.toLowerCase().includes("capsule")
        ? "Take 1 unit with a glass of water after meals, or strictly as prescribed by your registered medical practitioner."
        : p.form.toLowerCase().includes("syrup")
        ? "Take 5ml to 10ml twice daily using the provided measuring cup, or as advised by your physician."
        : p.form.toLowerCase().includes("cream") || p.form.toLowerCase().includes("gel")
        ? "Apply a thin layer gently over the affected area 2 to 3 times daily. Wash hands thoroughly before and after application."
        : "Use as directed on the label or consult your healthcare specialist.";

    const precautions = isRx
      ? "Schedule H / Prescription Drug: To be sold by retail on the prescription of a Registered Medical Practitioner only. Do not exceed recommended dosage."
      : "Keep out of reach of children. If symptoms persist beyond 3 days, consult your physician immediately.";

    const storageInstructions =
      "Store below 25°C in a cool, dry place. Protect from direct heat, moisture and sunlight.";

    // Check if product exists by slug
    const [existingProd] = await db
      .select()
      .from(products)
      .where(eq(products.slug, uniqueSlug))
      .limit(1);

    let productId: string;

    if (existingProd) {
      const [updated] = await db
        .update(products)
        .set({
          name: p.name,
          brand,
          manufacturer: "Genekon Pharmaceuticals Pvt Ltd, MIDC Industrial Area, Nagpur, Maharashtra",
          categoryId,
          description,
          composition: p.composition,
          dosageForm: p.packSize || p.form,
          usage,
          precautions,
          storageInstructions,
          mrp: mrp.toFixed(2),
          sellingPrice: sellingPrice.toFixed(2),
          discount: discount.toFixed(2),
          gst: gst.toFixed(2),
          sku,
          stockQuantity: 120 + ((idx * 13) % 150),
          prescriptionRequired: isRx,
          status: "ACTIVE",
          rating: (4.2 + ((idx % 7) * 0.1)).toFixed(2),
          reviewCount: 45 + ((idx * 17) % 400),
          updatedAt: new Date(),
        })
        .where(eq(products.id, existingProd.id))
        .returning();
      productId = updated.id;
      updatedCount++;
    } else {
      const [created] = await db
        .insert(products)
        .values({
          name: p.name,
          slug: uniqueSlug,
          brand,
          manufacturer: "Genekon Pharmaceuticals Pvt Ltd, MIDC Industrial Area, Nagpur, Maharashtra",
          categoryId,
          description,
          composition: p.composition,
          dosageForm: p.packSize || p.form,
          usage,
          precautions,
          storageInstructions,
          mrp: mrp.toFixed(2),
          sellingPrice: sellingPrice.toFixed(2),
          discount: discount.toFixed(2),
          gst: gst.toFixed(2),
          sku,
          stockQuantity: 120 + ((idx * 13) % 150),
          prescriptionRequired: isRx,
          status: "ACTIVE",
          rating: (4.2 + ((idx % 7) * 0.1)).toFixed(2),
          reviewCount: 45 + ((idx * 17) % 400),
        })
        .returning();
      productId = created.id;
      insertedCount++;
    }

    // Ensure Product Image
    const [existingImg] = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .limit(1);

    if (!existingImg) {
      await db.insert(productImages).values({
        productId,
        imageUrl: img,
        altText: `${p.name} - Genekon Pharmaceuticals`,
        displayOrder: 0,
        isPrimary: true,
      });
    } else if (existingImg.imageUrl !== img) {
      await db
        .update(productImages)
        .set({ imageUrl: img, altText: `${p.name} - Genekon Pharmaceuticals` })
        .where(eq(productImages.id, existingImg.id));
    }

    // Ensure Inventory Batch
    const [existingBatch] = await db
      .select()
      .from(inventoryBatches)
      .where(eq(inventoryBatches.productId, productId))
      .limit(1);

    if (!existingBatch) {
      await db.insert(inventoryBatches).values({
        productId,
        batchNumber,
        manufacturingDate: new Date("2026-01-15T00:00:00Z"),
        expiryDate: new Date("2028-10-31T23:59:59Z"),
        quantity: 150,
        initialQuantity: 150,
        mrp: mrp.toFixed(2),
        costPrice: Math.round(sellingPrice * 0.7).toFixed(2),
        status: "IN_STOCK",
      });
    }

    if ((idx + 1) % 50 === 0 || idx === rawProducts.length - 1) {
      logger.info(`...processed ${idx + 1}/${rawProducts.length} products`);
    }
  }

  logger.info("\n==================================================");
  logger.info(`✨ Seed Completed Successfully!`);
  logger.info(`   - Categories: ${distinctCategories.size}`);
  logger.info(`   - Products Inserted: ${insertedCount}`);
  logger.info(`   - Products Updated: ${updatedCount}`);
  logger.info(`   - Total Live Products: ${insertedCount + updatedCount}`);
  logger.info("==================================================");
}

if (require.main === module) {
  seedCatalog363()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error("Failed to seed catalog:", err);
      process.exit(1);
    });
}
