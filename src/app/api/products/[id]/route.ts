import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative().optional(),
  available: z.boolean().optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const user = await requireUser();
  if (!user || user.role !== "RETAILER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const product = await prisma.product.findUnique({
    where: { id: ctx.params.id },
    include: { retailer: true },
  });
  if (!product || product.retailer.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: parsed.data,
  });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const user = await requireUser();
  if (!user || user.role !== "RETAILER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const product = await prisma.product.findUnique({
    where: { id: ctx.params.id },
    include: { retailer: true },
  });
  if (!product || product.retailer.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.product.delete({ where: { id: product.id } });
  return NextResponse.json({ ok: true });
}
