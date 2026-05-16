import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200/70 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-[var(--bg)]/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:px-6">
        <p>
          <span>&copy; {year} CertFinder.</span>{' '}
          <span className="text-gray-500 dark:text-gray-400">Curated by Ozzy.</span>
        </p>

        <nav aria-label="Footer" className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md px-2 py-1 transition-colors duration-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:text-white dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
          >
            Home
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="rounded-md p-1.5 transition-colors duration-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:text-white dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
          >
            <GitHubIcon />
          </a>
        </nav>
      </div>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.486 2 12.02c0 4.428 2.865 8.184 6.839 9.51.5.092.682-.218.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.622.069-.61.069-.61 1.004.072 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.115-4.555-4.962 0-1.096.39-1.992 1.029-2.694-.103-.253-.446-1.273.098-2.653 0 0 .84-.27 2.75 1.028A9.563 9.563 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.298 2.748-1.028 2.748-1.028.546 1.38.203 2.4.1 2.653.64.702 1.028 1.598 1.028 2.694 0 3.856-2.338 4.706-4.566 4.954.359.31.678.92.678 1.855 0 1.338-.012 2.418-.012 2.747 0 .267.18.58.688.482A10.02 10.02 0 0 0 22 12.02C22 6.486 17.523 2 12 2Z"
      />
    </svg>
  );
}
