import { describe, expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CertExplorer from '@/components/cert-explorer';
import type { Certification } from '@/lib/certifications/schema';

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
    slug: 'azure-fundamentals',
    provider: 'Microsoft',
    name: 'Azure Fundamentals',
    description: 'Cloud concepts on Azure.',
    link: 'https://learn.microsoft.com/azure-fundamentals',
    skills: ['Azure', 'Cloud'],
    tracks: ['cloud'],
    level: 'Beginner',
    lastUpdated: '2026-05-15',
  }),
  makeCert({
    id: 2,
    slug: 'azure-ai-engineer',
    provider: 'Microsoft',
    name: 'Azure AI Engineer Associate',
    description: 'Build AI solutions on Azure.',
    link: 'https://learn.microsoft.com/azure-ai-engineer',
    skills: ['Azure', 'AI'],
    tracks: ['ai', 'cloud'],
    level: 'Advanced',
    lastUpdated: '2026-05-15',
  }),
  makeCert({
    id: 3,
    slug: 'google-data-analytics',
    provider: 'Google',
    name: 'Google Data Analytics',
    description: 'Hands-on data analytics path.',
    link: 'https://www.coursera.org/google-data-analytics',
    skills: ['Data', 'SQL'],
    tracks: ['data'],
    level: 'Beginner',
    lastUpdated: '2026-05-15',
  }),
  makeCert({
    id: 4,
    slug: 'anthos-service-mesh',
    provider: 'Google',
    name: 'Anthos Service Mesh Advanced',
    description: 'Advanced service mesh administration.',
    link: 'https://www.coursera.org/google-anthos',
    skills: ['Kubernetes', 'Networking'],
    tracks: ['cloud'],
    level: 'Advanced',
    lastUpdated: '2026-05-15',
  }),
];

function renderExplorer() {
  return render(<CertExplorer initialCertifications={mockCertifications} />);
}

function getToolbar(): HTMLElement {
  return screen.getByRole('region', { name: /filter and sort certifications/i });
}

function getCountText(): string {
  const toolbar = getToolbar();
  // Stream 2 surfaces the count as <p role="status" aria-live="polite">.
  const live = toolbar.querySelector('[aria-live="polite"]');
  if (!live) throw new Error('aria-live count region not found');
  return (live.textContent ?? '').trim();
}

describe('CertExplorer', () => {
  test('renders the initial result count', () => {
    renderExplorer();
    expect(getCountText()).toMatch(/^4 certifications$/);
  });

  test('typing in the search input filters case-insensitively', async () => {
    const user = userEvent.setup();
    renderExplorer();
    const search = screen.getByRole('searchbox', { name: /search/i });
    await user.type(search, 'azure');
    expect(getCountText()).toMatch(/^2 certifications$/);
  });

  test('selecting a provider filters to that provider only', async () => {
    const user = userEvent.setup();
    renderExplorer();
    const providerSelect = screen.getByRole('combobox', { name: /provider/i });
    await user.selectOptions(providerSelect, 'Microsoft');
    expect(getCountText()).toMatch(/^2 certifications$/);
    // CertList renders a single provider section heading.
    const providerHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(providerHeadings).toHaveLength(1);
    expect(providerHeadings[0]?.textContent).toBe('Microsoft');
  });

  test('selecting an advanced level filters appropriately', async () => {
    const user = userEvent.setup();
    renderExplorer();
    const levelSelect = screen.getByRole('combobox', { name: /level/i });
    await user.selectOptions(levelSelect, 'Advanced');
    expect(getCountText()).toMatch(/^2 certifications$/);
    expect(screen.getByText('Azure AI Engineer Associate')).toBeInTheDocument();
    expect(screen.getByText('Anthos Service Mesh Advanced')).toBeInTheDocument();
    expect(screen.queryByText('Azure Fundamentals')).not.toBeInTheDocument();
  });

  test('sorting A-Z reorders entries within a provider group', async () => {
    const user = userEvent.setup();
    renderExplorer();
    // Filter to a single provider so provider-grouping does not interleave alphabetical order.
    await user.selectOptions(screen.getByRole('combobox', { name: /provider/i }), 'Google');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort/i }), 'a-z');
    const cardHeadings = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent ?? '');
    expect(cardHeadings).toEqual(['Anthos Service Mesh Advanced', 'Google Data Analytics']);
  });

  test('reset button appears for non-default filters and clears them', async () => {
    const user = userEvent.setup();
    renderExplorer();
    const search = screen.getByRole('searchbox', { name: /search/i });
    await user.type(search, 'azure');
    const toolbar = getToolbar();
    const reset = await within(toolbar).findByRole('button', { name: /reset filters/i });
    expect(reset).toBeInTheDocument();
    await user.click(reset);
    expect(getCountText()).toMatch(/^4 certifications$/);
    expect(within(toolbar).queryByRole('button', { name: /reset filters/i })).not.toBeInTheDocument();
  });

  test('empty result shows a no-match state', async () => {
    const user = userEvent.setup();
    renderExplorer();
    const search = screen.getByRole('searchbox', { name: /search/i });
    await user.type(search, 'definitelynothere');
    expect(getCountText()).toMatch(/^0 certifications$/);
    expect(screen.getByRole('heading', { name: /no matches/i })).toBeInTheDocument();
  });

  test('aria-live region announces the count', () => {
    renderExplorer();
    const toolbar = getToolbar();
    const live = toolbar.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect((live as HTMLElement).textContent?.trim()).toMatch(/^\d+ certifications?$/);
  });
});
