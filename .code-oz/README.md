# .code-oz

This directory was scaffolded by `code-oz init`.

- **Profile:** `greenfield` (auto-detected at init time; edit `config.yaml` to override)
- **agents/** — agent and skill Markdown files (frontmatter + system prompt)
- **artifacts/** — phase outputs (`SPEC.md`, `PLAN.md`, `SOURCE_CHECK.md`, etc.)
- **state/** — top-level state directory. The active-run pointer lives at `state/active.json`; per-run state (events, gate files, current.json) lives at `state/runs/<runId>/`.
- **runs/** — per-run worktrees (M7+). Distinct from `state/runs/`.
- **config.yaml** — provider, model, and budget configuration
- **.gitignore** — runtime artifact paths excluded from version control

Commit `config.yaml`, `agents/`, and the contents of `artifacts/` so the team shares agent definitions and phase outputs. The bundled `.gitignore` excludes `state/active.json`, `state/runs/`, and `runs/` — runs are local by default; sharing a run is an explicit bundle/export step (W4+).

## Getting started

```bash
code-oz run --request "build me X"     # starts the DEFINE phase
# review .code-oz/artifacts/SPEC.md
code-oz approve define                 # advances to PLAN (stub in v0.1)
```

See https://github.com/omerakben/code-oz for the full milestone plan.
