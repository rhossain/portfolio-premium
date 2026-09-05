do $migration$
declare
  styloviz_project jsonb := $project$
  {
    "index": "01",
    "title": "Styloviz",
    "category": "UI Library",
    "year": "2026",
    "description": "A production-ready Angular UI ecosystem with 120 components, backend-ready state contracts, three application templates and more than 500 icons — designed, engineered and documented end to end.",
    "stack": ["Angular 21", "Tailwind CSS 4", "TypeScript", "npm"],
    "url": "https://styloviz.dev",
    "images": [
      {
        "src": "https://czmpwatylyfhsjggdsiu.supabase.co/storage/v1/object/public/portfolio-media/work/styloviz-1.webp",
        "alt": "Styloviz — backend-ready component overview",
        "storagePath": "work/styloviz-1.webp"
      },
      {
        "src": "https://czmpwatylyfhsjggdsiu.supabase.co/storage/v1/object/public/portfolio-media/work/styloviz-2.webp",
        "alt": "Styloviz — shared data-state architecture",
        "storagePath": "work/styloviz-2.webp"
      },
      {
        "src": "https://czmpwatylyfhsjggdsiu.supabase.co/storage/v1/object/public/portfolio-media/work/styloviz-3.webp",
        "alt": "Styloviz — interactive component playground",
        "storagePath": "work/styloviz-3.webp"
      }
    ],
    "palette": { "base": "#08101f", "orb": "#2563eb", "orb2": "#06b6d4" },
    "wide": true,
    "caseStudy": {
      "role": "Creator & Lead Engineer",
      "overview": "Styloviz is an Angular component ecosystem built for teams shipping real applications. It combines reusable interface primitives with shared backend-ready state contracts, production templates, documentation and an interactive playground.",
      "highlights": [
        "120 standalone components, three production templates and a tree-shakeable library of more than 500 icons",
        "Shared loading, error, retry and empty-state contracts across 92 components that accept live data",
        "Angular Signals, OnPush change detection, strict TypeScript, accessible interactions and light/dark theming",
        "Free and Pro npm packages supported by live documentation, editable examples and zero runtime dependencies"
      ]
    }
  }
  $project$::jsonb;
begin
  insert into public.portfolio_revisions (document_key, content, version, created_by)
  select document_key, published_content, version, null
  from public.portfolio_documents
  where document_key = 'main'
    and not exists (
      select 1
      from jsonb_array_elements(published_content->'projects') as project
      where lower(project->>'title') = 'styloviz'
    );

  update public.portfolio_documents
  set draft_content = jsonb_set(
    draft_content,
    '{projects}',
    jsonb_build_array(styloviz_project) || coalesce(
      (
        select jsonb_agg(
          jsonb_set(project, '{index}', to_jsonb(lpad((position + 1)::text, 2, '0')), true)
          order by position
        )
        from jsonb_array_elements(draft_content->'projects') with ordinality as entries(project, position)
      ),
      '[]'::jsonb
    ),
    true
  )
  where document_key = 'main'
    and not exists (
      select 1
      from jsonb_array_elements(draft_content->'projects') as project
      where lower(project->>'title') = 'styloviz'
    );

  update public.portfolio_documents
  set published_content = jsonb_set(
        published_content,
        '{projects}',
        jsonb_build_array(styloviz_project) || coalesce(
          (
            select jsonb_agg(
              jsonb_set(project, '{index}', to_jsonb(lpad((position + 1)::text, 2, '0')), true)
              order by position
            )
            from jsonb_array_elements(published_content->'projects') with ordinality as entries(project, position)
          ),
          '[]'::jsonb
        ),
        true
      ),
      version = version + 1,
      published_at = now()
  where document_key = 'main'
    and not exists (
      select 1
      from jsonb_array_elements(published_content->'projects') as project
      where lower(project->>'title') = 'styloviz'
    );
end
$migration$;
