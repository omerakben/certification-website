import Link from 'next/link';
import { formatDate } from '@/lib/certifications/format';

export interface HeroProps {
  providerCount: number;
  certCount: number;
  /** ISO date (YYYY-MM-DD), the most recent verifiedFreeAt across the catalog. */
  lastVerified: string;
}

export default function Hero({ providerCount, certCount, lastVerified }: HeroProps) {
  const formattedDate = formatDate(lastVerified);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 md:py-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
          />
          Last verified <time dateTime={lastVerified}>{formattedDate}</time>
        </p>

        <h1
          id="hero-heading"
          className="bg-gradient-to-br from-gray-900 via-brand-700 to-brand-600 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl md:text-6xl dark:from-white dark:via-brand-200 dark:to-brand-300"
        >
          Free certifications, verified.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-gray-600 sm:text-lg dark:text-gray-300">
          A hand-curated index of certifications you can earn at no cost, checked weekly so the
          links keep working.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/builder"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
          >
            Build my free path
          </Link>
          <Link
            href="#browse"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
          >
            Browse all certs
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <StatChip label={`${certCount} ${certCount === 1 ? 'cert' : 'certs'}`} />
          <StatChip label={`${providerCount} ${providerCount === 1 ? 'provider' : 'providers'}`} />
          <StatChip label={`${certCount} guides with proofs`} />
        </ul>
      </div>
    </section>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <li className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
      {label}
    </li>
  );
}
