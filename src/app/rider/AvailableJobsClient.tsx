"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/types";

type Job = {
  id: string;
  totalCents: number;
  deliveryAddr: string;
  createdAt: string;
  itemCount: number;
  retailer: { shopName: string; location: string | null };
  student: { hostel: string | null; roomNumber: string | null } | null;
};

export function AvailableJobsClient({ orders }: { orders: Job[] }) {
  const router = useRouter();
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function accept(id: string) {
    setError(null);
    setAccepting(id);
    const res = await fetch(`/api/orders/${id}/accept`, { method: "POST" });
    setAccepting(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to accept");
      return;
    }
    router.push("/rider/active");
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="card p-8 text-center text-ink-600">
        No jobs available right now. Check back in a bit!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {orders.map((o) => (
        <div key={o.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs text-ink-500">
                #{o.id.slice(-6).toUpperCase()} ·{" "}
                {new Date(o.createdAt).toLocaleTimeString()}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {o.retailer.shopName}
              </div>
              {o.retailer.location && (
                <div className="text-xs text-ink-500">
                  Pickup: {o.retailer.location}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-ink-500">Order value</div>
              <div className="font-semibold">{formatPrice(o.totalCents)}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-ink-500">Items</div>
              <div className="font-medium">{o.itemCount}</div>
            </div>
            <div>
              <div className="text-xs text-ink-500">Drop-off</div>
              <div className="font-medium">
                {[o.student?.hostel, o.student?.roomNumber]
                  .filter(Boolean)
                  .join(" · ") || o.deliveryAddr}
              </div>
            </div>
          </div>
          <button
            onClick={() => accept(o.id)}
            disabled={accepting !== null}
            className="btn-primary mt-4 w-full"
          >
            {accepting === o.id ? "Accepting…" : "Accept job"}
          </button>
        </div>
      ))}
    </div>
  );
}
