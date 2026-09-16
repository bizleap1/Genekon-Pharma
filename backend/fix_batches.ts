require('dotenv').config();
const { db, products, inventoryBatches } = require('./src/db');
const { sql, eq, notExists } = require('drizzle-orm');

async function fixMissingBatches() {
  try {
    const missingBatchProducts = await db
      .select()
      .from(products)
      .where(
        notExists(
          db.select().from(inventoryBatches).where(eq(inventoryBatches.productId, products.id))
        )
      );

    console.log(`Found ${missingBatchProducts.length} products with missing batches.`);

    let count = 0;
    for (const p of missingBatchProducts) {
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      await db.insert(inventoryBatches).values({
        productId: p.id,
        batchNumber: `BATCH-RECOVER-${Date.now().toString().slice(-6)}-${count}`,
        manufacturingDate: now,
        expiryDate: oneYearFromNow,
        quantity: p.stockQuantity,
        initialQuantity: p.stockQuantity,
        mrp: p.mrp,
        status: p.stockQuantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      });
      count++;
    }
    
    console.log(`Successfully recovered ${count} missing batches!`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

fixMissingBatches();
