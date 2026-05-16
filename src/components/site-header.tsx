import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-gray-200/70 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-[var(--bg)]/70 dark:supports-[backdrop-filter]:bg-[var(--bg)]/60"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          aria-label="CertFinder home"
          className="group inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[var(--bg)]"
        >
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            CertFinder
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="#browse"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-gray-300 dark:hover:text-white dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
          >
            Browse
          </Link>
          <div className="ml-1 sm:ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}

function BrandMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-brand-500 transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
    >
      <defs>
        <linearGradient id="cf-logo" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5586f5" />
          <stop offset="100%" stopColor="#1f4cc4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#cf-logo)" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
