const fs = require('fs');
const path = require('path');

const csvPath = 'C:/Users/prave/.gemini/antigravity-ide/brain/3ca824cd-d0a6-4f35-bae1-16ba5dfd40be/.user_uploaded/media_1789031000177.csv';
const content = fs.readFileSync(csvPath, 'utf8');

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePriceRange(str) {
  // Handle excel date formats like Oct-15, May-15, Dec-20
  const excelDateMap = {
    'oct-15': { low: 10, high: 15 },
    'oct-20': { low: 10, high: 20 },
    'may-15': { low: 5, high: 15 },
    'dec-20': { low: 12, high: 20 },
    'dec-15': { low: 12, high: 15 },
  };

  const clean = str.trim().toLowerCase();
  if (excelDateMap[clean]) {
    return excelDateMap[clean];
  }

  const parts = clean.split('-').map(p => parseFloat(p.replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p));
  if (parts.length >= 2) {
    return { low: parts[0], high: parts[1] };
  } else if (parts.length === 1) {
    return { low: Math.round(parts[0] * 0.8), high: parts[0] };
  }
  return { low: 40, high: 50 };
}

function extractBrand(name) {
  const firstWord = name.split(' ')[0].replace(/[^a-zA-Z0-9-]/g, '');
  return firstWord || 'Genekon';
}

function getProductImage(form, category, name) {
  const f = (form || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (c.includes('eye') || c.includes('ear') || n.includes('drop') || f.includes('drop')) {
    return '/images/products/genekon-eye-drops.jpg';
  }
  if (c.includes('diagnostic') || f.includes('device') || f.includes('meter') || f.includes('monitor') || n.includes('monitor') || n.includes('glucometer')) {
    return '/images/products/genekon-diagnostic-device.jpg';
  }
  if (f.includes('inhaler') || f.includes('respule') || f.includes('spray') || f.includes('rotacap')) {
    return '/images/products/genekon-inhaler-device.jpg';
  }
  if (f.includes('cream') || f.includes('gel') || f.includes('ointment') || f.includes('lotion') || f.includes('wash') || f.includes('soap')) {
    return '/images/products/genekon-ointment-tube.jpg';
  }
  if (f.includes('syrup') || f.includes('suspension') || f.includes('liquid') || f.includes('gargle') || f.includes('oil')) {
    return '/images/products/genekon-syrup-bottle.jpg';
  }
  if (f.includes('powder') || f.includes('jar') || f.includes('paste') || f.includes('churna') || f.includes('tin') || c.includes('nutrition')) {
    return '/images/products/genekon-health-powder.jpg';
  }
  if (f.includes('capsule')) {
    return '/images/products/genekon-capsules-bottle.jpg';
  }
  return '/images/products/genekon-tablets-pack.jpg';
}

const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
const rawProducts = [];
const categoryStats = {};

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (cols.length < 7) continue;
  const [name, category, composition, form, packSize, rxRequired, priceRange] = cols;
  categoryStats[category] = (categoryStats[category] || 0) + 1;
  rawProducts.push({
    name,
    category,
    composition,
    form,
    packSize,
    prescriptionRequired: rxRequired.toUpperCase() === 'Y',
    priceRange
  });
}

console.log('Parsed total products:', rawProducts.length);
console.log('Distinct categories:', Object.keys(categoryStats).length);

