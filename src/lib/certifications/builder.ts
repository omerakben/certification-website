import type { Certification } from './schema';

/**
 * Pure planning logic for the Free Path Builder.
 *
 * Given a goal track, weekly time budget, and experience level, this returns
 * a 3-5 step roadmap of certifications drawn from the catalog. The shape is
 * deterministic so the same URL params produce the same plan when shared.
 */

export type Goal =
  | 'it-support'
  | 'data'
  | 'cloud'
  | 'ai'
  | 'web'
  | 'marketing'
  | 'security'
  | 'foundations';

export type WeeklyTime = '2' | '5' | '10';
export type Experience = 'new' | 'some' | 'working';

export interface PlanInput {
  goal: Goal;
  weeklyTime: WeeklyTime;
  experience: Experience;
}

export interface PlanStep {
  cert: Certification;
  weekStart: number;
  weekEnd: number;
  rationale: string;
}

export const GOAL_LABELS: Record<Goal, string> = {
  'it-support': 'IT Support',
  data: 'Data & Analytics',
  cloud: 'Cloud',
  ai: 'AI & Machine Learning',
  web: 'Web Development',
  marketing: 'Marketing',
  security: 'Security',
  foundations: 'Foundations',
};

export const WEEKLY_TIME_LABELS: Record<WeeklyTime, string> = {
  '2': '2 hours',
  '5': '5 hours',
  '10': '10 hours',
};

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  new: 'New to the field',
  some: 'Some exposure',
  working: 'Working professional',
};

const GOAL_VALUES: Goal[] = [
  'it-support',
  'data',
  'cloud',
  'ai',
  'web',
  'marketing',
  'security',
  'foundations',
];
const WEEKLY_TIME_VALUES: WeeklyTime[] = ['2', '5', '10'];
const EXPERIENCE_VALUES: Experience[] = ['new', 'some', 'working'];

export function isGoal(value: string | null | undefined): value is Goal {
  return value != null && (GOAL_VALUES as string[]).includes(value);
}

export function isWeeklyTime(value: string | null | undefined): value is WeeklyTime {
  return value != null && (WEEKLY_TIME_VALUES as string[]).includes(value);
}

export function isExperience(value: string | null | undefined): value is Experience {
  return value != null && (EXPERIENCE_VALUES as string[]).includes(value);
}

interface ScoredCert {
  cert: Certification;
  score: number;
}

function levelMatchesExperience(
  level: Certification['level'],
  experience: Experience,
): boolean {
  if (!level) return false;
  if (experience === 'new') return level === 'Beginner';
  if (experience === 'some') return level === 'Beginner' || level === 'Intermediate';
  return level === 'Intermediate' || level === 'Advanced';
}

function passesExperienceFilter(
  level: Certification['level'],
  experience: Experience,
): boolean {
  // experience=new excludes Advanced certs entirely.
  if (experience === 'new' && level === 'Advanced') return false;
  return true;
}

function fitsTimeBudget(cert: Certification, weeklyTime: WeeklyTime): boolean {
  const hoursPerWeek = Number(weeklyTime);
  return cert.estimatedHours / hoursPerWeek <= 12;
}

/**
 * Hand-tuned rationale lines per cert slug. These are the share artifact, so
 * they read as editorial sentences instead of formulaic descriptions.
 */
const SLUG_RATIONALE: Record<string, string> = {
  'google-it-support':
    'Coursera financial aid covers it, and the help-desk reps in the labs sound like the team you will join.',
  'azure-fundamentals':
    'AZ-900 is the lowest-cost way to learn Azure vocabulary before any paid certification path.',
  'aws-cloud-practitioner-essentials':
    'Free Skill Builder course plus a digital badge, ideal before you spend on the CLF-C02 exam.',
  'aws-cloud-quest-cloud-practitioner':
    'Scenario-based AWS practice that locks in the services you just studied.',
  'azure-ai-fundamentals':
    'Microsoft Learn modules give you AI vocabulary that recruiters expect on an entry-level resume.',
  'google-ai-essentials':
    'A short Coursera path that turns daily AI tools into a workplace skill you can defend in an interview.',
  'anthropic-courses':
    'Free notebooks from Anthropic teach prompting and tool use the way production teams actually use Claude.',
  'openai-academy':
    'OpenAI Academy fills the gaps between consumer ChatGPT and real API workflows.',
  'deeplearning-ai-chatgpt-prompt-engineering':
    'A 90-minute DeepLearning.AI course that gets you writing developer-grade prompts.',
  'ibm-ai-fundamentals':
    'IBM SkillsBuild gives you a free digital credential and a capstone you can show on LinkedIn.',
  'google-data-analytics':
    'A structured analytics path with financial aid that takes you from spreadsheets to SQL and R.',
  'ibm-data-science':
    'Python, SQL, and a portfolio capstone, the natural next step after a Google analytics path.',
  'harvard-cs50':
    'CS50 free audit closes the gaps in computer science fundamentals that a bootcamp never quite covers.',
  'freecodecamp-responsive-web-design':
    'Five real projects, fully free, and the credential is gated on shipping work instead of watching lessons.',
  'freecodecamp-javascript-algorithms':
    'The follow-on freeCodeCamp track that turns HTML/CSS muscle into actual JavaScript reps.',
  'hubspot-inbound-marketing':
    'A four-hour HubSpot Academy certification that gives your portfolio a recognized marketing credential.',
  'power-platform-fundamentals':
    'PL-900 frames Power Apps, Automate, and BI together, which is how business teams actually use them.',
  'google-cybersecurity':
    'A Coursera financial-aid path that walks you from Linux basics through SIEM tools and incident response.',
};

