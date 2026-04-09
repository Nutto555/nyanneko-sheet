---
phase: 6
slug: frontend-ui-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-09
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual verification + ESLint + TypeScript compiler |
| **Config file** | `eslint.config.js`, `tsconfig.app.json` |
| **Quick run command** | `npx tsc --noEmit && npx eslint src/` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Full build must succeed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 1 | UI-04 | — | N/A | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 6-01-02 | 01 | 1 | UI-03 | — | N/A | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 6-02-01 | 02 | 1 | UI-02 | — | N/A | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 6-02-02 | 02 | 1 | UI-01 | — | N/A | build | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 6-03-01 | 03 | 2 | UI-03 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 6-03-02 | 03 | 2 | UI-01 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. This phase is CSS/layout/component refactoring — TypeScript compiler and build verification are sufficient automated checks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Character portraits display correctly in all contexts | UI-02 | Visual rendering check | Navigate to Characters, CharacterDetail, Counter Lookup, Admin builder — verify portraits render with correct sizing and fallback |
| Mobile layout is usable during GvG battles | UI-03 | Requires device/viewport testing | Resize browser to 375px width, navigate all pages, verify no horizontal scroll and text is readable |
| Navigation provides one-click access to all sections | UI-04 | Interaction flow check | Click each nav link on desktop and mobile — verify Counter Lookup, Team Browser, Character Database, Admin all reachable |
| Consistent spacing and typography across pages | UI-01 | Visual design consistency | Compare all pages side-by-side — verify matching container widths, padding, font usage, color palette |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
