import { eq } from "drizzle-orm";
import { db, categories } from "../db";
import { generateSlug } from "../services/categoryService";
import { logger } from "../utils/logger";

interface ParentCategoryConfig {
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
  subcategories: string[];
}

const HIERARCHY: ParentCategoryConfig[] = [
  {
    name: "Medicines",
    slug: "medicines",
    image: "/images/products/genekon-tablets-pack.jpg",
    displayOrder: 1,
    subcategories: [
      "Pain Relief & Fever",
      "Cold, Cough & Flu",
      "Antibiotics",
      "Diabetes Care",
      "Cardiac & Blood Pressure",
      "Gastro & Digestive",
      "Allergy & Antihistamines",
      "Respiratory & Asthma",
      "Eye & Ear Care",
      "Steroids & Anti-inflammatory",
      "Thyroid & Hormonal",
      "Deworming",
      "Piles & Hemorrhoid Care",
    ],
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    image: "/images/products/genekon-ointment-tube.jpg",
    displayOrder: 2,
    subcategories: [
      "Antiseptics & First Aid",
      "Muscle & Joint Pain",
      "Bone & Joint Health",
      "Women's Health",
    ],
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    image: "/images/products/genekon-ointment-tube.jpg",
    displayOrder: 3,
    subcategories: [
      "Skin Care & Dermatology",
      "Personal Care & Hygiene",
      "Oral Care",
    ],
  },
  {
    name: "Vitamins & Nutrition",
    slug: "vitamins-nutrition",
    image: "/images/products/genekon-capsules-bottle.jpg",
    displayOrder: 4,
    subcategories: [
      "Vitamins & Supplements",
      "Nutrition & Health Drinks",
      "Anemia & Iron Supplements",
    ],
  },
  {
    name: "Baby Care",
    slug: "baby-care",
    image: "/images/products/genekon-syrup-bottle.jpg",
    displayOrder: 5,
    subcategories: [
      "Baby Care",
    ],
  },
  {
    name: "Ayurveda",
    slug: "ayurveda",
    image: "/images/products/genekon-health-powder.jpg",
    displayOrder: 6,
    subcategories: [
      "Ayurvedic & Herbal",
    ],
  },
  {
    name: "Medical Devices",
    slug: "medical-devices",
    image: "/images/products/genekon-diagnostic-device.jpg",
    displayOrder: 7,
    subcategories: [
      "Diagnostic Devices & Health Monitors",
    ],
  },
  {
    name: "Wellness",
    slug: "wellness",
    image: "/images/products/genekon-tablets-pack.jpg",
    displayOrder: 8,
    subcategories: [
      "Sexual Wellness",
    ],
  },
];

export async function updateCategoryHierarchy() {
  logger.info("==================================================");
  logger.info("🌿 Establishing 8 Main Category & 27 Subcategory Tree");
  logger.info("==================================================");

  for (const parent of HIERARCHY) {
    // 1. Upsert Parent Category
    let parentId: string;
    const [existingParent] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, parent.slug))
      .limit(1);

    if (existingParent) {
      await db
        .update(categories)
        .set({
          name: parent.name,
          image: parent.image,
          displayOrder: parent.displayOrder,
          parentCategoryId: null,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, existingParent.id));
      parentId = existingParent.id;
      logger.info(`✓ Parent Category Ready: ${parent.name} (${parent.slug})`);
    } else {
      const [created] = await db
        .insert(categories)
        .values({
          name: parent.name,
          slug: parent.slug,
          image: parent.image,
          displayOrder: parent.displayOrder,
          parentCategoryId: null,
          isActive: true,
        })
        .returning();
      parentId = created.id;
      logger.info(`✓ Parent Category Created: ${parent.name} (${parent.slug})`);
    }

    // 2. Link each subcategory to this parent
    let subOrder = 0;
    for (const subName of parent.subcategories) {
      subOrder++;
      const subSlug = generateSlug(subName);

      const [existingSub] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, subSlug))
        .limit(1);

      if (existingSub && existingSub.id !== parentId) {
        await db
          .update(categories)
          .set({
            parentCategoryId: parentId,
            displayOrder: subOrder,
            updatedAt: new Date(),
          })
          .where(eq(categories.id, existingSub.id));
        logger.info(`   ↳ Linked Subcategory: ${subName} -> ${parent.name}`);
      } else if (existingSub && existingSub.id === parentId) {
        await db
          .update(categories)
          .set({ parentCategoryId: null, displayOrder: parent.displayOrder })
          .where(eq(categories.id, parentId));
      } else {
        logger.warn(`   ⚠️ Subcategory with slug ${subSlug} not found in database!`);
      }
    }
  }

  // Deactivate any legacy/test categories
  await db
    .update(categories)
    .set({ isActive: false })
    .where(eq(categories.slug, "diagnostics-health"));

  logger.info("==================================================");
  logger.info("✨ Category Hierarchy successfully linked in Neon PostgreSQL!");
  logger.info("==================================================");
}

if (require.main === module) {
  updateCategoryHierarchy()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error("Failed to update hierarchy:", err);
      process.exit(1);
    });
}
