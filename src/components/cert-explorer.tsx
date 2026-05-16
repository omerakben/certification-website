"use client";

import { useCallback, useId, useMemo, useState } from 'react';
import CertList from './cert-list';
import type { Certification } from '@/lib/certifications/schema';

type LevelFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';
type SortMode = 'recent' | 'a-z' | 'provider';

interface CertExplorerProps {
  initialCertifications: Certification[];
}

const LEVELS: LevelFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent', label: 'Recently updated' },
  { value: 'a-z', label: 'A - Z' },
  { value: 'provider', label: 'Provider' },
];

// Inline-SVG chevrons applied via background-image so the native <select> renders
// a consistent caret across Safari/Chrome/Firefox in both color schemes.
const SELECT_CHEVRON_CLASSES =
  "appearance-none bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'><path fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/></svg>\")] bg-no-repeat bg-[right_0.75rem_center] pr-9 dark:bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23cbd5e1'><path fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/></svg>\")]";

const SELECT_BASE_CLASSES =
  "w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function EmptyIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="Empty state illustration"
      className="text-gray-300 dark:text-white/15"
    >
      <circle cx="42" cy="42" r="22" stroke="currentColor" strokeWidth="3" />
      <path
        d="M59 59l14 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M34 42h16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function compareUpdated(a: Certification, b: Certification): number {
  const av = a.lastUpdated ?? a.verifiedFreeAt ?? '';
  const bv = b.lastUpdated ?? b.verifiedFreeAt ?? '';
  if (av === bv) return 0;
  return av < bv ? 1 : -1;
}

export default function CertExplorer({ initialCertifications }: CertExplorerProps) {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<string>('All');
  const [level, setLevel] = useState<LevelFilter>('All');
  const [sort, setSort] = useState<SortMode>('recent');

  const searchId = useId();
  const providerId = useId();
  const levelId = useId();
  const sortId = useId();
  const countId = useId();

  const providers = useMemo(() => {
    const set = new Set<string>();
    for (const cert of initialCertifications) set.add(cert.provider);
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [initialCertifications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matched = initialCertifications.filter((cert) => {
      if (provider !== 'All' && cert.provider !== provider) return false;
      if (level !== 'All' && cert.level !== level) return false;
      if (q.length === 0) return true;

      if (cert.name.toLowerCase().includes(q)) return true;
      if (cert.description.toLowerCase().includes(q)) return true;
      for (const skill of cert.skills) {
        if (skill.toLowerCase().includes(q)) return true;
      }
      return false;
    });

    const sorted = matched.slice();
    if (sort === 'a-z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'provider') {
      sorted.sort((a, b) => {
        const p = a.provider.localeCompare(b.provider);
        if (p !== 0) return p;
        return a.name.localeCompare(b.name);
      });
    } else {
      sorted.sort(compareUpdated);
    }

    return sorted;
  }, [initialCertifications, query, provider, level, sort]);

  const countLabel = `${filtered.length} ${filtered.length === 1 ? 'certification' : 'certifications'}`;
  const hasActiveFilters = query.length > 0 || provider !== 'All' || level !== 'All';

  const handleReset = useCallback(() => {
    setQuery('');
    setProvider('All');
    setLevel('All');
  }, []);

  return (
    <div id="browse" className="scroll-mt-20">
      <div
        className="sticky top-16 z-20 mb-8 scroll-mt-20 rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/95"
        role="region"
        aria-label="Filter and sort certifications"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-12 md:items-end">
          <div className="col-span-2 md:col-span-5">
            <label
              htmlFor={searchId}
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Search
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 dark:text-slate-500">
                <SearchIcon />
              </span>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, description, or skill"
                aria-controls="results"
                aria-describedby={countId}
                className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              {query.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus-visible:ring-offset-[var(--bg)]"
                >
                  <ClearIcon />
                </button>
              ) : null}
            </div>
          </div>

          <div className="col-span-2 md:col-span-3">
            <label
              htmlFor={providerId}
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Provider
            </label>
            <select
              id={providerId}
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className={`${SELECT_BASE_CLASSES} ${SELECT_CHEVRON_CLASSES}`}
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor={levelId}
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Level
            </label>
            <select
              id={levelId}
              value={level}
              onChange={(e) => setLevel(e.target.value as LevelFilter)}
              className={`${SELECT_BASE_CLASSES} ${SELECT_CHEVRON_CLASSES}`}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor={sortId}
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Sort
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className={`${SELECT_BASE_CLASSES} ${SELECT_CHEVRON_CLASSES}`}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          {/* Scoped live region: only the count text re-announces. */}
          <p role="status" aria-live="polite" id={countId} className="m-0">
            {countLabel}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleReset}
              className="rounded text-brand-600 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-brand-300 dark:focus-visible:ring-offset-slate-900"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      <div id="results">
        {filtered.length > 0 ? (
          <CertList certifications={filtered} />
        ) : (
          <div
            role="status"
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/40 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]"
          >
            <EmptyIllustration />
            <h2 className="mt-5 text-base font-semibold text-gray-900 dark:text-gray-50">
              No matches
            </h2>
            <p className="mt-1 max-w-sm text-sm text-gray-600 dark:text-gray-300">
              No matches. Try clearing filters or searching a different skill.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleReset}
                className="mt-5 inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 motion-reduce:transition-none"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
