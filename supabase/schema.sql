create table if not exists tournaments (
  id text primary key,
  name text not null,
  year integer not null,
  lock_time_iso timestamptz not null,
  entry_fee numeric not null default 65,
  viewer_passcode text not null,
  payout_round_1 numeric not null,
  payout_round_2 numeric not null,
  payout_round_3 numeric not null,
  payout_round_4 numeric not null,
  payout_final numeric not null,
  updated_at timestamptz not null default now()
);

create table if not exists golfers (
  tournament_id text not null references tournaments(id) on delete cascade,
  code text not null,
  name text not null,
  odds numeric not null,
  probability numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tournament_id, code)
);

create table if not exists submissions (
  id text primary key,
  tournament_id text not null references tournaments(id) on delete cascade,
  participant_name text not null,
  email text not null,
  venmo_handle text,
  team_name text not null,
  probability_total numeric not null,
  payment_status text not null default 'pending',
  edit_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locked_at timestamptz
);

create table if not exists submission_picks (
  submission_id text not null references submissions(id) on delete cascade,
  slot_index integer not null,
  golfer_code text not null,
  primary key (submission_id, slot_index)
);

create table if not exists score_snapshots (
  id text primary key,
  tournament_id text not null references tournaments(id) on delete cascade,
  source text not null,
  imported_at timestamptz not null default now(),
  source_label text not null,
  raw_payload jsonb not null
);

create table if not exists player_scores (
  snapshot_id text not null references score_snapshots(id) on delete cascade,
  golfer_code text not null,
  golfer_name text not null,
  status text not null,
  r1 integer,
  r2 integer,
  r3 integer,
  r4 integer,
  total integer,
  primary key (snapshot_id, golfer_code)
);

create table if not exists derived_team_standings (
  submission_id text not null references submissions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  payload jsonb not null,
  primary key (submission_id)
);
