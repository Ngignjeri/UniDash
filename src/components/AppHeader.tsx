"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

type NavItem = { href: string; label: string };

export function AppHeader({ nav = [] }: { nav?: NavItem[] }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-900 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo size={36} variant="light" />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-ink-800 text-brand-400"
                      : "text-ink-200 hover:bg-ink-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <div className="hidden text-right text-sm sm:block">
                <div className="font-medium text-white">{session.user.name}</div>
                <div className="text-xs text-ink-300">
                  {(session.user as { role?: string }).role}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-ink-700 px-3 py-1.5 text-sm font-medium text-ink-100 hover:bg-ink-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-100 hover:bg-ink-800"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-semibold text-ink-900 hover:bg-brand-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      {nav.length > 0 && (
        <nav className="flex gap-1 overflow-x-auto border-t border-ink-800 px-4 py-2 md:hidden">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-ink-800 text-brand-400"
                    : "text-ink-200 hover:bg-ink-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
