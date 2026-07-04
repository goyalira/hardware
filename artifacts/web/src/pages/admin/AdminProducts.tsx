import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { productApi, categoryApi } from "@/api/services";
import type { Category, Product } from "@/types";

interface FormState {
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: string;
  discountPrice: string;
  unit: string;
  stock: string;
  isFeatured: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  category: "",
  brand: "",
  sku: "",
  price: "",
  discountPrice: "",
  unit: "each",
  stock: "0",
  isFeatured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([productApi.list({ limit: 60 }), categoryApi.list()])
      .then(([{ products }, cats]) => {
        setProducts(products);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description,
      category: typeof p.category === "string" ? p.category : p.category._id,
      brand: p.brand ?? "",
      sku: p.sku,
      price: String(p.price),
      discountPrice: p.discountPrice !== undefined ? String(p.discountPrice) : "",
      unit: p.unit,
      stock: String(p.stock),
      isFeatured: p.isFeatured,
    });
    setEditingId(p._id);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      brand: form.brand || undefined,
      sku: form.sku,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      unit: form.unit,
      stock: Number(form.stock),
      isFeatured: form.isFeatured,
    };
    try {
      if (editingId) {
        await productApi.update(editingId, payload);
      } else {
        await productApi.create(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? "Failed to save product.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await productApi.remove(id);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">{editingId ? "Edit product" : "New product"}</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <textarea
              required
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
              rows={3}
            />
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Unit (e.g. each, kit, bag)"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Discount price (optional)"
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Featured product
            </label>
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <button
              type="submit"
              className="rounded-md bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 sm:col-span-2"
            >
              {editingId ? "Save changes" : "Create product"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Loading...
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.sku}</td>
                  <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                  <td className={`px-4 py-3 ${p.stock <= p.lowStockThreshold ? "text-red-600 font-semibold" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-neutral-500 hover:text-neutral-900">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="text-neutral-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
