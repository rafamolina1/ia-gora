create table if not exists web_vitals_events (
  id               uuid primary key default gen_random_uuid(),
  metric_id        text not null,
  name             text not null check (name in ('CLS', 'LCP', 'INP', 'FCP', 'TTFB')),
  value            double precision not null,
  rating           text not null check (rating in ('good', 'needs-improvement', 'poor')),
  pathname         text not null,
  navigation_type  text,
  user_agent       text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_web_vitals_events_created_at on web_vitals_events(created_at desc);
create index if not exists idx_web_vitals_events_name_created_at on web_vitals_events(name, created_at desc);

alter table web_vitals_events enable row level security;

drop policy if exists "web_vitals: insert público" on web_vitals_events;
create policy "web_vitals: insert público"
  on web_vitals_events for insert
  with check (true);

drop policy if exists "web_vitals: leitura pública" on web_vitals_events;
create policy "web_vitals: leitura pública"
  on web_vitals_events for select
  using (true);
