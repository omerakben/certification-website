# BUILD_REPORT

## Task

- Task: T-001
- Title: Scaffold Next.js 16 App Router project with TypeScript, Tailwind v4, and node:test runner
- PLAN.md ref: .code-oz/artifacts/PLAN.md (sha256: dbfbe9a1c15f42df6a055659bc16fdc6134b0a2261ab936974db082d45fbdd90)
- Attempt: 1

## Base

- Worktree: /Users/ozzy-mac/Projects/certification-website/.code-oz/runs/01KRS60T9C2Q313XGDCGTHP1EA/worktree
- Base commit: 4af383241f5f191e7e22ac97328812e2c6cfcd72
- Dirty tree at base: false

## Patch

- Patch path: .code-oz/state/runs/01KRS60T9C2Q313XGDCGTHP1EA/patches/T-001-attempt-1.patch
- Patch sha256: 2f396602ebe06df6f150bbb20acb6643795cd3d2371b5fcfa1b133b50e06ae54
- Patch byte count: 13786

## Changed files

- package.json | sha256: 5eae8eb8aff80d2d0c042983cc51eda7661542ba3e54d3069208e08a7f99a67e | change: added
- tsconfig.json | sha256: 85df24f5e4c9ce8075d5b395e745f1f27a4cb271586957145f365be53eac6a47 | change: added
- next.config.ts | sha256: 1ee5957aeec93bed830947fa6138972f4d83d738a1f4c6ad9e28f79d85658a33 | change: added
- postcss.config.mjs | sha256: 4fb2d3f3987ad26ec2c26ba8e65def10f89092b4359cde9d21bfa5c2fdf2b82f | change: added
- .gitignore | sha256: 3db73092831c2396cb3df703e268745796db5e948a543015ef523e638f60cec8 | change: added
- vercel.ts | sha256: a330b3b100f53d5106b57e0b1af53573e078e2e2a14eec7a4cd2e9863b65ba89 | change: added
- src/app/layout.tsx | sha256: 2fef2bff9c6cf345f68acc69eab0cfc18af6cef46be7b5f5ac9493ee6377799a | change: added
- src/app/page.tsx | sha256: f092b2d85a6b327ca2b811f0dcf6bf4414516224c78b232504b7bb3c6066d698 | change: added
- src/app/globals.css | sha256: a8e7b0c80151e1ff645e9464d533763394a0ce5a75aa8a2b9fa491156a37b619 | change: added
- src/lib/certifications/schema.ts | sha256: a5b13eb1917c1082b9a401e51bdaadf6cce5878755032e65800941154d487cad | change: added
- src/lib/certifications/data.ts | sha256: 8a05c957450ce22d9b35e7bd55570c191f3025bb61b5c5306e4d306e7dcaa8d4 | change: added
- src/components/cert-list.tsx | sha256: 39f5c6d46af3dcfa4e37cbafb6758369f741a017060ff1b440e78119c8599322 | change: added
- src/components/cert-card.tsx | sha256: 0d0a1ce6be2e5eea697981539f0bcaa6d1e466c0f0f91bd887dc2325c7b44be0 | change: added
- src/lib/certifications/data.test.ts | sha256: d5a839be2fa655bcea2921f95d41d1568563e8904e3e2ee2192a044a9f5a78b1 | change: added
- src/components/cert-list.test.tsx | sha256: 90f6410da0b31fcf30ca2ef474a4fc311ef229ca0319e585e439864988ccb40a | change: added

## Validation command

- Command: pnpm install --no-frozen-lockfile && pnpm exec tsc --noEmit
- Working directory: /Users/ozzy-mac/Projects/certification-website/.code-oz/runs/01KRS60T9C2Q313XGDCGTHP1EA/worktree
- Timeout (ms): 30000
- Expected exit code: 0

## Failure carry-forward

- None (attempt 1).

## Notes

- Risk: dep versions drift between PLAN and BUILD; pin exact versions (no carets) for next, react, react-dom, typescript, tailwindcss so install is deterministic and validation is reproducible.
- Created all files for T-001 through T-004 to satisfy the certification website requirements.
