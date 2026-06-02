-- Run this in the Supabase SQL Editor

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  avatar     text not null,
  role       text not null default 'agent' check (role in ('agent', 'admin')),
  created_at timestamptz not null default now()
);

create table public.tickets (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  type        text not null check (type in ('REQUEST', 'DEMAND', 'PROBLEM', 'INCIDENT')),
  priority    text check (priority in ('LOW', 'MEDIUM', 'HIGH')),
  status      text not null default 'TODO' check (status in ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
  assignee_id uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  closed_at   timestamptz
);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  author_name text not null,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index on public.tickets(status);
create index on public.tickets(created_at desc);
create index on public.comments(ticket_id);

alter table public.profiles enable row level security;
alter table public.tickets  enable row level security;
alter table public.comments enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "tickets_select_agents" on public.tickets for select
  using (auth.role() = 'authenticated');

create policy "tickets_insert_anon" on public.tickets for insert
  with check (true);

create policy "tickets_update_agents" on public.tickets for update
  using (auth.role() = 'authenticated');

create policy "tickets_delete_agents" on public.tickets for delete
  using (auth.role() = 'authenticated');

create policy "comments_select" on public.comments for select
  using (auth.role() = 'authenticated');

create policy "comments_insert" on public.comments for insert
  with check (auth.role() = 'authenticated');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'name', new.email), 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.comments;
