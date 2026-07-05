import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Package, Minus, Plus } from "lucide-react";
import { productApi } from "@/api/services";
import type { Category, Product } from "@/types";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/utils/currency";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productApi
      .getBySlug(slug)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10">Loading...</div>;
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-10">Product not found.</div>;

  const category = product.category as Category;
  const finalPrice = product.discountPrice ?? product.price;

  function handleAdd() {
    if (!product) return;
    dispatch(
      addToCart({
        item: {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: finalPrice,
          image: product.images[0],
          unit: product.unit,
          stock: product.stock,
        },
        quantity: qty,
      }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link to="/catalog" className="hover:text-orange-600">
          Catalog
        </Link>
        {category?.name && (
          <>
            {" / "}
            <Link to={`/catalog?category=${category._id}`} className="hover:text-orange-600">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-neutral-100">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-24 w-24 text-neutral-400" />
          )}
        </div>

        <div>
          {product.brand && <p className="mb-1 text-sm text-neutral-500">{product.brand}</p>}
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">{product.name}</h1>
          <p className="mb-4 text-xs text-neutral-500">SKU: {product.sku}</p>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-neutral-900">{formatCurrency(finalPrice)}</span>
            {product.discountPrice && (
              <span className="text-lg text-neutral-400 line-through">{formatCurrency(product.price)}</span>
            )}
            <span className="text-sm text-neutral-500">/ {product.unit}</span>
          </div>

          <p className="mb-6 text-sm text-neutral-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <p className="mb-6 text-neutral-700">{product.description}</p>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold">Specifications</h3>
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-neutral-500">{k}</dt>
                    <dd className="text-neutral-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border border-neutral-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-neutral-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="p-2 hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex-1 rounded-md bg-neutral-900 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {added ? "Added!" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}