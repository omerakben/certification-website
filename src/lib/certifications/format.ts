import type { Certification } from '@/lib/certifications/schema';

const PROVIDER_PALETTE: Array<readonly [string, string]> = [
  ['from-blue-500', 'to-indigo-600'],
  ['from-emerald-500', 'to-teal-600'],
  ['from-fuchsia-500', 'to-purple-600'],
  ['from-amber-500', 'to-orange-600'],
  ['from-cyan-500', 'to-sky-600'],
  ['from-violet-500', 'to-indigo-600'],
  ['from-lime-500', 'to-emerald-600'],
];

export function providerGradient(provider: string): string {
  let hash = 0;
  for (let i = 0; i < provider.length; i++) {
    hash = (hash * 31 + provider.charCodeAt(i)) >>> 0;
  }
  const entry = PROVIDER_PALETTE[hash % PROVIDER_PALETTE.length] ?? PROVIDER_PALETTE[0]!;
  const [from, to] = entry;
  return `${from} ${to}`;
}

export function providerInitial(provider: string): string {
  const trimmed = provider.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function levelStyles(level: Certification['level']): string {
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

export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const d = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
