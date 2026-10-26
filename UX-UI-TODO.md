# UX/UI refinement TODO

Created: 24 October 2026

Status: Main implementation pass completed on `codex/ux-ui-refinement`. Checked tasks have shipped in the working tree; open tasks have explicit remaining content or verification work below. No deployment has been performed.

## Objective and scope

Make the portfolio and CMS feel more premium, elegant, and modern through clearer navigation, earlier project evidence, readable typography, restrained motion, and dependable editing workflows.

Preserve the existing identity: copper accents, Fraunces display typography, the SH monogram, framed photography, the focused project viewer, and the light capability section. Evaluate visual refinements against the existing `DESIGN.md`; update that document only when a durable design decision is accepted.

The audit covered the rendered public homepage, public sections, case-study dialog, and admin login on desktop and mobile. Authenticated CMS findings were identified through source review and need confirmation in a signed-in session. Measurements below reflect the published content served during the audit, not permanent layout requirements.

## Execution rules

- Work through the phases in order; safety and interaction fixes precede visual polish.
- Complete each task's acceptance criteria and relevant checks before marking it done.
- Record unresolved product decisions before implementing dependent tasks.
- Use verified project outcomes and claims; do not invent metrics or testimonials.
- Verify CMS changes against test content without modifying the live publication.
- Reuse shared tokens and controls for recurring behavior.

## Phase 0 — Confirm the plan and establish a baseline

- [x] **P0-01 — Confirm the main audience and primary action.**
  - **Implementation status:** Implementation decision: employers/collaborators; Work is primary, Contact secondary. Recorded in UX-CONTRACT.md.
  - Proposed direction: employers and collaborators evaluating frontend engineering work; primary action is viewing selected work, followed by contact.
  - Decide whether recruitment, client enquiries, or another audience should take precedence.
  - Done when: the audience and primary/secondary actions are recorded and guide the homepage, work viewer, and contact section.

- [x] **P0-02 — Confirm the homepage sequence.**
  - **Implementation status:** Implemented the proposed work-first sequence. Existing section anchors remain supported.
  - Proposed sequence: Hero → Selected work → Short introduction → Experience → Capabilities → Contact.
  - Alternative: retain the current section order and add a featured-project preview directly after the hero.
  - Done when: one approach is selected, including how existing anchor links and section labels will be preserved or updated.

- [x] **P0-03 — Confirm optional content and interaction choices.**
  - **Implementation status:** Decisions: retain a subtle ornamental cursor alongside the native pointer and secondary physics; disable nonessential motion for reduced-motion users. Sort supplied professional links first. No résumé or unsupported claims were added.
  - Decide whether to include a public résumé, which professional social destinations to prioritize, and which project outcomes can be substantiated.
  - Decide whether to retain the custom cursor and physics interaction, and how capability selections should provide useful evidence.
  - Done when: decisions and any missing content/assets are listed without placeholder claims.

- [ ] **P0-04 — Capture a reproducible baseline.**
  - **Implementation status:** Partial/deferred: original public screenshots and source-review findings form the baseline. Authenticated editor behavior is now exercised with isolated browser fixtures; an authenticated screenshot of the historical pre-change UI cannot be captured retrospectively.
  - Capture the homepage, all public sections, project switching, case-study open state, login, and authenticated CMS editor states.
  - Include desktop 1440 × 900 and mobile 390 × 844; check 320px and 768px widths.
  - Confirm CMS workflow risks in a signed-in test session, including save, publish, navigation, and image removal.
  - Done when: baseline screenshots and a behavior checklist exist, with browser-tested findings distinguished from code-review findings.

## Phase 1 — Repair interaction and editing risks

- [x] **P1-01 — Make case-study dialogs keyboard accessible.**
  - Move focus into the dialog when it opens, contain focus, and make background content inert.
  - Preserve Escape closing and scroll locking; restore focus to the opening control on close.
  - Keep the close control reachable on narrow and short screens.
  - Done when: Tab and Shift+Tab never reach background controls while open, Escape closes the dialog, and focus returns predictably.
  - Owner: `src/app/components/case-study.component.ts`.

- [x] **P1-02 — Add public mobile navigation.**
  - Provide a compact menu for Work, About, Experience, Capabilities, and Contact.
  - Keep Work and Contact easy to reach; expose expanded/collapsed state to assistive technology.
  - Support keyboard use, dismissal, and focus restoration appropriate to the chosen menu pattern.
  - Done when: every public section is reachable without scrolling through the entire page, and opening/closing the menu introduces no overlap or scroll trap.
  - Owner: `src/app/components/nav.component.ts`.

