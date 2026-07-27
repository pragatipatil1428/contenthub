import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 text-white text-sm font-bold">
                CH
              </div>
              <span className="text-lg font-bold">ContentHub</span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs">
              Premium digital content marketplace. Discover, purchase, and download high-quality digital products.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/contents" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">All Content</Link></li>
              <li><Link href="/categories" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Categories</Link></li>
              <li><Link href="/trending" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Trending</Link></li>
              <li><Link href="/new-arrivals" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Account</h3>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Login</Link></li>
              <li><Link href="/signup" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Sign Up</Link></li>
              <li><Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} ContentHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
