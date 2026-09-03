-- Supabase free-tier schema for Emmy's Agency leads (minimal v1, no passports).
-- Run once in Supabase SQL editor. Table editable/deletable anytime.
create table if not exists leads (
  id bigint generated always as identity primary key,
  name text not null,
  contact text not null,
  university text not null,
  message text not null,
  created_at timestamptz default now()
);
-- Open inserts to anon (contact form), block reads/updates/deletes without service key.
alter table leads add column if not exists university text;
alter table leads enable row level security;
drop policy if exists "anon insert leads" on leads;
create policy "anon insert leads" on leads for insert to anon with check (true);