- [x] **P1-03 — Protect unsaved CMS edits.**
  - **Implementation status:** Implemented a leave guard, actual-unload warning, explicit recovery/discard, and 24-hour tab-scoped content recovery. Optimistic update-timestamp checks prevent stale tabs from silently overwriting newer server drafts.
  - Guard navigation away from the editor and browser unload when changes would be lost.
  - Provide recoverable drafts with explicit saved, unsaved, saving, failed, and recovered states.
  - Define recovery storage and lifetime before implementation; do not persist authentication secrets with draft data.
  - Done when: leaving, refreshing, returning after a failed save, and cancelling navigation cannot silently discard work; section-to-section navigation preserves the intended draft.
  - Owners: admin editor, routes, and portfolio admin service.

- [x] **P1-04 — Separate draft image removal from permanent file deletion.**
  - **Implementation status:** Implemented draft-only removal and removed the frontend storage-delete method. Permanent cleanup remains unavailable, so retained published/revision references cannot be deleted through this UI.
  - Removing an image from a draft must not immediately delete a file needed by published content.
  - Check published references and any retained revision references before permanent deletion; define the retention policy before adding cleanup.
  - Done when: removing a shared image from a draft leaves the published portfolio intact, and deletion is available only when the applicable reference/retention rules permit it.
  - Owners: `src/app/admin/admin-content.component.ts`, `src/app/services/portfolio-admin.service.ts`, and applicable storage/database policies.

- [x] **P1-05 — Replace native deletion confirmations.**
  - Use one accessible, app-owned confirmation pattern for project, experience, and permanent media deletion.
  - Name the object, scope, and consequence; keep safe and destructive actions visually distinct.
  - Offer Undo for reversible draft removals where reliable.
  - Done when: no CMS deletion uses browser `confirm()`, serious confirmations initially focus the safe action, and cancellation preserves data and focus.

- [x] **P1-06 — Clarify document-wide publishing.**
  - Show a summary of all pending document changes before publication, even when the user is editing one section.
  - Add an authenticated draft preview that does not expose drafts publicly.
  - Distinguish saving a draft from publishing and keep success/failure feedback accessible.
  - Done when: the user can inspect the draft and understand every affected section before committing; errors preserve work and offer recovery.

- [x] **P1-07 — Make the dashboard project action truthful.**
  - Either make “Add project” open a new project workflow or rename the existing destination “Manage projects.”
  - Done when: the label accurately describes the resulting screen and action.
  - Owner: `src/app/admin/admin-dashboard.component.ts`.

## Phase 2 — Improve homepage hierarchy and navigation

- [x] **P2-01 — Rewrite and reposition the hero value proposition.**
  - Give the professional role and value statement meaningful prominence beside the name.
  - Suggested starting point: “Frontend engineer building thoughtful, dependable product interfaces.” Refine against the agreed audience and actual experience.
  - Add one verified proof point, such as the current role, relevant experience, or a featured project.
  - Done when: the first viewport clearly communicates who the portfolio belongs to, the work offered, and a credible reason to explore.
  - Owner: `src/app/components/hero.component.ts` and CMS-managed profile content.

- [x] **P2-02 — Add clear hero actions.**
  - Add “View selected work” as the primary action and “Get in touch” as the secondary action, subject to P0-01.
  - Keep the physics interaction secondary if retained.
  - Done when: both actions are visible, keyboard accessible, and functional on desktop and mobile, with obvious hover/focus/pressed states.

- [x] **P2-03 — Recompose the mobile hero.**
  - Reduce the large empty area above the name.
  - Explore a small portrait treatment, readable introduction, and visible actions without crowding the screen.
  - Done when: the mobile first viewport has a deliberate hierarchy, no clipped text or overlapping controls, and reachable primary actions at 320px and 390px widths.

- [x] **P2-04 — Bring project evidence forward.**
  - Implement the selected sequence or featured-project preview from P0-02.
  - Baseline: Work starts around 3,710px on desktop and 4,865px on mobile.
  - Done when: visible project evidence appears within the first two viewport heights at the baseline sizes, with a direct route to the full work viewer.

- [x] **P2-05 — Improve section orientation and browser navigation.**
  - Show the active section in navigation.
  - Keep anchor URLs, direct section entry, refresh, and browser Back/Forward coherent with smooth scrolling.
  - Include Capabilities in navigation and account for sticky-header offsets.
  - Done when: each section can be shared and revisited, and scrolling does not create excessive browser-history entries.
  - Owners: navigation and scroll service.

