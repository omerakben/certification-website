# Security Audit Report
**Project**: Certification Website  
**Date**: 2026-05-16  
**Auditor**: Security Auditor Agent  
**Scope**: Pre-production security review  

---

## Executive Summary

The certification website has one moderate-severity dependency vulnerability (PostCSS XSS) and lacks production security headers. No critical issues detected. The codebase follows secure practices: no user input handling, proper external link safety, static content only, and a safely implemented theme script. Recommend upgrading PostCSS to 8.5.10+ and implementing a strict Content Security Policy before production launch. Estimated remediation time: 1-2 hours.

---

## Findings

### 1. Dependency Vulnerability: PostCSS XSS

**Severity**: MODERATE  
**CVE**: GHSA-qx2v-qp2m-jg93  
**Location**: pnpm-lock.yaml line 53  

**What**:  
PostCSS version 8.5.14 is vulnerable to XSS via unescaped closing style tags in CSS stringify output. The package is a dev dependency (via autoprefixer) but is bundled into the Next.js build process.

**Vulnerable version**: 8.5.14 (current)  
**Patched version**: >=8.5.10  
**Advisory URL**: https://github.com/advisories/GHSA-qx2v-qp2m-jg93

**Why it matters**:  
While this site does not accept user-generated CSS, the vulnerability exists in the build toolchain. If future features allow user-submitted content, this could become exploitable. Best practice: keep all dependencies patched.

**Fix**:
```bash
pnpm update postcss@latest
pnpm audit --prod
```

**Effort**: Small (5 minutes)

---

### 2. Missing Content Security Policy (CSP)

**Severity**: HIGH  
**Location**: No CSP headers configured  

**What**:  
The site lacks a Content Security Policy header, leaving it vulnerable to XSS attacks if future code introduces unsafe content rendering.

**Why it matters**:  
CSP is a defense-in-depth mechanism. Even though the current codebase is safe, CSP protects against supply-chain attacks, compromised dependencies, and future code changes. The inline theme script in src/components/theme-script.tsx (line 13) will require a script-src exception.

**Exploitation scenario**:  
If a future developer introduces user content in HTML context or a compromised npm package injects malicious scripts, CSP would block execution.

**Fix**:

**Recommended CSP (Next.js 16 with strict policy)**:
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ];
}
```

**Note on unsafe-inline**:  
- Next.js 16 App Router injects inline scripts for hydration and preloading.
- Tailwind CSS generates inline styles in production.
- To eliminate unsafe-inline, you would need CSP nonces for all Next.js inline scripts (complex, requires middleware).
  
For a static cert directory site, the current CSP with unsafe-inline is acceptable. Monitor Next.js updates for improved CSP support.

**If you add Google Fonts later**:
```typescript
"font-src 'self' https://fonts.gstatic.com",
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
```

**Effort**: Medium (30 minutes to implement + test)

---

### 3. Missing Security Headers

**Severity**: MEDIUM  
**Location**: No security headers configured  

**What**:  
The site lacks standard security headers: Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and X-Frame-Options.

**Why it matters**:  
These headers protect against common attacks:
- **HSTS**: Forces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME-sniffing attacks
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Disables unnecessary browser features
- **X-Frame-Options**: Prevents clickjacking

**Fix**:

Add to the headers() array in next.config.ts:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
      ],
    },
  ];
}
```

**Effort**: Small (15 minutes)

---

### 4. Theme Script Inline Safety

**Severity**: INFORMATIONAL  
**Location**: src/components/theme-script.tsx (lines 1-14)  

**What**:  
The theme bootstrap script uses an inline script tag that reads localStorage.theme and toggles the dark class on document.documentElement.

