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
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
  body:
    fontFamily: "Inter, -apple-system, PingFang SC, Microsoft YaHei, sans-serif"
  utility:
    fontFamily: "JetBrains Mono, SFMono-Regular, Menlo, monospace"
components:
  brand-mark: {}
  capability-map: {}
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

Runtime tokens in `src/styles.css` remain canonical. This file mirrors their accepted values and records the brand rationale; `public/brand-mark.svg`, `public/favicon.svg`, navigation, preloader, and admin brand surfaces are the consumers.

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

### Motion

The navigation mark may lift by two pixels and rotate two degrees on hover. Pressed state returns it to rest and scales subtly. Reduced-motion users receive an effectively immediate transition. Preloader motion belongs to the containing page transition; the artwork itself stays still.

### Capability Map

Use a paper field, ink framing, and three discipline accents (rust, sage, lavender) to separate the capability section from the dark project viewer. All tools stay visible simultaneously so breadth is understood without interaction. Selection updates the compact footer readout; it never implies a proficiency score or hides content behind hover. On narrow screens each discipline stacks above its signal grid without horizontal scrolling.

## Do's and Don'ts

- **Do:** Keep the monogram legible at 16px before adding detail at larger sizes.
- **Do:** Reuse the same source geometry across public, admin, and favicon surfaces.
- **Don't:** replace the copper signal with a different feature color.
- **Don't:** add code brackets, gradients, initials set in a runtime font, or independent logo variants.
