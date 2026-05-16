import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CertList from '@/components/cert-list';
import type { Certification } from '@/lib/certifications/schema';

describe('CertList component', () => {
  const mockCertifications: Certification[] = [
    {
      id: 1,
      provider: 'Google',
      name: 'Test Cert 1',
      description: 'A test certification',
      link: 'https://example.com',
      skills: ['Test'],
      verifiedFreeAt: '2026-05-15',
    },
    {
      id: 2,
      provider: 'Google',
      name: 'Test Cert 2',
      description: 'Another test certification',
      link: 'https://example.com',
      skills: ['Test'],
      verifiedFreeAt: '2026-05-15',
    },
    {
      id: 3,
      provider: 'Microsoft',
      name: 'Test Cert 3',
      description: 'Yet another test certification',
      link: 'https://example.com',
      skills: ['Test'],
      verifiedFreeAt: '2026-05-15',
    },
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
