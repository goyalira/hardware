import { connectDatabase } from "../config/db";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { User } from "../models/User";
import mongoose from "mongoose";
import { logger } from "../lib/logger";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seed() {
  await connectDatabase();

  const existingAdmin = await User.findOne({ email: "admin@ironpoint.com" });
  if (!existingAdmin) {
    await User.create({
      name: "Store Admin",
      email: "admin@ironpoint.com",
      password: "Admin123!",
      role: "admin",
      phone: "555-010-0000",
    });
    logger.info("Created admin user: admin@ironpoint.com / Admin123!");
  }

  const categoryDefs = [
    { name: "Power Tools", description: "Drills, saws, grinders and more" },
    { name: "Hand Tools", description: "Wrenches, hammers, pliers and screwdrivers" },
    { name: "Building Materials", description: "Lumber, cement, drywall and insulation" },
    { name: "Plumbing", description: "Pipes, fittings, valves and fixtures" },
    { name: "Electrical", description: "Wiring, outlets, breakers and lighting" },
    { name: "Fasteners & Hardware", description: "Screws, bolts, nails and anchors" },
    { name: "Paint & Supplies", description: "Paint, primer, brushes and rollers" },
    { name: "Safety Equipment", description: "Helmets, gloves, goggles and vests" },
  ];

  const categories: Record<string, mongoose.Types.ObjectId> = {};
  for (const def of categoryDefs) {
    const slug = slugify(def.name);
    let category = await Category.findOne({ slug });
    if (!category) {
      category = await Category.create({ ...def, slug });
      logger.info(`Created category: ${def.name}`);
    }
    categories[def.name] = category._id;
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const productDefs = [
      {
        name: "18V Cordless Drill Driver Kit",
        category: "Power Tools",
        brand: "TorqueMax",
        sku: "PWR-DRILL-18V",
        price: 129.99,
        discountPrice: 109.99,
        unit: "kit",
        stock: 42,
        description:
          "Compact 18V brushless drill driver with two batteries, fast charger, and 30-piece bit set. Ideal for framing, decking, and general job-site work.",
        specifications: { Voltage: "18V", Chuck: "1/2 in", Weight: "3.4 lbs" },
        isFeatured: true,
        images: [],
      },
      {
        name: "7-1/4 in Circular Saw",
        category: "Power Tools",
        brand: "TorqueMax",
        sku: "PWR-SAW-CIRC",
        price: 89.5,
        unit: "each",
        stock: 30,
        description: "15-amp circular saw with laser guide and dust blower for clean, accurate cuts through framing lumber and sheet goods.",
        specifications: { Blade: "7-1/4 in", Amperage: "15A" },
        isFeatured: true,
        images: [],
      },
      {
        name: "20 oz Steel Framing Hammer",
        category: "Hand Tools",
        brand: "IronGrip",
        sku: "HND-HAMMER-20",
        price: 24.99,
        unit: "each",
        stock: 85,
        description: "Forged steel framing hammer with milled face and magnetic nail starter. Shock-reducing rubber grip.",
        specifications: { Weight: "20 oz", Handle: "Fiberglass" },
        images: [],
      },
      {
        name: "12-Piece Combination Wrench Set",
        category: "Hand Tools",
        brand: "IronGrip",
        sku: "HND-WRENCH-12",
        price: 44.0,
        unit: "set",
        stock: 60,
        description: "SAE combination wrench set, chrome vanadium steel, sizes 1/4 in to 1 in, with storage rack.",
        specifications: { Material: "Chrome Vanadium", Pieces: "12" },
        images: [],
      },
      {
        name: "Premium Kiln-Dried 2x4 Stud (8 ft)",
        category: "Building Materials",
        brand: "TimberCo",
        sku: "BLD-2X4-8FT",
        price: 6.75,
        unit: "per stud",
        stock: 500,
        description: "Kiln-dried SPF stud for interior framing. Straight grain, low moisture content, ready to use.",
        specifications: { Length: "8 ft", Grade: "Stud Grade" },
        isFeatured: true,
        images: [],
      },
      {
        name: "Portland Cement (94 lb bag)",
        category: "Building Materials",
        brand: "SolidBase",
        sku: "BLD-CEMENT-94",
        price: 14.25,
        unit: "per bag",
        stock: 220,
        description: "Type I/II Portland cement for concrete, mortar, and stucco mixes. All-purpose construction grade.",
        specifications: { Weight: "94 lb", Type: "I/II" },
        images: [],
      },
      {
        name: "1/2 in Drywall Sheet (4x8)",
        category: "Building Materials",
        brand: "SolidBase",
        sku: "BLD-DRYWALL-12",
        price: 13.5,
        unit: "per sheet",
        stock: 150,
        description: "Standard 1/2 in gypsum drywall panel for interior walls and ceilings.",
        specifications: { Thickness: "1/2 in", Size: "4x8 ft" },
        images: [],
      },
      {
        name: "PVC Pipe 1/2 in (10 ft)",
        category: "Plumbing",
        brand: "FlowTech",
        sku: "PLM-PVC-12",
        price: 5.4,
        unit: "per length",
        stock: 180,
        description: "Schedule 40 PVC pipe for cold water supply lines and drainage applications.",
        specifications: { Diameter: "1/2 in", Length: "10 ft" },
        images: [],
      },
      {
        name: "Brass Ball Valve 3/4 in",
        category: "Plumbing",
        brand: "FlowTech",
        sku: "PLM-VALVE-34",
        price: 11.99,
        unit: "each",
        stock: 95,
        description: "Full-port brass ball valve rated for potable water, gas, and general shutoff applications.",
        specifications: { Size: "3/4 in", Material: "Brass" },
        images: [],
      },
      {
        name: "12 AWG Romex Wire (250 ft)",
        category: "Electrical",
        brand: "VoltLine",
        sku: "ELC-WIRE-12",
        price: 89.99,
        unit: "per roll",
        stock: 40,
        description: "NM-B copper electrical wire for residential branch circuits, 20-amp rated.",
        specifications: { Gauge: "12 AWG", Length: "250 ft" },
        isFeatured: true,
        images: [],
      },
      {
        name: "20-Amp Single Pole Breaker",
        category: "Electrical",
        brand: "VoltLine",
        sku: "ELC-BREAKER-20",
        price: 8.75,
        unit: "each",
        stock: 130,
        description: "Standard single-pole circuit breaker compatible with most residential panels.",
        specifications: { Amperage: "20A", Poles: "1" },
        images: [],
      },
      {
        name: "3 in Deck Screws (5 lb box)",
        category: "Fasteners & Hardware",
        brand: "FastenPro",
        sku: "FST-SCREW-3",
        price: 22.5,
        unit: "per box",
        stock: 110,
        description: "Corrosion-resistant coated deck screws with sharp point for fast driving into treated lumber.",
        specifications: { Length: "3 in", Coating: "Ceramic" },
        images: [],
      },
      {
        name: "Concrete Wedge Anchors 1/2 in (25-pack)",
        category: "Fasteners & Hardware",
        brand: "FastenPro",
        sku: "FST-ANCHOR-12",
        price: 18.0,
        unit: "per pack",
        stock: 75,
        description: "Zinc-plated wedge anchors for securing structural elements to concrete and masonry.",
        specifications: { Diameter: "1/2 in", Pack: "25" },
        images: [],
      },
      {
        name: "Exterior Acrylic Paint (1 Gallon)",
        category: "Paint & Supplies",
        brand: "ColorGuard",
        sku: "PNT-EXT-GAL",
        price: 42.99,
        unit: "per gallon",
        stock: 65,
        description: "Weather-resistant acrylic exterior paint with UV protection, low-VOC formula.",
        specifications: { Volume: "1 gal", Finish: "Satin" },
        images: [],
      },
      {
        name: "9 in Paint Roller Kit",
        category: "Paint & Supplies",
        brand: "ColorGuard",
        sku: "PNT-ROLLER-9",
        price: 15.25,
        unit: "kit",
        stock: 90,
        description: "Complete roller kit with tray, roller frame, and two nap covers for smooth wall finishes.",
        specifications: { Size: "9 in" },
        images: [],
      },
      {
        name: "ANSI Hard Hat with Ratchet Suspension",
        category: "Safety Equipment",
        brand: "GuardWear",
        sku: "SFT-HELMET-01",
        price: 19.99,
        unit: "each",
        stock: 100,
        description: "Type I Class C hard hat with adjustable ratchet suspension for job-site head protection.",
        specifications: { Standard: "ANSI Z89.1" },
        images: [],
      },
      {
        name: "Cut-Resistant Work Gloves (Pair)",
        category: "Safety Equipment",
        brand: "GuardWear",
        sku: "SFT-GLOVES-01",
        price: 12.5,
        unit: "per pair",
        stock: 140,
        description: "ANSI cut level A4 work gloves with textured grip palm for handling sharp materials safely.",
        specifications: { CutLevel: "A4" },
        images: [],
      },
      {
        name: "Safety Glasses with Anti-Fog Coating",
        category: "Safety Equipment",
        brand: "GuardWear",
        sku: "SFT-GLASSES-01",
        price: 7.99,
        unit: "each",
        stock: 200,
        description: "Impact-resistant polycarbonate lenses with anti-fog and anti-scratch coating.",
        specifications: { Standard: "ANSI Z87.1" },
        images: [],
      },
      {
        name: "Reciprocating Saw with Case",
        category: "Power Tools",
        brand: "TorqueMax",
        sku: "PWR-RECIP-01",
        price: 99.0,
        unit: "each",
        stock: 25,
        description: "Variable-speed reciprocating saw for demolition, plumbing, and remodeling work. Includes blade set and carry case.",
        specifications: { Strokes: "0-3000 SPM" },
        images: [],
      },
      {
        name: "Digital Angle Finder & Level",
        category: "Hand Tools",
        brand: "IronGrip",
        sku: "HND-LEVEL-DIG",
        price: 34.99,
        unit: "each",
        stock: 50,
        description: "Digital angle finder with magnetic base and backlit display for precise measurements.",
        specifications: { Range: "0-360deg" },
        images: [],
      },
    ];

    for (const def of productDefs) {
      const { category, ...rest } = def;
      await Product.create({
        ...rest,
        slug: slugify(rest.name),
        category: categories[category],
        lowStockThreshold: 15,
      });
    }
    logger.info(`Seeded ${productDefs.length} products.`);
  }

  logger.info("Seed complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
