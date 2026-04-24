import Image from "next/image";
import Link from "next/link";

export function Logo({
  size = 40,
  href = "/",
  variant = "dark",
}: {
  size?: number;
  href?: string | null;
  variant?: "dark" | "light" | "mark";
}) {
  const content = (
    <div className="flex items-center gap-2.5">
      <Image
        src="/unidash-logo.png"
        alt="UniDash"
        width={size * 4}
        height={size}
        priority
        className="hidden h-10 w-auto sm:block"
        style={{ height: size, width: "auto" }}
      />
      <div className="flex items-center gap-2 sm:hidden">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-ink-900">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 13l9-7 9 7M5 12v7a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={`text-lg font-extrabold tracking-tight ${
            variant === "light" ? "text-white" : "text-ink-900"
          }`}
        >
          Uni<span className="text-brand-500">Dash</span>
        </span>
      </div>
    </div>
  );
  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
