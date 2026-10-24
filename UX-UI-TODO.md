# UX/UI refinement TODO

Created: 24 October 2026

Status: Planning only. No implementation has started. Every checkbox below is open.

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

- [ ] **P0-01 — Confirm the main audience and primary action.**
  - Proposed direction: employers and collaborators evaluating frontend engineering work; primary action is viewing selected work, followed by contact.
  - Decide whether recruitment, client enquiries, or another audience should take precedence.
  - Done when: the audience and primary/secondary actions are recorded and guide the homepage, work viewer, and contact section.

- [ ] **P0-02 — Confirm the homepage sequence.**
  - Proposed sequence: Hero → Selected work → Short introduction → Experience → Capabilities → Contact.
  - Alternative: retain the current section order and add a featured-project preview directly after the hero.
  - Done when: one approach is selected, including how existing anchor links and section labels will be preserved or updated.

- [ ] **P0-03 — Confirm optional content and interaction choices.**
  - Decide whether to include a public résumé, which professional social destinations to prioritize, and which project outcomes can be substantiated.
  - Decide whether to retain the custom cursor and physics interaction, and how capability selections should provide useful evidence.
  - Done when: decisions and any missing content/assets are listed without placeholder claims.

- [ ] **P0-04 — Capture a reproducible baseline.**
  - Capture the homepage, all public sections, project switching, case-study open state, login, and authenticated CMS editor states.
  - Include desktop 1440 × 900 and mobile 390 × 844; check 320px and 768px widths.
  - Confirm CMS workflow risks in a signed-in test session, including save, publish, navigation, and image removal.
  - Done when: baseline screenshots and a behavior checklist exist, with browser-tested findings distinguished from code-review findings.

## Phase 1 — Repair interaction and editing risks

- [ ] **P1-01 — Make case-study dialogs keyboard accessible.**
  - Move focus into the dialog when it opens, contain focus, and make background content inert.
  - Preserve Escape closing and scroll locking; restore focus to the opening control on close.
  - Keep the close control reachable on narrow and short screens.
  - Done when: Tab and Shift+Tab never reach background controls while open, Escape closes the dialog, and focus returns predictably.
  - Owner: `src/app/components/case-study.component.ts`.

- [ ] **P1-02 — Add public mobile navigation.**
  - Provide a compact menu for Work, About, Experience, Capabilities, and Contact.
  - Keep Work and Contact easy to reach; expose expanded/collapsed state to assistive technology.
  - Support keyboard use, dismissal, and focus restoration appropriate to the chosen menu pattern.
  - Done when: every public section is reachable without scrolling through the entire page, and opening/closing the menu introduces no overlap or scroll trap.
  - Owner: `src/app/components/nav.component.ts`.

- [ ] **P1-03 — Protect unsaved CMS edits.**
  - Guard navigation away from the editor and browser unload when changes would be lost.
  - Provide recoverable drafts with explicit saved, unsaved, saving, failed, and recovered states.
  - Define recovery storage and lifetime before implementation; do not persist authentication secrets with draft data.
  - Done when: leaving, refreshing, returning after a failed save, and cancelling navigation cannot silently discard work; section-to-section navigation preserves the intended draft.
  - Owners: admin editor, routes, and portfolio admin service.

- [ ] **P1-04 — Separate draft image removal from permanent file deletion.**
  - Removing an image from a draft must not immediately delete a file needed by published content.
  - Check published references and any retained revision references before permanent deletion; define the retention policy before adding cleanup.
  - Done when: removing a shared image from a draft leaves the published portfolio intact, and deletion is available only when the applicable reference/retention rules permit it.
  - Owners: `src/app/admin/admin-content.component.ts`, `src/app/services/portfolio-admin.service.ts`, and applicable storage/database policies.

- [ ] **P1-05 — Replace native deletion confirmations.**
  - Use one accessible, app-owned confirmation pattern for project, experience, and permanent media deletion.
  - Name the object, scope, and consequence; keep safe and destructive actions visually distinct.
  - Offer Undo for reversible draft removals where reliable.
  - Done when: no CMS deletion uses browser `confirm()`, serious confirmations initially focus the safe action, and cancellation preserves data and focus.

- [ ] **P1-06 — Clarify document-wide publishing.**
  - Show a summary of all pending document changes before publication, even when the user is editing one section.
  - Add an authenticated draft preview that does not expose drafts publicly.
  - Distinguish saving a draft from publishing and keep success/failure feedback accessible.
  - Done when: the user can inspect the draft and understand every affected section before committing; errors preserve work and offer recovery.

- [ ] **P1-07 — Make the dashboard project action truthful.**
  - Either make “Add project” open a new project workflow or rename the existing destination “Manage projects.”
  - Done when: the label accurately describes the resulting screen and action.
  - Owner: `src/app/admin/admin-dashboard.component.ts`.

## Phase 2 — Improve homepage hierarchy and navigation

