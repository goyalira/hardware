import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import type { Product } from "@/types";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart } from "@/store/slices/cartSlice";

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const finalPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
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
      }),
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md"
    >
      <div className="flex aspect-square items-center justify-center bg-neutral-100">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package className="h-12 w-12 text-neutral-400" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand && <span className="text-xs text-neutral-500">{product.brand}</span>}
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{product.name}</h3>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="text-base font-bold text-neutral-900">${finalPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-neutral-400 line-through">${product.price.toFixed(2)}</span>
          )}
        </div>
        <span className="text-xs text-neutral-500">
          {product.stock > 0 ? `In stock · ${product.unit}` : "Out of stock"}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-2 rounded-md bg-neutral-900 py-2 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Add to cart
        </button>
      </div>
    </Link>
  );
}
