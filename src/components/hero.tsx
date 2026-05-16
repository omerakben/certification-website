export interface HeroProps {
  providerCount: number;
  certCount: number;
  /** ISO date (YYYY-MM-DD) — the most recent verifiedFreeAt across the catalog. */
  lastVerified: string;
}

function formatLastVerified(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Hero({ providerCount, certCount, lastVerified }: HeroProps) {
  const formattedDate = formatLastVerified(lastVerified);

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
          A hand-curated index of certifications you can earn at no cost — checked weekly so the
          links keep working.
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <StatChip label={`${certCount} ${certCount === 1 ? 'cert' : 'certs'}`} />
          <StatChip label={`${providerCount} ${providerCount === 1 ? 'provider' : 'providers'}`} />
          <StatChip label={`Last verified ${formattedDate}`} />
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
