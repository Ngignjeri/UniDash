import { prisma } from "@/lib/prisma";
import { BrowseClient } from "./BrowseClient";

export default async function StudentHome() {
  const retailers = await prisma.retailer.findMany({
    include: {
      products: { where: { available: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { shopName: "asc" },
  });
  const filtered = retailers.filter((r) => r.products.length > 0);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Browse campus shops</h1>
        <p className="mt-1 text-sm text-ink-600">
          Pick a shop, add items to your cart, and place an order.
        </p>
      </div>
      <BrowseClient
        retailers={filtered.map((r) => ({
          id: r.id,
          shopName: r.shopName,
          location: r.location,
          description: r.description,
          products: r.products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            priceCents: p.priceCents,
            imageUrl: p.imageUrl,
          })),
        }))}
      />
    </div>
  );
}
