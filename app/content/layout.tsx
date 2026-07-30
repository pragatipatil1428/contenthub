import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-blue-500 text-white text-[10px] font-bold">
              C
            </div>
            <span className="text-sm font-bold tracking-tight">ContentHub</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/contents"
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
