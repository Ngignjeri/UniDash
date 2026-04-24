import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/AppHeader";

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/rider");
  if (user.role !== "RIDER") redirect("/");

  return (
    <div>
      <AppHeader
        nav={[
          { href: "/rider", label: "Available jobs" },
          { href: "/rider/active", label: "My jobs" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
