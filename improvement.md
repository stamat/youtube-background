# Code Review Findings

Project review of `src/` (v1.1.8, 2026-07-28). 1910 lines, no tests. Ranked by severity.

## Broken logic

### 1. `getVidID` null check never fires
[src/video-backgrounds.js:144](src/video-backgrounds.js#L144)

```js
if (link === undefined && link === null) return;
```

Condition is never true (`&&` should be `||`). When an element lacks both `data-youtube` and `data-vbg`, `link` is `null` and `link.match()` throws a TypeError.

**Fix:** `if (!link) return;`

### 2. Parent `position: relative` logic inverted
[src/lib/super-video-background.js:182](src/lib/super-video-background.js#L182)

```js
if (!['absolute', 'fixed', 'relative', 'sticky'].indexOf(parent.style.position)) {
  parent.style.position = 'relative';
}
```

Two bugs in one:
- Parent with `position: absolute` → `indexOf` returns `0` → `!0` is `true` → absolute gets overwritten with relative.
- Statically positioned parent (`''`) → `indexOf` returns `-1` → `!(-1)` is `false` → never gets `position: relative`. This is the primary use case and it's broken.

**Fix:** `if (['absolute', 'fixed', 'relative', 'sticky'].indexOf(parent.style.position) === -1)`

Additionally, this only inspects inline styles. A parent positioned via CSS class is not detected. Consider `getComputedStyle(parent).position`.

### 3. jQuery plugin breaks on second call
[src/main.js:8](src/main.js#L8)

```js
window.VIDEO_BACKGROUNDS.add($this, params);
```

`add()` expects a DOM element and calls `element.hasAttribute()`. Passing a jQuery object throws a TypeError. First call works (constructor handles array-likes), every subsequent `.youtube_background()` call crashes.

**Fix:**
```js
$this.each(function () {
  window.VIDEO_BACKGROUNDS.add(this, params);
});
```

### 4. IntersectionObserver callback throws on unknown uid
[src/video-backgrounds.js:31-37](src/video-backgrounds.js#L31-L37)

The `else` branch runs when `uid` is missing or not in the index, then dereferences `self.index[uid].isIntersecting = false` outside the try/catch → TypeError.

**Fix:** guard first, then branch on intersection only:
```js
if (!uid || !self.index.hasOwnProperty(uid)) return;
if (entry.isIntersecting) { ... } else { ... }
```

### 5. `VideoBackgroundGroup.destroy()` removes nothing
[src/lib/controls.js:244-252](src/lib/controls.js#L244-L252)

`removeEventListener(..., this.onVideoEnded.bind(this))` — each `bind()` creates a new function, so no listener matches and destroy is a silent no-op. All group listeners leak.

**Fix:** store bound references in the constructor (`this.boundOnVideoEnded = this.onVideoEnded.bind(this)`), add and remove those.

### 6. Opacity comparison always false
[src/lib/controls.js:55](src/lib/controls.js#L55)

```js
if (... this.vbgInstance.playerElement.style.opacity === 0) ...
```

`style.opacity` is a string; `'0' === 0` is always false, branch is dead — player stays invisible after seeking a never-played video.

**Fix:** `parseFloat(playerElement.style.opacity) === 0` (or `== 0`).

### 7. `fastSeek` detection always false
[src/lib/video-background.js:167](src/lib/video-background.js#L167)

```js
if (this.player.hasOwnProperty('fastSeek')) {
```

`fastSeek` lives on the prototype; `hasOwnProperty` is always false. Dead path — works via the `currentTime` fallback, but intent broken.

**Fix:** `typeof this.player.fastSeek === 'function'`. When fixing, note the fastSeek path returns before dispatching `video-background-seeked` — move the dispatch above the return.

### 8. Button ARIA state inverted + wrong role/attribute pairing
[src/lib/buttons.js:7-15](src/lib/buttons.js#L7-L15)

- `buttonOn` (state active) sets `aria-pressed="false"`, `buttonOff` sets `"true"` — inverted, and contradicts `MuteToggle`/`PlayToggle` in controls.js where active → `aria-pressed="true"`.
- `role="switch"` pairs with `aria-checked`; `aria-pressed` pairs with a plain toggle button. Commit e7c0a2e swapped the attribute but left the role.

**Fix:** drop `role="switch"`, keep `aria-pressed`, un-invert the values so active state → `aria-pressed="true"`.

## Behavior warts

### 9. `shouldPlay()` ignores user pause
[src/lib/super-video-background.js:259-264](src/lib/super-video-background.js#L259-L264)

User pauses video, switches tab, returns → `onVisibilityChange` force-plays it. `shouldPlay()` never checks `this.paused` (the flag that exists precisely to block soft-play).

**Fix:** first line: `if (this.paused) return false;`

### 10. Global API-ready callbacks clobbered
[src/video-backgrounds.js:230](src/video-backgrounds.js#L230)

`window.onYouTubeIframeAPIReady` / `window.onVimeoIframeAPIReady` are overwritten per `VideoBackgrounds` instance. A second instance silently kills the first's init, and any user-defined handler is destroyed.

**Fix:** capture the previous handler and chain it.

### 11. `destroy()` throws on mobile-disabled instances
[src/lib/super-video-background.js:212](src/lib/super-video-background.js#L212)

When `is_mobile && !params.mobile`, the constructor returns before `injectPlayer()` — `playerElement` is null, so `destroy()` throws on `this.playerElement.remove()`.

**Fix:** `if (this.playerElement) this.playerElement.remove();`

Also `this.element.style = ''` wipes any pre-existing user inline styles — snapshot `element.getAttribute('style')` at init and restore it instead.

### 12. Extensionless video URL crashes
[src/lib/video-background.js:11](src/lib/video-background.js#L11)

```js
this.ext = /(?:\.([^.]+))?$/.exec(vid_data.id)[1];
...
this.mime = this.MIME_MAP[this.ext.toLowerCase()];
```

No extension → `this.ext` is `undefined` → `.toLowerCase()` throws. Same pattern in `setSource()` (line 93).

**Fix:** guard and fall back, e.g. `this.mime = this.MIME_MAP[(this.ext || 'mp4').toLowerCase()];`

## Minor

### 13. `this.re` rebuilt per call
[src/video-backgrounds.js:146](src/video-backgrounds.js#L146) — regex map recreated on every `getVidID` call and stored as instance state for no reason. Make it a local `const` (or module-level).

### 14. YouTube `&loop=1` ineffective
[src/lib/youtube-background.js:98](src/lib/youtube-background.js#L98) — YT embed ignores `loop=1` without `playlist=<id>`. Harmless since looping is done manually in `onVideoEnded`; delete the param or add `playlist`.

### 15. Button condition reads nonexistent param
[src/lib/buttons.js:27](src/lib/buttons.js#L27) — `obj.params[props.condition_parameter]` reads `params['paused']`, which doesn't exist (`pause` is the param; `paused` is instance state). Compare against the instance property instead: `obj[props.condition_parameter]`.

### 16. `GeneralFactory` YAGNI
[src/lib/controls.js:394](src/lib/controls.js#L394) — abstract factory with one subclass and one use. Inline into `VideoBackgroundGroups` next time this file is touched.

## Missing

- **No tests.** `getVidID`, `parseProperties`, `timeToPercentage`/`percentageToTime` are pure and trivially testable — one small test file covers the regressions above.
