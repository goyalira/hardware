import type { Request, Response } from "express";
import { Category } from "../models/Category";
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

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, "Category not found.");
  res.json({ category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image } = req.body ?? {};
  if (!name) throw new ApiError(400, "Category name is required.");

  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    image,
  });

  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, isActive } = req.body ?? {};
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");

  if (name !== undefined) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    throw new ApiError(409, "Cannot delete a category that has products assigned to it.");
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");

  res.json({ message: "Category deleted." });
});