- [ ] **P2-01 — Rewrite and reposition the hero value proposition.**
  - Give the professional role and value statement meaningful prominence beside the name.
  - Suggested starting point: “Frontend engineer building thoughtful, dependable product interfaces.” Refine against the agreed audience and actual experience.
  - Add one verified proof point, such as the current role, relevant experience, or a featured project.
  - Done when: the first viewport clearly communicates who the portfolio belongs to, the work offered, and a credible reason to explore.
  - Owner: `src/app/components/hero.component.ts` and CMS-managed profile content.

- [ ] **P2-02 — Add clear hero actions.**
  - Add “View selected work” as the primary action and “Get in touch” as the secondary action, subject to P0-01.
  - Keep the physics interaction secondary if retained.
  - Done when: both actions are visible, keyboard accessible, and functional on desktop and mobile, with obvious hover/focus/pressed states.

- [ ] **P2-03 — Recompose the mobile hero.**
  - Reduce the large empty area above the name.
  - Explore a small portrait treatment, readable introduction, and visible actions without crowding the screen.
  - Done when: the mobile first viewport has a deliberate hierarchy, no clipped text or overlapping controls, and reachable primary actions at 320px and 390px widths.

- [ ] **P2-04 — Bring project evidence forward.**
  - Implement the selected sequence or featured-project preview from P0-02.
  - Baseline: Work starts around 3,710px on desktop and 4,865px on mobile.
  - Done when: visible project evidence appears within the first two viewport heights at the baseline sizes, with a direct route to the full work viewer.

- [ ] **P2-05 — Improve section orientation and browser navigation.**
  - Show the active section in navigation.
  - Keep anchor URLs, direct section entry, refresh, and browser Back/Forward coherent with smooth scrolling.
  - Include Capabilities in navigation and account for sticky-header offsets.
  - Done when: each section can be shared and revisited, and scrolling does not create excessive browser-history entries.
  - Owners: navigation and scroll service.

## Phase 3 — Refine the visual system and motion

- [ ] **P3-01 — Establish a readable supporting type scale.**
  - Target approximately 15–17px for body copy and 12–13px for meaningful utility text, adjusted to the chosen font and context.
  - Reserve tiny uppercase labels and wide tracking for nonessential decoration.
  - Done when: navigation, descriptions, metadata, captions, and form labels are comfortably readable at normal size and remain usable at 200% zoom.

- [ ] **P3-02 — Consolidate text contrast and surface tokens.**
  - Define consistent primary, secondary, and muted text roles for dark and light surfaces, including the CMS.
  - Check composited colors over texture, overlays, and imagery, rather than checking token values alone.
  - Done when: meaningful text meets the applicable WCAG 2.2 AA contrast requirements and recurring roles use shared tokens.
  - Owner: `src/styles.css`, component styles, and `DESIGN.md`.

- [ ] **P3-03 — Refine spacing and decorative hierarchy.**
  - Preserve the portrait framing and typography as the signature.
  - Lower grain intensity, especially over screenshots and long reading surfaces; reduce competition from background lettering and hero layers.
  - Make section spacing deliberate across mobile and desktop, avoiding oversized gaps before useful content.
  - Done when: the content hierarchy remains clear in still screenshots, and decoration does not reduce legibility or screenshot fidelity.

- [ ] **P3-04 — Simplify motion and pointer effects.**
  - Shorten reveals so content becomes readable sooner.
  - Keep screenshot tours deliberate and user controlled, with equivalent touch and keyboard access.
  - If retained, make the custom cursor subtler and preserve obvious link/button cues; keep optional physics secondary.
  - Done when: effects do not delay reading, obscure controls, or make interaction dependent on hover.

- [ ] **P3-05 — Replace the simulated loading percentage.**
  - Replace random percentage increments with a brief brand entrance or progress tied to genuine loading work.
  - Ensure returning visitors and slow/error states can access meaningful content promptly.
  - Done when: displayed progress is truthful and no decorative timer unnecessarily blocks the page.
  - Owner: `src/app/pages/portfolio-page.component.ts`.

- [ ] **P3-06 — Complete reduced-motion support.**
  - Cover marquees, availability pulses, scroll indicators, physics, magnetic links, reveal transitions, tours, parallax, and project/modal entrances.
  - Disable nonessential movement while preserving content and useful state feedback.
  - Done when: a reduced-motion session has no continuous decorative animation and all controls and content remain available.

## Phase 4 — Strengthen work presentation and capability evidence

- [ ] **P4-01 — Improve screenshot fidelity and framing.**
  - Reduce dark overlays on project screenshots.
  - Choose intentional cover crops and provide an explicit full-screen image viewer.
  - Define stable loading and failed-image states with retry or a useful fallback.
  - Done when: project imagery is clear, images retain reserved space while loading, and the viewer supports keyboard, touch, zoom/detail inspection, and safe dismissal.

- [ ] **P4-02 — Add discoverable screen navigation.**
  - Add thumbnail navigation alongside clearly named previous/next controls and the current screen indicator.
  - Keep the selected project visible and identifiable in the mobile project picker.
  - Done when: users can anticipate and select screens without relying on hover, dragging, or tiny indicators.

