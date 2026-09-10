import { NavCategory, Category, HealthConcern } from "@/types/product";

export const NAV_CATEGORIES: NavCategory[] = [
  {
    "id": "all",
    "name": "All Categories",
    "slug": "/categories"
  },
  {
    "id": "pain-relief-fever",
    "name": "Pain & Fever",
    "slug": "/category/pain-relief-fever"
  },
  {
    "id": "cold-cough-flu",
    "name": "Cold & Cough",
    "slug": "/category/cold-cough-flu"
  },
  {
    "id": "antibiotics",
    "name": "Antibiotics",
    "slug": "/category/antibiotics"
  },
  {
    "id": "diabetes-care",
    "name": "Diabetes Care",
    "slug": "/category/diabetes-care"
  },
  {
    "id": "cardiac-blood-pressure",
    "name": "Cardiac & BP",
    "slug": "/category/cardiac-blood-pressure"
  },
  {
    "id": "gastro-digestive",
    "name": "Gastro & Acidity",
    "slug": "/category/gastro-digestive"
  },
  {
    "id": "vitamins-supplements",
    "name": "Vitamins & Zinc",
    "slug": "/category/vitamins-supplements"
  },
  {
    "id": "skin-care-dermatology",
    "name": "Skin & Derma",
    "slug": "/category/skin-care-dermatology"
  },
  {
    "id": "ayurvedic-herbal",
    "name": "Ayurvedic & Herbal",
    "slug": "/category/ayurvedic-herbal"
  },
  {
    "id": "diagnostic-devices-health-monitors",
    "name": "Medical Devices",
    "slug": "/category/diagnostic-devices-health-monitors"
  },
  {
    "id": "offers",
    "name": "Special Offers",
    "slug": "/offers",
    "badge": "SALE",
    "isSpecial": true
  }
];

