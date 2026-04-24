import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { RetailerOrdersClient } from "./RetailerOrdersClient";

export const dynamic = "force-dynamic";

export default async function RetailerOrders() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const retailer = await prisma.retailer.findUnique({
    where: { ownerId: user.id },
  });
  if (!retailer) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-600">Retailer profile not found.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { retailerId: retailer.id },
    include: {
      items: true,
      student: {
        select: { name: true, phone: true, hostel: true, roomNumber: true },
      },
      rider: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{retailer.shopName}</h1>
        <p className="mt-1 text-sm text-ink-600">
          Accept incoming orders and mark them ready for pickup.
        </p>
      </div>
      <RetailerOrdersClient
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalCents: o.totalCents,
          deliveryAddr: o.deliveryAddr,
          notes: o.notes,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i) => ({
            id: i.id,
            nameSnap: i.nameSnap,
            quantity: i.quantity,
            priceCents: i.priceCents,
          })),
          student: o.student,
          rider: o.rider,
        }))}
      />
    </div>
  );
}
