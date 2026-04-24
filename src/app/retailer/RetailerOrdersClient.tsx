"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPrice, type OrderStatus } from "@/lib/types";

type OrderItem = {
  id: string;
  nameSnap: string;
  quantity: number;
  priceCents: number;
};
type Order = {
  id: string;
  status: string;
  totalCents: number;
  deliveryAddr: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  student: {
    name: string | null;
    phone: string | null;
    hostel: string | null;
    roomNumber: string | null;
  } | null;
  rider: { name: string | null; phone: string | null } | null;
};

const NEXT_ACTION: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> =
  {
    PENDING: { status: "ACCEPTED", label: "Accept" },
    ACCEPTED: { status: "PREPARING", label: "Start preparing" },
    PREPARING: { status: "READY_FOR_PICKUP", label: "Mark ready for pickup" },
  };

export function RetailerOrdersClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<"active" | "all" | "done">("active");

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
          No {filter === "done" ? "completed" : filter} orders.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const next = NEXT_ACTION[order.status as OrderStatus];
  const canCancel = ["PENDING", "ACCEPTED", "PREPARING"].includes(order.status);

  async function update(status: OrderStatus, note?: string) {
    setLoading(status);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-ink-500">
            #{order.id.slice(-6).toUpperCase()} ·{" "}
            {new Date(order.createdAt).toLocaleString()}
          </div>
          <div className="mt-1 text-lg font-semibold">
            {order.student?.name ?? "Student"}
          </div>
          <div className="text-xs text-ink-500">
            {[order.student?.hostel, order.student?.roomNumber]
              .filter(Boolean)
              .join(" · ") || order.deliveryAddr}
            {order.student?.phone ? ` · ${order.student.phone}` : ""}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ul className="mt-4 space-y-1 text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between">
            <span>
              {i.quantity} × {i.nameSnap}
            </span>
            <span className="text-ink-600">
              {formatPrice(i.priceCents * i.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">Note:</span> {order.notes}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
        <span className="font-semibold">{formatPrice(order.totalCents)}</span>
        <div className="flex flex-wrap gap-2">
          {next && (
            <button
              onClick={() => update(next.status)}
              disabled={loading !== null}
              className="btn-primary text-xs"
            >
              {loading === next.status ? "Saving…" : next.label}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => update("CANCELLED", "Cancelled by retailer")}
              disabled={loading !== null}
              className="btn-ghost border border-rose-200 text-xs text-rose-700 hover:bg-rose-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