## Phase 3 — Refine the visual system and motion

- [x] **P3-01 — Establish a readable supporting type scale.**
  - Target approximately 15–17px for body copy and 12–13px for meaningful utility text, adjusted to the chosen font and context.
  - Reserve tiny uppercase labels and wide tracking for nonessential decoration.
  - Done when: navigation, descriptions, metadata, captions, and form labels are comfortably readable at normal size and remain usable at 200% zoom.

- [x] **P3-02 — Consolidate text contrast and surface tokens.**
  - Define consistent primary, secondary, and muted text roles for dark and light surfaces, including the CMS.
  - Check composited colors over texture, overlays, and imagery, rather than checking token values alone.
  - Done when: meaningful text meets the applicable WCAG 2.2 AA contrast requirements and recurring roles use shared tokens.
  - Owner: `src/styles.css`, component styles, and `DESIGN.md`.

- [x] **P3-03 — Refine spacing and decorative hierarchy.**
  - Preserve the portrait framing and typography as the signature.
  - Lower grain intensity, especially over screenshots and long reading surfaces; reduce competition from background lettering and hero layers.
  - Make section spacing deliberate across mobile and desktop, avoiding oversized gaps before useful content.
  - Done when: the content hierarchy remains clear in still screenshots, and decoration does not reduce legibility or screenshot fidelity.

- [x] **P3-04 — Simplify motion and pointer effects.**
  - Shorten reveals so content becomes readable sooner.
  - Keep screenshot tours deliberate and user controlled, with equivalent touch and keyboard access.
  - If retained, make the custom cursor subtler and preserve obvious link/button cues; keep optional physics secondary.
  - Done when: effects do not delay reading, obscure controls, or make interaction dependent on hover.

- [x] **P3-05 — Preserve the signature splash entrance (owner revision).**
  - Owner revision: restore the original splash and hero animation sequence. The counter tracks the entrance timeline; it does not claim network-loading progress.
  - Skip the splash for private previews, direct case-study entry and reduced-motion sessions; clean up timers on navigation.
  - Done when: the splash exits, the hero animates into view, and navigation/reduced-motion behavior remains usable.
  - Owner: `src/app/pages/portfolio-page.component.ts`.

- [x] **P3-06 — Complete reduced-motion support.**
  - Cover marquees, availability pulses, scroll indicators, physics, magnetic links, reveal transitions, tours, parallax, and project/modal entrances.
  - Disable nonessential movement while preserving content and useful state feedback.
  - Done when: a reduced-motion session has no continuous decorative animation and all controls and content remain available.

## Phase 4 — Strengthen work presentation and capability evidence

- [x] **P4-01 — Improve screenshot fidelity and framing.**
  - Reduce dark overlays on project screenshots.
  - Choose intentional cover crops and provide an explicit full-screen image viewer.
  - Define stable loading and failed-image states with retry or a useful fallback.
  - Done when: project imagery is clear, images retain reserved space while loading, and the viewer supports keyboard, touch, zoom/detail inspection, and safe dismissal.

- [x] **P4-02 — Add discoverable screen navigation.**
  - Add thumbnail navigation alongside clearly named previous/next controls and the current screen indicator.
  - Keep the selected project visible and identifiable in the mobile project picker.
  - Done when: users can anticipate and select screens without relying on hover, dragging, or tiny indicators.

- [ ] **P4-03 — Put contribution and results beside the project.**
  - **Owner decision — 25 October:** Remaining project content and project additions/removals are deferred at the owner’s request. Continue with non-project UX/UI work; retain the content work already prepared.
  - **Implementation status:** Implementation complete: contribution, optional result, and primary case-study action are present. Styloviz, ngCommerce, Nop Kalles and Fortune now have authored contributions and scoped results. Evidence is recorded per project: public documentation and bundles where available, supplied visual layouts and existing owner attribution where no maintained implementation source is available. Local fallback copy is updated; the draft helper merges it into a fresh CMS export without overwriting unrelated edits. Other projects still need substantiated outcomes. Nothing was published automatically.
  - Show the problem, personal contribution, and one verified result in a concise summary.
  - Use qualitative outcomes when numerical evidence is unavailable.
  - Make “View case study” the primary action if agreed in P0-01; maintain a clear live-site action.
  - Done when: visitors can understand why the project matters and what you contributed without first opening the full case study.

