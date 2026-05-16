"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import FreeProofBadge from '@/components/free-proof-badge';
import {
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  WEEKLY_TIME_LABELS,
  buildPlan,
  isExperience,
  isGoal,
  isWeeklyTime,
  planTotals,
  type Experience,
  type Goal,
  type WeeklyTime,
} from '@/lib/certifications/builder';
import { levelStyles } from '@/lib/certifications/format';
import type { Certification } from '@/lib/certifications/schema';

export interface PathBuilderProps {
  certifications: Certification[];
}

type ProgressState = 'started' | 'done';
type ProgressMap = Record<string, ProgressState | undefined>;

const PROGRESS_KEY = 'certfinder.progress.v1';

const GOAL_OPTIONS: Goal[] = [
  'it-support',
  'data',
  'cloud',
  'ai',
  'web',
  'marketing',
  'security',
  'foundations',
];

const TIME_OPTIONS: WeeklyTime[] = ['2', '5', '10'];
const EXPERIENCE_OPTIONS: Experience[] = ['new', 'some', 'working'];

function readProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as ProgressMap;
    }
    return {};
  } catch {
    return {};
  }
}

function writeProgress(value: ProgressMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(value));
  } catch {
    // Storage may be full or blocked; the UI keeps in-memory state regardless.
  }
}