// Generate Category Metadata
const categoryIconMap = {
  'Pain Relief & Fever': { icon: 'Pill', description: 'Fast-acting paracetamol, analgesics, NSAIDs & antipyretics' },
  'Cold, Cough & Flu': { icon: 'ThermometerSnowflake', description: 'Decongestants, non-drowsy cough syrups & soothing vaporubs' },
  'Antibiotics': { icon: 'ShieldPlus', description: 'Broad-spectrum antibacterial, antifungal & antimicrobial therapies' },
  'Diabetes Care': { icon: 'Activity', description: 'Metformin, glimepiride, insulin cartridges & blood sugar management' },
  'Cardiac & Blood Pressure': { icon: 'Heart', description: 'Hypertension control, statins, beta-blockers & cardio therapeutics' },
  'Gastro & Digestive': { icon: 'ShieldCheck', description: 'Antacids, proton pump inhibitors, probiotics & enzyme solutions' },
  'Vitamins & Supplements': { icon: 'Apple', description: 'Daily multivitamins, Vitamin D3, calcium, zinc & mineral formulations' },
  'Allergy & Antihistamines': { icon: 'Wind', description: 'Non-sedating cetirizine, fexofenadine & montelukast allergy relief' },
  'Skin Care & Dermatology': { icon: 'Sparkles', description: 'Clinical antifungal creams, acne gels, gentle cleansers & barrier lotions' },
  'Antiseptics & First Aid': { icon: 'Cross', description: 'Povidone iodine, antiseptic liquids, sterile cotton & adhesive bandages' },
  "Women's Health": { icon: 'HeartHandshake', description: 'Uterine tonics, folic acid, progesterone & emergency contraceptives' },
  'Respiratory & Asthma': { icon: 'Airplay', description: 'Metered-dose inhalers, respules, rotacaps & bronchodilators' },
  'Eye & Ear Care': { icon: 'Eye', description: 'Sterile lubricating eye drops, anti-infectives & ear wax softeners' },
  'Oral Care': { icon: 'Smile', description: 'Desensitizing toothpastes, chlorhexidine gargles & oral gels' },
  'Baby Care': { icon: 'Baby', description: 'Pediatric colic drops, zinc barrier creams & gentle infant washes' },
  'Muscle & Joint Pain': { icon: 'Zap', description: 'Deep penetrating diclofenac gels, pain relief sprays & herbal balms' },
  'Ayurvedic & Herbal': { icon: 'Leaf', description: 'Classical Chyawanprash, Liv 52, Ashwagandha & pure herbal extracts' },
  'Sexual Wellness': { icon: 'Flame', description: 'Personal health formulations, lubricants & protective essentials' },
  'Steroids & Anti-inflammatory': { icon: 'ShieldAlert', description: 'Prescription corticosteroids for acute inflammation & allergy management' },
  'Nutrition & Health Drinks': { icon: 'Coffee', description: 'High-protein diet powders, malts & diabetic nutritional care' },
  'Thyroid & Hormonal': { icon: 'Clock', description: 'Levothyroxine and carbimazole thyroid hormone regulators' },
  'Anemia & Iron Supplements': { icon: 'Droplet', description: 'Gentle iron, folic acid, vitamin B12 & hematinic tonics' },
  'Bone & Joint Health': { icon: 'Bone', description: 'Calcium citrate malate, Vitamin D3, glucosamine & chondroitin' },
  'Deworming': { icon: 'CheckCircle2', description: 'Albendazole, ivermectin & anthelmintic chewable formulations' },
  'Piles & Hemorrhoid Care': { icon: 'LifeBuoy', description: 'Soothing anti-inflammatory anorectal ointments & herbal tablets' },
  'Diagnostic Devices & Health Monitors': { icon: 'Stethoscope', description: 'Digital BP monitors, Accu-Chek glucometers & pulse oximeters' },
  'Personal Care & Hygiene': { icon: 'Sparkles', description: 'Antibacterial handwashes, sanitary napkins, soaps & adult diapers' },
};