- [ ] **P4-04 — Restructure case-study storytelling.**
  - **Owner decision — 25 October:** Further case-study authoring is deferred while the project list is being revised.
  - **Implementation status:** Implementation complete: backward-compatible optional problem, decisions and result fields exist in the CMS and public case study. Styloviz, ngCommerce, Nop Kalles and Fortune now include Problem → Responsibility → Key decisions → Result, with source notes and safe CMS application instructions in their `artifacts/*-case-study/README.md` files. Other projects retain legacy overview/role/highlights until their narratives are authored.
  - Use Problem → Responsibility → Key decisions → Result, supported by relevant screenshots and captions.
  - Avoid repeating generic technology lists in place of explaining decisions.
  - Extend CMS fields and content migration only as required, preserving existing published data.
  - Done when: each featured case study explains the work, ownership, tradeoffs, and substantiated outcome.

- [x] **P4-05 — Add shareable case-study URLs.**
  - Give every project a stable URL and appropriate title/description.
  - Support direct entry, refresh, sharing, and Back/Forward while preserving work-viewer context.
  - Done when: a copied project URL opens the correct case study and navigation returns predictably to the portfolio.
  - Dependency: complete P1-01 before extending dialog/route behavior.

- [x] **P4-06 — Give capability selections useful content.**
  - Preserve the light map and simultaneous visibility of tools.
  - Replace “signals” with audience-friendly language such as “tools” or “capabilities.”
  - Make selection reveal a practical example, related project, or how the capability is used, rather than repeating the name and category.
  - Reduce excessive mobile height while retaining readable labels and operable controls.
  - Done when: every interactive selection provides additional useful information, updates accessibly, and remains usable on mobile.
  - Owner: `src/app/components/skills.component.ts` and any required content fields.

## Phase 5 — Improve contact and CMS usability

- [x] **P5-01 — Add explicit contact actions.**
  - Provide “Email me” and “Copy email,” with accessible success and clipboard-failure feedback.
  - Keep the address selectable and provide a fallback when clipboard access is unavailable.
  - Done when: visitors can obtain the email address even without a configured mail application.

- [x] **P5-02 — Refine contact content and hierarchy.**
  - Simplify the outlined “— together” treatment or use solid text for better mobile readability.
  - Prioritize professional social destinations and add a résumé link only if selected in P0-03 and a current document exists.
  - Done when: the contact action is prominent, supporting links are relevant and valid, and the heading reads comfortably at narrow widths.
  - Owner: `src/app/components/contact.component.ts` and CMS-managed links.

- [x] **P5-03 — Make CMS forms clearer and more practical.**
  - Keep brand typography in page headings while improving label size, text contrast, field grouping, and help text.
  - Keep save/publish controls reachable during long edits without obscuring focused fields or mobile content.
  - Add field-associated validation and focus the first invalid field; do not rely solely on a page-level message.
  - Standardize busy, disabled, success, and failure feedback; prevent duplicate operations without layout jumps.
  - Done when: long-form editing and error correction work by keyboard and on mobile, with the same behavior across sections.

- [x] **P5-04 — Polish sign-in interactions.**
  - Add an accessible password show/hide control while keeping passwords masked by default and preserving password-manager support.
  - Make the pending action clear for password sign-in versus email-link requests.
  - Done when: labels, errors, pending states, and confirmation states are readable, accessible, and stable; test email delivery only when explicitly authorized.

## Phase 6 — Verify the complete experience

- [ ] **P6-01 — Run responsive and visual checks.**
  - **Implementation status:** Partial: public and fixture CMS checks passed at widths 1440, 768, 390 and 320px. Public sections were inspected at desktop/mobile sizes; 720×450 effective reflow and reachable dialog close control were checked. Actual Chrome 200% page zoom now passes: a 1440×900 window produced a 720×406 CSS viewport with devicePixelRatio 2. Public sections, nested image viewer, login, dashboard, all six editors and private preview were exercised without document overflow or page errors. Fixed a focused-field obstruction by making the CMS editor toolbar scroll normally at viewport heights of 600px or less; keyboard focus through every visible profile field then passed. Physical-device/virtual-keyboard review remains a manual follow-up.
  - Review the hero, every section, navigation, project picker, image viewer, case studies, login, dashboard, and editors.
  - Cover 1440 × 900, 390 × 844, 320px and 768px widths, a short viewport, and 200% zoom.
  - Done when: there is no unintended horizontal overflow, clipping, overlapping text, obscured focus, or unreachable action.

