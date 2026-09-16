require('dotenv').config();
const { db, products, inventoryBatches } = require('./backend/src/db');
const { sql } = require('drizzle-orm');

async function test() {
  const p = await db.select({ count: sql`count(*)::int` }).from(products);
  const b = await db.select({ count: sql`count(*)::int` }).from(inventoryBatches);
  console.log('Products:', p[0].count, 'Batches:', b[0].count);
  process.exit(0);
}
test();
