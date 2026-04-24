import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user || user.role !== "RIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { status: "READY_FOR_PICKUP", riderId: null },
    include: {
      items: true,
      retailer: { select: { shopName: true, location: true } },
      student: { select: { hostel: true, roomNumber: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ orders });
}
