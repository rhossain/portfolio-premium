# Portfolio UX contract

The public portfolio is a brand surface for employers and collaborators evaluating engineering work. The CMS is a private editing tool. Visual identity and runtime token mapping live in [DESIGN.md](DESIGN.md).

## Evidence and scope

- `README.md` documents draft/public separation, the allow-listed administrator, revision history, and immutable media.
- `supabase/migrations/202609040001_portfolio_cms.sql` owns authorization, document storage, revision snapshots, and publication.
- This refinement changes the frontend; it does not weaken server permissions or change retention policy.

## Canonical owners

| Capability | Owner | Contract |
| --- | --- | --- |
| Modal, inert background, focus containment/restoration | `shared/dialog.directive.ts` on native `<dialog>` | Browser top layer; initial focus waits until the entrance and controls can receive focus; Escape emits dismissal; nested dialogs restore parent focus |
| Confirmations | `shared/confirmation.service.ts` and `confirmation.component.ts` | Specific object/action/consequence; cancellation is default focus; no native alert/confirm/prompt |
| Public navigation | `ScrollService` and `NavComponent` | Explicit section actions write anchors; passive scrolling changes active state only |
| Case-study navigation | `PortfolioPageComponent` | `?project=<slug>#work`; direct entry, refresh, Back/Forward; titles/descriptions follow content |
| Media inspection | `shared/image-viewer.component.ts` | Fit/zoom; previous/next and arrow keys; internally scrollable; retry; Escape restores focus |
| Forms | Admin editor and login with shared `.admin-field` styles | Native text/select controls; OS-owned select popup accepted for era selection; inline association, first-invalid focus, stable feedback |
| Draft recovery | `DraftRecoveryService` | Content only in tab-scoped sessionStorage, expiry 24 hours; explicit restore/discard; no credentials; unavailable storage is reported |
| Scrollbars | `src/styles.css` | Visible global baseline and standard/engine properties; forced-colors fallback |
| Mutation feedback | Editor `message` status and inline `formError` alert | Accessible live state; errors preserve values; repeat clicks blocked while busy |

## Public behavior

- Sequence: Hero → Work → About → Experience → Capabilities → Contact. Existing section IDs remain compatible.
- Primary journey: view selected work, inspect personal contribution, then contact.
- The skip link moves keyboard focus to Work. Case-study content is a named scroll region reachable by Tab and scrollable with PageDown; named groups organize screenshot and capability controls.
- Native pointer remains visible; ornamental cursor is secondary and disabled for reduced motion.
- Tours require an explicit action, have a stop action, and are disabled for reduced motion. The restored splash percentage represents the timed brand entrance, not measured network loading. The public surface is inert during the entrance. Preview, direct case-study and reduced-motion sessions skip the splash.
- Legacy case studies render existing overview, role and highlights. Optional problem/decisions/result fields display only when authored; no outcome claims are synthesized.
- Slugs may be explicitly authored to remain stable after renaming. Legacy content derives a compatible slug from its title. Editor rejects duplicate link names.
- No résumé or new social destination is invented. Existing LinkedIn/repository destinations sort before other supplied links.

## CMS behavior

- The overview exposes complete table headers/cells and section-specific edit names. Narrow layouts keep column context available to assistive technology while visually presenting compact rows.
- The mobile sidebar is a non-modal disclosure. Keyboard focus entering page content dismisses its overlay; Escape and the explicit close action restore toggle focus. Active navigation links announce the current page.
- Loading feedback uses a status region and load failures use an alert with a retry action.

- At viewport heights of 600px or less, the editor toolbar scrolls with the page so keyboard-focused fields are not covered. Taller screens retain sticky editor actions.
- All sections edit one draft document. Valid section navigation preserves the in-memory draft without an exit confirmation; switching during a pending mutation is blocked. Leaving the editor requires a decision when dirty; actual unload uses the browser lifecycle warning.
- Recovery is explicit, never automatically applied over newer server content. A timestamp mismatch is explained before restoration.
- Save draft retains the editor; failures retain values and recovery data. Saves compare the server update timestamp, and a stale editor is asked to export/reload rather than overwrite newer content. While a mutation is pending, fields and duplicate mutation actions are disabled.
- After confirmed publication, a failed metadata refresh preserves the editor and the authoritative published response, with an explicit refresh warning. A failed publication retains the saved draft for an explicit retry.
- Publication summarizes every changed section. Preview is a local modal with a scoped content service, no public fetch, no draft URL, and no public persistence. Publishing remains an authenticated server operation.
- Removing media changes JSON references only. Stored files are retained, including references used by published content and revisions. Permanent cleanup is unavailable until a separate server-authorized reference/retention design exists.
- Project/experience/media removals use named confirmations. A removal can be undone before further edits or a successful save. Undo expires after another edit to prevent overwriting later work.
- Browser-test fixtures may intercept authentication/data requests only in test harnesses. No production auth bypass is shipped.

## Verification boundaries

Run production build, Jasmine tests, and browser checks for keyboard dialogs, mobile navigation, URLs/history, reduced motion, content/media failure, recovery, save failure, publication cancellation, and draft-only media removal. Use isolated CMS fixtures for mutations; live sign-in email, publication and permanent storage deletion are outside routine verification.

## Mobile interaction guarantees

- Browser `pointercancel` on a screenshot drag clears its temporary offset without changing the selected screen. A completed horizontal swipe retains previous/next behaviour; native vertical scrolling is allowed.
- CMS navigation scrolls independently so footer actions remain reachable in short windows. Its disclosure, focus dismissal and Escape behaviour remain unchanged.
- Touch/narrow CMS text entry uses at least 16px type. Paired fields stack below 481px. Reduced-height fields use smaller scroll margins to remain visible below the mobile header; the editor toolbar already scrolls with the page below 601px.
- The mobile validation matrix includes 320–844px widths, portrait and landscape, nested dialogs, private preview, native touch gestures and simulated 250px keyboard-height viewports. Physical mobile browser/keyboard and assistive-technology checks remain manual verification boundaries.
