import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi, categoryApi } from "@/api/services";
import type { Category, Pagination, Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  useEffect(() => {
    categoryApi.list().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({
        search: search || undefined,
        category: category || undefined,
        sort: sort || undefined,
        page,
        limit: 12,
      })
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(p: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        {search ? `Search results for "${search}"` : "All products"}
      </h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 md:w-56">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-800">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => updateParam("category", "")}
                  className={`w-full rounded px-2 py-1 text-left hover:bg-neutral-100 ${
                    !category ? "font-semibold text-orange-600" : "text-neutral-700"
                  }`}
                >
                  All
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => updateParam("category", c._id)}
                    className={`w-full rounded px-2 py-1 text-left hover:bg-neutral-100 ${
                      category === c._id ? "font-semibold text-orange-600" : "text-neutral-700"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-neutral-500">
              {pagination ? `${pagination.total} products` : ""}
            </span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            >
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
              <option value="name">Name</option>
            </select>
          </div>

          {loading ? (
            <p className="text-neutral-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-neutral-500">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-md text-sm font-medium ${
                    p === pagination.page
                      ? "bg-neutral-900 text-white"
                      : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
