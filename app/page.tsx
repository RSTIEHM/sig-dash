import Image from "next/image";

export default function Home() {
  const links = [
    { title: "AUM Report", href: "/dashboard/top25-advisors" },
    { title: "Weekly Biz", href: "/dashboard/weekly-biz" }
  ];

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center">
        <div className="flex items-center justify-center py-3">
          <Image
            src="/SIG-Rebranded-Logo.png"
            alt="Sound Income Group"
            width={400}
            height={0}
            sizes="100vw"
            className="w-400 h-auto"
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm hover:shadow-md transition text-slate-700 hover:text-emerald-700 font-medium"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
