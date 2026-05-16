import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { applyTheme, getStoredTheme, resolveTheme, type Theme } from './theme';

const STORAGE_KEY = 'theme';

function makeMatchMedia(prefersDark: boolean): (query: string) => MediaQueryList {
  return (query: string) =>
    ({
      matches: prefersDark && query.includes('prefers-color-scheme: dark'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList;
}

function mockMatchMedia(prefersDark: boolean) {
  // jsdom does not implement matchMedia, so we install it before spying.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: makeMatchMedia(prefersDark),
  });
}

describe('theme utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    // Reset any matchMedia stub.
    // @ts-expect-error — we intentionally remove the stub.
    delete window.matchMedia;
  });

  describe('getStoredTheme', () => {
    test("returns 'system' when no value is stored", () => {
      expect(getStoredTheme()).toBe('system');
    });

    test("returns 'light' when 'light' is stored", () => {
      window.localStorage.setItem(STORAGE_KEY, 'light');
      expect(getStoredTheme()).toBe('light');
    });

    test("returns 'dark' when 'dark' is stored", () => {
      window.localStorage.setItem(STORAGE_KEY, 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    test("returns 'system' when 'system' is stored", () => {
      window.localStorage.setItem(STORAGE_KEY, 'system');
      expect(getStoredTheme()).toBe('system');
    });

    test("returns 'system' when stored value is garbage", () => {
      window.localStorage.setItem(STORAGE_KEY, 'banana');
      expect(getStoredTheme()).toBe('system');
    });

    test("returns 'system' when localStorage.getItem throws", () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(getStoredTheme()).toBe('system');
      spy.mockRestore();
    });
  });

  describe('resolveTheme', () => {
    test("returns 'light' for 'light'", () => {
      expect(resolveTheme('light')).toBe('light');
    });

    test("returns 'dark' for 'dark'", () => {
      expect(resolveTheme('dark')).toBe('dark');
    });

    test("returns 'dark' for 'system' when matchMedia prefers dark", () => {
      mockMatchMedia(true);
      expect(resolveTheme('system')).toBe('dark');
    });

    test("returns 'light' for 'system' when matchMedia prefers light", () => {
      mockMatchMedia(false);
      expect(resolveTheme('system')).toBe('light');
    });
  });

  describe('applyTheme', () => {
    test("adds the 'dark' class to documentElement for 'dark'", () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test("removes the 'dark' class for 'light'", () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('persists the chosen theme to localStorage', () => {
      applyTheme('dark');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    test("respects matchMedia when applying 'system'", () => {
      mockMatchMedia(true);
      applyTheme('system' satisfies Theme);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      mockMatchMedia(false);
      applyTheme('system');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
