import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <div>
      <AppHeader />

      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(240,180,41,0.25),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
              Campus delivery made fast
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Your campus{" "}
              <span className="text-brand-400">essentials</span>, delivered in
              minutes.
            </h1>
            <p className="mt-4 max-w-xl text-ink-200">
              UniDash connects students, campus retailers, and student riders
              in one simple app. Order food, groceries, and supplies — or earn
              by delivering between classes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-5 py-3 text-base">
                Get started
              </Link>
              <Link href="/login" className="btn-outline border-ink-700 bg-ink-800 px-5 py-3 text-base text-white hover:bg-ink-700">
                Sign in
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md rounded-2xl bg-ink-800/60 p-6 ring-1 ring-ink-700 backdrop-blur">
              <Image
                src="/unidash-logo.png"
                alt="UniDash"
                width={800}
                height={200}
                priority
                className="h-auto w-full"
              />
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <RoleTile title="Students" desc="Order" />
                <RoleTile title="Retailers" desc="Sell" />
                <RoleTile title="Riders" desc="Earn" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-ink-900">
          One app. Three roles. Everything moves.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Feature
            title="Students"
            body="Browse campus shops, build your cart, place orders, and watch your delivery progress in real time."
            cta={{ href: "/register?role=STUDENT", label: "Order now" }}
          />
          <Feature
            title="Retailers"
            body="Add products, manage availability, accept incoming orders, and mark them ready for pickup."
            cta={{ href: "/register?role=RETAILER", label: "Open a shop" }}
          />
          <Feature
            title="Riders"
            body="See orders ready for pickup, accept the ones that work for you, and get paid per delivery."
            cta={{ href: "/register?role=RIDER", label: "Become a rider" }}
          />
        </div>
      </section>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-500 sm:px-6">
          © {new Date().getFullYear()} UniDash. Campus delivery made fast.
        </div>
      </footer>
    </div>
  );
}

function RoleTile({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg bg-ink-900/60 p-3 ring-1 ring-ink-700">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-400">
        {desc}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{title}</div>
    </div>
  );
}

function Feature({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="card p-6">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
        <span className="text-lg font-bold">{title[0]}</span>
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-600">{body}</p>
      <Link href={cta.href} className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600">
        {cta.label} →
      </Link>
    </div>
  );
}
