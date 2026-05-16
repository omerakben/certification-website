import Link from 'next/link';
import type { Certification } from '@/lib/certifications/schema';

const MAX_VISIBLE_SKILLS = 5;

// Stable, restrained palette for provider avatar gradients.
// Each entry is [from, to] Tailwind classes. Chosen for AA contrast against white text.
// Note: rose/pink intentionally omitted so the avatar never visually fuses with the
// rose Advanced-level chip (see audit M7).
const PROVIDER_PALETTE: Array<readonly [string, string]> = [
  ['from-blue-500', 'to-indigo-600'],
  ['from-emerald-500', 'to-teal-600'],
  ['from-fuchsia-500', 'to-purple-600'],
  ['from-amber-500', 'to-orange-600'],
  ['from-cyan-500', 'to-sky-600'],
  ['from-violet-500', 'to-indigo-600'],
  ['from-lime-500', 'to-emerald-600'],
];

function providerGradient(provider: string): string {
  // Deterministic FNV-1a-ish hash so the same provider always gets the same color.
  let hash = 0;
  for (let i = 0; i < provider.length; i++) {
    hash = (hash * 31 + provider.charCodeAt(i)) >>> 0;
  }
  const entry = PROVIDER_PALETTE[hash % PROVIDER_PALETTE.length] ?? PROVIDER_PALETTE[0]!;
  const [from, to] = entry;
  return `${from} ${to}`;
}

function providerInitial(provider: string): string {
  const trimmed = provider.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function levelStyles(level: Certification['level']): string {
  switch (level) {
    case 'Beginner':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20';
    case 'Intermediate':
      return 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20';
    case 'Advanced':
      return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20';
    default:
      return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10';
  }
}

function formatVerifiedDate(iso: string): string {
  // Render YYYY-MM-DD as a readable month/day/year without locale surprises.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function CertCard({ certification }: { certification: Certification }) {
  const {
    provider,
    name,
    description,
    link,
    skills,
    verifiedFreeAt,
    level,
    duration,
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
          {level ? (
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${levelStyles(level)}`}
            >
              {level}
            </span>
          ) : null}
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
            Verified <time dateTime={verifiedFreeAt}>{formatVerifiedDate(verifiedFreeAt)}</time>
          </dd>
        </div>
      </dl>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/80 focus-visible:ring-offset-0 dark:text-brand-300 dark:hover:text-brand-200 motion-reduce:transition-none"
          aria-label={`Learn more about ${name} (opens in new tab)`}
        >
          Learn more
          <ArrowRightIcon />
        </Link>
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
