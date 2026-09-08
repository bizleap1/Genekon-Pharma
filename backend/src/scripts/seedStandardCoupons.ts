import { db, coupons } from "../db";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

const STANDARD_COUPONS = [
  {
    code: "GENEKON20",
    description: "20% OFF on all medicines & health essentials (Min Order ₹499)",
    discountType: "PERCENTAGE",
    discountValue: "20.00",
    minOrderValue: "499.00",
    maxDiscount: "300.00",
    isActive: true,
    expiryDate: new Date("2030-12-31T23:59:59Z"),
  },
  {
    code: "FIRSTMED",
    description: "Flat ₹150 OFF on your first healthcare order (Min Order ₹699)",
    discountType: "FIXED",
    discountValue: "150.00",
    minOrderValue: "699.00",
    maxDiscount: null,
    isActive: true,
    expiryDate: new Date("2030-12-31T23:59:59Z"),
  },
  {
    code: "BULK500",
    description: "Flat ₹500 OFF on wellness & bulk medicine packs (Min Order ₹2,999)",
    discountType: "FIXED",
    discountValue: "500.00",
    minOrderValue: "2999.00",
    maxDiscount: null,
    isActive: true,
    expiryDate: new Date("2030-12-31T23:59:59Z"),
  },
  {
    code: "MONSOON10",
    description: "10% OFF on monsoon immunity and OTC remedies (Min Order ₹299)",
    discountType: "PERCENTAGE",
    discountValue: "10.00",
    minOrderValue: "299.00",
    maxDiscount: "100.00",
    isActive: true,
    expiryDate: new Date("2030-12-31T23:59:59Z"),
  },
];

export async function seedStandardCoupons() {
  console.log("Seeding standard coupons into Neon PostgreSQL...");

  for (const c of STANDARD_COUPONS) {
    const [existing] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, c.code))
      .limit(1);

    if (existing) {
      await db
        .update(coupons)
        .set({
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minOrderValue: c.minOrderValue,
          maxDiscount: c.maxDiscount,
          isActive: true,
          expiryDate: c.expiryDate,
          updatedAt: new Date(),
        })
        .where(eq(coupons.id, existing.id));
      console.log(`✓ Updated coupon: ${c.code}`);
    } else {
      await db.insert(coupons).values(c);
      console.log(`✓ Created coupon: ${c.code}`);
    }
  }

  console.log("Standard coupons seeded successfully!");
}

if (require.main === module) {
  seedStandardCoupons()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed coupons:", err);
      process.exit(1);
    });
}