- [ ] **P6-02 — Run accessibility and interaction checks.**
  - **Implementation status:** Partial: modal initial focus, forward/reverse focus wrapping, Escape, nested scroll locking, mobile navigation, native pointer, and zero decorative reduced-motion animations were checked. Axe-core WCAG A/AA scans passed on home, case study and login at 1440/390/320px, plus fixture CMS upload-error states at 1440/390px. Fixed control-group semantics, outlined marquee/login-divider contrast, keyboard-focusable case-study scrolling, and delayed modal initial focus. Keyboard skip-link, Enter-to-open, PageDown, Escape and focus return passed at 1440×900, 720×450 and 390×320. The follow-up CMS pass repairs overview table semantics, section-specific edit names, current-page navigation, announced loading/errors and mobile disclosure focus. Full screen-reader and formal WCAG conformance review remain manual follow-ups.
  - Cover keyboard-only navigation, focus visibility/restoration, dialog/menu behavior, accessible names/status, contrast, reduced motion, and touch targets.
  - Verify hover enhancements have touch/keyboard equivalents.
  - Done when: all essential journeys can be completed without a pointer and applicable WCAG 2.2 AA requirements have been checked.

- [x] **P6-03 — Verify routing and content resilience.**
  - Test section links, direct case-study URLs, refresh, Back/Forward, slow content/media, failed images, empty collections, and unavailable backend content.
  - Done when: each state has a stable layout, understandable feedback, and a useful recovery path without misleading progress.

- [ ] **P6-04 — Verify CMS safety with test data.**
  - **Implementation status:** Partial: isolated fixtures passed unsaved navigation cancellation, reload recovery, save failure/retry, private preview, publication cancellation, draft-only media removal and Undo. Failure-state follow-up passed simulated expired-session save/retry and failed storage upload in desktop/mobile browsers. Unit tests cover total/partial upload failure, portrait preservation, recovery of successful images, expired-session recovery, stale-save rejection, and overlapping save/upload/publication guards. Successful fixture publication, publication failure/retry, save-before-publish ordering, and refresh failure after confirmed publication now pass. A refresh failure retains the editor and authoritative published response; retrying review without new changes does not republish. Real provider session renewal and actual publication remain staging follow-ups; no production mutations were made.
  - Exercise save/retry, draft recovery, leaving with edits, publication preview/summary, deletion cancellation, and published-media reference protection.
  - Test upload failure, session expiry, and double submission without affecting the production publication.
  - Done when: edits are preserved, draft/public boundaries hold, and no destructive action removes media still required by retained content.

- [x] **P6-05 — Run implementation quality checks and document results.**
  - Run the production build and applicable repository tests; add meaningful coverage for the changed behaviors.
  - Inspect browser console/network failures and repeat screenshot comparisons against the baseline.
  - Check performance for regressions from effects, image viewers, fonts, and new media.
  - Reconcile accepted decisions with `DESIGN.md` and shared runtime tokens.
  - Done when: checks pass and the delivery notes list actual results, evidence, and any explicitly deferred work.

## Completion criteria

- [ ] Phase 0 decisions are recorded and every applicable task above is completed or explicitly deferred with a reason.
- [ ] The public journey clearly communicates identity, shows evidence early, and makes work/contact easy to reach on mobile and desktop.
- [ ] The visual identity remains recognizable while supporting text, imagery, spacing, and motion are more disciplined.
- [ ] CMS edits are recoverable, publication scope is clear, and media removal cannot accidentally damage retained public content.
- [x] Verification evidence distinguishes passing checks from untested states and known limitations.

Reference: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Implementation verification — 24 October 2026

