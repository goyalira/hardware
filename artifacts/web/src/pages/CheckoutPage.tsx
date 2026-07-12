import { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/utils/currency";
import { useNavigate } from "react-router-dom";
import { orderApi, paymentApi } from "@/api/services";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { clearCart } from "@/store/slices/cartSlice";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const justOrderedRef = useRef(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  useEffect(() => {
    if (items.length === 0 && !justOrderedRef.current) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  function extractErrorMessage(err: unknown): string {
    const message =
      typeof err === "object" && err !== null && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
    return message ?? "Failed to place order. Please try again.";
  }

  async function handleCardPayment(orderItems: { productId: string; quantity: number }[]) {
    const razorpayOrder = await paymentApi.createRazorpayOrder(orderItems);

    const razorpay = new window.Razorpay({
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.razorpayOrderId,
      name: "IronPoint Hardware",
      description: "Order payment",
      prefill: {
        name: form.fullName,
        contact: form.phone,
        email: user?.email,
      },
      theme: { color: "#f97316" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const order = await paymentApi.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: orderItems,
            shippingAddress: form,
          });
          justOrderedRef.current = true;
          navigate(`/orders/${order._id}`);
          dispatch(clearCart());
        } catch (err) {
          setError(extractErrorMessage(err));
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
        },
      },
    });

    razorpay.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setSubmitting(false);
    });

    razorpay.open();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const orderItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    try {
      if (paymentMethod === "card") {
        await handleCardPayment(orderItems);
        // submitting stays true until the Razorpay modal closes or succeeds
      } else {
        const order = await orderApi.create({
          items: orderItems,
          shippingAddress: form,
          paymentMethod,
        });
        justOrderedRef.current = true;
        navigate(`/orders/${order._id}`);
        dispatch(clearCart());
      }
    } catch (err) {
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Checkout</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          <div>
            <h2 className="mb-3 font-semibold text-neutral-900">Shipping address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Street address"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-neutral-900">Payment method</h2>
            <div className="space-y-2 text-sm">
              {[
                { value: "cash_on_delivery", label: "Cash on delivery" },
                { value: "card", label: "Credit / debit card / UPI / Wallet" },
                { value: "bank_transfer", label: "Bank transfer" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-orange-500 py-3 font-semibold text-neutral-950 transition hover:bg-orange-400 disabled:opacity-60"
          >
            {submitting ? "Processing..." : `Place order · ${formatCurrency(total)}`}
          </button>
        </form>

        <div className="w-full shrink-0 md:w-80">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-neutral-900">Order summary</h2>
            <ul className="mb-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between">
                  <span className="text-neutral-600">
                    {i.name} x{i.quantity}
                  </span>
                  <span>{formatCurrency(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-neutral-200 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}