"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

/* ----------------------- Nav config ----------------------- */
const tabs = [
  { href: "/dashboard/top25-advisors", label: "Top 25 Advisors" },
  { href: "/dashboard/top25-groups", label: "Top 25 Groups" },
  { href: "/dashboard/all-advisors", label: "All Advisors" },
  { href: "/dashboard/all-groups", label: "All Groups" },
  { href: "/dashboard/weekly-biz", label: "Weekly Biz" },
  { href: "/dashboard/weekly", label: "Weekly Sales" },
];

/* --------------------- Active helpers --------------------- */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Active if pathname is exactly `href` OR starts with `${href}/` */
function useIsActive(href: string) {
  const pathname = usePathname() || "/";
  const re = new RegExp(`^${escapeRegex(href)}(?:/|$)`);
  return re.test(pathname);
}

function NavItem({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const active = useIsActive(href);
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all duration-150
        ${
          active
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
            : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
        }`}
    >
      {children}
    </Link>
  );
}

/* ------------------------- Header ------------------------- */
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-6 py-.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/SIG-Rebranded-Logo.png"
            alt="Sound Income Group"
            width={250}
            height={60}
            priority
          />
        </Link>

        {/* Tabs */}
        <nav className="hidden md:flex gap-1.5">
          {tabs.map((t) => (
            <NavItem key={t.href} href={t.href}>
              {t.label}
            </NavItem>
          ))}
        </nav>
      </div>
    </header>
  );
}
