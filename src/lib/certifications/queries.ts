import { Certifications } from '@/lib/certifications/data';
import type { Certification } from '@/lib/certifications/schema';

const bySlug = new Map(Certifications.map((cert) => [cert.slug, cert]));

export function getCertificationBySlug(slug: string): Certification | undefined {
  return bySlug.get(slug);
}

export function getAllSlugs(): string[] {
  return Certifications.map((cert) => cert.slug);
}

export function getRelatedCertifications(cert: Certification, limit = 3): Certification[] {
  const sourceTracks = new Set(cert.tracks);
  const sourceSkills = new Set(cert.skills.map(normalize));
  const sourceOutcomes = new Set(cert.outcomes.flatMap(tokenize));

  return Certifications.filter((candidate) => candidate.slug !== cert.slug)
    .map((candidate, index) => {
      const sharedTracks = candidate.tracks.filter((track) => sourceTracks.has(track)).length;
      const sharedSkills = candidate.skills.filter((skill) => sourceSkills.has(normalize(skill))).length;
      const sharedOutcomeTerms = candidate.outcomes
        .flatMap(tokenize)
        .filter((term) => sourceOutcomes.has(term)).length;

      return {
        candidate,
        index,
        score: sharedTracks * 100 + sharedSkills * 10 + sharedOutcomeTerms,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.index - b.index;
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4);
}
