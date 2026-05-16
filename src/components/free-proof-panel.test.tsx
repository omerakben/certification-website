import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import FreeProofPanel from '@/components/free-proof-panel';
import type { Certification } from '@/lib/certifications/schema';

const freeAccess: Certification['freeAccess'] = {
  type: 'financial-aid',
  summary: 'The certificate is available through financial aid.',
  steps: ['Open the course page', 'Apply for aid', 'Enroll after approval'],
  caveat: 'Starting a trial first can create a paid charge.',
  proofUrl: 'https://example.com/proof',
  verifiedAt: '2026-05-15',
};

describe('FreeProofPanel', () => {
  test('renders summary, steps, caveat, verified date, and proof link', () => {
    render(<FreeProofPanel freeAccess={freeAccess} />);

    expect(screen.getByText(freeAccess.summary)).toBeInTheDocument();
    for (const step of freeAccess.steps) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    expect(screen.getByText(freeAccess.caveat!)).toBeInTheDocument();
    expect(screen.getByText(/May 15, 2026/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view free-access source/i })).toHaveAttribute(
      'href',
      freeAccess.proofUrl,
    );
  });

  test('proof link opens in a new tab with noopener noreferrer', () => {
    render(<FreeProofPanel freeAccess={freeAccess} />);

    const link = screen.getByRole('link', { name: /view free-access source/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('caveat region has role note', () => {
    render(<FreeProofPanel freeAccess={freeAccess} />);

    expect(screen.getByRole('note')).toHaveTextContent(freeAccess.caveat!);
  });

  test('renders without caveat when none is supplied', () => {
    const { queryByRole } = render(
      <FreeProofPanel freeAccess={{ ...freeAccess, caveat: undefined }} />,
    );

    expect(queryByRole('note')).not.toBeInTheDocument();
  });
});
