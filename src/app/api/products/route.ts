import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { available: true },
    include: { retailer: { select: { id: true, shopName: true, location: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().or(z.literal("")).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user || user.role !== "RETAILER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const retailer = await prisma.retailer.findUnique({ where: { ownerId: user.id } });
  if (!retailer) {
    return NextResponse.json({ error: "Retailer profile missing" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const product = await prisma.product.create({
    data: {
      retailerId: retailer.id,
      name: parsed.data.name,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  return NextResponse.json({ product });
}