function rationaleFor(cert: Certification, input: PlanInput, position: number): string {
  const editorial = SLUG_RATIONALE[cert.slug];
  if (editorial) return editorial;

  const goalLabel = GOAL_LABELS[input.goal];
  if (position === 0) {
    return `Starts your ${goalLabel.toLowerCase()} path with vocabulary you will reuse in every later step.`;
  }
  return `Layers onto the earlier steps and stays inside your ${input.weeklyTime}-hour weekly budget.`;
}

export function buildPlan(input: PlanInput, certs: Certification[]): PlanStep[] {
  const { goal, weeklyTime, experience } = input;
  const hoursPerWeek = Number(weeklyTime);

  const candidates = certs.filter(
    (cert) =>
      cert.tracks.includes(goal) && passesExperienceFilter(cert.level, experience),
  );

  if (candidates.length === 0) return [];

  // Score each candidate using the rules in the spec. Existing position in
  // the array breaks score ties for deterministic ordering.
  const scored: ScoredCert[] = candidates.map((cert) => {
    let score = 0;
    if (cert.recommendedOrder !== undefined) {
      // Lower recommendedOrder is preferred. Convert to a positive bonus so
      // an early-track cert (order 1) scores higher than a later one (order 9).
      score += 3 + (10 - cert.recommendedOrder) * 0.1;
    }
    if (levelMatchesExperience(cert.level, experience)) score += 2;
    if (fitsTimeBudget(cert, weeklyTime)) {
      score += 1;
    } else {
      score -= 1;
    }
    return { cert, score };
  });

  // First pass: top picks before chaining bonus. We then add +1 for any cert
  // whose nextSteps points at an already-selected slug.
  scored.sort((a, b) => b.score - a.score);

  // Decide how many slots based on experience.
  const maxSteps = experience === 'new' ? 4 : experience === 'working' ? 5 : 5;
  const minSteps = 3;
  const targetCount = Math.min(maxSteps, Math.max(minSteps, Math.min(scored.length, 4)));

  // Chaining bonus pass: prefer a cert if any already-picked cert lists it in
  // its nextSteps. We seed the picked set with the current top, then iterate.
  const picked: Certification[] = [];
  const pickedSlugs = new Set<string>();

  // Greedy: at each step, pick the highest-scoring cert that maximizes the
  // chaining bonus relative to already-picked items.
  while (picked.length < Math.min(targetCount, scored.length)) {
    let bestIdx = -1;
    let bestEffectiveScore = -Infinity;

    scored.forEach(({ cert, score }, idx) => {
      if (pickedSlugs.has(cert.slug)) return;
      let effective = score;
      for (const already of picked) {
        if (already.nextSteps?.includes(cert.slug)) {
          effective += 1;
          break;
        }
      }
      if (effective > bestEffectiveScore) {
        bestEffectiveScore = effective;
        bestIdx = idx;
      }
    });

    if (bestIdx === -1) break;
    const choice = scored[bestIdx]!;
    picked.push(choice.cert);
    pickedSlugs.add(choice.cert.slug);
  }

  // Order picked certs by recommendedOrder asc, then estimatedHours asc.
  picked.sort((a, b) => {
    const ao = a.recommendedOrder ?? 9;
    const bo = b.recommendedOrder ?? 9;
    if (ao !== bo) return ao - bo;
    return a.estimatedHours - b.estimatedHours;
  });

  // Compute contiguous week ranges.
  let prevEnd = 0;
  return picked.map((cert, index) => {
    const weeks = Math.max(1, Math.ceil(cert.estimatedHours / hoursPerWeek));
    const weekStart = prevEnd + 1;
    const weekEnd = weekStart + weeks - 1;
    prevEnd = weekEnd;
    return {
      cert,
      weekStart,
      weekEnd,
      rationale: rationaleFor(cert, input, index),
    };
  });
}

export function planTotals(plan: PlanStep[]): { weeks: number; hours: number } {
  if (plan.length === 0) return { weeks: 0, hours: 0 };
  const hours = plan.reduce((sum, step) => sum + step.cert.estimatedHours, 0);
  const weeks = plan[plan.length - 1]!.weekEnd;
  return { weeks, hours };
}
