import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().optional(),
});

// Who is allowed to transition to which status
const RETAILER_ALLOWED: OrderStatus[] = [
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "CANCELLED",
];
const RIDER_ALLOWED: OrderStatus[] = ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
const STUDENT_ALLOWED: OrderStatus[] = ["CANCELLED"];

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: ctx.params.id },
    include: {
      items: true,
      retailer: { select: { id: true, shopName: true, location: true, ownerId: true } },
      student: { select: { id: true, name: true, phone: true, hostel: true, roomNumber: true } },
      rider: { select: { id: true, name: true, phone: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    order.studentId === user.id ||
    order.retailer.ownerId === user.id ||
    order.riderId === user.id ||
    (user.role === "RIDER" && order.status === "READY_FOR_PICKUP" && !order.riderId);

  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ order });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { status, note } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: ctx.params.id },
    include: { retailer: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let allowed = false;
  if (user.role === "RETAILER" && order.retailer.ownerId === user.id) {
    allowed = RETAILER_ALLOWED.includes(status);
  } else if (user.role === "RIDER" && order.riderId === user.id) {
    allowed = RIDER_ALLOWED.includes(status);
  } else if (user.role === "STUDENT" && order.studentId === user.id) {
    allowed =
      STUDENT_ALLOWED.includes(status) &&
      ["PENDING", "ACCEPTED"].includes(order.status);
  }
  if (!allowed) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      events: { create: { status, note } },
    },
  });
  return NextResponse.json({ order: updated });
}
