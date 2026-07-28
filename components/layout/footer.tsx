import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-blue-500 text-white text-[10px] font-bold">
                C
              </div>
              <span className="text-sm font-semibold">ContentHub</span>
            </Link>
            <span className="text-xs text-zinc-400 hidden sm:inline">|</span>
            <p className="text-xs text-zinc-400 hidden sm:block">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <Link href="/contents" className="hover:text-zinc-700 transition-colors">Content</Link>
            <Link href="/terms" className="hover:text-zinc-700 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-700 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-zinc-700 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-1 text-center sm:hidden">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} ContentHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
