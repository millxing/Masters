# AGENTS.md

## Purpose

This repo is a local-first Next.js app for a Masters pool. It currently runs against a JSON file at `data/db.json` and has enough mock/seeded 2025 data to exercise the public pages locally.

## Current State

- `data/db.json` is populated with:
  - 39 real submissions from `MastersPool2025_Final Rosters.xlsx`
  - 95 golfer rows
  - a mock ESPN snapshot for the 2025 Masters final leaderboard
  - derived standings for scoreboard, round pages, and overall
- Round pages and the overall page use the same scrollable table structure.
- Displayed scores are relative to par, matching the pool spreadsheets.
- Overall and round displays use the pool's effective scoring display, including fallback values for missing rounds / `No Player`.
- The scoring engine still compares raw stroke counts internally. For Augusta this preserves the same ordering because par is constant across rounds.

## Source Files That Matter

- `src/lib/scoring/engine.ts`
  - best-3 scoring, 4th-score tiebreak, rank assignment
- `src/lib/pool-display.ts`
  - transforms stored scores/standings into round/overall table rows
- `src/lib/espn/provider.ts`
  - ESPN leaderboard parser
- `src/lib/score-import.ts`
  - score import and name normalization
- `src/components/round-results-table.tsx`
  - shared table for round pages and overall
- `src/components/leaderboard-table.tsx`
  - scoreboard table
- `data/db.json`
  - current local runtime data

## Spreadsheet Inputs

- `MastersPool2025_Blank.xlsx`
  - original blank entry sheet plus golfer pool / odds / normalized probabilities
- `MastersPool2025_Final Rosters.xlsx`
  - actual 2025 team rosters
- `MastersPool2025_Round4.xlsx`
  - authoritative reference for round-by-round and final displayed scoring

If the UI and workbook disagree, trust the workbook and `rules.txt`.

## Scoring Notes

- Pool scoring is always displayed relative to par.
- Each round is the lowest combined score of any 3 golfers on a team.
- Final is the lowest combined 4-round total of any 3 golfers.
- Tiebreak is the 4th best golfer.
- Missing rounds and `No Player` are scored as highest round score plus one.
- Playoff holes do not count.

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Create local env if needed:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

Useful pages:

- `/scoreboard`
- `/round-1`
- `/round-2`
- `/round-3`
- `/round-4`
- `/overall`
- `/rosters`
- `/admin`

## Local Data / Env Notes

- Runtime persistence is file-based through `data/db.json`.
- `src/lib/config.ts` supports `DB_PATH`; if set, the app will use that file instead of `data/db.json`.
- `.env.example` includes:
  - `NEXT_PUBLIC_APP_URL`
  - `COOKIE_SECRET`
  - `ADMIN_PASSCODE`
  - `DEV_VIEWER_PASSCODE`
  - `DEFAULT_LOCK_TIME_ISO`
  - `ESPN_TOURNAMENT_ID`

## Verification

Run:

```bash
npm test
npm run typecheck
```

Important:

- Tests are configured to use a temp database via `tests/setup.ts`.
- Do not point tests at the live `data/db.json`.

## Known Constraints

- `data/db.json` is fine for local development and layout testing, not production.
- Supabase migration scaffolding exists in `supabase/schema.sql`, but the runtime still uses the JSON store.
- The scoreboard and overall pages now reflect the 2025 mock import state, not an automated live sync.

## Editing Guidance

- If you change scoring display behavior, validate it against `MastersPool2025_Round4.xlsx`.
- If you change ESPN parsing, validate against real captured ESPN leaderboard HTML, not just synthetic test markup.
- If you change table layout, verify `/round-4` and `/overall` in a narrow desktop browser, not only full-width.