**Current implementation**:
```typescript
const themeBootstrap = `(() => {
  try {
    var stored = localStorage.getItem('theme');
    var theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();`;
```

**Security analysis**:
- SAFE: No user input flows into the template string  
- SAFE: localStorage read is validated against an allowlist  
- SAFE: No DOM manipulation beyond classList  
- SAFE: Wrapped in try-catch to prevent errors  

**Why it matters**:  
This script runs before React hydration to prevent a flash of unstyled content. It is a common Next.js pattern for theme switching. The script is static and contains no dynamic values.

**CSP compatibility**:  
Under a strict CSP, this inline script requires unsafe-inline in script-src. The recommended CSP in Finding 2 allows this pattern. If you move to nonce-based CSP in the future, you will need to generate a nonce in middleware and add it to the script tag.

**Current recommendation**: No changes needed. This is a secure, idiomatic Next.js pattern.

**Effort**: None (informational only)

---

### 5. External Link Safety Verification

**Severity**: INFORMATIONAL (PASS)  
**Location**: src/components/cert-card.tsx (line 143), src/components/site-footer.tsx (line 23)  

**What**:  
All external links use target="_blank" with rel="noopener noreferrer", preventing tabnabbing attacks.

**Verified links**:
- cert-card.tsx: User clicks "Learn more" opens cert provider URL in new tab
- site-footer.tsx: GitHub icon link

**Security attributes present**:
- target="_blank": Opens in new tab
- rel="noopener": Prevents window.opener access (blocks tabnabbing)
- rel="noreferrer": Strips referrer header (privacy)

**Third-party domains in cert data** (src/lib/certifications/data.ts):
- coursera.org (Google certs)
- learn.microsoft.com (Azure certs)
- github.com (Anthropic courses)
- academy.openai.com (OpenAI Academy)
- skillbuilder.aws (AWS training)
- skillsbuild.org (IBM SkillsBuild)
- freecodecamp.org (freeCodeCamp certs)
- academy.hubspot.com (HubSpot Academy)
- edx.org (HarvardX CS50)

**Domain verification**:  
All domains are legitimate, HTTPS-only, and well-known education/certification providers. No shortened URLs. No user-controlled URLs (all hardcoded in data.ts).

**Current recommendation**: No changes needed. Link safety is properly implemented.

**Effort**: None (informational only)

---

### 6. GitHub Link Points to Root

**Severity**: LOW  
**Location**: src/components/site-footer.tsx (line 22)  

**What**:  
The footer GitHub link points to https://github.com/ (GitHub homepage) instead of the project repository.

**Why it matters**:  
Minor UX issue. Users expect the GitHub icon to link to the source code repository. This is not a security issue, but it is a common oversight.

**Fix**:
```typescript
// src/components/site-footer.tsx (line 22)
<a
  href="https://github.com/YOUR_USERNAME/certification-website"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="GitHub Repository"
  className="..."
>
```

Replace YOUR_USERNAME with the actual GitHub username or organization.

**Effort**: Trivial (1 minute)

---

### 7. Future Risk: User-Submitted Cert Links

**Severity**: INFORMATIONAL (PLANNING)  
**Location**: Roadmap consideration  

**What**:  
The current site uses hardcoded cert data (src/lib/certifications/data.ts). If the roadmap includes user-submitted certifications, several attack vectors open:

1. **XSS via malicious URLs**: User submits javascript:alert(1) as a cert link
2. **Open redirect**: User submits legitimate-looking but malicious URLs
3. **Data exfiltration**: User submits attacker-controlled URLs with referrer leakage
4. **Phishing**: User submits lookalike domains

**Required mitigations when accepting user input**:

**A. URL validation schema** (Zod example):
```typescript
import { z } from 'zod';

const ALLOWED_PROTOCOLS = ['https:'];
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

const CertificationLinkSchema = z.string()
  .url('Invalid URL format')
  .refine((url) => {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  }, 'Only HTTPS links are allowed')
  .refine((url) => {
    const parsed = new URL(url);
    return !BLOCKED_HOSTS.includes(parsed.hostname);
  }, 'Private/local URLs are not allowed')
  .refine((url) => {
    const parsed = new URL(url);
    return !parsed.username && !parsed.password;
  }, 'URLs with credentials are not allowed');
```

**B. Content sanitization** (if descriptions become user-editable):
```bash
pnpm add dompurify isomorphic-dompurify
```
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userDescription, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
});
```

**C. Server-side link verification**:
- Validate URL format
- Check against known-good domains (allowlist) or known-bad (blocklist)
- Optionally: HEAD request to verify URL is reachable (watch for SSRF)
- Rate-limit submissions per user/IP

**D. Security headers for user content** (add to CSP):
```typescript
"upgrade-insecure-requests",
"block-all-mixed-content",
```

**Current recommendation**: Document these requirements in your roadmap. No action needed now.

**Effort**: Large (when implementing user submissions: 4-8 hours for validation, moderation, rate limiting)

---

### 8. No Secrets Committed

**Severity**: INFORMATIONAL (PASS)  
**Location**: .gitignore (lines 14-17)  

**What**:  
The .gitignore correctly excludes environment files:
```
.env.local
.env.development
.env.test
.env.production
```

**Verification**:
- No .env* files found in the repository
- No hardcoded API keys in source code
- No sensitive file patterns found

**Current recommendation**: Maintain this practice. When adding third-party integrations, always use environment variables and never commit .env files.

**Effort**: None (informational only)

---

## Prioritized Fix Plan

| Priority | Finding                          | Severity | Effort | Est. Time |
|----------|----------------------------------|----------|--------|-----------|
| 1        | Upgrade PostCSS                  | MODERATE | Small  | 5 min     |
| 2        | Add security headers             | HIGH     | Medium | 30 min    |
| 3        | Implement CSP                    | HIGH     | Medium | 30 min    |
| 4        | Fix GitHub link                  | LOW      | Trivial| 1 min     |
| 5        | Plan user input validation       | INFO     | Large  | Future    |

**Total immediate remediation time**: ~1 hour  
**Total before user submissions**: +4-8 hours

---

## Recommendations Summary

### Immediate (before production launch):
1. Run pnpm update postcss@latest to patch XSS vulnerability
2. Add security headers to next.config.ts
3. Update footer GitHub link to point to actual repository
4. Run pnpm audit to verify no remaining vulnerabilities

### Short-term (next sprint):
5. Test CSP in staging to ensure no breakage
6. Add CSP reporting endpoint to monitor violations
7. Document security practices in CONTRIBUTING.md or SECURITY.md

### Long-term (before user submissions):
8. Implement URL validation schema (Zod + allowlist)
9. Add content sanitization (DOMPurify)
10. Implement rate limiting and abuse prevention
11. Add moderation queue for user-submitted certs

---

## Configuration Block (Copy-Paste Ready)

**Complete next.config.ts with all security headers**:

```typescript
import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Testing Checklist

After applying fixes:

- Run pnpm audit (should show 0 vulnerabilities)
- Run pnpm build (should complete without errors)
- Test in browser (dark mode toggle should work)
- Open DevTools Network and check response headers:
  - Content-Security-Policy present
  - Strict-Transport-Security present
  - X-Content-Type-Options: nosniff present
  - Referrer-Policy present
  - Permissions-Policy present
  - X-Frame-Options: DENY present
- Test external links (should open in new tab with no window.opener access)
- Check browser console (no CSP violations)
- Test on Vercel preview (headers should match local)

---

## Out of Scope (Handled by Other Agents)

Per the audit brief, the following were not reviewed:
- UX/UI design patterns
- Performance optimization
- SEO configuration
- Accessibility compliance (WCAG)
- Code architecture and patterns
- Test coverage

---

## References

- **PostCSS CVE**: https://github.com/advisories/GHSA-qx2v-qp2m-jg93
- **OWASP Top 10 2021**: https://owasp.org/Top10/
- **Next.js Security Headers**: https://nextjs.org/docs/app/api-reference/next-config-js/headers
- **CSP Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Content Security Policy Evaluator**: https://csp-evaluator.withgoogle.com/

---

**Audit completed**: 2026-05-16  
**Next review**: After implementing user submissions or 6 months (whichever comes first)
