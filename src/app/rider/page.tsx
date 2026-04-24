import { prisma } from "@/lib/prisma";
import { AvailableJobsClient } from "./AvailableJobsClient";

export const dynamic = "force-dynamic";

export default async function RiderAvailable() {
  const orders = await prisma.order.findMany({
    where: { status: "READY_FOR_PICKUP", riderId: null },
    include: {
      items: true,
      retailer: { select: { shopName: true, location: true } },
      student: { select: { hostel: true, roomNumber: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available jobs</h1>
        <p className="mt-1 text-sm text-ink-600">
          Orders ready for pickup across campus. Accept one to start delivering.
        </p>
      </div>
      <AvailableJobsClient
        orders={orders.map((o) => ({
          id: o.id,
          totalCents: o.totalCents,
          deliveryAddr: o.deliveryAddr,
          createdAt: o.createdAt.toISOString(),
          itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
          retailer: o.retailer,
          student: o.student,
        }))}
      />
    </div>
  );
}
