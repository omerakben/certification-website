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

export const CertificationSchema = z.object({
  /** Stable numeric identifier. Must be unique across the dataset. */
  id: z.number().int().positive('id must be a positive integer'),
  /** Issuing organization or platform (e.g. "Google", "Microsoft"). */
  provider: nonEmptyString('provider'),
  /** Official program/certificate name as published by the provider. */
  name: nonEmptyString('name'),
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
  /** ISO date (YYYY-MM-DD) on which the free access was last verified. */
  verifiedFreeAt: isoDate,
  /** Optional difficulty hint shown in the UI. */
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  /** Optional human-readable duration (e.g. "6 months", "Self-paced"). */
  duration: nonEmptyString('duration').optional(),
  /** ISO date (YYYY-MM-DD) of the last record update. */
  lastUpdated: isoDate.optional(),
});

export const CertificationsSchema = z.array(CertificationSchema);

export type Certification = z.infer<typeof CertificationSchema>;
