import type { Metadata } from 'next';
import Link from 'next/link';
import FreeProofBadge from '@/components/free-proof-badge';
import { Certifications } from '@/lib/certifications/data';
import { formatDate } from '@/lib/certifications/format';
import type { Certification } from '@/lib/certifications/schema';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'How each certification is free',
  description:
    'A verification ledger showing how each CertFinder listing can be accessed at no cost, where paid traps appear, and when each path was checked.',
  alternates: {
    canonical: '/verified',
  },
};

const GROUPS: Array<{
  type: Certification['freeAccess']['type'];
  heading: string;
}> = [
  { type: 'free-certificate', heading: 'Free certificates' },
  { type: 'free-badge', heading: 'Free badges' },
  { type: 'free-course-paid-certificate', heading: 'Free courses with paid certificate options' },
  { type: 'financial-aid', heading: 'Free with financial aid' },
  { type: 'free-learning-paid-exam', heading: 'Free learning with paid exams' },
  { type: 'free-event-voucher', heading: 'Free with event vouchers' },
];

export default function VerifiedPage() {
  return (
    <main id="main" className="bg-aurora">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            Verification ledger
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
            How each certification is free
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-700 dark:text-slate-300">
            CertFinder is not an affiliate list. Each entry documents how to access the course,
            certificate, badge, or learning path at no cost.
          </p>
          <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
            We also call out the paid trap, such as subscriptions, audit limits, exam fees, or
            voucher rules, and show when the path was last confirmed.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {GROUPS.map((group) => {
            const certs = Certifications.filter((cert) => cert.freeAccess.type === group.type);
            if (certs.length === 0) return null;

            return (
              <section key={group.type} aria-labelledby={`${group.type}-heading`}>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h2
                    id={`${group.type}-heading`}
                    className="text-xl font-semibold text-slate-950 dark:text-slate-50"
                  >
                    {group.heading}
                  </h2>
                  <FreeProofBadge type={group.type} />
                </div>

                <ul role="list" className="space-y-3">
                  {certs.map((cert) => (
                    <li
                      key={cert.slug}
                      className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                            {cert.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {cert.freeAccess.summary}
                          </p>
                          {cert.freeAccess.caveat ? (
                            <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
                              {cert.freeAccess.caveat}
                            </p>
                          ) : null}
                          <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Verified{' '}
                            <time dateTime={cert.freeAccess.verifiedAt}>
                              {formatDate(cert.freeAccess.verifiedAt)}
                            </time>
                          </p>
                        </div>

                        <Link
                          href={`/certifications/${cert.slug}`}
                          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
                        >
                          View guide
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
