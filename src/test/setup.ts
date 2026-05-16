import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// vitest-axe ships its matcher only under the /matchers subpath in this build.
expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
});
