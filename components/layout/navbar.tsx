"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/contents", label: "Browse" },
  { href: "/contents?type=VIDEO", label: "Videos" },
  { href: "/contents?type=AUDIO", label: "Audio" },
  { href: "/contents?type=PDF", label: "PDFs" },
  { href: "/contents?type=COURSE", label: "Courses" },
  { href: "/free", label: "Free" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 sm:px-6 lg:px-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
