require("dotenv").config();
const { db, users } = require("./backend/src/db");
const { eq } = require("drizzle-orm");
const jwt = require("jsonwebtoken");

async function testPost() {
  const adminUser = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
  if (adminUser.length === 0) {
    console.log("No admin user found");
    return;
  }
  
  const token = jwt.sign(
    { id: adminUser[0].id, role: adminUser[0].role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );

  const payload = {
    name: "Test Med 2",
    brand: "Genekon",
    categoryId: "5289d3e4-c96a-499e-a828-839b3cf3a7b3",
    sku: "GNK-TEST-002",
    mrp: 100,
    sellingPrice: 80
  };

  try {
    const response = await fetch("http://localhost:5000/api/v1/products", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}

testPost();
