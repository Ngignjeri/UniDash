"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/types";

type Product = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
};
type Retailer = {
  id: string;
  shopName: string;
  location: string | null;
  description: string | null;
  products: Product[];
};

type CartItem = { productId: string; name: string; priceCents: number; quantity: number };

export function BrowseClient({ retailers }: { retailers: Retailer[] }) {
  const router = useRouter();
  const [activeRetailerId, setActiveRetailerId] = useState<string | null>(
    retailers[0]?.id ?? null,
  );
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartRetailerId, setCartRetailerId] = useState<string | null>(null);
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRetailer = retailers.find((r) => r.id === activeRetailerId) ?? null;

  const cartTotal = useMemo(
    () =>
      Object.values(cart).reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, i) => sum + i.quantity, 0),
    [cart],
  );

  function addToCart(product: Product, retailerId: string) {
    setError(null);
    if (cartRetailerId && cartRetailerId !== retailerId) {
      setError("Cart contains items from another shop. Clear it first.");
      return;
    }
    setCartRetailerId(retailerId);
    setCart((c) => ({
      ...c,
      [product.id]: {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        quantity: (c[product.id]?.quantity ?? 0) + 1,
      },
    }));
  }

  function setQty(productId: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[productId];
      else if (next[productId]) next[productId] = { ...next[productId], quantity: qty };
      return next;
    });
  }

  function clearCart() {
    setCart({});
    setCartRetailerId(null);
    setError(null);
  }

  async function placeOrder() {
    setError(null);
    if (!deliveryAddr.trim()) {
      setError("Please enter a delivery address");
      return;
    }
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: Object.values(cart).map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        deliveryAddr,
        notes,
      }),
    });
    setPlacing(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to place order");
      return;
    }
    clearCart();
    setDeliveryAddr("");
    setNotes("");
    router.push("/student/orders");
    router.refresh();
  }

  if (retailers.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-600">
          No shops have listed products yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {retailers.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRetailerId(r.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeRetailerId === r.id
                  ? "border-brand-500 bg-brand-500 text-ink-900"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
              }`}
            >
              {r.shopName}
            </button>
          ))}
        </div>

        {activeRetailer && (
          <>
            <div className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{activeRetailer.shopName}</h2>
                  {activeRetailer.location && (
                    <p className="text-sm text-ink-500">📍 {activeRetailer.location}</p>
                  )}
                  {activeRetailer.description && (
                    <p className="mt-2 text-sm text-ink-600">
                      {activeRetailer.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeRetailer.products.map((p) => (
                <div key={p.id} className="card flex flex-col p-4">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="mb-3 h-32 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 text-3xl">
                      🛍️
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink-900">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 text-xs text-ink-500 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-ink-900">
                      {formatPrice(p.priceCents)}
                    </span>
                    <button
                      onClick={() => addToCart(p, activeRetailer.id)}
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your cart</h2>
            <span className="badge bg-ink-100 text-ink-700">{cartCount} items</span>
          </div>
          {cartCount === 0 ? (
            <p className="mt-4 text-sm text-ink-500">Add items to get started.</p>
          ) : (
            <>
              <ul className="mt-4 space-y-3">
                {Object.values(cart).map((i) => (
                  <li key={i.productId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{i.name}</div>
                      <div className="text-xs text-ink-500">
                        {formatPrice(i.priceCents)} each
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQty(i.productId, i.quantity - 1)}
                        className="h-7 w-7 rounded-md border border-ink-200 text-sm"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {i.quantity}
                      </span>
                      <button
                        onClick={() => setQty(i.productId, i.quantity + 1)}
                        className="h-7 w-7 rounded-md border border-ink-200 text-sm"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-3 border-t border-ink-100 pt-4">
                <label className="block">
                  <span className="label">Delivery address</span>
                  <input
                    className="input mt-1"
                    placeholder="Hostel name, room number, landmark"
                    value={deliveryAddr}
                    onChange={(e) => setDeliveryAddr(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label">Notes (optional)</span>
                  <textarea
                    className="input mt-1"
                    rows={2}
                    placeholder="e.g. no onions, leave at reception"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>

              {error && (
                <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-sm text-ink-600">Total</span>
                <span className="text-lg font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn-primary mt-3 w-full"
              >
                {placing ? "Placing…" : "Place order"}
              </button>
              <button onClick={clearCart} className="btn-ghost mt-2 w-full text-xs">
                Clear cart
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
