# ngCommerce case-study content

Reviewed 25 October 2026. The canonical narrative is the ngCommerce entry in `src/app/content.ts`.

## Evidence and limits

- [Live storefront](https://ngcommerce.rshossain.me/home): category navigation, catalogue search, cart access, loading/empty states and retry feedback were observed.
- Existing screenshots `public/work/ngc-1.jpg`, `ngc-2.jpg` and `ngc-3.jpg` show the category overview and catalogue search/category/price controls. They also show empty results and failed requests; they are not evidence of a populated catalogue or completed purchase.
- The live entry bundle `main-L33MJSEF.js` references public application chunks. On the review date, [the category-service bundle](https://ngcommerce.rshossain.me/chunk-4NWM3R5F.js) contained the category cache and its expiry logic; [the product-card bundle](https://ngcommerce.rshossain.me/chunk-TVICII7K.js) contained the IntersectionObserver image loader and fallback path. Bundle filenames are deployment-specific and may change.
- Lead UI Engineer is the existing portfolio attribution. The problem statement describes the integration needs of the observed interface; it does not imply customer interviews or a measured research finding.
- Some live catalogue requests failed during review. The result describes the delivered interface and integration patterns, not a verified checkout, production availability, conversion improvement or performance benchmark.
- Removed unsupported claims about steady 60fps, measured slow-network testing, silent token refresh and pixel-perfect Figma translation from the narrative. The latter implementation claims were not independently established in this review.

## Prepare a CMS draft

1. Export the current draft from CMS Settings.
2. Use the repository's supported Node version:

   ```sh
   node scripts/prepare-project-draft.mjs "ngCommerce" /absolute/path/current-draft.json /absolute/path/ngcommerce-draft.json
   ```

3. Import the generated JSON in CMS Settings, review **Preview draft**, then save. Publication remains a separate confirmed CMS action.

Only ngCommerce's description, stack and case-study fields are merged. Images, URL, slug, palette, ordering, other projects and other sections are retained. The helper makes no network requests and refuses to overwrite an existing file. Start from a fresh export to include unpublished edits.

The generic command also accepts `Styloviz`; the existing `prepare-styloviz-draft.mjs` command remains compatible.

Run `npm run test:content` to check merge preservation, output protection and compatibility.