- Branch: `codex/ux-ui-refinement`; backup branch and `main` remain unchanged.
- Runtime: Node 24.20.0 for Angular commands (the shell default Node 20 is below the repository requirement).
- `npm run build`: passed. The existing Matter.js CommonJS optimization warning remains.
- `CHROME_BIN=<installed Chrome> npm test -- --watch=false --browsers=ChromeHeadless`: 40 tests passed, including delayed modal focus/controls, recovery, removal, publication-cancellation, stale-save, upload-failure, expired-session and duplicate-submission regression coverage.
- Premium skill static audit in strict/no-write mode: zero findings. `git diff --check`: clean.
- `designmd lint DESIGN.md`: zero errors. Runtime-owned palette tokens not referenced by frontmatter component recipes produce advisory orphan-token warnings; the mapping is documented in DESIGN.md.
- Browser plugin was unavailable; verification used bundled Playwright with installed Chrome against `http://127.0.0.1:4700/`.
- Public browser loop: 1440/768/390/320px, hero actions, mobile menu, section URLs, project switching, case-study URL/history, keyboard focus containment, Escape, image-viewer zoom/navigation, password visibility. No observed page errors or horizontal document overflow.
- Measured Work start: desktop 900px; 390px mobile approximately 664px (audit baseline: 3710px and 4865px respectively).
- Final targeted checks also passed direct-link closing back to Work with the 96px header clearance, mobile project switching, keyboard inspection while zoomed, and clean modal scroll-lock release.
- Reduced motion: zero CSS animations active. Backend-unavailable fallback, empty collections, failed image/retry, and effective 720×450 reflow checks passed.
- CMS fixtures: 1440/768/390/320px, recovery after reload, unsaved navigation cancellation, failed save with preserved values, successful retry, draft preview, publication cancellation, media removal/Undo. Zero live publication calls or storage-delete requests were made.
- Accessibility follow-up: axe-core 4.10.3 WCAG 2 A/AA, 2.1 AA and 2.2 AA tagged checks reported zero violations across home/case-study/login at 1440/390/320px and fixture CMS upload-error states at 1440/390px. These scans are not a conformance certification: automated contrast checks include incomplete results on layered/decorative public content that require manual review. No horizontal document overflow or page errors were observed.
- Keyboard follow-up: visible skip link → Work focus, Enter opens case study → safe initial focus, PageDown scrolls case content, Tab stays within modal, Escape closes → original trigger focus. Mobile menu Enter/Escape restores toggle focus. Passed at 1440×900, 720×450, and 390×320; the latter two cover short viewport/reflow, not actual browser-toolbar zoom.
- Actual zoom follow-up: selected 200% in Chrome Settings in an isolated temporary profile (not CSS zoom, pinch zoom, or viewport-only emulation). Confirmed outer window 1440×900, layout viewport 720×406 and devicePixelRatio 2. Passed homepage/Work/About/Experience/Capabilities/Contact, case-study initial focus and dismissal, nested image fit/zoom/Escape, login, dashboard, all six editor sections, keyboard reachability of lower editor controls, mobile-menu Enter/Escape, and private preview open/close. A deeper field-by-field check reproduced toolbar overlap on four profile inputs; the editor toolbar now scrolls normally on short viewports (≤600px), and the same check passed without covered fields. Zero page errors, document overflow, or CMS mutation requests; authenticated screens used intercepted fixture APIs. Screenshots are `zoom-200-*.png` and measurements are `zoom-results.json` in the temporary evidence directory.
- CMS failure follow-up: at 1440px and 390px, simulated HTTP 401/JWT-expired saves preserved edits and tab recovery; retry succeeded. Simulated HTTP 503 storage failures preserved the unchanged draft, reset the file input for reselection, and displayed retry guidance. Pending saves disabled competing actions. No browser page errors, live writes, or publication requests. Unit tests also verified partial batch recovery and duplicate mutation rejection.
- Screenshots and temporary browser harnesses are outside the repository in `/tmp/portfolio-ux-implementation/`; original public audit screenshots are in `/tmp/portfolio-ux-audit/`. These paths are ephemeral, not committed deliverables.

### Remaining authoring and manual verification

The open items above are intentionally not represented as completed. Supply verified project outcomes and narratives, then review screen-reader behavior, physical devices/virtual keyboards, real provider session renewal, storage permissions, and actual publication in staging. Actual Chrome 200% page zoom has passed locally. Simulated upload/session failures have passed locally. A résumé remains omitted until a current document is available. Permanent media cleanup is a separate server-side reference/retention workflow, not an exposed UI action.

Owner revisions: restored the signature splash/hero choreography and the original floating navigation pill/header styling. Configured desktop navigation order is preserved; mobile section access, active-section semantics and anchor history remain functional.


## Publication and authored-content follow-up — 25 October 2026

