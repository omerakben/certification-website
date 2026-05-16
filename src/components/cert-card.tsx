import Link from 'next/link';
import FreeProofBadge from '@/components/free-proof-badge';
import { formatDate, levelStyles, providerGradient, providerInitial } from '@/lib/certifications/format';
import type { Certification } from '@/lib/certifications/schema';

const MAX_VISIBLE_SKILLS = 5;

export default function CertCard({ certification }: { certification: Certification }) {
  const {
    provider,
    name,
    description,
    link,
    slug,
    skills,
    verifiedFreeAt,
    level,
    duration,
    freeAccess,
  } = certification;

  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflowCount = Math.max(skills.length - MAX_VISIBLE_SKILLS, 0);
  const gradient = providerGradient(provider);

  return (
    <article
      className="group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <header className="mb-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-base font-semibold text-white shadow-sm ${gradient}`}
        >
          {providerInitial(provider)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {provider}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {level ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${levelStyles(level)}`}
              >
                {level}
              </span>
            ) : null}
            <FreeProofBadge type={freeAccess.type} />
          </div>
        </div>
      </header>

      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 dark:text-gray-50">
        {name}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>

      {visibleSkills.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {visibleSkills.map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10"
            >
              {skill}
            </li>
          ))}
          {overflowCount > 0 ? (
            <li
              className="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200 dark:bg-white/[0.02] dark:text-gray-400 dark:ring-white/10"
              aria-label={`${overflowCount} more skills`}
            >
              +{overflowCount} more
            </li>
          ) : null}
        </ul>
      ) : null}

      <dl className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-600 dark:text-gray-300">
        {duration ? (
          <div className="inline-flex items-center gap-1.5">
            <ClockIcon />
            <dt className="sr-only">Duration</dt>
            <dd>{duration}</dd>
          </div>
        ) : null}
        <div className="inline-flex items-center gap-1.5">
          <CheckBadgeIcon />
          <dt className="sr-only">Verified free on</dt>
          <dd>
            Verified <time dateTime={verifiedFreeAt}>{formatDate(verifiedFreeAt)}</time>
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
        <Link
          href={`/certifications/${slug}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
          aria-label={`View CertFinder guide for ${name}`}
        >
          View guide
          <ArrowRightIcon />
        </Link>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
          aria-label={`Open ${name} on ${provider} (opens in new tab)`}
        >
          Open on {provider} ↗
        </a>
      </div>
    </article>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 12l2 2 4-4" />
      <path d="M12 3l2.5 1.8 3.1-.4 1 3 2.6 1.7-1.2 2.9.6 3-2.8 1.3-1.4 2.7-3.1-.6L12 21l-2.3-2.6-3.1.6-1.4-2.7L2.4 15l.6-3-1.2-2.9 2.6-1.7 1-3 3.1.4Z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
    >
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}
