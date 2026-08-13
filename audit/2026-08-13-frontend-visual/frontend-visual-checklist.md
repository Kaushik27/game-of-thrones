# Frontend visual verification

Run date: 2026-08-13

Every route below was opened in the deployed site and captured at 375px, 768px, and 1440px. The audit used strict broken-image detection (`complete && !naturalWidth`), document horizontal-overflow checks, and browser console error collection.

## Root static site

| Route | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| `#/` | PASS | PASS | PASS |
| `#/characters` | PASS | PASS | PASS |
| `#/character/arya-stark` | PASS | PASS | PASS |
| `#/houses` | PASS | PASS | PASS |
| `#/house/Stark` | PASS | PASS | PASS |
| `#/map` | PASS | PASS | PASS |
| `#/maps` | PASS | PASS | PASS |
| `#/chronicle` | PASS | PASS | PASS |
| `#/history` | PASS | PASS | PASS |
| `#/chronicles` | PASS | PASS | PASS |
| `#/what-if` | PASS | PASS | PASS |
| `#/desk` | PASS | PASS | PASS |
| `#/episode/s01e01` | PASS | PASS | PASS |
| `#/timeline` | PASS | PASS | PASS |
| `#/timeline?atlas=1` | PASS | PASS | PASS |
| `#/battles` | PASS | PASS | PASS |
| `#/battles?battle=battle-blackwater` | PASS | PASS | PASS |
| `#/quiz` | PASS | PASS | PASS |
| `#/quotes` | PASS | PASS | PASS |
| `#/quotes?quote=q1` | PASS | PASS | PASS |
| `#/lore` | PASS | PASS | PASS |
| `#/credits` | PASS | PASS | PASS |

## React application

| Route | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| `/app/` | PASS | PASS | PASS |
| `/app/people` | PASS | PASS | PASS |
| `/app/people/arya-stark` | PASS | PASS | PASS |
| `/app/houses` | PASS | PASS | PASS |
| `/app/stories` | PASS | PASS | PASS |
| `/app/battles` | PASS | PASS | PASS |
| `/app/quotes` | PASS | PASS | PASS |
| `/app/database` | PASS | PASS | PASS |
| `/app/architecture` | PASS | PASS | PASS |

## Interaction checks

- React timeline control toggled `aria-pressed` from `false` to `true` and changed from Play to Pause.
- Command palette opened as a dialog and closed with its close control.
- Header People navigation reached `/app/people`; server-backed People search for `Arya` returned an Arya Stark record.
- Static and React browser captures reported zero console errors, zero broken images, and zero document-level horizontal overflow at all 66 static and 27 React checkpoints.
- Small intentional horizontal rails (season/quote/chapter controls) remain internally scrollable; they do not expand the document or clip the page.

## Evidence

- `static-audit-final.json` — 22 static routes × 3 viewports.
- `react-audit-final.json` — 9 React routes × 3 viewports.
- `static-*.png` and `react-*.png` — viewport captures for each checkpoint.

## Changes verified

- Normalized character and house asset paths with safe local fallbacks.
- Removed narrow-screen header/logo clipping and condensed the mobile status bar to the live indicator.
- Prevented root realm medallion captions from colliding on small screens and reduced mobile node dimensions.
- Kept the mobile navigation shell on one row and removed the nonessential raven action at narrow widths.
- Bumped static stylesheet and navigation bundle cache keys so GitHub Pages serves the corrected CSS/JS.

## Regional visual refresh

- The Maps journey now uses distinct scenes for Winterfell, the Wall, King’s Landing, Meereen, and Beyond the Wall. The new Beyond the Wall scene is an original snowy wilderness asset designed for this project.
- The Houses landing page now opens on a cinematic King’s Landing / Red Keep treatment with a focused feature panel; the orbiting sigil diagram has been removed.
- Rechecked both routes at 375px, 768px, and 1440px: zero broken images, horizontal overflow, or browser console errors. Every map stop resolved to its intended regional background at all three widths.
- Reworked the observatory medallions so the transparent control no longer renders a second dark circular plate around the engraved source coin. Removed wallpaper breathing/arrival scaling, preloaded all nine house scenes, and removed map-backdrop scaling so selections swap without the visible expansion/loading lag.
