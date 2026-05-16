import { z } from 'zod';

/**
 * Runtime schema for a single certification record.
 *
 * Validated at module load in `data.ts` so any data drift (missing field,
 * mistyped id, http:// link, malformed date) fails the build instead of
 * reaching the UI. Components import the inferred TypeScript type below.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected ISO date in YYYY-MM-DD format');

const nonEmptyString = (label: string) =>
  z.string().min(1, `${label} must not be empty`);

const slugString = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'slug must be kebab-case');

export const FreeAccessTypeSchema = z.enum([
  'free-certificate',
  'free-course-paid-certificate',
  'financial-aid',
  'free-learning-paid-exam',
  'free-badge',
  'free-event-voucher',
]);

export const TrackSchema = z.enum([
  'it-support',
  'data',
  'cloud',
  'ai',
  'web',
  'marketing',
  'security',
  'foundations',
]);

const FreeAccessSchema = z.object({
  type: FreeAccessTypeSchema,
  summary: nonEmptyString('freeAccess.summary'),
  steps: z
    .array(nonEmptyString('freeAccess.steps entry'))
    .min(1, 'freeAccess.steps must contain at least one entry'),
  caveat: nonEmptyString('freeAccess.caveat').optional(),
  proofUrl: z
    .string()
    .url('freeAccess.proofUrl must be a valid URL')
    .startsWith('https://', 'freeAccess.proofUrl must use https://'),
  verifiedAt: isoDate,
});

export const CertificationSchema = z.object({
  /** Stable numeric identifier. Must be unique across the dataset. */
  id: z.number().int().positive('id must be a positive integer'),
  /** Stable route segment for detail pages and cross-linking. */
  slug: slugString,
  /** Issuing organization or platform (e.g. "Google", "Microsoft"). */
  provider: nonEmptyString('provider'),
  /** Official program/certificate name as published by the provider. */
  name: nonEmptyString('name'),
  /** Short display label for compact UI surfaces. */
  shortTitle: nonEmptyString('shortTitle').optional(),
  /** Short marketing-free summary of what the learner gets. */
  description: nonEmptyString('description'),
  /** Canonical public HTTPS URL where a learner can enroll for free. */
  link: z
    .string()
    .url('link must be a valid URL')
    .startsWith('https://', 'link must use https://'),
  /** Skill tags surfaced as chips in the UI and used for filtering. */
  skills: z
    .array(nonEmptyString('skill'))
    .min(1, 'skills must contain at least one entry'),
  tracks: z.array(TrackSchema).min(1, 'tracks must contain at least one entry'),
  estimatedHours: z.number().int().positive('estimatedHours must be a positive integer'),
  recommendedOrder: z.number().int().min(1).max(9).optional(),
  careerFit: z
    .array(nonEmptyString('careerFit entry'))
    .min(1, 'careerFit must contain at least one entry'),
  outcomes: z
    .array(nonEmptyString('outcome'))
    .min(2, 'outcomes must contain at least two entries'),
  prerequisites: z
    .array(nonEmptyString('prerequisite'))
    .min(1, 'prerequisites must contain at least one entry')
    .optional(),
  bestFor: z
    .array(nonEmptyString('bestFor entry'))
    .min(1, 'bestFor must contain at least one entry'),
  notFor: z
    .array(nonEmptyString('notFor entry'))
    .min(1, 'notFor must contain at least one entry')
    .optional(),
  assessmentFormat: nonEmptyString('assessmentFormat').optional(),
  credentialType: z.enum(['certificate', 'certification', 'badge', 'course-completion']),
  nextSteps: z.array(slugString).optional(),
  freeAccess: FreeAccessSchema,
  /** ISO date (YYYY-MM-DD) on which the free access was last verified. */
  verifiedFreeAt: isoDate,
  /** Optional difficulty hint shown in the UI. */
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  /** Optional human-readable duration (e.g. "6 months", "Self-paced"). */
  duration: nonEmptyString('duration').optional(),
  /** ISO date (YYYY-MM-DD) of the last record update. */
  lastUpdated: isoDate.optional(),
});

export const CertificationsSchema = z.array(CertificationSchema).superRefine((certs, ctx) => {
  const seenIds = new Map<number, number>();
  const seenSlugs = new Map<string, number>();

  certs.forEach((cert, index) => {
    const firstIdIndex = seenIds.get(cert.id);
    if (firstIdIndex !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate id ${cert.id}; first seen at index ${firstIdIndex}`,
        path: [index, 'id'],
      });
    } else {
      seenIds.set(cert.id, index);
    }

    const firstSlugIndex = seenSlugs.get(cert.slug);
    if (firstSlugIndex !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate slug ${cert.slug}; first seen at index ${firstSlugIndex}`,
        path: [index, 'slug'],
      });
    } else {
      seenSlugs.set(cert.slug, index);
    }
  });
});

export type Certification = z.infer<typeof CertificationSchema>;