- [ ] **P4-03 — Put contribution and results beside the project.**
  - Show the problem, personal contribution, and one verified result in a concise summary.
  - Use qualitative outcomes when numerical evidence is unavailable.
  - Make “View case study” the primary action if agreed in P0-01; maintain a clear live-site action.
  - Done when: visitors can understand why the project matters and what you contributed without first opening the full case study.

- [ ] **P4-04 — Restructure case-study storytelling.**
  - Use Problem → Responsibility → Key decisions → Result, supported by relevant screenshots and captions.
  - Avoid repeating generic technology lists in place of explaining decisions.
  - Extend CMS fields and content migration only as required, preserving existing published data.
  - Done when: each featured case study explains the work, ownership, tradeoffs, and substantiated outcome.

- [ ] **P4-05 — Add shareable case-study URLs.**
  - Give every project a stable URL and appropriate title/description.
  - Support direct entry, refresh, sharing, and Back/Forward while preserving work-viewer context.
  - Done when: a copied project URL opens the correct case study and navigation returns predictably to the portfolio.
  - Dependency: complete P1-01 before extending dialog/route behavior.

- [ ] **P4-06 — Give capability selections useful content.**
  - Preserve the light map and simultaneous visibility of tools.
  - Replace “signals” with audience-friendly language such as “tools” or “capabilities.”
  - Make selection reveal a practical example, related project, or how the capability is used, rather than repeating the name and category.
  - Reduce excessive mobile height while retaining readable labels and operable controls.
  - Done when: every interactive selection provides additional useful information, updates accessibly, and remains usable on mobile.
  - Owner: `src/app/components/skills.component.ts` and any required content fields.

## Phase 5 — Improve contact and CMS usability

- [ ] **P5-01 — Add explicit contact actions.**
  - Provide “Email me” and “Copy email,” with accessible success and clipboard-failure feedback.
  - Keep the address selectable and provide a fallback when clipboard access is unavailable.
  - Done when: visitors can obtain the email address even without a configured mail application.

- [ ] **P5-02 — Refine contact content and hierarchy.**
  - Simplify the outlined “— together” treatment or use solid text for better mobile readability.
  - Prioritize professional social destinations and add a résumé link only if selected in P0-03 and a current document exists.
  - Done when: the contact action is prominent, supporting links are relevant and valid, and the heading reads comfortably at narrow widths.
  - Owner: `src/app/components/contact.component.ts` and CMS-managed links.

- [ ] **P5-03 — Make CMS forms clearer and more practical.**
  - Keep brand typography in page headings while improving label size, text contrast, field grouping, and help text.
  - Keep save/publish controls reachable during long edits without obscuring focused fields or mobile content.
  - Add field-associated validation and focus the first invalid field; do not rely solely on a page-level message.
  - Standardize busy, disabled, success, and failure feedback; prevent duplicate operations without layout jumps.
  - Done when: long-form editing and error correction work by keyboard and on mobile, with the same behavior across sections.

- [ ] **P5-04 — Polish sign-in interactions.**
  - Add an accessible password show/hide control while keeping passwords masked by default and preserving password-manager support.
  - Make the pending action clear for password sign-in versus email-link requests.
  - Done when: labels, errors, pending states, and confirmation states are readable, accessible, and stable; test email delivery only when explicitly authorized.

## Phase 6 — Verify the complete experience

- [ ] **P6-01 — Run responsive and visual checks.**
  - Review the hero, every section, navigation, project picker, image viewer, case studies, login, dashboard, and editors.
  - Cover 1440 × 900, 390 × 844, 320px and 768px widths, a short viewport, and 200% zoom.
  - Done when: there is no unintended horizontal overflow, clipping, overlapping text, obscured focus, or unreachable action.

- [ ] **P6-02 — Run accessibility and interaction checks.**
  - Cover keyboard-only navigation, focus visibility/restoration, dialog/menu behavior, accessible names/status, contrast, reduced motion, and touch targets.
  - Verify hover enhancements have touch/keyboard equivalents.
  - Done when: all essential journeys can be completed without a pointer and applicable WCAG 2.2 AA requirements have been checked.

- [ ] **P6-03 — Verify routing and content resilience.**
  - Test section links, direct case-study URLs, refresh, Back/Forward, slow content/media, failed images, empty collections, and unavailable backend content.
  - Done when: each state has a stable layout, understandable feedback, and a useful recovery path without misleading progress.

- [ ] **P6-04 — Verify CMS safety with test data.**
  - Exercise save/retry, draft recovery, leaving with edits, publication preview/summary, deletion cancellation, and published-media reference protection.
  - Test upload failure, session expiry, and double submission without affecting the production publication.
  - Done when: edits are preserved, draft/public boundaries hold, and no destructive action removes media still required by retained content.

- [ ] **P6-05 — Run implementation quality checks and document results.**
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
- [ ] Verification evidence distinguishes passing checks from untested states and known limitations.

Reference: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