- 48 Jasmine tests passed. Production build passed with the existing Matter.js CommonJS warning. Strict premium static audit and `git diff --check` passed.
- At 1440px and 390px, isolated API fixtures exercised importing the prepared JSON, switching from Settings to Profile while retaining the imported draft, private preview, publication summary/confirmation, failed publication with a retained saved draft, explicit retry, successful publication followed by a failed document refresh, continued editor access, and reload recovery. A subsequent unchanged publication review sent no second mutation. All publication requests were mocked; no production writes or storage mutations occurred. No browser page errors or horizontal document overflow were observed.
- Fixed the editor navigation guard: valid section changes retain the same in-memory draft without an unsaved-exit prompt; leaving the editor and switching during a pending mutation still use the existing guard. Added regression tests for valid sections, query strings, invalid section names, editor exit and pending mutations.
- Authored the selected Styloviz case study from its public homepage and backend integration guide. Updated the earlier local product scope to the observed 169 components / 21 templates / Angular 21 and 22; this is dated public-site evidence, not an independent source-code audit or an adoption metric.
- Verified the story in private preview and a direct case-study URL at desktop/mobile sizes. The default content now carries the narrative; Supabase remains authoritative for published content.
- `scripts/prepare-styloviz-draft.mjs` merges only the Styloviz narrative, description and stack into a fresh CMS export. Checks confirmed preservation of other sections/projects, media, URL, ordering and styling, and refusal to overwrite an existing output. Apply through the existing CMS import/preview/save/publication workflow; the helper makes no network requests.
- Source notes and exact application steps: `artifacts/styloviz-case-study/README.md`. Temporary harnesses and screenshots remain outside committed source under `/tmp/portfolio-ux-implementation/`.


## ngCommerce authoring follow-up — 25 October 2026

- Authored ngCommerce's problem, responsibility, engineering decisions and delivered-interface result. Replaced unsupported 60fps, measured slow-network, silent-refresh and Figma-accuracy claims with observations supported by the live UI, existing screenshots and public application bundles.
- The live demo exposes category/search/cart interfaces and expiry-based category caching / lazy product-image code, but some catalogue requests fail. No checkout success, business result or performance benchmark is asserted. The historical project role remains the existing owner-supplied attribution.
- Generalized the safe local merge into `scripts/prepare-project-draft.mjs`; the original Styloviz command remains compatible. Only an explicitly selected authored project is updated; media, stable links, ordering, other projects and unpublished section edits are retained.
- 48 Angular/Jasmine tests passed. `npm run test:content`: five safety tests pass, including ambiguous matches, output/input overwrite protection, malformed exports, preservation of customized fields and compatibility with the original Styloviz command and www URL alias.
- At 1440px and 390px, isolated fixtures passed CMS JSON import → private preview → select ngCommerce → case-study narrative, plus direct case-study URL and selected-project result rendering. No page errors, horizontal document overflow or backend mutation requests occurred. Production build passed with the existing Matter.js warning.
- Evidence, known limits and exact draft application command: `artifacts/ngcommerce-case-study/README.md`. This updates local fallback content and prepares CMS edits; it does not publish or replace the server document automatically.


## Nop Kalles authoring follow-up — 25 October 2026

- Authored the problem, responsibility, visual decisions and presentation result for Nop Kalles from its existing project record and three supplied images. The narrative connects the campaign homepage, catalogue controls and product-detail purchase panel.
- Removed unsupported conversion/drop-off and verified-interaction claims. Role and platform attribution are retained from the existing owner-supplied content; the visible layouts do not establish checkout completion, customer research, measured gains or independently verified implementation history.
- The generic draft helper now accepts this authored project without a maintained URL. A sixth safety test verifies exact-title matching and preservation of owner captions, slug, custom notes and other projects. `npm run test:content`: six tests passed.
- 48 Angular/Jasmine tests passed. Production build passed with the existing Matter.js warning. Strict static UI audit and `git diff --check` passed.
- At 1440px and 390px, isolated fixtures passed CMS import/private preview, selecting Nop Kalles, full case-study narrative, direct case-study URL, Escape dismissal and the selected-project result. No page errors, document overflow or backend mutation requests occurred.
- Evidence and CMS steps: `artifacts/nop-kalles-case-study/README.md`. Supabase remains authoritative; no live content was published. The next project without an authored narrative is Fortune.


## Fortune authoring follow-up — 25 October 2026

