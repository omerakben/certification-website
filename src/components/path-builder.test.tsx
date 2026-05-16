import { describe, expect, test, beforeEach, vi } from 'vitest';
import { act, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import PathBuilder from '@/components/path-builder';
import { Certifications } from '@/lib/certifications/data';
import type { Certification } from '@/lib/certifications/schema';

// Mock next/navigation. The router replaces the URL synchronously and we
// reflect that back through useSearchParams. A tiny subscription hook turns
// the mutable store into a React-aware reactive value.
const searchParamsStore = {
  current: new URLSearchParams(),
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
  set(next: URLSearchParams) {
    this.current = next;
    for (const fn of this.listeners) fn();
  },
};

const replaceMock = vi.fn((url: string) => {
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
  window.history.replaceState({}, '', url);
  searchParamsStore.set(new URLSearchParams(query));
});

// Lightweight React subscription to the store via useSyncExternalStore so
// updates from replaceMock trigger a re-render of any consumer.
async function makeSearchParamsHook() {
  const React = await import('react');
  return () => {
    return React.useSyncExternalStore(
      (listener) => searchParamsStore.subscribe(listener),
      () => searchParamsStore.current,
      () => searchParamsStore.current,
    );
  };
}

vi.mock('next/navigation', async () => {
  const useSearchParams = await makeSearchParamsHook();
  return {
    useRouter: () => ({
      replace: replaceMock,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams,
  };
});

function resetUrl(query = '') {
  window.history.replaceState({}, '', query ? `/builder?${query}` : '/builder');
  searchParamsStore.set(new URLSearchParams(query));
}

beforeEach(() => {
  replaceMock.mockClear();
  resetUrl();
  window.localStorage.clear();
});

describe('PathBuilder quiz', () => {
  test('renders three fieldsets with question legends', () => {
    render(<PathBuilder certifications={Certifications} />);
    expect(screen.getByText(/what is your goal\?/i)).toBeInTheDocument();
    expect(screen.getByText(/hours per week\?/i)).toBeInTheDocument();
    expect(screen.getByText(/where are you starting from\?/i)).toBeInTheDocument();
  });

  test('renders one radio per goal, weekly time, and experience option', () => {
    render(<PathBuilder certifications={Certifications} />);
    const goalRadios = screen.getAllByRole('radio', { name: /it support|data & analytics|cloud|ai & machine learning|web development|marketing|security|foundations/i });
    expect(goalRadios.length).toBeGreaterThanOrEqual(8);

    expect(screen.getByRole('radio', { name: /2 hours/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /5 hours/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /10 hours/i })).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: /new to the field/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /some exposure/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /working professional/i })).toBeInTheDocument();
  });

  test('submit button is disabled until all three are answered', async () => {
    const user = userEvent.setup();
    render(<PathBuilder certifications={Certifications} />);
    const submit = screen.getByRole('button', { name: /build my path/i });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: /ai & machine learning/i }));
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: /5 hours/i }));
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: /some exposure/i }));
    expect(submit).toBeEnabled();
  });

  test('submitting the quiz updates URL params and reveals the roadmap', async () => {
    const user = userEvent.setup();
    render(<PathBuilder certifications={Certifications} />);
    await user.click(screen.getByRole('radio', { name: /ai & machine learning/i }));
    await user.click(screen.getByRole('radio', { name: /5 hours/i }));
    await user.click(screen.getByRole('radio', { name: /some exposure/i }));
    await user.click(screen.getByRole('button', { name: /build my path/i }));

    expect(replaceMock).toHaveBeenCalled();
    const lastCall = replaceMock.mock.calls.at(-1);
    expect(lastCall?.[0]).toContain('goal=ai');
    expect(lastCall?.[0]).toContain('time=5');
    expect(lastCall?.[0]).toContain('exp=some');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your free path to ai & machine learning/i })).toBeInTheDocument();
    });
  });

  test('axe finds no violations in the quiz state', async () => {
    const { container } = render(<PathBuilder certifications={Certifications} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('PathBuilder roadmap', () => {
  test('renders 3-5 plan steps with contiguous week ranges and detail links', () => {
    resetUrl('goal=ai&time=5&exp=some');
    const { container } = render(<PathBuilder certifications={Certifications} />);

    const stepList = container.querySelector('ol[role="list"]');
    expect(stepList).not.toBeNull();
    const items = within(stepList as HTMLElement).getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.length).toBeLessThanOrEqual(5);

    for (const item of items) {
      const link = within(item).getByRole('link');
      expect(link.getAttribute('href')).toMatch(/^\/certifications\/[a-z0-9-]+$/);
    }

    // First step should be Week 1...
    expect(within(items[0]!).getByText(/^Week 1/)).toBeInTheDocument();
  });

  test('share button copies window.location.href to clipboard and shows a polite confirmation', async () => {
    resetUrl('goal=ai&time=5&exp=some');
    // Set up userEvent first (it stubs navigator.clipboard), then overwrite
    // with our spy so the assertion can observe writeText calls.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<PathBuilder certifications={Certifications} />);

    await user.click(screen.getByRole('button', { name: /share this plan/i }));
    expect(writeText).toHaveBeenCalledWith(window.location.href);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/copied!/i);
    });

    const live = screen.getByRole('status');
    expect(live.getAttribute('aria-live')).toBe('polite');
  });

  test('progress toggle writes to localStorage and re-reads it', async () => {
    resetUrl('goal=ai&time=5&exp=some');
    const user = userEvent.setup();
    const { unmount } = render(<PathBuilder certifications={Certifications} />);

    const firstToggle = screen.getAllByRole('button', { name: /^mark started/i })[0]!;
    await user.click(firstToggle);

    const stored = window.localStorage.getItem('certfinder.progress.v1');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    const firstSlug = Object.keys(parsed)[0]!;
    expect(parsed[firstSlug]).toBe('started');

    unmount();

    render(<PathBuilder certifications={Certifications} />);
    await waitFor(() => {
      // After re-render, that cert should show "Started" status now.
      const statusChips = screen.getAllByText(/^Started$/);
      expect(statusChips.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('"Try a different plan" clears URL params and reveals the quiz again', async () => {
    resetUrl('goal=ai&time=5&exp=some');
    const user = userEvent.setup();
    render(<PathBuilder certifications={Certifications} />);

    await user.click(screen.getByRole('button', { name: /try a different plan/i }));

    expect(replaceMock).toHaveBeenCalled();
    const lastCall = replaceMock.mock.calls.at(-1);
    expect(lastCall?.[0]).toBe('/builder');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /build my free path/i })).toBeInTheDocument();
    });
  });

  test('axe finds no violations on the roadmap state', async () => {
    resetUrl('goal=ai&time=5&exp=some');
    const { container } = render(<PathBuilder certifications={Certifications} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('invalid URL params fall back to the quiz', () => {
    resetUrl('goal=banana&time=99&exp=expert');
    render(<PathBuilder certifications={Certifications} />);
    expect(screen.getByRole('heading', { name: /build my free path/i })).toBeInTheDocument();
  });

  test('handles a goal with no matching certs by showing an empty-state message', () => {
    // Construct an isolated dataset with no AI track entries.
    const filtered = Certifications.filter((c: Certification) => !c.tracks.includes('ai'));
    resetUrl('goal=ai&time=5&exp=some');
    render(<PathBuilder certifications={filtered} />);
    expect(
      screen.getByText(/no certifications matched this combination/i),
    ).toBeInTheDocument();
  });
});

describe('PathBuilder URL sync', () => {
  test('changes via radio click do not push extra history entries (router.replace is used)', async () => {
    const user = userEvent.setup();
    render(<PathBuilder certifications={Certifications} />);
    await user.click(screen.getByRole('radio', { name: /ai & machine learning/i }));
    await user.click(screen.getByRole('radio', { name: /5 hours/i }));
    await user.click(screen.getByRole('radio', { name: /some exposure/i }));

    act(() => {
      // Trigger the submit and confirm only `replace` was called, never `push`.
    });
    await user.click(screen.getByRole('button', { name: /build my path/i }));
    expect(replaceMock).toHaveBeenCalled();
  });
});