export const FEATURED_CATEGORIES: Category[] = [
  {
    "id": "pain-relief-fever",
    "name": "Pain Relief & Fever",
    "slug": "/category/pain-relief-fever",
    "itemCount": 36,
    "iconName": "Pill",
    "description": "Fast-acting paracetamol, analgesics, NSAIDs & antipyretics"
  },
  {
    "id": "cold-cough-flu",
    "name": "Cold, Cough & Flu",
    "slug": "/category/cold-cough-flu",
    "itemCount": 23,
    "iconName": "ThermometerSnowflake",
    "description": "Decongestants, non-drowsy cough syrups & soothing vaporubs"
  },
  {
    "id": "antibiotics",
    "name": "Antibiotics",
    "slug": "/category/antibiotics",
    "itemCount": 34,
    "iconName": "ShieldPlus",
    "description": "Broad-spectrum antibacterial, antifungal & antimicrobial therapies"
  },
  {
    "id": "diabetes-care",
    "name": "Diabetes Care",
    "slug": "/category/diabetes-care",
    "itemCount": 28,
    "iconName": "Activity",
    "description": "Metformin, glimepiride, insulin cartridges & blood sugar management"
  },
  {
    "id": "cardiac-blood-pressure",
    "name": "Cardiac & Blood Pressure",
    "slug": "/category/cardiac-blood-pressure",
    "itemCount": 18,
    "iconName": "Heart",
    "description": "Hypertension control, statins, beta-blockers & cardio therapeutics"
  },
  {
    "id": "gastro-digestive",
    "name": "Gastro & Digestive",
    "slug": "/category/gastro-digestive",
    "itemCount": 29,
    "iconName": "ShieldCheck",
    "description": "Antacids, proton pump inhibitors, probiotics & enzyme solutions"
  },
  {
    "id": "vitamins-supplements",
    "name": "Vitamins & Supplements",
    "slug": "/category/vitamins-supplements",
    "itemCount": 20,
    "iconName": "Apple",
    "description": "Daily multivitamins, Vitamin D3, calcium, zinc & mineral formulations"
  },
  {
    "id": "allergy-antihistamines",
    "name": "Allergy & Antihistamines",
    "slug": "/category/allergy-antihistamines",
    "itemCount": 11,
    "iconName": "Wind",
    "description": "Non-sedating cetirizine, fexofenadine & montelukast allergy relief"
  },
  {
    "id": "skin-care-dermatology",
    "name": "Skin Care & Dermatology",
    "slug": "/category/skin-care-dermatology",
    "itemCount": 23,
    "iconName": "Sparkles",
    "description": "Clinical antifungal creams, acne gels, gentle cleansers & barrier lotions"
  },
  {
    "id": "antiseptics-first-aid",
    "name": "Antiseptics & First Aid",
    "slug": "/category/antiseptics-first-aid",
    "itemCount": 12,
    "iconName": "Cross",
    "description": "Povidone iodine, antiseptic liquids, sterile cotton & adhesive bandages"
  },
  {
    "id": "womens-health",
    "name": "Women's Health",
    "slug": "/category/womens-health",
    "itemCount": 11,
    "iconName": "HeartHandshake",
    "description": "Uterine tonics, folic acid, progesterone & emergency contraceptives"
  },
  {
    "id": "respiratory-asthma",
    "name": "Respiratory & Asthma",
    "slug": "/category/respiratory-asthma",
    "itemCount": 10,
    "iconName": "Airplay",
    "description": "Metered-dose inhalers, respules, rotacaps & bronchodilators"
  },
  {
    "id": "eye-ear-care",
    "name": "Eye & Ear Care",
    "slug": "/category/eye-ear-care",
    "itemCount": 7,
    "iconName": "Eye",
    "description": "Sterile lubricating eye drops, anti-infectives & ear wax softeners"
  },
  {
    "id": "oral-care",
    "name": "Oral Care",
    "slug": "/category/oral-care",
    "itemCount": 7,
    "iconName": "Smile",
    "description": "Desensitizing toothpastes, chlorhexidine gargles & oral gels"
  },
  {
    "id": "baby-care",
    "name": "Baby Care",
    "slug": "/category/baby-care",
    "itemCount": 6,
    "iconName": "Baby",
    "description": "Pediatric colic drops, zinc barrier creams & gentle infant washes"
  },
  {
    "id": "muscle-joint-pain",
    "name": "Muscle & Joint Pain",
    "slug": "/category/muscle-joint-pain",
    "itemCount": 9,
    "iconName": "Zap",
    "description": "Deep penetrating diclofenac gels, pain relief sprays & herbal balms"
  },
  {
    "id": "ayurvedic-herbal",
    "name": "Ayurvedic & Herbal",
    "slug": "/category/ayurvedic-herbal",
    "itemCount": 12,
    "iconName": "Leaf",
    "description": "Classical Chyawanprash, Liv 52, Ashwagandha & pure herbal extracts"
  },
  {
    "id": "sexual-wellness",
    "name": "Sexual Wellness",
    "slug": "/category/sexual-wellness",
    "itemCount": 5,
    "iconName": "Flame",
    "description": "Personal health formulations, lubricants & protective essentials"
  },
  {
    "id": "steroids-anti-inflammatory",
    "name": "Steroids & Anti-inflammatory",
    "slug": "/category/steroids-anti-inflammatory",
    "itemCount": 5,
    "iconName": "ShieldAlert",
    "description": "Prescription corticosteroids for acute inflammation & allergy management"
  },
  {
    "id": "nutrition-health-drinks",
    "name": "Nutrition & Health Drinks",
    "slug": "/category/nutrition-health-drinks",
    "itemCount": 6,
    "iconName": "Coffee",
    "description": "High-protein diet powders, malts & diabetic nutritional care"
  },
  {
    "id": "thyroid-hormonal",
    "name": "Thyroid & Hormonal",
    "slug": "/category/thyroid-hormonal",
    "itemCount": 6,
    "iconName": "Clock",
    "description": "Levothyroxine and carbimazole thyroid hormone regulators"
  },
  {
    "id": "anemia-iron-supplements",
    "name": "Anemia & Iron Supplements",
    "slug": "/category/anemia-iron-supplements",
    "itemCount": 7,
    "iconName": "Droplet",
    "description": "Gentle iron, folic acid, vitamin B12 & hematinic tonics"
  },
  {
    "id": "bone-joint-health",
    "name": "Bone & Joint Health",
    "slug": "/category/bone-joint-health",
    "itemCount": 6,
    "iconName": "Bone",
    "description": "Calcium citrate malate, Vitamin D3, glucosamine & chondroitin"
  },
  {
    "id": "deworming",
    "name": "Deworming",
    "slug": "/category/deworming",
    "itemCount": 4,
    "iconName": "CheckCircle2",
    "description": "Albendazole, ivermectin & anthelmintic chewable formulations"
  },
  {
    "id": "piles-hemorrhoid-care",
    "name": "Piles & Hemorrhoid Care",
    "slug": "/category/piles-hemorrhoid-care",
    "itemCount": 4,
    "iconName": "LifeBuoy",
    "description": "Soothing anti-inflammatory anorectal ointments & herbal tablets"
  },
  {
    "id": "diagnostic-devices-health-monitors",
    "name": "Diagnostic Devices & Health Monitors",
    "slug": "/category/diagnostic-devices-health-monitors",
    "itemCount": 16,
    "iconName": "Stethoscope",
    "description": "Digital BP monitors, Accu-Chek glucometers & pulse oximeters"
  },
  {
    "id": "personal-care-hygiene",
    "name": "Personal Care & Hygiene",
    "slug": "/category/personal-care-hygiene",
    "itemCount": 8,
    "iconName": "Sparkles",
    "description": "Antibacterial handwashes, sanitary napkins, soaps & adult diapers"
  }
];

