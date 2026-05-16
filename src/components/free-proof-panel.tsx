import type { Certification } from '@/lib/certifications/schema';
import { formatDate } from '@/lib/certifications/format';
import FreeProofBadge from '@/components/free-proof-badge';

type FreeAccess = Certification['freeAccess'];

export default function FreeProofPanel({ freeAccess }: { freeAccess: FreeAccess }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3">
        <FreeProofBadge type={freeAccess.type} />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Free access proof</p>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-6 text-slate-950 dark:text-slate-50">
        {freeAccess.summary}
      </h3>

      <ol className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
        {freeAccess.steps.map((step) => (
          <li key={step} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-400/20">
              {freeAccess.steps.indexOf(step) + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {freeAccess.caveat ? (
        <div
          role="note"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200"
        >
          {freeAccess.caveat}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm dark:border-white/10">
        <p className="text-slate-600 dark:text-slate-400">
          Last verified{' '}
          <time dateTime={freeAccess.verifiedAt}>{formatDate(freeAccess.verifiedAt)}</time>
        </p>
        <a
          href={freeAccess.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-[var(--bg)] motion-reduce:transition-none"
        >
          View free-access source
        </a>
      </div>
    </aside>
  );
}
