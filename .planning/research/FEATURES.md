# Feature Landscape

**Domain:** Guild strategy hub / game counter-picking tool (Seven Knights Rebirth GvG)
**Researched:** 2026-04-06
**Reference tools studied:** SWGT (Summoners War Guild Tools), Fribbels E7 GW Meta Tracker, Pokemon Showdown Team Builder, Genshin Impact Paimon.plus team builder, crob.at PokePaste, VGC Helper

---

## Table Stakes

Features users expect from any counter-strategy tool. Missing these means the tool fails its core job.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Counter strategy display | Core job — show what counters what. No counter display = not a tool | Low | Already partially exists via team viewer |
| Search by enemy characters | Primary lookup workflow — member knows who they're fighting, needs to find counter fast | Medium | Multi-character input, fuzzy match on names |
| Character portraits in team displays | Industry standard (every tool from Showdown to E7 tracker shows sprites). Text-only teams feel unfinished | Low | Character DB already exists with images |
| Priority-ordered counter alternatives | "Try A first, then B, then C if blocked" — critical for GvG where characters get banned/used up | Medium | Ordered list per strategy; SWGT supports manual sort of counters |
| Strategy notes per counter | Explains WHY a counter works and WHAT to watch for. Every tool that survives long-term includes this (SWGT notes tab, Smogon explanations) | Low | Free-text field attached to each counter entry |
| Admin create/edit strategy | Someone has to maintain the data. If the admin UX is slow, strategies don't get updated | Medium | Character autocomplete is the critical UX piece |
| Role-based access (admin vs member) | Members read + submit; admins curate. Without separation, data integrity collapses | Medium | Supabase auth already in stack |

---

## Conditional Logic (Core Differentiator for This Tool)

This block is what separates a simple "team lookup" from a conditional counter strategy system. No off-the-shelf reference tool does this well — it is the primary reason this tool exists.

| Feature | Why Valuable | Complexity | Notes |
|---------|-------------|------------|-------|
| Condition definitions per strategy | "Use Team Z only if enemy has X but NOT Y" — captures the nuance that makes strategies actually work in-game | High | Data model challenge: conditions need AND/NOT logic, stored as structured predicates not free text |
| Negative conditions (exclude if enemy has X) | GvG enemies often have specific synergy-breakers. "Don't use this counter if they have Silence immunity" is as important as the positive case | High | Extension of condition definitions; needs NOT/exclude operator |
| Conditional branching display (if/then/else) | Renders the decision logic visually so members understand which alternative to pick and why | High | Visual tree or stepped card UI; must be scannable in 10 seconds |
| Enemy defense templates (popular comps) | Common enemy configurations show up weekly. Named templates like "Sustain Core" or "Speed Burst" let members navigate by enemy archetype, not just individual characters | Medium | Admin-curated list at top of browse/search view |

---

## Differentiators

Features that raise the tool above a static spreadsheet or a Discord pinned message. Competitive advantage within the guild context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Member strategy submission queue | Crowdsourcing counter ideas from the whole guild. Admin reviews before publishing. E7/SWGT show that guilds accumulate more knowledge than any single admin | Medium | Submission → pending status → admin approve/reject workflow; simple state machine |
| Submission notes to admin | Member explains their reasoning when submitting. Reduces admin back-and-forth for validation | Low | Text field on submission form |
| Character autocomplete for team building | Typing "Lena" shows matching characters instantly. Critical for admin speed. Pokemon Showdown's autocomplete is the gold standard UX | Low | Filter against character DB; debounced input |
| Enemy comp frequency indicators | Show which defense comps appear most often so the guild can prioritize which counters to refine first | High | Requires win/loss tracking or manual admin tagging — high effort, conditional on scope |
| Pros/cons per counter entry | Structured breakdown of why a counter works and where it can fail. SWGT provides this per defense comp | Low | Two optional structured text fields (pros, cons) on counter record |
| Strategy version/last-updated timestamp | Strategies go stale as game patches change balance. A "last updated" stamp tells members whether to trust the data | Low | Auto-set on save; display next to strategy |
| Quick-copy team composition | One-click copy of team characters for fast reference in-game. Common on PokePaste/crob.at | Low | Copy character names or IDs as formatted text |

---

## Nice-to-Have (Post-MVP)

Features worth tracking but deliberately deferred. Build only if table stakes and differentiators are solid.

| Feature | Deferred Because | Revisit When |
|---------|-----------------|--------------|
| Weakness/synergy matrix visualization | Requires character attribute data model expansion; high effort for passive reference value | Character meta system is mature |
| Import counter data from Excel | Excel import exists for teams already; counter import is a separate schema | Admin reports submission workflow is too slow |
| Counter effectiveness voting (upvotes) | SWGT has this; adds social layer but requires trust infrastructure | Member base > 10 active daily users |
| Filter counters by owned characters | Requires member-side "roster" tracking — major scope expansion | Separate milestone |
| Print/export strategy sheets | Low digital tool usage signals; teams might want offline reference | Admin requests it |

---

## Anti-Features

