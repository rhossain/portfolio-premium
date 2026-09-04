create or replace function public.restrict_portfolio_signup(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  candidate_email text := lower(btrim(coalesce(event->'user'->>'email', '')));
begin
  if candidate_email = 'rshossain.bd@gmail.com' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'This is a private administrator account.'
    )
  );
end;
$$;

create or replace function public.restrict_portfolio_access_token(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  candidate_email text := lower(btrim(coalesce(event->'claims'->>'email', '')));
begin
  if candidate_email = 'rshossain.bd@gmail.com' then
    return jsonb_build_object('claims', event->'claims');
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'This is a private administrator account.'
    )
  );
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.restrict_portfolio_signup(jsonb) to supabase_auth_admin;
grant execute on function public.restrict_portfolio_access_token(jsonb) to supabase_auth_admin;

revoke execute on function public.restrict_portfolio_signup(jsonb) from public, anon, authenticated;
revoke execute on function public.restrict_portfolio_access_token(jsonb) from public, anon, authenticated;
