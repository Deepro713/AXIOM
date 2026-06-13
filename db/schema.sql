-- AXIOM Command — implementation tracking schema (NeonDB / Postgres)
-- Idempotent: safe to run repeatedly.

create table if not exists phases (
  phase_key     text primary key,
  name          text not null,
  description   text,
  target_window text,
  sort_order    int  not null,
  status        text not null default 'not_started'
                  check (status in ('not_started','in_progress','done')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists features (
  code          text primary key,
  phase_key     text not null references phases(phase_key) on update cascade,
  title         text not null,
  description   text,
  priority      text not null check (priority in ('P0','P1','P2')),
  prd_section   text,
  status        text not null default 'planned'
                  check (status in ('planned','in_progress','blocked','in_review','done')),
  progress      int  not null default 0 check (progress between 0 and 100),
  target_window text,
  owner         text,
  notes         text,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_features_phase  on features(phase_key);
create index if not exists idx_features_status on features(status);

-- keep updated_at fresh on any row change
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_phases_updated on phases;
create trigger trg_phases_updated  before update on phases
  for each row execute function set_updated_at();

drop trigger if exists trg_features_updated on features;
create trigger trg_features_updated before update on features
  for each row execute function set_updated_at();

-- per-phase rollup for monitoring
create or replace view phase_progress as
select
  p.phase_key,
  p.name,
  p.target_window,
  p.status,
  count(f.code)                                   as features,
  coalesce(round(avg(f.progress))::int, 0)        as avg_progress,
  count(*) filter (where f.status = 'done')        as done,
  count(*) filter (where f.status = 'in_progress') as in_progress,
  count(*) filter (where f.status = 'blocked')     as blocked,
  count(*) filter (where f.status = 'planned')     as planned
from phases p
left join features f using (phase_key)
group by p.phase_key, p.name, p.target_window, p.status, p.sort_order
order by p.sort_order;
