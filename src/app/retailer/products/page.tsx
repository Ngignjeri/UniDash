import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function RetailerProducts() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const retailer = await prisma.retailer.findUnique({
    where: { ownerId: user.id },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  if (!retailer) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-600">Retailer profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="mt-1 text-sm text-ink-600">
          Manage the items your shop offers to students.
        </p>
      </div>
      <ProductsClient
        products={retailer.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          imageUrl: p.imageUrl,
          available: p.available,
        }))}
      />
    </div>
  );
}
