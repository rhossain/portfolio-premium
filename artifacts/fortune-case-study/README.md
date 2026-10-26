# Fortune case-study content

Reviewed 25 October 2026. Canonical copy is the Fortune entry in `src/app/content.ts`.

## Evidence and limits

The existing project record supplies the UI Engineer attribution and HTML5/Tailwind CSS/JavaScript stack. No maintained live-project URL, implementation source or measured outcome is available for this project in the repository.

The supplied images establish these visible layouts:

- `public/work/fortune-1.jpg`: dark campaign homepage, jewellery category tiles, new-arrival product cards, brand story and footer.
- `public/work/fortune-2.jpg`: product gallery and thumbnails, price, metal options, quantity, purchase action, detail/shipping/care sections and related pieces.
- `public/work/fortune-3.jpg`: collection grid with price, material and length controls, sorting and pagination.

The problem and decisions are an editorial interpretation of visible design choices, not independently verified implementation history, user research or tested interactive behaviour. Role and technology attribution retain the existing owner-supplied record.

Removed claims of instant filtering on large collections, verified mobile reflow down to 320px and a tested token implementation. Screenshots alone do not verify those behaviours. No sales, conversion, performance, checkout-completion or accessibility-conformance result is claimed. Reviews, warranty promises and inventory text embedded in images are not used as business evidence. A browser address depicted in a screenshot is not assigned as a project URL.

## Prepare a CMS draft

1. Export the current draft from CMS Settings.
2. Run with the supported Node version:

   ```sh
   node scripts/prepare-project-draft.mjs "Fortune" /absolute/path/current-draft.json /absolute/path/fortune-draft.json
   ```

3. Import the generated JSON, review **Preview draft**, then save. Publication remains a separate confirmed action.

The helper matches the exact project title because there is no maintained live URL. It merges only description, stack and case-study fields, preserving media, stable slug, palette, ordering, unrelated projects and unpublished edits. It makes no network requests and refuses to overwrite existing files.

Run `npm run test:content` for merge safety checks. Desktop/mobile preview checks verify this portfolio's rendering of the supplied content; they do not certify the original storefront's responsive behaviour.
