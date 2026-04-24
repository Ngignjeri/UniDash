import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPrice, ORDER_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { CancelOrderButton } from "./CancelOrderButton";

export const dynamic = "force-dynamic";

const DELIVERY_PROGRESSION: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default async function StudentOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      retailer: { select: { shopName: true, location: true } },
      rider: { select: { name: true, phone: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order || order.studentId !== user.id) notFound();

  const isCancelled = order.status === "CANCELLED";
  const currentIdx = DELIVERY_PROGRESSION.indexOf(order.status as OrderStatus);
  const canCancel = ["PENDING", "ACCEPTED"].includes(order.status);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/student/orders" className="text-sm text-ink-500 hover:text-ink-700">
          ← All orders
        </Link>
      </div>
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-ink-500">
              Order #{order.id.slice(-6).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold">{order.retailer.shopName}</h1>
            {order.retailer.location && (
              <p className="mt-1 text-sm text-ink-500">📍 {order.retailer.location}</p>
            )}
          </div>
          <StatusBadge status={order.status} />
        </div>

        {!isCancelled && (
          <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {DELIVERY_PROGRESSION.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <li
                  key={s}
                  className={`rounded-md border p-2 text-center text-[11px] font-medium ${
                    done
                      ? active
                        ? "border-brand-500 bg-brand-500 text-ink-900"
                        : "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-ink-200 bg-white text-ink-400"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-3 space-y-2">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between text-sm">
                <span>
                  {i.quantity} × {i.nameSnap}
                </span>
                <span className="font-medium">
                  {formatPrice(i.priceCents * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-ink-100 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold">Delivery</h2>
          <div className="mt-3 space-y-2 text-sm text-ink-700">
            <div>
              <span className="text-ink-500">Address: </span>
              {order.deliveryAddr}
            </div>
            {order.notes && (
              <div>
                <span className="text-ink-500">Notes: </span>
                {order.notes}
              </div>
            )}
            {order.rider ? (
              <div>
                <span className="text-ink-500">Rider: </span>
                {order.rider.name}
                {order.rider.phone ? ` · ${order.rider.phone}` : ""}
              </div>
            ) : (
              <div className="text-ink-500">Rider not yet assigned</div>
            )}
          </div>
          {canCancel && <CancelOrderButton orderId={order.id} />}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Timeline</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.events.map((ev) => {
            const s = ev.status as OrderStatus;
            const label =
              ORDER_STATUSES.includes(s) ? STATUS_LABEL[s] : ev.status;
            return (
              <li key={ev.id} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <div>
                  <div className="font-medium">{label}</div>
                  {ev.note && <div className="text-xs text-ink-500">{ev.note}</div>}
                  <div className="text-xs text-ink-400">
                    {new Date(ev.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
