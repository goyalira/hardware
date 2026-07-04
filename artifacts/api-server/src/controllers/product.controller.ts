import type { Request, Response } from "express";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    brand,
    sort,
    page = "1",
    limit = "12",
    inStock,
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category;
  }
  if (brand) {
    filter.brand = brand;
  }
  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  }
  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    filter.price = priceFilter;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    name: { name: 1 },
  };
  const sortBy = sortMap[sort] ?? { createdAt: -1 };

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(60, Math.max(1, Number(limit) || 12));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(8);
  res.json({ products });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "category",
    "name slug",
  );
  if (!product) throw new ApiError(404, "Product not found.");
  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const {
    name,
    description,
    category,
    brand,
    sku,
    price,
    discountPrice,
    unit,
    stock,
    images,
    specifications,
    isFeatured,
    lowStockThreshold,
  } = body;

  if (!name || !description || !category || !sku || price === undefined) {
    throw new ApiError(400, "name, description, category, sku, and price are required.");
  }

  const product = await Product.create({
    name,
    slug: slugify(name),
    description,
    category,
    brand,
    sku,
    price,
    discountPrice,
    unit: unit ?? "each",
    stock: stock ?? 0,
    images: images ?? [],
    specifications: specifications ?? {},
    isFeatured: Boolean(isFeatured),
    lowStockThreshold: lowStockThreshold ?? 10,
  });

  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");

  const updatable = [
    "name",
    "description",
    "category",
    "brand",
    "sku",
    "price",
    "discountPrice",
    "unit",
    "stock",
    "images",
    "specifications",
    "isFeatured",
    "isActive",
    "lowStockThreshold",
  ] as const;

  for (const field of updatable) {
    if (req.body?.[field] !== undefined) {
      (product as unknown as Record<string, unknown>)[field] = req.body[field];
    }
  }

  if (req.body?.name) {
    product.slug = slugify(req.body.name);
  }

  await product.save();
  res.json({ product });
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { stock, adjustment } = req.body ?? {};
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");

  if (stock !== undefined) {
    product.stock = Math.max(0, Number(stock));
  } else if (adjustment !== undefined) {
    product.stock = Math.max(0, product.stock + Number(adjustment));
  } else {
    throw new ApiError(400, "Provide either stock or adjustment.");
  }

  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");
  res.json({ message: "Product deleted." });
});

export const listBrands = asyncHandler(async (_req: Request, res: Response) => {
  const brands = await Product.distinct("brand", { isActive: true, brand: { $ne: null } });
  res.json({ brands: brands.filter(Boolean) });
});

export const lowStockProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  })
    .populate("category", "name slug")
    .sort({ stock: 1 });
  res.json({ products });
});
