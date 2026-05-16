import { describe, test, expect } from 'vitest';
import { Certifications } from './data';
import { CertificationSchema, CertificationsSchema } from './schema';

describe('Certifications data', () => {
  test('should have at least 10 entries', () => {
    expect(Certifications.length).toBeGreaterThanOrEqual(10);
  });

  test('each entry should have required fields', () => {
    Certifications.forEach((cert) => {
      expect(cert).toHaveProperty('id');
      expect(cert).toHaveProperty('slug');
      expect(cert).toHaveProperty('provider');
      expect(cert).toHaveProperty('name');
      expect(cert).toHaveProperty('description');
      expect(cert).toHaveProperty('link');
      expect(cert).toHaveProperty('skills');
      expect(cert).toHaveProperty('tracks');
      expect(cert).toHaveProperty('estimatedHours');
      expect(cert).toHaveProperty('careerFit');
      expect(cert).toHaveProperty('outcomes');
      expect(cert).toHaveProperty('bestFor');
      expect(cert).toHaveProperty('credentialType');
      expect(cert).toHaveProperty('freeAccess');
      expect(cert).toHaveProperty('verifiedFreeAt');

      // Validate types
      expect(typeof cert.id).toBe('number');
      expect(typeof cert.slug).toBe('string');
      expect(typeof cert.provider).toBe('string');
      expect(typeof cert.name).toBe('string');
      expect(typeof cert.description).toBe('string');
      expect(typeof cert.link).toBe('string');
      expect(Array.isArray(cert.skills)).toBe(true);
      expect(Array.isArray(cert.tracks)).toBe(true);
      expect(Array.isArray(cert.outcomes)).toBe(true);
      expect(typeof cert.estimatedHours).toBe('number');
      expect(typeof cert.freeAccess.type).toBe('string');
      expect(typeof cert.verifiedFreeAt).toBe('string');

      // Validate link is a URL
      expect(cert.link).toMatch(/^https?:\/\//);
    });
  });

  test('should not contain duplicate IDs', () => {
    const ids = Certifications.map((cert) => cert.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('should contain 18 unique slugs', () => {
    const slugs = Certifications.map((cert) => cert.slug);
    const uniqueSlugs = new Set(slugs);
    expect(slugs).toHaveLength(18);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  test('should cover at least 5 distinct providers', () => {
    const providers = new Set(Certifications.map((cert) => cert.provider));
    expect(providers.size).toBeGreaterThanOrEqual(5);
  });

  test('every entry should have a non-empty skills list', () => {
    Certifications.forEach((cert) => {
      expect(cert.skills.length).toBeGreaterThan(0);
      cert.skills.forEach((skill) => {
        expect(typeof skill).toBe('string');
        expect(skill.length).toBeGreaterThan(0);
      });
    });
  });

  test('every entry has valid free access and at least two outcomes', () => {
    const freeAccessTypes = new Set([
      'free-certificate',
      'free-course-paid-certificate',
      'financial-aid',
      'free-learning-paid-exam',
      'free-badge',
      'free-event-voucher',
    ]);

    Certifications.forEach((cert) => {
      expect(freeAccessTypes.has(cert.freeAccess.type)).toBe(true);
      expect(cert.outcomes.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('verifiedFreeAt should be ISO date (YYYY-MM-DD)', () => {
    Certifications.forEach((cert) => {
      expect(cert.verifiedFreeAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test('passes the zod CertificationsSchema parser', () => {
    const parsed = CertificationsSchema.safeParse(Certifications);
    expect(parsed.success).toBe(true);
  });
});

describe('CertificationSchema validation', () => {
  const validCert = {
    id: 99,
    slug: 'acme-cloud-pro',
    provider: 'Acme',
    name: 'Acme Cloud Pro',
    description: 'A valid record used as a baseline for negative tests.',
    link: 'https://example.com/cert',
    skills: ['Cloud'],
    tracks: ['cloud'],
    estimatedHours: 10,
    careerFit: ['Cloud learner'],
    outcomes: ['Explain cloud basics', 'Compare cloud services'],
    bestFor: ['Beginners'],
    credentialType: 'certificate',
    freeAccess: {
      type: 'free-certificate',
      summary: 'The certificate is free after passing the required assessment.',
      steps: ['Create an account', 'Pass the assessment'],
      proofUrl: 'https://example.com/proof',
      verifiedAt: '2026-05-15',
    },
    verifiedFreeAt: '2026-05-15',
  };

  test('accepts a well-formed record', () => {
    expect(CertificationSchema.safeParse(validCert).success).toBe(true);
  });

  test('rejects a record missing id', () => {
    const { id: _id, ...withoutId } = validCert;
    void _id;
    expect(CertificationSchema.safeParse(withoutId).success).toBe(false);
  });

  test('rejects a non-https link', () => {
    const result = CertificationSchema.safeParse({ ...validCert, link: 'http://example.com' });
    expect(result.success).toBe(false);
  });

  test('rejects an empty skills array', () => {
    const result = CertificationSchema.safeParse({ ...validCert, skills: [] });
    expect(result.success).toBe(false);
  });

  test('rejects a malformed verifiedFreeAt date', () => {
    const result = CertificationSchema.safeParse({ ...validCert, verifiedFreeAt: '2026/05/15' });
    expect(result.success).toBe(false);
  });

  test('rejects a non-positive id', () => {
    const result = CertificationSchema.safeParse({ ...validCert, id: 0 });
    expect(result.success).toBe(false);
  });
});