export const HEALTH_CONCERNS: HealthConcern[] = [
  {
    "id": "pain-fever",
    "title": "Pain Relief & Fever",
    "slug": "/category/pain-relief-fever",
    "description": "Paracetamol, Dolo 650, Zerodol, Combiflam & analgesics",
    "itemCount": 36,
    "iconName": "Pill",
    "badge": "Popular"
  },
  {
    "id": "cold-cough",
    "title": "Cold, Cough & Flu",
    "slug": "/category/cold-cough-flu",
    "description": "Cheston Cold, Ascoril syrup, Vicks & nasal decongestants",
    "itemCount": 23,
    "iconName": "ThermometerSnowflake",
    "badge": "Seasonal"
  },
  {
    "id": "diabetes",
    "title": "Diabetes Care",
    "slug": "/category/diabetes-care",
    "description": "Metformin, Glimepiride, Janumet & insulin pens",
    "itemCount": 28,
    "iconName": "Activity",
    "badge": "Chronic"
  },
  {
    "id": "cardiac",
    "title": "Cardiac & Blood Pressure",
    "slug": "/category/cardiac-blood-pressure",
    "description": "Telma 40, Atorva, Ecosprin & antihypertensives",
    "itemCount": 18,
    "iconName": "Heart"
  },
  {
    "id": "gastro",
    "title": "Gastro & Digestive Health",
    "slug": "/category/gastro-digestive",
    "description": "Pan 40, Omez, Digene, Gelusil & probiotics",
    "itemCount": 29,
    "iconName": "ShieldPlus"
  },
  {
    "id": "antibiotics",
    "title": "Antibiotics & Anti-infectives",
    "slug": "/category/antibiotics",
    "description": "Augmentin 625, Azithral, Taxim-O & Cifran",
    "itemCount": 34,
    "iconName": "ShieldPlus"
  },
  {
    "id": "skin-care",
    "title": "Skin & Dermatology",
    "slug": "/category/skin-care-dermatology",
    "description": "Candid, Betnovate, Acnestar & antiseptic creams",
    "itemCount": 23,
    "iconName": "Sparkles"
  },
  {
    "id": "vitamins",
    "title": "Vitamins & Supplements",
    "slug": "/category/vitamins-supplements",
    "description": "Becosules, Zincovit, Shelcal, Evion & Calcium",
    "itemCount": 20,
    "iconName": "Apple"
  }
];
