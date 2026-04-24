"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/types";

type Product = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  available: boolean;
};

export function ProductsClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(price);
    if (!name.trim()) return setError("Name is required");
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return setError("Price must be a valid number");

    setSaving(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || undefined,
        priceCents: Math.round(priceNum * 100),
        imageUrl: imageUrl.trim() || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add product");
      return;
    }
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    router.refresh();
  }

  async function toggleAvailability(id: string, available: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available }),
    });
    router.refresh();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px,1fr]">
      <form onSubmit={addProduct} className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">Add product</h2>
        <label className="block">
          <span className="label">Name</span>
          <input
            className="input mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="label">Description</span>
          <textarea
            className="input mt-1"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label">Price (KES)</span>
          <input
            className="input mt-1"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="label">Image URL (optional)</span>
          <input
            className="input mt-1"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        {error && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Adding…" : "Add product"}
        </button>
      </form>

      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="card p-8 text-center text-ink-600">
            No products yet. Add your first one →
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="card flex items-center gap-4 p-4">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-50 text-xl">
                  🛍️
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  {!p.available && (
                    <span className="badge bg-ink-100 text-ink-600">
                      Unavailable
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-xs text-ink-500">{p.description}</p>
                )}
                <div className="mt-1 text-sm font-semibold">
                  {formatPrice(p.priceCents)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => toggleAvailability(p.id, !p.available)}
                  className="btn-outline px-3 py-1 text-xs"
                >
                  {p.available ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="btn-ghost border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
