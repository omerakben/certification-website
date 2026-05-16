import { describe, expect, test } from 'vitest';
import { Certifications } from '@/lib/certifications/data';
import {
  buildPlan,
  planTotals,
  isGoal,
  isWeeklyTime,
  isExperience,
  type Goal,
  type WeeklyTime,
  type Experience,
} from '@/lib/certifications/builder';

describe('buildPlan', () => {
  test('returns AI-track certs for goal=ai, time=5, exp=new', () => {
    const plan = buildPlan({ goal: 'ai', weeklyTime: '5', experience: 'new' }, Certifications);
    expect(plan.length).toBeGreaterThanOrEqual(3);
    expect(plan.length).toBeLessThanOrEqual(4);
    for (const step of plan) {
      expect(step.cert.tracks).toContain('ai');
    }
  });

  test('every returned cert has tracks.includes(goal)', () => {
    const goals: Goal[] = ['it-support', 'data', 'cloud', 'ai', 'web', 'marketing', 'security'];
    for (const goal of goals) {
      const plan = buildPlan({ goal, weeklyTime: '5', experience: 'some' }, Certifications);
      for (const step of plan) {
        expect(step.cert.tracks).toContain(goal);
      }
    }
  });

  test('week ranges are contiguous and non-overlapping', () => {
    const plan = buildPlan({ goal: 'ai', weeklyTime: '5', experience: 'some' }, Certifications);
    expect(plan[0]?.weekStart).toBe(1);
    for (let i = 1; i < plan.length; i++) {
      const previous = plan[i - 1]!;
      const current = plan[i]!;
      expect(current.weekStart).toBe(previous.weekEnd + 1);
      expect(current.weekEnd).toBeGreaterThanOrEqual(current.weekStart);
    }
  });

  test('experience=new excludes Advanced certs', () => {
    const plan = buildPlan({ goal: 'cloud', weeklyTime: '5', experience: 'new' }, Certifications);
    for (const step of plan) {
      expect(step.cert.level).not.toBe('Advanced');
    }
  });

  test('experience=new caps at 4 steps', () => {
    const plan = buildPlan({ goal: 'ai', weeklyTime: '10', experience: 'new' }, Certifications);
    expect(plan.length).toBeLessThanOrEqual(4);
  });

  test('returns empty array when no certs match the goal', () => {
    const plan = buildPlan(
      { goal: 'marketing', weeklyTime: '5', experience: 'new' },
      [],
    );
    expect(plan).toEqual([]);
  });

  test('marketing goal returns the inbound marketing cert', () => {
    const plan = buildPlan(
      { goal: 'marketing', weeklyTime: '2', experience: 'new' },
      Certifications,
    );
    expect(plan.length).toBeGreaterThan(0);
    expect(plan[0]?.cert.slug).toBe('hubspot-inbound-marketing');
  });

  test('rationale is non-empty for each step', () => {
    const plan = buildPlan({ goal: 'ai', weeklyTime: '5', experience: 'some' }, Certifications);
    for (const step of plan) {
      expect(step.rationale.length).toBeGreaterThan(20);
    }
  });

  test('week math scales with weekly time budget', () => {
    const slow = buildPlan({ goal: 'ai', weeklyTime: '2', experience: 'some' }, Certifications);
    const fast = buildPlan({ goal: 'ai', weeklyTime: '10', experience: 'some' }, Certifications);
    const slowTotals = planTotals(slow);
    const fastTotals = planTotals(fast);
    expect(slowTotals.weeks).toBeGreaterThan(fastTotals.weeks);
  });

  test('planTotals returns zeroes for an empty plan', () => {
    expect(planTotals([])).toEqual({ weeks: 0, hours: 0 });
  });
});

describe('builder param validators', () => {
  test('isGoal accepts every enum value', () => {
    const all: Goal[] = ['it-support', 'data', 'cloud', 'ai', 'web', 'marketing', 'security', 'foundations'];
    for (const g of all) expect(isGoal(g)).toBe(true);
    expect(isGoal('something-else')).toBe(false);
    expect(isGoal(null)).toBe(false);
  });

  test('isWeeklyTime accepts only declared values', () => {
    const all: WeeklyTime[] = ['2', '5', '10'];
    for (const t of all) expect(isWeeklyTime(t)).toBe(true);
    expect(isWeeklyTime('3')).toBe(false);
    expect(isWeeklyTime(undefined)).toBe(false);
  });

  test('isExperience accepts only declared values', () => {
    const all: Experience[] = ['new', 'some', 'working'];
    for (const e of all) expect(isExperience(e)).toBe(true);
    expect(isExperience('pro')).toBe(false);
  });
});
