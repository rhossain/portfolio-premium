# Styloviz case-study content

Reviewed 25 October 2026. The canonical local narrative lives in the Styloviz entry of `src/app/content.ts`, and appears in the selected-project summary and the Problem → Responsibility → Key decisions → Result sections of the case study.

## Evidence

- [Styloviz homepage](https://styloviz.dev/): observed 169 components, 21 application templates, Angular 21/22, optional backend adapter, runnable templates and an interactive playground.
- [Connecting to a backend](https://styloviz.dev/docs/connecting-to-a-backend): shared query/page/error/item-key types, transport-independent components, optional adapter, request guards, cancellation, debouncing and status-aware retries.
- Creator & Lead Engineer is the existing portfolio attribution. The problem statement synthesizes the integration needs described in the guide; it is not a customer quote or a claim about conducted user research.
- The result describes shipped product scope. It does not claim customer adoption, revenue, conversion, time savings, measured performance gains or certified accessibility. Counts are a dated public-site observation, not an independent repository audit.

## Apply to an existing CMS draft

Supabase remains the public source of truth. Updating fallback content does not overwrite a published document or an unpublished server draft.

1. In CMS Settings, export the current draft to a local JSON file.
2. Run with the repository's supported Node version:

   ```sh
   node scripts/prepare-styloviz-draft.mjs /absolute/path/current-draft.json /absolute/path/styloviz-draft.json
   ```

3. Import the generated file in CMS Settings and use **Preview draft**. Review the project summary and complete case study before saving.
4. Use the existing publication review when ready to make the draft public.

The preparation script updates only Styloviz's description, stack and case-study fields. It retains its media, stable slug, URL, position, styling and every other project's content. It refuses to overwrite the source or an existing output file, and makes no network requests. Always use a fresh draft export so unpublished edits remain included.
