// app/components/Header.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/top25-advisors", label: "Top 25 Advisors" },
  { href: "/dashboard/top25-groups", label: "Top 25 Groups" },
  { href: "/dashboard/all-advisors", label: "All Advisors" },
  { href: "/dashboard/all-groups", label: "All Groups" },
  { href: "/dashboard/weekly-biz", label: "Weekly Biz" },
  { href: "/dashboard/weekly", label: "Weekly Sales" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      {/* Keep these classes IDENTICAL on server & client */}
      <div className="mx-auto max-w-[1600px] px-6 py-2.5 flex items-center justify-between">
        {/* Logo (static width/height + static sizes) */}
        <Link href="/" className="flex items-center gap-3" prefetch={false}>
          <Image
            src="/SIG-Rebranded-Logo.png"
            alt="Sound Income Group"
            width={250}      // set only width
            height={0}       // or remove height entirely
            priority
            sizes="(min-width: 1024px) 250px, 200px"
            className="h-auto w-[250px] max-w-none"
          />
        </Link>

        {/* Tabs */}
        <nav className="hidden md:flex gap-1.5">
          {tabs.map((t) => {
            // purely path-based: deterministic on server & client
            const active = pathname === t.href || pathname?.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                prefetch={false}
                className={`rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
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
