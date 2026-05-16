import { describe, expect, test } from 'vitest';
import { getAllSlugs, getCertificationBySlug, getRelatedCertifications } from './queries';

describe('certification queries', () => {
  test('getCertificationBySlug returns a matching certification', () => {
    const cert = getCertificationBySlug('google-it-support');

    expect(cert?.name).toBe('Google IT Support Professional Certificate');
  });

  test('getCertificationBySlug returns undefined for unknown slugs', () => {
    expect(getCertificationBySlug('missing-certification')).toBeUndefined();
  });

  test('getAllSlugs returns 18 unique strings', () => {
    const slugs = getAllSlugs();

    expect(slugs).toHaveLength(18);
    expect(new Set(slugs).size).toBe(18);
    expect(slugs.every((slug) => typeof slug === 'string')).toBe(true);
  });

  test('getRelatedCertifications excludes the source cert, prefers same track, and respects limit', () => {
    const source = getCertificationBySlug('google-it-support');
    if (!source) throw new Error('Expected source certification');

    const related = getRelatedCertifications(source, 2);

    expect(related).toHaveLength(2);
    expect(related.map((cert) => cert.slug)).not.toContain(source.slug);
    expect(related[0]?.tracks.some((track) => source.tracks.includes(track))).toBe(true);
  });
});
