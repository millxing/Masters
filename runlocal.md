Run one of these from Masters:

npm install
cp .env.example .env.local
npm run dev:2025
Or pick a different mode:

npm run dev:roster
npm run dev:leaderboard
npm run dev:live
Then open http://localhost:3000.

What each one is for:

dev:2025: fixed 2025 replay baseline
dev:roster: submit/edit fake rosters safely
dev:leaderboard: canned score states for scoreboard/round/overall testing
dev:live: isolated live DB, fixture reset/load actions blocked
For admin tools, go to http://localhost:3000/admin and use your ADMIN_PASSCODE from .env.local.

Useful pages:

http://localhost:3000/submit
http://localhost:3000/rosters
http://localhost:3000/scoreboard
http://localhost:3000/round-1
http://localhost:3000/overall
