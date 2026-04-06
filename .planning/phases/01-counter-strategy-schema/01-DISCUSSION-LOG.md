# Phase 1: Counter Strategy Schema - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-06
**Phase:** 01-counter-strategy-schema
**Mode:** discuss
**Areas discussed:** Table relationships, Condition model, Access control, Seed data strategy

## Gray Areas Presented

| Area | Options Offered | User Choice |
|------|----------------|-------------|
| Table relationships | Reuse team_compositions / Separate counter tables | Separate counter tables |
| Condition model | Flat predicates / Grouped AND/OR | Flat predicates |
| RLS & access rules | (User pre-answered) | Open read/write, auth deferred to v2 |
| Seed data strategy | No offline fallback / Yes seed data | No offline fallback |

## Key Decisions

1. **Separate tables** — Counter system is independent from existing team_compositions
2. **Flat conditions** — One row per condition (character_id + must_have/must_not_have)
3. **Open access** — No auth restrictions now, structure ready for v2 tightening
4. **No offline** — Strategies require Supabase, no seed data fallback
