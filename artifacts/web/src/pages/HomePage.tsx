import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Wrench, ArrowRight } from "lucide-react";
import { productApi, categoryApi } from "@/api/services";
import type { Category, Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.featured(), categoryApi.list()])
      .then(([products, cats]) => {
        setFeatured(products);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-neutral-950 text-neutral-50">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 md:py-24">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-neutral-950">
            Built for job sites
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Hardware and construction supplies for builders who don't wait.
          </h1>
          <p className="max-w-xl text-neutral-300">
            Bulk lumber, power tools, plumbing, electrical, and safety gear —
            in stock and ready for delivery or job-site pickup.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-orange-400"
          >
            Shop the catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            <Truck className="h-8 w-8 text-orange-500" />
            <div>
              <p className="font-semibold">Free shipping over $250</p>
              <p className="text-sm text-neutral-500">On most orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            <ShieldCheck className="h-8 w-8 text-orange-500" />
            <div>
              <p className="font-semibold">Trusted brands</p>
              <p className="text-sm text-neutral-500">Quality you can rely on</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            <Wrench className="h-8 w-8 text-orange-500" />
            <div>
              <p className="font-semibold">Job-site ready</p>
              <p className="text-sm text-neutral-500">Tools & materials in stock</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-4 text-xl font-bold text-neutral-900">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/catalog?category=${c._id}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 text-center transition hover:border-orange-400 hover:shadow-sm"
            >
              <span className="text-sm font-semibold text-neutral-800">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Featured products</h2>
          <Link to="/catalog" className="text-sm font-medium text-orange-600 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-neutral-500">Loading products...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
