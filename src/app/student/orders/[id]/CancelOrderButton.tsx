"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm("Cancel this order?")) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED", note: "Cancelled by student" }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={cancel}
      disabled={loading}
      className="btn-ghost mt-4 w-full border border-rose-200 text-rose-700 hover:bg-rose-50"
    >
      {loading ? "Cancelling…" : "Cancel order"}
    </button>
  );
}