// Build products array
const fullProducts = rawProducts.map((p, idx) => {
  const id = `prod-${idx + 1}`;
  const slug = slugify(p.name);
  const catSlug = slugify(p.category);
  const brand = extractBrand(p.name);
  const { low, high } = parsePriceRange(p.priceRange);
  const mrp = high || 50;
  const sellingPrice = low || Math.round(mrp * 0.85);
  const discount = Math.round(((mrp - sellingPrice) / mrp) * 100);
  const img = getProductImage(p.form, p.category, p.name);
  const isRx = p.prescriptionRequired;

  const description = `${p.name} (${p.composition}) is a pharmaceutical-grade formulation manufactured under strict GMP compliance by Genekon Pharmaceuticals. Indicated for ${p.category.toLowerCase()} applications, providing clinical efficacy and rapid bioavailability.`;
  const usage = p.form.toLowerCase().includes('tablet') || p.form.toLowerCase().includes('capsule')
    ? 'Take 1 unit with a glass of water after meals, or strictly as prescribed by your registered medical practitioner.'
    : p.form.toLowerCase().includes('syrup')
    ? 'Take 5ml to 10ml twice daily using the provided measuring cup, or as advised by your physician.'
    : p.form.toLowerCase().includes('cream') || p.form.toLowerCase().includes('gel')
    ? 'Apply a thin layer gently over the affected area 2 to 3 times daily. Wash hands thoroughly before and after application.'
    : 'Use as directed on the label or consult your healthcare specialist.';

  const precautions = isRx
    ? 'Schedule H / Prescription Drug: To be sold by retail on the prescription of a Registered Medical Practitioner only. Do not exceed recommended dosage.'
    : 'Keep out of reach of children. If symptoms persist beyond 3 days, consult your physician immediately.';

  return {
    id,
    name: p.name,
    genericName: p.composition,
    brand,
    manufacturer: 'Genekon Pharmaceuticals Pvt Ltd, MIDC Industrial Area, Nagpur, Maharashtra',
    category: p.category,
    subCategory: p.form,
    price: sellingPrice,
    sellingPrice,
    mrp,
    originalPrice: mrp,
    discount,
    discountPercent: discount,
    gst: p.category.includes('Diagnostic') ? 18 : 12,
    sku: `GNK-${slug.slice(0, 8).toUpperCase()}-${idx + 101}`,
    batchNumber: `GK-2026-${idx + 201}`,
    expiryDate: '10/2028',
    rating: Number((4.3 + ((idx % 7) * 0.1)).toFixed(1)),
    reviewCount: 45 + ((idx * 17) % 400),
    stockStatus: 'In Stock',
    stockQuantity: 120 + ((idx * 13) % 150),
    quantity: 1,
    prescriptionRequired: isRx,
    inStock: true,
    composition: p.composition,
    description,
    usage,
    precautions,
    storageInstructions: 'Store below 25°C in a dry place. Protect from direct heat, moisture and sunlight.',
    image: img,
    images: [img],
    dosageForm: p.form,
    packSize: p.packSize,
    tag: idx < 20 ? 'Bestseller' : isRx ? 'Prescription Required' : 'OTC Certified',
    variants: [
      { id: `v-${id}-1`, name: p.packSize, price: sellingPrice, mrp, stock: 120 + ((idx * 13) % 150) }
    ]
  };
});

console.log('Processed full products count:', fullProducts.length);

// 1. Write frontend products.ts
const productsFileContent = `import { Product } from "@/types/product";

export const ALL_PRODUCTS: Product[] = ${JSON.stringify(fullProducts, null, 2)};

export const REFERENCE_PRODUCTS: Product[] = ALL_PRODUCTS.slice(0, 8);
export const SAMPLE_PRODUCTS: Product[] = ALL_PRODUCTS;
export const POPULAR_PRODUCTS: Product[] = ALL_PRODUCTS.slice(0, 12);
export const WELLNESS_PRODUCTS: Product[] = ALL_PRODUCTS.filter(
  (p) =>
    p.category.toLowerCase().includes("vitamin") ||
    p.category.toLowerCase().includes("ayurvedic") ||
    p.category.toLowerCase().includes("nutrition")
);
`;

fs.writeFileSync('frontend/src/data/products.ts', productsFileContent, 'utf8');
console.log('Updated frontend/src/data/products.ts successfully!');

// 2. Build Category Objects for frontend
const categoryList = Object.entries(categoryStats).map(([name, count], index) => {
  const slug = slugify(name);
  const meta = categoryIconMap[name] || { icon: 'Pill', description: 'Quality healthcare products' };
  return {
    id: slug,
    name,
    slug: `/category/${slug}`,
    itemCount: count,
    iconName: meta.icon,
    description: meta.description,
  };
});

