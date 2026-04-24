"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Role } from "@/lib/types";

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "STUDENT", label: "Student", description: "Browse and order from campus shops" },
  { value: "RETAILER", label: "Retailer", description: "Sell products to students" },
  { value: "RIDER", label: "Rider", description: "Deliver orders across campus" },
];

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const defaultRole = (sp.get("role") as Role | null) ?? "STUDENT";
  const [role, setRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    hostel: "",
    roomNumber: "",
    shopName: "",
    shopLocation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }
    const signin = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (signin?.error) {
      setError("Registered but failed to sign in. Please try logging in.");
      return;
    }
    if (role === "STUDENT") router.push("/student");
    else if (role === "RETAILER") router.push("/retailer");
    else router.push("/rider");
    router.refresh();
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div>
        <div className="label mb-2">I am a…</div>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`rounded-md border px-3 py-3 text-left text-xs transition-colors ${
                role === r.value
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <div className="text-sm font-semibold text-ink-900">{r.label}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-ink-500">
                {r.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Field label="Full name" required>
        <input
          className="input mt-1"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email" required>
          <input
            type="email"
            className="input mt-1"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Phone">
          <input
            className="input mt-1"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Password (min 6 characters)" required>
        <input
          type="password"
          className="input mt-1"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </Field>

      {role === "STUDENT" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Hostel / Hall">
            <input
              className="input mt-1"
              value={form.hostel}
              onChange={(e) => update("hostel", e.target.value)}
            />
          </Field>
          <Field label="Room number">
            <input
              className="input mt-1"
              value={form.roomNumber}
              onChange={(e) => update("roomNumber", e.target.value)}
            />
          </Field>
        </div>
      )}

      {role === "RETAILER" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Shop name" required>
            <input
              className="input mt-1"
              value={form.shopName}
              onChange={(e) => update("shopName", e.target.value)}
              required
            />
          </Field>
          <Field label="Shop location">
            <input
              className="input mt-1"
              value={form.shopLocation}
              onChange={(e) => update("shopLocation", e.target.value)}
            />
          </Field>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex justify-center">
          <Logo size={44} />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">Create your account</h1>
        <p className="mb-6 text-center text-sm text-ink-600">
          Join UniDash as a student, retailer, or rider.
        </p>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
