import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CertList from '@/components/cert-list';
import type { Certification } from '@/lib/certifications/schema';

describe('CertList component', () => {
  function makeCert(overrides: Partial<Certification>): Certification {
    return {
      id: 99,
      slug: 'test-cert',
      provider: 'Test',
      name: 'Test Cert',
      description: 'A test certification',
      link: 'https://example.com',
      skills: ['Test'],
      tracks: ['foundations'],
      estimatedHours: 5,
      careerFit: ['Tester'],
      outcomes: ['Learn a test skill', 'Apply a test skill'],
      bestFor: ['Test learners'],
      credentialType: 'certificate',
      freeAccess: {
        type: 'free-certificate',
        summary: 'This test certificate is free.',
        steps: ['Open the test page'],
        proofUrl: 'https://example.com/proof',
        verifiedAt: '2026-05-15',
      },
      verifiedFreeAt: '2026-05-15',
      ...overrides,
    };
  }

  const mockCertifications: Certification[] = [
    makeCert({
      id: 1,
      slug: 'test-cert-1',
      provider: 'Google',
      name: 'Test Cert 1',
    }),
    makeCert({
      id: 2,
      slug: 'test-cert-2',
      provider: 'Google',
      name: 'Test Cert 2',
      description: 'Another test certification',
    }),
    makeCert({
      id: 3,
      slug: 'test-cert-3',
      provider: 'Microsoft',
      name: 'Test Cert 3',
      description: 'Yet another test certification',
    }),
  ];

  test('renders without crashing', () => {
    const { container } = render(<CertList certifications={mockCertifications} />);
    expect(container).toBeInTheDocument();
  });

  test('groups certifications by provider', () => {
    render(<CertList certifications={mockCertifications} />);

    // Should have provider headings (rendered as the provider name alone)
    expect(screen.getByRole('heading', { name: /^Google$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Microsoft$/i })).toBeInTheDocument();

    // Should have certification names
    expect(screen.getByText(/Test Cert 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Cert 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Cert 3/i)).toBeInTheDocument();
  });
});
