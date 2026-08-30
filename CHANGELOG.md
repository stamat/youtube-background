# Changelog

All notable changes to youtube-background are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries start at the version this file was added; releases before it are in the
[GitHub releases](https://github.com/stamat/youtube-background/releases),
generated from commits.

## Contributing an entry

Write your change under `## [Unreleased]`, grouped under `### Added`,
`### Changed`, `### Fixed`, `### Deprecated`, `### Removed` or `### Security`.
Give the heading a short title after an em dash and open with a sentence or two
saying what was wrong before — those become the title and description of the
release notes.

Keep it bare: one sentence per bullet saying what changed, one saying why, and
two is the ceiling. Write it for the person upgrading — a renamed option, a
different default, an error that is now thrown, output that moved. How it was
verified, what was rejected on the way, and internals nobody can reach stay out.

```markdown
## [Unreleased] — a paused video no longer restarts itself

`shouldPlay()` ignored the `paused` flag, so returning to the tab restarted a
video the visitor had stopped on purpose.

### Fixed

- **A user-initiated pause survives a tab switch.** ...
```

## Contributing a release

`script/publish [version]` writes the version, calls `script/changelog` to cut
`## [Unreleased]` into `## [<version>] - <date>`, commits both, builds and
commits the output, then tags and pushes. The cut happens inside the bump
commit on purpose, so the tag contains the released entry and no CI step has to
push back to `master`. Pushing the tag triggers
[publish.yml](.github/workflows/publish.yml), which publishes to npm through
trusted publishing — `script/publish` never runs `npm publish` from your
machine. Last it offers a GitHub release, using the entry it cut as the body.

## [Unreleased] — a source swap keeps the state it was handed

`setSource()` replaced the player's `src` and left everything else standing. The new
video came back muted after the visitor had unmuted, it no longer looped, and a plain
video file did not change at all.

### Fixed

- **`setSource()` goes through the player API, not the iframe `src`.** A new `src`
  navigates the iframe away from the document the YouTube and Vimeo APIs shook hands
  with, so state changes stopped arriving and the loop went with them. YouTube now
  swaps with `loadVideoById`, or `cueVideoById` for a video that was not playing, and
  Vimeo with `loadVideo` — the player survives, and so do its mute state and volume.

- **A swap before the player exists carries the live state into the URL.** That one
  path still assigns `src`, but it now reads the current mute and pause state rather
  than the `muted` and `autoplay` parameters the instance started with.

- **A `<video>` file actually changes.** `setSource()` swapped the `<source>` child,
  which the browser only reads while running its load algorithm, so the old file played
  on; the element is reloaded now, and resumes playing if it was playing.

- **The replaced video leaves no duration behind.** Duration and progress carried over
  from the old video, so a longer replacement was cut short at the old length.

## [1.2.0] - 2026-08-29 — a pass over every file in `src/`, and jQuery on notice

A full review of `src/` turned up a teardown that tore nothing down, a video that
restarted itself after the visitor had paused it, and a second instance that
quietly killed the first. Nothing in the public API was renamed except one event:
the group unmute event went out as `video-background-group-umnute`, and listeners
bound to that spelling need updating. The jQuery plugin is deprecated here.

### Added

- **`VideoBackgrounds.disconnect()`, full teardown.** It destroys every instance,
  disconnects both observers and removes the two global listeners the factory
  registered; `destroyAll()` leaves the factory itself listening, as it always did.

- **`destroy()` on `SeekBar`, `PlayToggle` and `MuteToggle`.** None had one, and every
  listener was attached through a fresh `.bind()` with no reference kept, so a control
  removed from the page stayed alive through the element it pointed at and kept running
  on every `video-background-time-update`. The controls are documented now, as the
  optional part of the package they are.

- **`data-ytbg` is read as a source URL.** `setSource()` had always written back to
  it, but nothing ever read it, so an element carrying only `data-ytbg` was never
  picked up.

- **An `exports` map.** `import { VideoBackgrounds } from 'youtube-background'` hands
  you the class. `require()` and the CDN keep getting the IIFE bundle, which has no
  exports — loading it registers `window.VideoBackgrounds` as a side effect.

- **Tests, linting and CI.** `npm test` runs jest over the pure logic behind every
  fix below, `npm run lint` runs eslint, and CI runs both plus the build, failing if
  the checked-in build output is stale.

### Changed

- **`SeekBar` moves smoothly.** It advanced only on `video-background-time-update`, which
  every provider sends about four times a second, so the thumb visibly stepped; while the
  video plays it now moves on an animation frame, extrapolating from the last report, and
  holds rather than stepping back when a report lands a few milliseconds behind it.

- **The group unmute event is `video-background-group-unmute`.** It was dispatched
  as `video-background-group-umnute` — the only rename in this release, and the only
  thing here that breaks a listener.

- **The source URL is read from `data-vbg`, `data-youtube`, then `data-ytbg`.**
  `data-youtube` used to win over `data-vbg`, which only shows up on an element
  carrying both.

- **`setSource()` writes back the URL you gave it,** not the generated embed URL, so
  reading the attribute back no longer hands you `player.vimeo.com/video/…`.

- **`.avi` sources are typed `video/x-msvideo`,** the registered MIME type, instead
  of the invented `video/avi`.

- **The published package is sources and bundles only** — no site, scripts or tests.

- **Sources are now `.mjs`.** Jest will not treat `.js` as ESM while the package
  stays CommonJS, and it has to stay CommonJS because the published bundles are IIFE
  and have to remain `require()`-able — the published files and their paths are
  unchanged.

- **The demo page is generated.** `site/index.md` goes through `poops-docs-theme`
  into `_site/` and is deployed by a workflow, and it now documents the options,
  events and API alongside the live examples. Poops `^1.0.18` → `^3.0.0`,
  `poops-docs-theme` `^1.1.2` → `^5.1.1` — the page gains a theme switcher, a
  footer and copy buttons, and its stylesheet and script grow from 12KB and 2KB to
  40KB and 25KB. Nothing published to npm is affected; both are build-time only.

- **`book-of-spells` `^1.0.18` → `^2.8.0`.** The `.mov` fix below landed in `1.3.1`.
  All eleven helpers the bundle imports are byte-identical across the majors, so
  nothing here changes behaviour — but the new one carries constants that survive
  tree shaking, so the minified bundle grows 485 bytes, 288 gzipped.

- **The inert `&loop=1` is gone from the YouTube embed URL.** The embed ignores it
  without a `playlist` parameter, and looping already runs through `onVideoEnded()`,
  which respects `start-at`.

- **The README is reconciled with the code** — a default export that never existed,
  a wrong `mobile` default, an instance variable (`playing`) that does not exist, a
  missing event and attribute, and a browser support table listing browsers that
  cannot run the ES2019 bundles.

### Deprecated

- **The jQuery plugin, `jQuery('[data-vbg]').youtube_background()`.** The first call now warns
  once in the console. `new VideoBackgrounds('[data-vbg]')` does the same job and has
  since 1.0.6 — the plugin only ever wrapped it.

### Removed

- **`onVideoError()` on `YoutubeBackground` and `VimeoBackground`.** The lines that
  would have wired them to the players had been commented out, so neither was ever
  called.

- **`VideoBackgroundGroup.onVideoPause()`,** whose body did nothing the other
  handlers were not already doing.

### Fixed

- **`.mov`, `.m4v` and `.qt` URLs are recognised.** They were in `MIME_MAP` but
  detection ran through book-of-spells' `RE_VIDEO`, which whitelisted only
  `mp4|ogg|ogv|ogm|webm|avi`, so those elements were silently skipped; fixed upstream
  in `book-of-spells@1.3.1`, where a trailing query string or hash no longer blocks a
  match either. A test keeps `MIME_MAP` and `RE_VIDEO` from drifting apart.

- **`autoplay: false` holds on scroll-in.** The IntersectionObserver started any
  video entering the viewport that the visitor had not paused, `autoplay` or not; it
  now asks `shouldPlay()`, the gate the tab-switch path already used (#74). The same
  gate keeps a video that ended with `loop` off from restarting when scrolled back in.

- **A user-initiated pause survives a tab switch.** `shouldPlay()` ignored the
  `paused` flag that exists to prevent exactly that, so returning to the tab
  restarted a video the visitor had stopped.

- **A user-initiated pause survives the end of a looping video.** `onVideoEnded()`
  rewound and played on regardless, so `loop` overrode the visitor.

- **The plugin's own buttons are named for the action they will take, and nothing
  else.** They announced as a bare "button" — their only content an icon — and then
  carried `aria-pressed` reporting the opposite of their state; now the name is
  `Pause` while playing and `Play` while paused, `Mute`/`Unmute` likewise, with an
  explicit `type="button"` and no `aria-pressed`, since a name that swaps and a pressed
  state together say it twice (#72).

- **`PlayToggle` and `MuteToggle` are toggle buttons, not switches.** `role="switch"`,
  which expects `aria-checked`, is gone; the name you gave the button stays, `aria-pressed`
  alone carries the state, and `type="button"` is added where you gave none. `SeekBar`
  names its input `Seek` when you gave it no name.

- **The play button starts in the right state.** Its initial state read
  `params['paused']`, which does not exist, so the value was `undefined` and only
  came out right by accident.

- **`video-background-group-forward-rewind` and `-backward-rewind` fire.** Both were
  dispatched on a condition tested after the index had already been clamped, so
  neither could ever be true.

- **A missing video link no longer crashes detection.** `getVidID()` used `&&` where
  it meant `||`, so its null guard never fired and an element with no source
  attribute threw a `TypeError`.

- **`VideoBackground` and `VimeoBackground` no longer dereference their arguments
  before checking them.** Both read a property off the video data on the way into
  `super()`, one line above the guard that was supposed to catch it being missing.

- **A statically positioned parent gets `position: relative`.** The check was
  inverted twice — an `absolute` parent was overwritten with `relative` while the
  static parent that actually needs a containing block was left alone. It reads
  `getComputedStyle` now, so a parent positioned from a CSS class is seen too.

- **The jQuery plugin survives the second call.** It passed a jQuery object to
  `add()`, which expects a DOM element.

- **`VideoBackgroundGroup.destroy()` removes its listeners.** Every one was attached
  and detached through a fresh `.bind()`, so no removal ever matched and each group
  leaked all six. `VideoBackgroundGroups.destroy()` and `destroyAll()` guarded on
  `hasOwnProperty('destroy')`, never true for a prototype method, so they tore
  nothing down either.

- **`VideoBackgrounds.destroyAll()` destroys.** It passed each instance's
  `playerElement` to `destroy()`, but `data-vbg-uid` only ever lands on the wrapper
  element, so the lookup returned `null` and the call was a silent no-op.

- **The factory releases its global listeners.** It attached a `visibilitychange`
  listener to `document`, plus a `resize` listener to `window` when `ResizeObserver`
  is missing, and offered no way to remove either; `disconnect()` above is that way.

- **A factory built from an empty selector honours tab visibility.** The
  `visibilitychange` listener was attached after the constructor's early return, so
  elements added later through `add()` were never resumed.

- **`add()` no longer writes to the params object you passed it.** With no
  `IntersectionObserver` it set `always-play` on that object, which the caller
  usually shares across every element.

- **`destroy()` no longer throws on mobile-disabled instances,** where the
  constructor returns before a player exists. It also blanked the element's inline
  `style` attribute, taking any styles the page had set with it; the original is
  restored.

- **A second `VideoBackgrounds` no longer kills the first.**
  `window.onYouTubeIframeAPIReady` and `window.onVimeoIframeAPIReady` were
  overwritten rather than chained, so the first instance never initialised its
  players — and any handler the host page had registered was discarded.

- **The IntersectionObserver callback survives an unknown element.** Entries whose
  uid was missing or unindexed fell into a branch that dereferenced the missing entry
  outside the `try`/`catch`.

- **A lazy YouTube video no longer autoplays while offscreen.** The `notstarted`
  state YouTube reports on load played the video unconditionally, skipping the
  intersection check every other path makes.

- **`loop` together with `start-at` returns to `start-at`.** The native `loop`
  attribute wraps to 0:00 and never fires `ended`, so the loop is driven from
  `onVideoEnded()` instead — and `setStartAt()` re-decides the attribute, rather than
  leaving whatever the constructor chose.

- **Seeking a video that had not started leaves it visible.** The opacity reset
  compared a CSS string against the number `0`.

- **`fastSeek` is used when it exists.** `hasOwnProperty` cannot see a prototype
  method, so the fast path never ran; it also returned before dispatching
  `video-background-seeked`, and both paths emit it now.

- **A video URL without a usable extension works.** An extensionless URL threw on
  `.toLowerCase()`, and an extension outside `MIME_MAP` produced `type="undefined"`
  on the `<source>`; the type attribute is omitted when the container is unknown,
  leaving the browser to sniff it.

- **`percentComplete` reports 0 while the duration is still unknown,** where it used
  to report 100 — every time is past a duration of zero. `end-at` now caps the
  duration through one `Math.min` rather than four branches that disagreed at the
  edges.

- **An unlisted Vimeo video survives `setSource()`.** The `h=` hash was dropped on
  the way to the new embed URL, and the player 404s without it; a public
  `/channels/…/123456789` URL no longer reads its own id as a hash either.

- **An unrecognised source type no longer dereferences an unassigned index entry.**
  The `switch` in `add()` had no `default`.
