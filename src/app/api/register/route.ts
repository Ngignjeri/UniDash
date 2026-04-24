import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["STUDENT", "RETAILER", "RIDER"]),
  hostel: z.string().optional(),
  roomNumber: z.string().optional(),
  shopName: z.string().optional(),
  shopLocation: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  if (data.role === "RETAILER" && !data.shopName) {
    return NextResponse.json({ error: "Shop name is required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name,
      phone: data.phone,
      role: data.role,
      hostel: data.role === "STUDENT" ? data.hostel : null,
      roomNumber: data.role === "STUDENT" ? data.roomNumber : null,
      riderStatus: data.role === "RIDER" ? "AVAILABLE" : null,
      retailer:
        data.role === "RETAILER"
          ? {
              create: {
                shopName: data.shopName!,
                location: data.shopLocation,
              },
            }
          : undefined,
    },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
