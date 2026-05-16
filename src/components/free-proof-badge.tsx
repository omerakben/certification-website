import type { Certification } from '@/lib/certifications/schema';

type FreeAccessType = Certification['freeAccess']['type'];

const BADGE_COPY: Record<FreeAccessType, { label: string; className: string }> = {
  'free-certificate': {
    label: 'Free certificate',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  },
  'free-course-paid-certificate': {
    label: 'Free course',
    className:
      'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  },
  'financial-aid': {
    label: 'Free w/ aid',
    className:
      'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  },
  'free-learning-paid-exam': {
    label: 'Free learning',
    className:
      'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  },
  'free-badge': {
    label: 'Free badge',
    className:
      'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20',
  },
  'free-event-voucher': {
    label: 'Free w/ voucher',
    className:
      'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:ring-fuchsia-400/20',
  },
};

export default function FreeProofBadge({ type }: { type: FreeAccessType }) {
  const badge = BADGE_COPY[type];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
