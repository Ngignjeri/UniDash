import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/types";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as { id: string; email: string; name?: string | null; role: Role };
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (!user) return null;
  if (user.role !== role) return null;
  return user;
}