- Authored Fortune's problem, responsibility, visual decisions and presentation result from its existing project record and three supplied images. Copy connects the campaign homepage, collection filters and product-selection panel.
- Removed unsupported claims about instant filtering over large collections, verified 320px responsive behaviour and tested design-token implementation. The role/stack remain existing owner-supplied attribution; screenshots establish visible layouts rather than implementation history or measured outcomes.
- Fortune is now available to the existing safe project-draft merge helper. The unavailable-project rejection test now uses an unknown project name so further authoring does not invalidate the guard test.
- 48 Angular/Jasmine tests and six content-helper safety tests passed. Production build passed with the existing Matter.js warning. Strict static UI audit and `git diff --check` passed.
- At 1440px and 390px, isolated fixtures passed CMS JSON import/private preview, selecting Fortune, full narrative, direct case-study URL/title, Escape dismissal and selected-project result. No page errors, framework overlay, horizontal document overflow or backend mutation requests occurred. Temporary fixtures were regenerated from current source after older ephemeral evidence files were cleaned up.
- Evidence and CMS steps: `artifacts/fortune-case-study/README.md`. No live document was changed or published. The next project without an authored narrative is My Realty.


## CMS accessibility follow-up — 25 October 2026

- Further project authoring and project-list changes are deferred at the owner's request. Prepared project edits are retained; this task changes CMS behaviour only.
- Fixed the overview table's missing header/cell roles and named actions. The compact layout retains its header/section/date context for assistive technology while preserving the visual row layout. Edit actions name the target section.
- Active sidebar links expose the current page. The mobile sidebar remains a non-modal disclosure: focus moving into page content dismisses its overlay, Escape/close return focus to the toggle, and switching to desktop clears the open state.
- Dashboard/editor loading feedback uses status regions and load failures use alerts. Dashboard errors retain a backend's message and provide the existing retry action rather than replacing it with a generic error.
- Added dashboard tests for delayed loading and backend failure followed by successful retry. 50 Angular/Jasmine tests passed. Production build passed with the existing Matter.js warning; strict static UI audit and `git diff --check` passed.
- Runtime verification: axe-core 4.10.3 WCAG A/AA tagged scans passed the overview plus all six editor sections at 1440px and 390px (14 screen states). Verified five accessible overview headers, named Edit Projects navigation, one current-page link, mobile Tab-to-content dismissal, Escape/close focus restoration, desktop resize reset, announced delayed editor loading and dashboard error/retry. No page errors, framework overlay or fixture backend mutations were observed. Screenshots and harness logs remain in the temporary evidence directory.
- This is automated accessibility and keyboard verification, not a manual screen-reader certification. Physical devices, live auth/provider renewal and staging publication remain separate checks.

## Mobile priority audit — 25 October 2026

- [x] Audit the public homepage, navigation, all main sections, case-study/image dialogs, login, overview and six CMS editors using touch emulation at 320×568, 360×640, 390×844, 430×932, 768×1024, 844×390 and 568×320.
- [x] Fix screenshot gesture cancellation: browser-cancelled scroll gestures reset the drag without advancing an image. Deliberate horizontal swipes still work; secondary mouse buttons do not initiate a drag. Added two interaction regression tests.
- [x] Make the full CMS sidebar scrollable, including footer actions, on short landscape screens. Preserve the existing header/navigation appearance and disclosure behaviour.
- [x] Increase undersized mobile footer, case-study footer, CMS add/remove/reorder/back/navigation touch targets. Keep touch text fields at 16px across phone, tablet and landscape widths to avoid small-font iOS focus zoom.
- [x] Stack paired statistic/navigation/social fields on phones up to 480px so their values have useful editing space.
- [x] Correct reduced-height field scroll margins; verify full-name focus with a 250px viewport height and preview close controls at 320px portrait and 844px landscape widths. This simulates reduced space, not a physical device keyboard.
- [x] Preserve and verify the normal-motion splash and hero entrance on a touch phone viewport; reduced-motion sessions retain their existing bypass.
- [x] Automated layout sweep: 112 states with no horizontal document overflow, text-entry font sizes below 16px or interactive targets below 24px. Native Chrome touch scroll cancellation, horizontal swiping and sidebar-footer reachability checked across the seven viewport sizes. No page errors or live content mutations.
- [x] Verification: 52 Jasmine tests passed, production build passed with the existing Matter.js CommonJS warning, strict static UI audit reported zero findings, and whitespace checks passed. Repeated axe WCAG A/AA scans of seven CMS screens at 1440px and 390px: zero violations across 14 states; keyboard disclosure, error/retry and loading checks also passed.
- [ ] Physical iPhone/Safari and Android checks: real virtual keyboard, browser chrome/safe areas, OS text scaling and screen-reader gestures. The installed local WebKit runtime was incompatible with the available automation client; Safari is not represented as verified.

Project additions/removals and further case-study writing remain deferred as requested. These changes are local and unpublished.
