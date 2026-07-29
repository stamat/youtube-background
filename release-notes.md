# Release notes

## 1.2.0

A bug-fix release from a full review of `src/`, plus tooling: a test suite, linting,
CI, and a rebuilt demo page.

### Breaking-ish

Nothing in the public API changed, but three behaviours differ:

- **`.mov`, `.m4v` and `.qt` URLs are now recognised.** They were listed in
  `MIME_MAP` but rejected by the detection regex, so elements pointing at them were
  silently skipped. If you were relying on such an element being ignored, it will
  now create a background.
- **A user-initiated pause survives a tab switch.** Returning to the tab used to
  restart a video the visitor had paused.
- **`aria-pressed` on the generated play/mute buttons was inverted** and is now
  corrected. Anything asserting on the old (wrong) value needs updating.

### Fixed

- **Missing video link crashed detection.** `getVidID()` used `&&` where it meant
  `||`, so its null guard never fired and an element with neither `data-vbg` nor
  `data-youtube` threw a `TypeError`.
- **Statically positioned parents never got `position: relative`.** The check was
  inverted twice: an `absolute` parent was overwritten with `relative`, while the
  static parent that actually needs a containing block was left alone. It now uses
  `getComputedStyle`, so parents positioned from a CSS class are seen too.
- **The jQuery plugin threw on every call after the first.** The second call passed
  a jQuery object to `add()`, which expects a DOM element.
- **The IntersectionObserver callback threw on unknown elements.** Entries whose
  uid was missing or unindexed fell into a branch that dereferenced the missing
  entry outside the `try`/`catch`.
- **`VideoBackgroundGroup.destroy()` removed nothing.** Every listener was attached
  and detached with a fresh `.bind()`, so no removal ever matched and each group
  leaked all six listeners. `VideoBackgroundGroups.destroy()`/`destroyAll()` had a
  related bug — they guarded on `hasOwnProperty('destroy')`, never true for a
  prototype method, so they never tore anything down either.
- **Seeking a video that had not started left it invisible.** The opacity reset
  compared a CSS string against the number `0`.
- **`fastSeek` was never used**, since `hasOwnProperty` cannot see a prototype
  method. The fast path also returned before dispatching
  `video-background-seeked`; both paths now emit it.
- **Control button ARIA.** `aria-pressed` reported the opposite of the button's
  state and was paired with `role="switch"`, which expects `aria-checked`. The role
  is gone, the values are correct, and the buttons — previously announced as a bare
  "button", their only content being an icon element — now carry a state-dependent
  `aria-label` and an explicit `type`.
- **A paused video restarted on tab focus.** `shouldPlay()` ignored the `paused`
  flag that exists to prevent exactly that.
- **Second instances killed the first.** `window.onYouTubeIframeAPIReady` and
  `window.onVimeoIframeAPIReady` were overwritten rather than chained, so a second
  `VideoBackgrounds` silently prevented the first from initialising its players —
  and any handler the host page had registered was discarded.
- **`destroy()` threw on mobile-disabled instances**, where the constructor returns
  before a player exists. It also blanked the element's inline `style` attribute,
  taking any styles the page had set with it; the original is now restored.
- **Video URLs without a usable extension.** An extensionless URL threw on
  `.toLowerCase()`, and an extension outside `MIME_MAP` produced
  `type="undefined"` on the `<source>`. The type attribute is now omitted when the
  container is unknown, leaving the browser to sniff it.
- **`.mov`, `.m4v` and `.qt` were undetectable.** `MIME_MAP` gained them in #67 but
  detection still ran through book-of-spells' `RE_VIDEO`, which whitelists only
  `mp4|ogg|ogv|ogm|webm|avi`. The pattern is now derived from `MIME_MAP` itself, so
  the two cannot drift apart, and a trailing query string or hash no longer
  prevents a match.
- **Button initial state read a parameter that does not exist.** The lookup went to
  `params['paused']`; the play button's starting state was `undefined` and only
  came out right by accident.
- **An unrecognised source type dereferenced an unassigned index entry.** The
  `switch` in `add()` had no `default`.

### Changed

- The inert `&loop=1` is gone from the YouTube embed URL — the embed ignores it
  without a `playlist` parameter, and looping already runs through
  `onVideoEnded()`, which respects `start-at`.
- `GeneralFactory` is folded into `VideoBackgroundGroups`, its only subclass.
- The source-detection regexes are hoisted to module scope instead of being rebuilt
  on every `getVidID()` call.

### Tooling

- **Sources are now `.mjs`.** Jest will not treat `.js` as ESM while the package
  stays CommonJS, and the package must stay CommonJS because the published bundles
  are IIFE and have to remain `require()`-able. The published artefacts and their
  paths are unchanged.
- **Tests** on jest, in `src/__tests__`, covering source detection, MIME
  resolution, property parsing, the time/percentage conversions and `shouldPlay()`.
  `npm test`.
- **ESLint** flat config on the recommended ruleset. `npm run lint`.
- **CI** runs lint, tests and the build on every push and pull request, and fails
  if the checked-in build output is stale.
- **The demo page** is generated from `src/markup/index.md` through
  `poops-docs-theme`, built into `site/`, and deployed to GitHub Pages by a
  workflow. It now documents the options, events and API alongside the live
  examples. Poops updated 1.0.18 → 1.9.4.

### Upstream

`book-of-spells` carries the same `RE_VIDEO` gap that hid `.mov` files here, and it
affects every consumer. Fixed on the `fix/re-video-containers` branch of that repo
(v1.3.1): QuickTime containers added, and a trailing query string or hash no longer
blocks a match. This package does not depend on that release — it derives its own
pattern from `MIME_MAP`.
