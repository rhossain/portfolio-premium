# Nop Kalles case-study content

Reviewed 25 October 2026. Canonical copy is the Nop Kalles entry in `src/app/content.ts`.

## Evidence and limits

The existing project record supplies the UI Engineer attribution and nopCommerce/Razor/SCSS/JavaScript stack. There is no maintained live-project URL or implementation source for this theme in this repository.

The supplied project images establish the visible layouts:

- `public/work/kalles-1.jpg`: seasonal campaign, collection links, product grid, editorial panels and footer.
- `public/work/kalles-2.jpg`: catalogue with category, size, colour and price controls, sorting and pagination.
- `public/work/kalles-3.jpg`: product photography/thumbnails, price, colour, size, quantity, purchase action, supporting detail and related products.

The problem and decisions are an editorial interpretation of those visible layouts, not a record of user interviews, a measured usability study or independently verified implementation history. They describe visual hierarchy and placement, not tested interactive behaviour. The role and technology stack retain the existing owner-supplied attribution.

Removed unsupported conversion/drop-off claims and claims of verified checkout behaviour, image zoom, variant-aware image switching, untouched platform core code and reusable SCSS mixins. No conversion result, benchmark, customer testimonial or checkout completion is asserted. Text and reviews embedded in the images are not treated as business evidence. The browser address depicted in an image is not assigned as a project URL.

## Prepare a CMS draft

1. Export the current draft from CMS Settings.
2. Run with the supported Node version:

   ```sh
   node scripts/prepare-project-draft.mjs "Nop Kalles" /absolute/path/current-draft.json /absolute/path/nop-kalles-draft.json
   ```

3. Import in CMS Settings and use **Preview draft** to review the summary and full case study before saving. Publication remains a separate confirmed action.

The helper matches the exact title because this project has no maintained live URL. It updates only the description, stack and case-study fields. Images, slug, palette, order, unrelated projects and other unpublished edits are retained. It makes no network requests and refuses to overwrite existing files.

Run `npm run test:content` for the merge safety checks, including title-only matching and retention of owner captions and extension fields.
