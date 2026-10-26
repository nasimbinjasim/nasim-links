-- Run this once in Supabase Dashboard -> SQL Editor
-- All names start with lp_ so they cannot clash with your other app's tables.

create table if not exists public.lp_profile (
  id          int primary key default 1 check (id = 1),
  name        text not null,
  bio         text,
  avatar_url  text,
  updated_at  timestamptz not null default now()
);

create table if not exists public.lp_socials (
  id        bigint generated always as identity primary key,
  type      text not null check (type in ('phone','facebook','whatsapp','telegram','email')),
  value     text not null,
  position  int  not null default 0,
  is_active boolean not null default true
);

create table if not exists public.lp_links (
  id        bigint generated always as identity primary key,
  title     text not null,
  url       text not null,
  position  int  not null default 0,
  is_active boolean not null default true,
  clicks    bigint not null default 0
);

-- >>> CHANGE THIS to the email you use to sign in to /admin (keep the quotes) <<<
create or replace function public.lp_is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('nasimbinjasim@gmail.com');
$$;

-- Row Level Security: visitors can only READ active content, the logged-in admin can do everything
alter table public.lp_profile enable row level security;
alter table public.lp_socials enable row level security;
alter table public.lp_links   enable row level security;

create policy "public read profile" on public.lp_profile for select using (true);
create policy "public read socials" on public.lp_socials for select using (is_active);
create policy "public read links"   on public.lp_links   for select using (is_active);

create policy "admin all profile" on public.lp_profile for all to authenticated using (public.lp_is_admin()) with check (public.lp_is_admin());
create policy "admin all socials" on public.lp_socials for all to authenticated using (public.lp_is_admin()) with check (public.lp_is_admin());
create policy "admin all links"   on public.lp_links   for all to authenticated using (public.lp_is_admin()) with check (public.lp_is_admin());

-- Click counter (visitors cannot write to the table directly, only call this function)
create or replace function public.lp_increment_click(link_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.lp_links set clicks = clicks + 1 where id = link_id and is_active;
$$;
grant execute on function public.lp_increment_click(bigint) to anon, authenticated;

-- Starting content copied from linktr.ee/nasimbinjasim
insert into public.lp_profile (id, name, bio, avatar_url) values
  (1, 'Nasim Bin Jasim', 'Executive Engineer, NESCO',
   'https://ugc.production.linktr.ee/269c0487-75ba-4512-95db-4b6da2fe5265_55665.jpeg')
on conflict (id) do nothing;

insert into public.lp_links (title, url, position) values
  ('Sent file to Nasim', 'https://tally.so/r/A7LgvN', 0),
  ('Download My CARD',   'https://vcf.fyi/686369d4',  1);

-- Contact icons. The public Linktree page only exposes the icon labels (not the numbers/URLs),
-- so these are hidden placeholders. Fill in the real values in /admin and switch them on.
insert into public.lp_socials (type, value, position, is_active) values
  ('phone',    '+8801XXXXXXXXX',                    0, false),
  ('facebook', 'https://facebook.com/your-profile', 1, false),
  ('whatsapp', '+8801XXXXXXXXX',                    2, false),
  ('telegram', '@your_username',                    3, false),
  ('email',    'you@example.com',                   4, false);
