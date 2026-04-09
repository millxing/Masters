# Masters Pool

Private Masters Pool web app built with Next.js.

## What is implemented

- Team submission with 3-8 golfers, duplicate picks allowed, and a 15% probability cap
- Private edit links for submissions
- Public leaderboard with no viewer login
- Admin console for tournament settings, golfer imports, ESPN refresh, manual score imports, and standings recompute
- Best-3 scoring engine with 4th-score tiebreaks and missed-round penalties
- Static golfer seeding from the checked-in 2025 field data on first run
- Startup-selected runtime modes with isolated JSON databases for replay, roster sandbox, leaderboard sandbox, and live

## Local run

1. Copy `.env.example` to `.env.local`
2. Set `ADMIN_PASSCODE`
3. Optionally set `ESPN_TOURNAMENT_ID`
4. Run `npm install`
5. Start the mode you want:

```bash
npm run dev:2025
npm run dev:roster
npm run dev:leaderboard
npm run dev:live
```

You can still use `npm run dev`, which defaults to `replay2025`.

## Runtime modes

- `replay2025`: canonical 2025 regression dataset with reset-to-baseline support
- `rosterSandbox`: empty/resettable roster submission environment
- `leaderboardSandbox`: canned round/final leaderboard states for scoreboard testing
- `live`: isolated live database with fixture reset/load actions blocked

## Important constraint

The current runtime adapter persists to `data/db.json` so the app works immediately in this repo without provisioning infrastructure first.

That is fine for local development and demos. It is not an acceptable production persistence layer on Vercel because filesystem writes are ephemeral. The intended production cutover is:

- Supabase Postgres for persistent data
- Vercel for the app
- The schema starter for that cutover is in `supabase/schema.sql`

The store boundary is isolated in `src/lib/data/store.ts` and `src/lib/data/repository.ts`. That is the seam to replace when you wire Supabase for deployment.
