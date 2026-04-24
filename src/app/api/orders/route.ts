import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const createSchema = z.object({
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().positive() }))
    .min(1),
  deliveryAddr: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "STUDENT") {
    const orders = await prisma.order.findMany({
      where: { studentId: user.id },
      include: {
        items: true,
        retailer: { select: { shopName: true, location: true } },
        rider: { select: { name: true, phone: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  if (user.role === "RETAILER") {
    const retailer = await prisma.retailer.findUnique({ where: { ownerId: user.id } });
    if (!retailer) return NextResponse.json({ orders: [] });
    const orders = await prisma.order.findMany({
      where: { retailerId: retailer.id },
      include: {
        items: true,
        student: { select: { name: true, phone: true, hostel: true, roomNumber: true } },
        rider: { select: { name: true, phone: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  if (user.role === "RIDER") {
    const orders = await prisma.order.findMany({
      where: { riderId: user.id },
      include: {
        items: true,
        student: { select: { name: true, phone: true, hostel: true, roomNumber: true } },
        retailer: { select: { shopName: true, location: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  return NextResponse.json({ orders: [] });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can place orders" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, available: true },
  });
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Some products are unavailable" }, { status: 400 });
  }

  const retailerIds = new Set(products.map((p) => p.retailerId));
  if (retailerIds.size !== 1) {
    return NextResponse.json(
      { error: "All items must be from the same retailer" },
      { status: 400 },
    );
  }
  const retailerId = products[0].retailerId;

  const itemsData = parsed.data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      productId: product.id,
      nameSnap: product.name,
      priceCents: product.priceCents,
      quantity: item.quantity,
    };
  });
  const total = itemsData.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      studentId: user.id,
      retailerId,
      totalCents: total,
      deliveryAddr: parsed.data.deliveryAddr,
      notes: parsed.data.notes,
      status: "PENDING",
      items: { create: itemsData },
      events: { create: { status: "PENDING", note: "Order placed" } },
    },
    include: { items: true },
  });

  return NextResponse.json({ order });
}
