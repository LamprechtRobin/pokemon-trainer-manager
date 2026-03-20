create extension if not exists pgcrypto;

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "imageUrl" text,
  description text,
  team jsonb not null default '[]'::jsonb,
  items jsonb not null default '[]'::jsonb,
  money integer not null default 0,
  skills jsonb,
  "createdAt" text not null,
  "updatedAt" timestamptz not null default now()
);

create or replace function public.set_trainers_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trainers_set_updated_at on public.trainers;
create trigger trainers_set_updated_at
before update on public.trainers
for each row
execute function public.set_trainers_updated_at();
