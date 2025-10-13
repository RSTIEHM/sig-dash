"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/top25-advisors", label: "Top 25 Advisors" },
  { href: "/dashboard/top25-groups", label: "Top 25 Groups" },
  { href: "/dashboard/all-advisors", label: "All Advisors" },
  { href: "/dashboard/all-groups", label: "All Groups" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-6 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/sig-logo.png"
            alt="Sound Income Group"
            width={130} // ⬅️ smaller logo
            height={36}
            priority
          />
        </Link>

        {/* Tabs */}
        <nav className="hidden md:flex gap-1.5">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all duration-150
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
