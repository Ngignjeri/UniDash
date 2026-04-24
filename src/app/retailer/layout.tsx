import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/AppHeader";

export default async function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/retailer");
  if (user.role !== "RETAILER") redirect("/");

  return (
    <div>
      <AppHeader
        nav={[
          { href: "/retailer", label: "Orders" },
          { href: "/retailer/products", label: "Products" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
