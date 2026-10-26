---
version: alpha
name: "Sazzad Hossain Portfolio"
description: "An editorial, cinematic portfolio for a senior frontend engineer, balanced by a precise interface-inspired identity."
colors:
  primary: "#b0704f"
  ink: "#0a0a0a"
  ink-secondary: "#0b0b0b"
  paper: "#efefef"
  cream: "#f5f2ed"
  accent: "#b0704f"
  rust: "#9f4920"
  sage: "#788c8c"
  lavender: "#a697c6"
  secondary-dark: "#b8b5b2"
  muted-dark: "#a4a09c"
  secondary-light: "#53504c"
  muted-light: "#65605b"
  focus: "#d89a73"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
  body:
    fontFamily: "Inter, -apple-system, PingFang SC, Microsoft YaHei, sans-serif"
  utility:
    fontFamily: "JetBrains Mono, SFMono-Regular, Menlo, monospace"
components:
  brand-mark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    size: "44px"
  capability-map:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
omitted:
  - section: spacing
    reason: "Existing Tailwind utilities remain canonical; the logo task introduces no spacing system change."
  - section: rounded
    reason: "Existing component geometry remains canonical; the brand mark has its own fixed silhouette."
---

# Sazzad Hossain Portfolio Design System

## Overview

The public portfolio is a brand surface for employers, collaborators, and clients evaluating a senior frontend engineer. Its creative North Star is an editorial studio portrait overlaid with the precision of an interface blueprint: cinematic at a distance, exact on inspection. The admin routes are a quieter product register that reuse the identity without importing the public site's theatrical motion.

The memorable signature is the `SH` monogram held by four open viewport corners. The copper corner and cursor node suggest an active interface without using literal code brackets. Avoid generic developer neon, terminal motifs, glossy corporate crests, and decorative complexity that collapses at favicon size.

Runtime tokens in `src/styles.css` remain canonical. This file mirrors their accepted values and records the brand rationale; `public/brand-mark.svg`, `public/favicon.svg`, navigation and admin brand surfaces are the consumers.

Selected Work is the cinematic, single-focus case-study surface. Capabilities deliberately switches register: a light architectural field presents the full interface stack at once, with discipline lanes and selectable tool signals. Do not reduce Capabilities back to a left-hand index controlling one large detail panel; that master/detail grammar belongs to Work.

## Colors

Ink is the dominant field, paper carries primary type and marks, and copper is both the primary brand color and the single expressive signal. Rust, sage, and lavender are supporting sectional colors rather than logo colors. The brand mark must remain recognizable in paper and ink alone; copper is an accent, not the only carrier of meaning.

## Typography

Fraunces provides editorial authority for names and statements. Inter keeps explanatory copy contemporary and readable. JetBrains Mono labels technical metadata and navigation. The logo is custom vector geometry and must never depend on a webfont loading successfully.

## Shapes

The logo uses a softly squared tile with open crop corners. Its geometry echoes the hero portrait frame and the act of framing an interface. Keep generous internal negative space and rounded stroke terminals; do not add an enclosing circle, shadow-heavy badge, or extra ornament.

## Components

### Iconography

Use the shared 64-unit `SH` artwork. At navigation and admin sizes it renders from `brand-mark.svg`; browser icons use the matching favicon artwork. Preserve the 1:1 view box, ink tile, paper monogram, three quiet paper corners, one copper corner, and copper cursor node.

### Runtime mapping

`src/styles.css` remains the canonical token source (existing runtime ownership). Brand colors map from the frontmatter to `@theme --color-*`; the utility roles `secondary-dark`, `muted-dark`, `secondary-light`, `muted-light`, and `focus` map to `:root --text-secondary-dark`, `--text-muted-dark`, `--text-secondary-light`, `--text-muted-light`, and `--focus-color`. Public controls, modal chrome, and CMS fields consume these roles. Fraunces, Inter, and JetBrains Mono retain their existing `@theme --font-*` mappings.

