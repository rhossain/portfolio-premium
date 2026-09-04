create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.portfolio_documents (
  document_key text primary key,
  draft_content jsonb not null check (jsonb_typeof(draft_content) = 'object'),
  published_content jsonb not null check (jsonb_typeof(published_content) = 'object'),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.portfolio_revisions (
  id bigint generated always as identity primary key,
  document_key text not null references public.portfolio_documents(document_key) on delete cascade,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  version integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index portfolio_revisions_document_key_idx
  on public.portfolio_revisions (document_key, created_at desc);

create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = (select auth.uid());
  return new;
end;
$$;

create trigger set_portfolio_documents_updated_at
before update on public.portfolio_documents
for each row execute function public.set_portfolio_updated_at();

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.register_portfolio_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'rshossain.bd@gmail.com'
     and new.email_confirmed_at is not null then
    insert into public.admin_users (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do update set email = excluded.email;
  end if;
  return new;
end;
$$;

create trigger register_portfolio_admin_after_auth
after insert or update of email_confirmed_at, email on auth.users
for each row execute function public.register_portfolio_admin();

insert into public.admin_users (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = 'rshossain.bd@gmail.com'
  and email_confirmed_at is not null
on conflict (user_id) do nothing;

alter table public.admin_users enable row level security;
alter table public.portfolio_documents enable row level security;
alter table public.portfolio_revisions enable row level security;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.portfolio_documents from anon, authenticated;
revoke all on public.portfolio_revisions from anon, authenticated;

grant select on public.portfolio_documents to authenticated;
grant update (draft_content) on public.portfolio_documents to authenticated;
grant select on public.portfolio_revisions to authenticated;

create policy portfolio_documents_admin_select
on public.portfolio_documents
for select to authenticated
using ((select public.is_portfolio_admin()));

create policy portfolio_documents_admin_update
on public.portfolio_documents
for update to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

create policy portfolio_revisions_admin_select
on public.portfolio_revisions
for select to authenticated
using ((select public.is_portfolio_admin()));

create or replace function public.get_public_portfolio()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select published_content
  from public.portfolio_documents
  where document_key = 'main';
$$;

create or replace function public.publish_portfolio()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  published jsonb;
begin
  if not (select public.is_portfolio_admin()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  insert into public.portfolio_revisions (document_key, content, version, created_by)
  select document_key, published_content, version, (select auth.uid())
  from public.portfolio_documents
  where document_key = 'main';

  update public.portfolio_documents
  set published_content = draft_content,
      version = version + 1,
      published_at = now()
  where document_key = 'main'
  returning published_content into published;

  return published;
end;
$$;

create or replace function public.restore_portfolio_revision(revision_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  restored jsonb;
begin
  if not (select public.is_portfolio_admin()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  select content into restored
  from public.portfolio_revisions
  where id = revision_id and document_key = 'main';

  if restored is null then
    raise exception 'Revision not found' using errcode = 'P0002';
  end if;

  update public.portfolio_documents
  set draft_content = restored
  where document_key = 'main';

  return restored;
end;
$$;

revoke all on function public.set_portfolio_updated_at() from public, anon, authenticated;
revoke all on function public.register_portfolio_admin() from public, anon, authenticated;
revoke all on function public.get_public_portfolio() from public;
revoke all on function public.publish_portfolio() from public;
revoke all on function public.restore_portfolio_revision(bigint) from public;
revoke all on function public.is_portfolio_admin() from public;

grant execute on function public.get_public_portfolio() to anon, authenticated;
grant execute on function public.is_portfolio_admin() to authenticated;
grant execute on function public.publish_portfolio() to authenticated;
grant execute on function public.restore_portfolio_revision(bigint) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy portfolio_media_admin_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'portfolio-media'
  and (select public.is_portfolio_admin())
);

create policy portfolio_media_admin_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'portfolio-media'
  and (select public.is_portfolio_admin())
)
with check (
  bucket_id = 'portfolio-media'
  and (select public.is_portfolio_admin())
);

create policy portfolio_media_admin_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'portfolio-media'
  and (select public.is_portfolio_admin())
);
