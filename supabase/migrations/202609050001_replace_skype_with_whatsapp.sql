insert into public.portfolio_revisions (document_key, content, version, created_by)
select document_key, published_content, version, null
from public.portfolio_documents
where document_key = 'main'
  and exists (
    select 1
    from jsonb_array_elements(published_content->'socials') as social
    where lower(social->>'label') = 'skype'
  );

update public.portfolio_documents
set draft_content = jsonb_set(
      draft_content,
      '{socials}',
      (
        select jsonb_agg(
          case
            when lower(social->>'label') = 'skype'
              then jsonb_build_object(
                'label', 'WhatsApp',
                'url', 'https://wa.me/8801713204761'
              )
            else social
          end
          order by position
        )
        from jsonb_array_elements(draft_content->'socials') with ordinality as entries(social, position)
      ),
      true
    ),
    published_content = jsonb_set(
      published_content,
      '{socials}',
      (
        select jsonb_agg(
          case
            when lower(social->>'label') = 'skype'
              then jsonb_build_object(
                'label', 'WhatsApp',
                'url', 'https://wa.me/8801713204761'
              )
            else social
          end
          order by position
        )
        from jsonb_array_elements(published_content->'socials') with ordinality as entries(social, position)
      ),
      true
    ),
    version = version + 1,
    published_at = now()
where document_key = 'main'
  and (
    exists (
      select 1
      from jsonb_array_elements(draft_content->'socials') as social
      where lower(social->>'label') = 'skype'
    )
    or exists (
      select 1
      from jsonb_array_elements(published_content->'socials') as social
      where lower(social->>'label') = 'skype'
    )
  );
