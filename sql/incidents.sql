-- ============================================
-- INCIDENTES: Señales OSINT agrupadas → acción
-- ============================================
create table if not exists public.incidents (
  id bigint primary key generated always as identity,
  type text not null,              -- terrorism, airspace_closure, conflict, natural_disaster, flight_disruption, health_outbreak, protest, travel_advisory
  entity_id text not null unique,  -- auto: terrorism-france-20240507
  title text not null,             -- "Huelga aeropuertos Francia"
  description text,                -- contexto breve
  country_code text,               -- FR, ES, etc.
  location text,                   -- "París, Lyon"
  severity text,                   -- low, medium, high, critical
  recommendation text,             -- "Considera cambiar fecha o usar tren"
  action_verb text,                -- "evitar", "monitorizar", "preparar", "cancelar"
  source text,                     -- gdelt, rss, reddit, gdacs, usgs, combined
  signal_count int default 1,
  detected_at timestamptz default now(),
  resolved_at timestamptz,
  is_active boolean default true,
  expires_at timestamptz           -- auto-resolve after this date
);

create index idx_incidents_active_type on public.incidents(type) where is_active = true;
create index idx_incidents_country on public.incidents(country_code) where is_active = true;
create index idx_incidents_expires on public.incidents(expires_at) where is_active = true;

alter table public.incidents enable row level security;
create policy "Anyone can read incidents" on public.incidents for select using (true);


-- ============================================
-- VALORACIONES: ¿Te fue útil esta alerta?
-- ============================================
create table if not exists public.incident_ratings (
  id bigint primary key generated always as identity,
  incident_id bigint not null references incidents(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  user_ip text not null,
  created_at timestamptz default now()
);

create index idx_ratings_incident on public.incident_ratings(incident_id);

alter table public.incident_ratings enable row level security;
create policy "Anyone can read incident_ratings" on public.incident_ratings for select using (true);
create policy "Anyone can rate incident" on public.incident_ratings for insert with check (true);
