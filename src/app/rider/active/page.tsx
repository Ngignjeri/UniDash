import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { RiderActiveClient } from "./RiderActiveClient";

export const dynamic = "force-dynamic";

export default async function RiderActive() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const orders = await prisma.order.findMany({
    where: { riderId: user.id },
    include: {
      items: true,
      retailer: { select: { shopName: true, location: true } },
      student: {
        select: { name: true, phone: true, hostel: true, roomNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My jobs</h1>
        <p className="mt-1 text-sm text-ink-600">
          Pick up, deliver, and update status for orders you&apos;ve accepted.
        </p>
      </div>
      <RiderActiveClient
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalCents: o.totalCents,
          deliveryAddr: o.deliveryAddr,
          notes: o.notes,
          createdAt: o.createdAt.toISOString(),
          itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
          retailer: o.retailer,
          student: o.student,
        }))}
      />
    </div>
  );
}