// Build NAV_CATEGORIES
const navCategories = [
  { id: 'all', name: 'All Categories', slug: '/categories' },
  { id: 'pain-relief-fever', name: 'Pain & Fever', slug: '/category/pain-relief-fever' },
  { id: 'cold-cough-flu', name: 'Cold & Cough', slug: '/category/cold-cough-flu' },
  { id: 'antibiotics', name: 'Antibiotics', slug: '/category/antibiotics' },
  { id: 'diabetes-care', name: 'Diabetes Care', slug: '/category/diabetes-care' },
  { id: 'cardiac-blood-pressure', name: 'Cardiac & BP', slug: '/category/cardiac-blood-pressure' },
  { id: 'gastro-digestive', name: 'Gastro & Acidity', slug: '/category/gastro-digestive' },
  { id: 'vitamins-supplements', name: 'Vitamins & Zinc', slug: '/category/vitamins-supplements' },
  { id: 'skin-care-dermatology', name: 'Skin & Derma', slug: '/category/skin-care-dermatology' },
  { id: 'ayurvedic-herbal', name: 'Ayurvedic & Herbal', slug: '/category/ayurvedic-herbal' },
  { id: 'diagnostic-devices-health-monitors', name: 'Medical Devices', slug: '/category/diagnostic-devices-health-monitors' },
  { id: 'offers', name: 'Special Offers', slug: '/offers', badge: 'SALE', isSpecial: true },
];

// Build HEALTH_CONCERNS linked to real categories
const healthConcerns = [
  {
    id: 'pain-fever',
    title: 'Pain Relief & Fever',
    slug: '/category/pain-relief-fever',
    description: 'Paracetamol, Dolo 650, Zerodol, Combiflam & analgesics',
    itemCount: categoryStats['Pain Relief & Fever'] || 36,
    iconName: 'Pill',
    badge: 'Popular',
  },
  {
    id: 'cold-cough',
    title: 'Cold, Cough & Flu',
    slug: '/category/cold-cough-flu',
    description: 'Cheston Cold, Ascoril syrup, Vicks & nasal decongestants',
    itemCount: categoryStats['Cold, Cough & Flu'] || 23,
    iconName: 'ThermometerSnowflake',
    badge: 'Seasonal',
  },
  {
    id: 'diabetes',
    title: 'Diabetes Care',
    slug: '/category/diabetes-care',
    description: 'Metformin, Glimepiride, Janumet & insulin pens',
    itemCount: categoryStats['Diabetes Care'] || 28,
    iconName: 'Activity',
    badge: 'Chronic',
  },
  {
    id: 'cardiac',
    title: 'Cardiac & Blood Pressure',
    slug: '/category/cardiac-blood-pressure',
    description: 'Telma 40, Atorva, Ecosprin & antihypertensives',
    itemCount: categoryStats['Cardiac & Blood Pressure'] || 18,
    iconName: 'Heart',
  },
  {
    id: 'gastro',
    title: 'Gastro & Digestive Health',
    slug: '/category/gastro-digestive',
    description: 'Pan 40, Omez, Digene, Gelusil & probiotics',
    itemCount: categoryStats['Gastro & Digestive'] || 29,
    iconName: 'ShieldPlus',
  },
  {
    id: 'antibiotics',
    title: 'Antibiotics & Anti-infectives',
    slug: '/category/antibiotics',
    description: 'Augmentin 625, Azithral, Taxim-O & Cifran',
    itemCount: categoryStats['Antibiotics'] || 34,
    iconName: 'ShieldPlus',
  },
  {
    id: 'skin-care',
    title: 'Skin & Dermatology',
    slug: '/category/skin-care-dermatology',
    description: 'Candid, Betnovate, Acnestar & antiseptic creams',
    itemCount: categoryStats['Skin Care & Dermatology'] || 23,
    iconName: 'Sparkles',
  },
  {
    id: 'vitamins',
    title: 'Vitamins & Supplements',
    slug: '/category/vitamins-supplements',
    description: 'Becosules, Zincovit, Shelcal, Evion & Calcium',
    itemCount: categoryStats['Vitamins & Supplements'] || 20,
    iconName: 'Apple',
  },
];

const categoriesFileContent = `import { NavCategory, Category, HealthConcern } from "@/types/product";

export const NAV_CATEGORIES: NavCategory[] = ${JSON.stringify(navCategories, null, 2)};

export const FEATURED_CATEGORIES: Category[] = ${JSON.stringify(categoryList, null, 2)};

export const HEALTH_CONCERNS: HealthConcern[] = ${JSON.stringify(healthConcerns, null, 2)};
`;

fs.writeFileSync('frontend/src/data/categories.ts', categoriesFileContent, 'utf8');
console.log('Updated frontend/src/data/categories.ts successfully!');
