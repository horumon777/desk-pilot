"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getStorageItem } from "@/lib/storage";
import { STORAGE_KEYS, UserProfile } from "@/types";

export function Header() {
  const pathname = usePathname();
  const [hasProfile, setHasProfile] = useState(true); // default true to avoid flash

  useEffect(() => {
    const profile = getStorageItem<UserProfile | null>(
      STORAGE_KEYS.USER_PROFILE,
      null
    );
    setHasProfile(!!profile && !!profile.ageRange);
  }, []);

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

          {/* Profile link with notification dot */}
          <Link
            href="/profile"
            className={`relative px-2 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === "/profile"
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
            aria-label="プロフィール"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {!hasProfile && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
