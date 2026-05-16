import Link from 'next/link';
import CertCard from '@/components/cert-card';
import FreeProofBadge from '@/components/free-proof-badge';
import FreeProofPanel from '@/components/free-proof-panel';
import {
  levelStyles,
  providerGradient,
  providerInitial,
} from '@/lib/certifications/format';
import { SITE_URL } from '@/lib/site';
import type { Certification } from '@/lib/certifications/schema';

interface CertDetailProps {
  certification: Certification;
  related: Certification[];
}

export default function CertDetail({ certification, related }: CertDetailProps) {
  const title = certification.shortTitle ?? certification.name;
  const courseJson = buildCourseJsonLd(certification);

  return (
    <main id="main" className="bg-aurora">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJson).replace(/</g, '\\u003c') }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600 dark:text-slate-300">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="rounded text-brand-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>{certification.provider}</li>
            <li aria-hidden="true">›</li>
            <li className="font-medium text-slate-900 dark:text-slate-100">{title}</li>
          </ol>
        </nav>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <span
                aria-hidden="true"
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-semibold text-white shadow-sm ${providerGradient(certification.provider)}`}
              >
                {providerInitial(certification.provider)}
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {certification.provider}
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                  {certification.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {certification.level ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${levelStyles(certification.level)}`}
                    >
                      {certification.level}
                    </span>
                  ) : null}
                  {certification.duration ? <InfoChip label={certification.duration} /> : null}
                  <InfoChip label={`${certification.estimatedHours} hours`} />
                  <FreeProofBadge type={certification.freeAccess.type} />
                </div>
              </div>
            </div>

            <a
              href={certification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
            >
              Open on {certification.provider}
            </a>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Guide</h2>
              <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                {certification.description}
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Outcomes</h2>
              <ul className="mt-4 space-y-3">
                {certification.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckIcon />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                Fit and prerequisites
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FitList title="Best for" items={certification.bestFor} />
                {certification.notFor ? <FitList title="Not for" items={certification.notFor} /> : null}
              </div>

              <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-5 dark:border-white/10 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    Prerequisites
                  </dt>
                  <dd className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {certification.prerequisites?.join(', ') ?? 'No formal prerequisites listed.'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                    Assessment format
                  </dt>
                  <dd className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {certification.assessmentFormat ?? 'Provider assessment details vary.'}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <FreeProofPanel freeAccess={certification.freeAccess} />
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-12" aria-labelledby="next-steps-heading">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="next-steps-heading"
                  className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50"
                >
                  Next steps
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Related guides based on tracks and skills.
                </p>
              </div>
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              >
                Browse all
              </Link>
            </div>

            <ul role="list" className="grid gap-4 md:grid-cols-3">
              {related.map((cert) => (
                <li key={cert.slug} className="h-full">
                  <CertCard certification={cert} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
      {label}
    </span>
  );
}

function FitList({ title, items }: { title: string; items: string[] }) {
  return (
    <dl className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <dt className="text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</dt>
      <dd className="mt-3">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </dd>
    </dl>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.31a1 1 0 0 1-1.42 0l-3.25-3.28a1 1 0 1 1 1.42-1.408l2.54 2.562 6.54-6.592a1 1 0 0 1 1.414-.006Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function buildCourseJsonLd(cert: Certification) {
  const payload: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: cert.name,
    description: cert.description,
    url: `${SITE_URL}/certifications/${cert.slug}`,
    sameAs: [cert.link],
    provider: {
      '@type': 'Organization',
      name: cert.provider,
    },
    educationalLevel: cert.level,
    timeRequired: cert.duration,
    teaches: cert.skills,
  };

  if (
    cert.freeAccess.type === 'free-certificate' ||
    cert.freeAccess.type === 'free-badge' ||
    cert.freeAccess.type === 'free-course-paid-certificate'
  ) {
    payload.offers = {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    };
  }

  return payload;
}
