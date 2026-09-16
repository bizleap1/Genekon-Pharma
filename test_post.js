async function testPost() {
  const payload = {
    name: "Test Med",
    brand: "Genekon",
    categoryId: "5289d3e4-c96a-499e-a828-839b3cf3a7b3",
    sku: "GNK-TEST-001",
    mrp: 100,
    sellingPrice: 80
  };

  try {
    const response = await fetch("http://localhost:5000/api/v1/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
