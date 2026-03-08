"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">DESK AI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {[
            { href: "/diagnose", label: "Diagnose" },
            { href: "/result", label: "Score" },
            { href: "/recommend", label: "Products" },
            { href: "/history", label: "History" },
            { href: "/chat", label: "Chat" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === link.href
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
