import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentOrders() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { studentId: user.id },
    include: {
      items: true,
      retailer: { select: { shopName: true } },
      rider: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My orders</h1>
        <p className="mt-1 text-sm text-ink-600">
          Track every order and its delivery progress.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink-600">You haven&apos;t placed any orders yet.</p>
          <Link href="/student" className="btn-primary mt-4 inline-flex">
            Browse shops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/student/orders/${o.id}`}
              className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-ink-500">
                    #{o.id.slice(-6).toUpperCase()} ·{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold">{o.retailer.shopName}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="text-sm text-ink-600">
                {o.items.reduce((s, i) => s + i.quantity, 0)} items ·{" "}
                <span className="font-semibold text-ink-900">
                  {formatPrice(o.totalCents)}
                </span>
              </div>
              {o.rider && (
                <div className="text-xs text-ink-500">
                  Rider: {o.rider.name}
                  {o.rider.phone ? ` · ${o.rider.phone}` : ""}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