Things to explicitly NOT build. Each has a reason — building them would waste time or actively harm the tool.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full decision-tree visual editor (drag/drop nodes) | 90% of strategy authors are one admin. A simplified form with condition dropdowns is 10x faster to build and use than a node canvas | Structured form: select character conditions, pick counter team, add notes, set priority order |
| Real-time win/loss tracking | Requires in-game data integration or manual logging after every battle — high burden, low adoption | Let admin tag strategies as "tested" or "untested"; skip automated analytics |
| Chat or messaging within the tool | Guild already uses Discord/LINE. Adding a second channel fragments communication and splits attention | Link to Discord from the tool; don't replicate it |
| Public/multi-guild mode | Adds auth complexity, data isolation, billing concerns. Zero value for this guild's use case | Keep single-guild scope; revisit only if guild requests it explicitly |
| Automated meta tracking from game API | No official Seven Knights Rebirth API exists for this. Scraping is fragile and violates ToS | Manual admin curation is the intended model |
| Character stat optimizer | Out of scope (PvE / character building domain). This tool is GvG counter-picking only | Link to external wikis (GameWith) for character builds |
| Mobile native app | Responsive web covers the use case. Native doubles maintenance burden | PWA-level responsive design is sufficient |

---

## Feature Dependencies

```
Character DB (exists)
  └── Character autocomplete (admin team builder)
  └── Character search (member counter lookup)
  └── Character portraits in team display
  └── Condition definitions (reference characters by ID)

Role-based access (Supabase auth)
  └── Admin strategy builder
  └── Member submission queue
  └── Admin review/approve flow

Counter strategy data model
  └── Condition definitions per strategy
  └── Negative conditions
  └── Priority-ordered alternatives
  └── Strategy notes / pros / cons
  └── Conditional branching display

Enemy defense templates
  └── Counter search (templates surface at top of results)
  └── Conditional branching display (templates as named anchors)

Member submission queue
  └── Submission notes to admin
  └── Admin approve/reject workflow
```

---

## MVP Recommendation

Build in this order. Each layer is usable without the next.

**Layer 1 — Core lookup (unblocks all members immediately):**
1. Counter strategy data model with conditions and priority ordering
2. Character search — type enemy characters, get matching counter strategies
3. Character portraits in team displays
4. Strategy notes per counter

**Layer 2 — Admin productivity (unblocks fast strategy authoring):**
5. Admin strategy builder with character autocomplete
6. Condition definitions (positive + negative)
7. Enemy defense templates (admin-curated named comps)

**Layer 3 — Community loop (unblocks knowledge sharing):**
8. Member submission queue with admin review
9. Submission notes field
10. Strategy version timestamps

**Defer to later milestones:**
- Enemy comp frequency indicators (requires tracking infrastructure)
- Counter effectiveness voting (requires trust/auth maturity)
- Filter by owned characters (separate milestone)

---

## Confidence Assessment

| Finding | Confidence | Source |
|---------|------------|--------|
| Table stakes features (search, portraits, notes, priority ordering) | HIGH | Observed in SWGT, E7 tracker, Pokemon Showdown — consistent across all tools |
| Conditional logic as primary differentiator | HIGH | No surveyed tool handles this natively; all use flat lists or meta stats |
| Member submission with admin review as differentiator | HIGH | SWGT has this; documented in changelog; standard for guild tools with single-admin bottleneck |
| Anti-feature list (chat, native app, multi-guild) | HIGH | PROJECT.md explicitly marks these out of scope with matching rationale |
| Pros/cons structured field | MEDIUM | SWGT documents this; not universal across all tools |
| Enemy comp frequency indicators | LOW | Only seen in analytics-heavy tools (SWGT stats, E7 meta tracker); high implementation cost for this guild's scale |

---

## Sources

- [SWGT: Summoners War Game Tools — About](https://swgt.io/about/) — Feature changelog, defense counter data model, submission workflows
- [SWGT: 3 Monster Defense Counters](https://swgt.io/3mdc/) — Counter display format, pros/cons, notes, attack order
- [Fribbels Epic 7 GW Meta Tracker](https://fribbels.github.io/e7/gw-meta.html) — Search-by-defense, filter include/exclude, offense lookup
- [Epic Seven GW Tracker (Ark)](https://ark-gw-tracker-web.vercel.app/) — Modern E7 guild war tracking UI patterns
- [Pokemon Showdown Team Builder](https://play.pokemonshowdown.com/teambuilder) — Character autocomplete gold standard, import/export, weakness analysis
- [Best Pokemon Team Builders 2025](https://blog.poketeambuilder.app/best-team-builders-2025) — Feature comparison across team building tools
- [VGC Helper](https://vgchelper.com) — Counter-picking tool feature patterns
- [Genshin Impact Team Builder — Paimon.plus](https://paimon.plus/en/team-builder/) — Team composition planner UX patterns
- [Best Filter UI Patterns 2025](https://bricxlabs.com/blogs/universal-search-and-filters-ui) — Search UX: faceted filters, autocomplete thresholds
- [Search UX Best Practices 2026](https://www.designmonks.co/blog/search-ux-best-practices) — Autocomplete, fuzzy search, response time standards
