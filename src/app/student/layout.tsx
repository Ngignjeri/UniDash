import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/AppHeader";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/student");
  if (user.role !== "STUDENT") redirect("/");

  return (
    <div>
      <AppHeader
        nav={[
          { href: "/student", label: "Browse" },
          { href: "/student/orders", label: "My Orders" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
