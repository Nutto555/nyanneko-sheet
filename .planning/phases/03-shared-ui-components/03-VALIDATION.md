---
phase: 3
slug: shared-ui-components
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | `vite.config.ts` (inline vitest config) or `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | LOOK-03 | — | N/A | unit | `npx vitest run src/utils/imageUrl.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | LOOK-03 | — | N/A | unit | `npx vitest run src/components/character-portrait/CharacterPortrait.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | LOOK-02 | — | N/A | unit | `npx vitest run src/hooks/useCharacterSearch.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | LOOK-02 | — | N/A | unit | `npx vitest run src/components/character-multi-select/CharacterMultiSelect.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` dev dependencies
- [ ] Configure vitest with `jsdom` environment for component tests
- [ ] Stub test files for CharacterPortrait and CharacterMultiSelect

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Portrait images render correctly with Supabase URLs | LOOK-03 | Visual verification of image loading | Open dev server, navigate to a page with character portraits, verify images load |
| Combobox dropdown positioning | LOOK-02 | Visual layout verification | Open multi-select, verify dropdown appears below input without overflow |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
