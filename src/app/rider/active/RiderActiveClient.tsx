"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPrice, type OrderStatus } from "@/lib/types";

type Order = {
  id: string;
  status: string;
  totalCents: number;
  deliveryAddr: string;
  notes: string | null;
  createdAt: string;
  itemCount: number;
  retailer: { shopName: string; location: string | null };
  student: {
    name: string | null;
    phone: string | null;
    hostel: string | null;
    roomNumber: string | null;
  } | null;
};

const NEXT_ACTION: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> =
  {
    READY_FOR_PICKUP: { status: "PICKED_UP", label: "Mark picked up" },
    PICKED_UP: { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
    OUT_FOR_DELIVERY: { status: "DELIVERED", label: "Mark delivered" },
  };

export function RiderActiveClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<"active" | "done" | "all">("active");
  const shown = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "done")
      return ["DELIVERED", "CANCELLED"].includes(o.status);
    return !["DELIVERED", "CANCELLED"].includes(o.status);
  });

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["active", "done", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "border-brand-500 bg-brand-500 text-ink-900"
                : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
            }`}
          >
            {f === "done" ? "Completed" : f}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="card p-8 text-center text-ink-600">
          No {filter === "done" ? "completed" : filter} jobs.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => (
            <JobRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = NEXT_ACTION[order.status as OrderStatus];

  async function update(status: OrderStatus) {
    setLoading(true);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-ink-500">
            #{order.id.slice(-6).toUpperCase()}
          </div>
          <div className="mt-1 text-lg font-semibold">
            {order.retailer.shopName}
          </div>
          {order.retailer.location && (
            <div className="text-xs text-ink-500">
              Pickup: {order.retailer.location}
            </div>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-ink-500">Drop-off</div>
          <div className="text-sm font-medium">
            {[order.student?.hostel, order.student?.roomNumber]
              .filter(Boolean)
              .join(" · ") || order.deliveryAddr}
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-500">Customer</div>
          <div className="text-sm font-medium">
            {order.student?.name}
            {order.student?.phone ? ` · ${order.student.phone}` : ""}
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">Note:</span> {order.notes}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
        <div className="text-sm">
          <span className="text-ink-500">{order.itemCount} items · </span>
          <span className="font-semibold">{formatPrice(order.totalCents)}</span>
        </div>
        {next && (
          <button
            onClick={() => update(next.status)}
            disabled={loading}
            className="btn-primary text-xs"
          >
            {loading ? "Saving…" : next.label}
          </button>
        )}
      </div>
    </div>
  );
}
