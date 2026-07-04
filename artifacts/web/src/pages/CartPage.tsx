import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Package } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { removeFromCart, updateQuantity } from "@/store/slices/cartSlice";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  function handleCheckout() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Your cart is empty</h1>
        <p className="mb-6 text-neutral-500">Browse the catalog to find tools and materials.</p>
        <Link to="/catalog" className="rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Your cart</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-neutral-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-neutral-400" />
                )}
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.slug}`} className="font-medium text-neutral-900 hover:text-orange-600">
                  {item.name}
                </Link>
                <p className="text-sm text-neutral-500">${item.price.toFixed(2)} / {item.unit}</p>
              </div>
              <div className="flex items-center rounded-md border border-neutral-300">
                <button
                  onClick={() =>
                    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))
                  }
                  className="p-2 hover:bg-neutral-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
                  }
                  className="p-2 hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="w-20 text-right font-semibold text-neutral-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => dispatch(removeFromCart(item.productId))}
                className="text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="w-full shrink-0 md:w-80">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-neutral-900">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="mt-4 w-full rounded-md bg-orange-500 py-3 font-semibold text-neutral-950 transition hover:bg-orange-400"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
