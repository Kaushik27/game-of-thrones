# Final Design QA — Cinematic Realm Journey

## Comparison target

- Source visual truth: `/Users/xkxm377/.codex/generated_images/019fda86-75c3-7fd2-9104-0907288582b3/exec-e16930d4-d380-4159-a0a8-daf6b62ba756.png`
- Final implementation capture: `audit/realm-journey-implementation-final-2.png`
- Final full-view comparison: `audit/realm-journey-comparison-pass-2.png`
- Focused editorial/detail comparison: `audit/realm-journey-focus-comparison.png`
- Final mobile evidence: `audit/realm-journey-mobile-final-2.png`
- Route/state: `#/`, Season 6, Battle of the Bastards, Jon Snow detail open, dark theme, WebGL active
- Desktop viewport and CSS size: 1487 × 1058
- Source pixels: 1487 × 1058
- Implementation pixels: 1487 × 1058
- Density normalization: 1:1; no resampling was required for the final comparison
- Mobile validation viewport: 390 × 844 CSS pixels; in-app capture content was 375 × 812 pixels

## Findings

No actionable P0, P1, or P2 differences remain.

- Typography: Cinzel preserves the source's engraved editorial hierarchy; Cormorant Garamond gives the story copy an appropriately literary voice. The final headline is explicitly two lines, with no clipping or truncation.
- Spacing and layout: the left story column, central character focus, right season rail, marker constellation, detail card, and bottom chapter scrubber preserve the source composition and reading order. The mobile layout has a 22 px gap between the primary CTA and season rail and no horizontal page overflow.
- Colors and tokens: the blackened blue-gray landscape, restrained gold, icy blue metadata, translucent black panels, and quiet dividers remain coherent and legible. The implementation intentionally darkens the original generated landscape slightly to protect text and marker contrast.
- Image quality: all three 2048 × 1152 realm backdrops remain sharp after JPEG optimization. The visible Sansa, Ramsay, and Jon portraits load from verified local actor-photo assets with non-zero natural dimensions. Bootstrap Icons supply the non-portrait symbols; no emoji, placeholder art, inline SVG, or fake actor imagery is used.
- Copy and content: Season 6 copy matches the chosen visual's narrative beat, while the season rail expands the same system to all eight seasons. The Jon detail card uses a real route into the existing character archive.
- Accessibility and behavior: the region is labelled, marker disclosures expose `aria-controls` and `aria-expanded`, all buttons have accessible names, image alt attributes are present, duplicate IDs are absent, keyboard arrows change seasons, Escape closes details, and reduced-motion/fallback paths are implemented.

Residual P3 differences are intentional: the implementation uses original generated realm art instead of duplicating the reference landscape, real open-license actor portraits instead of production stills, and a subtler 3D route so the live terrain layer does not compete with editorial content.

## Focused comparison evidence

The focused crop covers the headline, narrative copy, actor markers, Jon disclosure, and primary CTA at original pixel density. It confirms the two-line title, sharp type, consistent gold rules, aligned marker labels, readable detail panel, and equivalent story hierarchy. A separate mobile capture verifies the responsive control stack and touch-width layout.

## Comparison history

1. Initial comparison — `audit/realm-journey-comparison.png`
   - [P1] The authored fallback rendered, but the Three.js core module was missing, so the requested 3D layer could not start.
   - Fix: vendored the matching `three.core.min.js`, kept the classic-script fallback independent, and added an in-place `realm-three-ready` upgrade.
   - Evidence after fix: `audit/realm-journey-desktop-3d.png` reported one canvas and `data-webgl="true"`.

2. Live 3D refinement — `audit/realm-journey-desktop-3d.png`
   - [P1] Opaque low-poly terrain, trees, and fortress geometry overpowered the photographic landscape.
   - Fix: changed the renderer to a transparent canvas, reduced terrain/forest/fortress opacity and scale, thinned the route, and kept the authored background as the dominant visual plane.
   - Evidence after fix: `audit/realm-journey-desktop-refined.png` shows the terrain and route as atmospheric depth rather than foreground obstruction.

3. Responsive refinement — `audit/realm-journey-mobile.png`
   - [P2] The mobile season rail overlapped the chapter CTA and exposed a native horizontal scrollbar.
   - Fix: moved the season rail and marker field below the CTA, preserved scrollability, and visually suppressed native scrollbars.
   - Evidence after fix: `audit/realm-journey-mobile-final-2.png`; measured CTA bottom 398 px, season rail top 420 px, and no horizontal document overflow.

4. Final fidelity pass — `audit/realm-journey-comparison-final.png`
   - [P2] The Season 6 headline wrapped to three lines while the source uses two, changing the main above-the-fold proportion.
   - Fix: let the authored line break use the full story-column width.
   - Evidence after fix: `audit/realm-journey-comparison-pass-2.png` and `audit/realm-journey-focus-comparison.png`; the rendered headline measures 420 × 124 px and reads on two lines.

## Browser and interaction checks

- All eight seasons: correct title, three chapters, loaded background, active WebGL canvas.
- Season 7: capital artwork and three chapter labels updated without remounting.
- Keyboard: ArrowRight moved Season 7 to Season 8; chapter selection and active state updated.
- Details: Jon opens by default for the selected chapter; Escape closes the disclosure; switching chapters updates marker sets.
- Search: `arya` returned grouped results and Enter opened `#/character/arya-stark`.
- Routing: leaving and returning to `#/` destroyed and recreated exactly one journey/canvas.
- Mobile: menu opens/closes, Stories route works, controls do not overlap, and the document has no horizontal overflow.
- Fresh final tab: zero console warnings/errors; actor portraits loaded; one WebGL canvas active.
- Progressive fallback: verified during the initial missing-core pass; the complete story UI remained usable without WebGL.

## Implementation checklist

- [x] Match the selected cinematic composition at the same viewport and state.
- [x] Keep the core season, chapter, marker, detail, search, and route interactions functional.
- [x] Validate desktop and mobile layouts.
- [x] Validate keyboard, disclosure, image, lifecycle, fallback, and clean-console behavior.
- [x] Preserve local licenses and source attribution.

final result: passed
