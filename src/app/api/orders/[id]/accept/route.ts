import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const user = await requireUser();
  if (!user || user.role !== "RIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const order = await prisma.order.findUnique({ where: { id: ctx.params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "READY_FOR_PICKUP" || order.riderId) {
    return NextResponse.json({ error: "Order no longer available" }, { status: 409 });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      riderId: user.id,
      events: { create: { status: order.status, note: "Rider accepted the job" } },
    },
  });
  return NextResponse.json({ order: updated });
}