### Refinement decisions — October 2026

The work-first public sequence serves employers and collaborators: Hero, Selected Work, About, Experience, Capabilities, Contact. The hero retains the framed portrait and large name but gives the value proposition and Work/Contact actions readable prominence. Mobile uses a small portrait and natural content height. Reordered section labels follow that sequence; anchor IDs remain compatible.

Meaningful utility text is 12–13px, body copy generally 15–17px, with tighter tracking than decorative labels. Keep supporting text readable on both surfaces; use copper for emphasis, with the lighter focus/copper role for small links on dark backgrounds. Grain is reduced to 0.018 opacity on the public surface, and 0.01 on admin surfaces. Screenshots use a minimal shade rather than a heavy dark veil. The native pointer stays visible; the ornamental ring is quiet and does not replace control affordances.

This intentionally refines the earlier motion guidance: screenshot tours now require an explicit action, and the signature splash screen and staged hero entrance are retained at the owner’s explicit request. The splash counter tracks the entrance timeline, not network loading. The photograph, framing and type remain the signature; motion supports discovery while retaining the requested opening presentation. Shared modal and editing behavior is documented in `UX-CONTRACT.md`.

### Motion

The navigation mark may lift by two pixels and rotate two degrees on hover. Pressed state returns it to rest and scales subtly. Reduced-motion users receive an effectively immediate transition. The monogram itself stays still outside its subtle navigation hover treatment; the opening splash introduces the monogram and name before the hero letters, portrait and copy animate into place. Private previews, direct case-study entry and reduced-motion sessions skip this entrance.

Retain restrained animated grain, short staggered reveals, optional project parallax, and explicitly controlled screenshot tours. Optimize their work rather than removing the effects: start reveals 250px before the viewport without permanent layer promotion; size the grain layer only large enough to cover its movement; schedule parallax outside Angular and skip offscreen style writes. Load screenshot images lazily and measure their loaded dimensions rather than prefetching the entire portfolio. Reduced-motion users receive visible content immediately, native wheel scrolling, no decorative animation, no magnetic pointer effects, and no physics or tour action.

### Capability Map

Use a paper field, ink framing, and three discipline accents (rust, sage, lavender) to separate the capability section from the dark project viewer. All tools stay visible simultaneously so breadth is understood without interaction. Selection reveals matching portfolio projects when the published technology stack supplies evidence; otherwise it links to the work for context. Selection updates the compact footer readout; it never implies a proficiency score or hides content behind hover. On narrow screens each discipline stacks above its signal grid without horizontal scrolling.

## Do's and Don'ts

- **Do:** Keep the monogram legible at 16px before adding detail at larger sizes.
- **Do:** Reuse the same source geometry across public, admin, and favicon surfaces.
- **Don't:** replace the copper signal with a different feature color.
- **Don't:** add code brackets, gradients, initials set in a runtime font, or independent logo variants.

Owner preference: restore the hero’s full ambient beams, drifting orbs, rotating rings, moving background name, pointer-responsive portrait and staggered name reveal. Preserve this choreography during future refinements.

Header preference: retain the original transparent floating header, rounded glass navigation pill, uppercase JetBrains Mono labels, pulsing availability indicator and thin paper scroll-progress line. The configured desktop link order is preserved. The header hides on downward scrolling and returns on upward scrolling or keyboard focus; the mobile menu remains available in the same visual language.

Accessibility refinement: outlined marquee text consumes `--text-muted-dark`, and the login divider consumes the shared admin muted role. Retain the outlined treatment and existing palette while avoiding independent low-opacity text colors. Case-study content is a named, keyboard-focusable scroll region; screenshot and capability selectors expose named control groups.

Short-screen CMS behavior: at viewport heights of 600px or less, the editor heading and action toolbar scroll with the document instead of sticking over form fields. Taller screens retain the sticky toolbar. The mobile navigation header keeps its existing behavior; public navigation is unaffected.