export default function PathBuilder({ certifications }: PathBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goalParam = searchParams.get('goal');
  const timeParam = searchParams.get('time');
  const expParam = searchParams.get('exp');

  const urlGoal = isGoal(goalParam) ? goalParam : null;
  const urlTime = isWeeklyTime(timeParam) ? timeParam : null;
  const urlExp = isExperience(expParam) ? expParam : null;
  // The roadmap shows iff the URL carries a full, valid set of params. The
  // quiz only swaps to the roadmap after the user clicks "Build my path".
  const showRoadmap = urlGoal !== null && urlTime !== null && urlExp !== null;

  // Local state for the quiz form. Seeded from URL when the URL is fully set
  // so a shared link re-hydrates the same selections, otherwise empty.
  const [goal, setGoal] = useState<Goal | null>(showRoadmap ? urlGoal : null);
  const [weeklyTime, setWeeklyTime] = useState<WeeklyTime | null>(showRoadmap ? urlTime : null);
  const [experience, setExperience] = useState<Experience | null>(showRoadmap ? urlExp : null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [shareMessage, setShareMessage] = useState<string>('');

  const firstLegendRef = useRef<HTMLLegendElement | null>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goalGroupId = useId();
  const timeGroupId = useId();
  const experienceGroupId = useId();

  // Sync local form state when the URL changes to a full plan (deep link or
  // back/forward navigation between plans).
  useEffect(() => {
    if (urlGoal !== null && urlTime !== null && urlExp !== null) {
      setGoal(urlGoal);
      setWeeklyTime(urlTime);
      setExperience(urlExp);
    }
  }, [urlGoal, urlTime, urlExp]);

  // Hydrate progress from localStorage once on mount.
  useEffect(() => {
    setProgress(readProgress());
  }, []);

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const plan = useMemo(() => {
    if (!showRoadmap || !urlGoal || !urlTime || !urlExp) return [];
    return buildPlan({ goal: urlGoal, weeklyTime: urlTime, experience: urlExp }, certifications);
  }, [showRoadmap, urlGoal, urlTime, urlExp, certifications]);

  const totals = useMemo(() => planTotals(plan), [plan]);

  const canSubmit = goal !== null && weeklyTime !== null && experience !== null;

  const updateUrl = useCallback(
    (next: { goal: Goal; time: WeeklyTime; exp: Experience } | null) => {
      const params = new URLSearchParams();
      if (next) {
        params.set('goal', next.goal);
        params.set('time', next.time);
        params.set('exp', next.exp);
      }
      const query = params.toString();
      router.replace(query ? `/builder?${query}` : '/builder', { scroll: false });
    },
    [router],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!goal || !weeklyTime || !experience) return;
      updateUrl({ goal, time: weeklyTime, exp: experience });
    },
    [goal, weeklyTime, experience, updateUrl],
  );

  const handleReset = useCallback(() => {
    setGoal(null);
    setWeeklyTime(null);
    setExperience(null);
    updateUrl(null);
    // Defer focus until after the quiz re-renders.
    requestAnimationFrame(() => {
      firstLegendRef.current?.focus();
      firstLegendRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    });
  }, [updateUrl]);

  const handleProgressToggle = useCallback((slug: string) => {
    setProgress((previous) => {
      const current = previous[slug];
      // Cycle: undefined → started → done → undefined
      const nextState: ProgressState | undefined =
        current === undefined ? 'started' : current === 'started' ? 'done' : undefined;
      const nextMap = { ...previous };
      if (nextState === undefined) {
        delete nextMap[slug];
      } else {
        nextMap[slug] = nextState;
      }
      writeProgress(nextMap);
      return nextMap;
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      // Fallback: select text in a hidden input and use execCommand.
      try {
        const helper = document.createElement('input');
        helper.value = url;
        helper.setAttribute('readonly', '');
        helper.style.position = 'absolute';
        helper.style.left = '-9999px';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
        copied = true;
      } catch {
        copied = false;
      }
    }

    setShareMessage(copied ? 'Copied!' : 'Copy failed. Use your browser to copy the URL.');
    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = setTimeout(() => setShareMessage(''), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {!showRoadmap ? (
        <QuizCard
          goal={goal}
          weeklyTime={weeklyTime}
          experience={experience}
          onGoalChange={setGoal}
          onTimeChange={setWeeklyTime}
          onExperienceChange={setExperience}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          firstLegendRef={firstLegendRef}
          goalGroupId={goalGroupId}
          timeGroupId={timeGroupId}
          experienceGroupId={experienceGroupId}
        />
      ) : urlGoal !== null && urlTime !== null && urlExp !== null ? (
        <Roadmap
          goal={urlGoal}
          weeklyTime={urlTime}
          experience={urlExp}
          plan={plan}
          totals={totals}
          progress={progress}
          onProgressToggle={handleProgressToggle}
          onShare={handleShare}
          onReset={handleReset}
          shareMessage={shareMessage}
        />
      ) : null}
    </div>
  );
}

interface QuizCardProps {
  goal: Goal | null;
  weeklyTime: WeeklyTime | null;
  experience: Experience | null;
  onGoalChange: (value: Goal) => void;
  onTimeChange: (value: WeeklyTime) => void;
  onExperienceChange: (value: Experience) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  canSubmit: boolean;
  firstLegendRef: React.RefObject<HTMLLegendElement | null>;
  goalGroupId: string;
  timeGroupId: string;
  experienceGroupId: string;
}

function QuizCard(props: QuizCardProps) {
  const {
    goal,
    weeklyTime,
    experience,
    onGoalChange,
    onTimeChange,
    onExperienceChange,
    onSubmit,
    canSubmit,
    firstLegendRef,
    goalGroupId,
    timeGroupId,
    experienceGroupId,
  } = props;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="builder-heading"
      className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8"
    >
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Free Path Builder
        </p>
        <h1
          id="builder-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl"
        >
          Build my free path
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">
          Three questions, one ranked roadmap. Every cert in the result is verified free, with
          week-by-week sequencing tuned to the time you have.
        </p>
      </header>

      <fieldset
        className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-white/[0.02]"
        aria-describedby={`${goalGroupId}-hint`}
      >
        <legend
          ref={firstLegendRef}
          tabIndex={-1}
          className="px-1 text-base font-semibold text-slate-950 outline-none dark:text-slate-50"
        >
          What is your goal?
        </legend>
        <p id={`${goalGroupId}-hint`} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Pick the track that matches the role you are aiming at.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {GOAL_OPTIONS.map((value) => (
            <RadioCard
              key={value}
              name="builder-goal"
              value={value}
              label={GOAL_LABELS[value]}
              checked={goal === value}
              onChange={() => onGoalChange(value)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset
        className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-white/[0.02]"
        aria-describedby={`${timeGroupId}-hint`}
      >
        <legend className="px-1 text-base font-semibold text-slate-950 dark:text-slate-50">
          Hours per week?
        </legend>
        <p id={`${timeGroupId}-hint`} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          We use this to fit each cert into a realistic week range.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TIME_OPTIONS.map((value) => (
            <RadioCard
              key={value}
              name="builder-time"
              value={value}
              label={WEEKLY_TIME_LABELS[value]}
              checked={weeklyTime === value}
              onChange={() => onTimeChange(value)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset
        className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-white/[0.02]"
        aria-describedby={`${experienceGroupId}-hint`}
      >
        <legend className="px-1 text-base font-semibold text-slate-950 dark:text-slate-50">
          Where are you starting from?
        </legend>
        <p id={`${experienceGroupId}-hint`} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Honest answers produce a better plan. Nobody else sees this.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {EXPERIENCE_OPTIONS.map((value) => (
            <RadioCard
              key={value}
              name="builder-experience"
              value={value}
              label={EXPERIENCE_LABELS[value]}
              checked={experience === value}
              onChange={() => onExperienceChange(value)}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-white/10">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {canSubmit
            ? 'Ready to generate your roadmap.'
            : 'Pick one answer in each question to continue.'}
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:focus-visible:ring-offset-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 motion-reduce:transition-none"
        >
          Build my path
        </button>
      </div>
    </form>
  );
}

interface RadioCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

function RadioCard({ name, value, label, checked, onChange }: RadioCardProps) {
  const id = `${name}-${value}`;
  return (
    <div>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="flex min-h-[44px] cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-brand-400 hover:bg-brand-50/60 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-900 peer-checked:ring-2 peer-checked:ring-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-white/[0.06] dark:peer-checked:border-brand-400 dark:peer-checked:bg-brand-500/15 dark:peer-checked:text-brand-100 dark:peer-focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
      >
        {label}
      </label>
    </div>
  );
}

interface RoadmapProps {
  goal: Goal;
  weeklyTime: WeeklyTime;
  experience: Experience;
  plan: ReturnType<typeof buildPlan>;
  totals: { weeks: number; hours: number };
  progress: ProgressMap;
  onProgressToggle: (slug: string) => void;
  onShare: () => void;
  onReset: () => void;
  shareMessage: string;
}

function Roadmap(props: RoadmapProps) {
  const {
    goal,
    weeklyTime,
    experience,
    plan,
    totals,
    progress,
    onProgressToggle,
    onShare,
    onReset,
    shareMessage,
  } = props;

  const goalLabel = GOAL_LABELS[goal];
  const stepCount = plan.length;

  return (
    <section aria-labelledby="roadmap-heading">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your free path
        </p>
        <h1
          id="roadmap-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl"
        >
          Your free path to {goalLabel}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
          {stepCount > 0
            ? `${stepCount} ${stepCount === 1 ? 'certification' : 'certifications'} · ~${totals.weeks} weeks · ~${totals.hours} hours total`
            : 'No certifications matched this combination. Try a wider goal or a higher weekly budget.'}
        </p>
        <ul aria-label="Plan summary" className="mt-4 flex flex-wrap gap-2 text-sm">
          <PlanChip label={`Track: ${goalLabel}`} />
          <PlanChip label={`Time: ${WEEKLY_TIME_LABELS[weeklyTime]} per week`} />
          <PlanChip label={`Starting: ${EXPERIENCE_LABELS[experience]}`} />
        </ul>
      </header>

      {plan.length > 0 ? (
        <ol role="list" className="mt-10 space-y-6">
          {plan.map((step, index) => (
            <PlanStepCard
              key={step.cert.slug}
              step={step}
              position={index + 1}
              progress={progress[step.cert.slug]}
              onProgressToggle={() => onProgressToggle(step.cert.slug)}
            />
          ))}
        </ol>
      ) : null}

      <footer className="mt-12 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
            Share this plan
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Copy the link. Anyone who opens it sees the same roadmap.
          </p>
          <p
            role="status"
            aria-live="polite"
            className="mt-2 min-h-[1.25rem] text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {shareMessage}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
          >
            Share this plan
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
          >
            Try a different plan
          </button>
        </div>
      </footer>
    </section>
  );
}

function PlanChip({ label }: { label: string }) {
  return (
    <li className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
      {label}
    </li>
  );
}

interface PlanStepCardProps {
  step: ReturnType<typeof buildPlan>[number];
  position: number;
  progress: ProgressState | undefined;
  onProgressToggle: () => void;
}

function PlanStepCard({ step, position, progress, onProgressToggle }: PlanStepCardProps) {
  const { cert, weekStart, weekEnd, rationale } = step;
  const weekLabel = weekStart === weekEnd ? `Week ${weekStart}` : `Week ${weekStart}-${weekEnd}`;
  const progressLabel =
    progress === 'done' ? 'Done' : progress === 'started' ? 'Started' : 'Not started';
  const nextLabel =
    progress === undefined ? 'Mark started' : progress === 'started' ? 'Mark done' : 'Reset progress';

  return (
    <li className="relative rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white shadow-sm dark:bg-brand-500"
        >
          {position}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-400/30">
              {weekLabel}
            </span>
            <FreeProofBadge type={cert.freeAccess.type} />
            {cert.level ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${levelStyles(cert.level)}`}
              >
                {cert.level}
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-950 dark:text-slate-50">
            <Link
              href={`/certifications/${cert.slug}`}
              className="rounded text-slate-950 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-50 dark:focus-visible:ring-offset-slate-950"
            >
              {cert.name}
            </Link>
          </h2>

          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {cert.provider}
          </p>

          <p className="mt-3 text-sm italic leading-6 text-slate-700 dark:text-slate-300">
            {rationale}
          </p>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            About {cert.estimatedHours} hours of study time.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                progress === 'done'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20'
                  : progress === 'started'
                    ? 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20'
                    : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10'
              }`}
            >
              {progressLabel}
            </span>
            <button
              type="button"
              onClick={onProgressToggle}
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
              aria-label={`${nextLabel} for ${cert.name}`}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
