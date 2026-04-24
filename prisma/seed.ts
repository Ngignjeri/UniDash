import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Clear existing data (for idempotent dev seeds)
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.user.deleteMany();

  const student = await prisma.user.create({
    data: {
      email: "student@uni.edu",
      passwordHash,
      name: "Aisha Student",
      phone: "+254700000001",
      role: "STUDENT",
      hostel: "Hall 8",
      roomNumber: "C-204",
    },
  });

  const retailerUser = await prisma.user.create({
    data: {
      email: "shop@uni.edu",
      passwordHash,
      name: "Sam Shopkeeper",
      phone: "+254700000002",
      role: "RETAILER",
      retailer: {
        create: {
          shopName: "Campus Bites",
          description: "Hot meals, snacks, and drinks just steps from the library.",
          location: "Student Center, Level 1",
        },
      },
    },
    include: { retailer: true },
  });

  const retailerUser2 = await prisma.user.create({
    data: {
      email: "mart@uni.edu",
      passwordHash,
      name: "Maria Mart",
      phone: "+254700000003",
      role: "RETAILER",
      retailer: {
        create: {
          shopName: "UniMart",
          description: "Groceries, toiletries, and study supplies.",
          location: "Block B, Ground Floor",
        },
      },
    },
    include: { retailer: true },
  });

  await prisma.user.create({
    data: {
      email: "rider@uni.edu",
      passwordHash,
      name: "Ryan Rider",
      phone: "+254700000004",
      role: "RIDER",
      riderStatus: "AVAILABLE",
    },
  });

  const bites = retailerUser.retailer!;
  const mart = retailerUser2.retailer!;

  await prisma.product.createMany({
    data: [
      {
        retailerId: bites.id,
        name: "Chicken Burger Combo",
        description: "Grilled chicken burger, fries, and a soda.",
        priceCents: 45000,
      },
      {
        retailerId: bites.id,
        name: "Veggie Wrap",
        description: "Hummus, grilled veg, and feta in a spinach wrap.",
        priceCents: 32000,
      },
      {
        retailerId: bites.id,
        name: "Iced Latte",
        description: "Double-shot espresso over ice with milk.",
        priceCents: 18000,
      },
      {
        retailerId: bites.id,
        name: "Chocolate Chip Muffin",
        description: "Freshly baked each morning.",
        priceCents: 9000,
      },
      {
        retailerId: mart.id,
        name: "Notebook (80 pages)",
        description: "A5 ruled, perforated.",
        priceCents: 12000,
      },
      {
        retailerId: mart.id,
        name: "Blue Pen (pack of 3)",
        description: "Smooth writing ballpoint pens.",
        priceCents: 9000,
      },
      {
        retailerId: mart.id,
        name: "Energy Bar",
        description: "Oats, almonds, and honey.",
        priceCents: 15000,
      },
      {
        retailerId: mart.id,
        name: "Instant Noodles",
        description: "Quick campus fuel.",
        priceCents: 8000,
      },
    ],
  });

  console.log("Seed complete:");
  console.log("  Student: student@uni.edu / password123");
  console.log("  Retailer: shop@uni.edu / password123");
  console.log("  Retailer: mart@uni.edu / password123");
  console.log("  Rider:    rider@uni.edu / password123");
  console.log("  (Student id:", student.id, ")");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
