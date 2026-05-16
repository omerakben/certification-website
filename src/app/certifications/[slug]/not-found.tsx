import Link from 'next/link';

export default function CertificationNotFound() {
  return (
    <main id="main" className="bg-aurora">
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Guide not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          This certification guide is not available.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          The guide may have moved, or the catalog slug may be out of date.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
        >
          Browse all certifications
        </Link>
      </section>
    </main>
  );
}
