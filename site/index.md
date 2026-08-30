---
layout: poops-docs-theme/prose
---

# 📺 Youtube Background
[![npm version](https://img.shields.io/npm/v/youtube-background)](https://www.npmjs.com/package/youtube-background)
[![CI](https://img.shields.io/github/actions/workflow/status/stamat/youtube-background/ci.yml?branch=master&label=CI)](https://github.com/stamat/youtube-background/actions/workflows/ci.yml)
[![gzip size](https://img.badgesize.io/stamat/youtube-background/master/dist/youtube-background.min.js?compression=gzip&label=gzip%20size)](https://github.com/stamat/youtube-background/blob/master/dist/youtube-background.js)

ESM module for turning a YouTube, Vimeo or plain video file link into a
cover background — with autoplay, looping, play/mute controls, seek bars and
playlist groups.

```bash
npm install youtube-background
```

> [!IMPORTANT]
> **2.0 removed the jQuery plugin and renamed the bundles.** The factory and every option,
> event and method are unchanged — `jquery.youtube-background.js` is now
> `dist/youtube-background.js`, and `youtube-background-experimental.js` is
> `dist/youtube-background-controls.js`. The 1.x page is [here](v1/).

> [!NOTE]
> If you would rather write markup than call a constructor, the same three providers ship
> as a custom element in
> [video-background-element](https://github.com/stamat/video-background-element) —
> `<video-background src="…">`, no factory and no selector. It is where new features go;
> this package stays maintained for the `[data-vbg]` API.

## Live demos

Every band below is a real instance. The markup that produces it is right under it.

<div class="example-marquee">
  <div id="demo-youtube" data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA" data-vbg-load-background="true" data-vbg-mobile="true"></div>
  <div class="content">
    <div class="inner">
      <h2>YouTube</h2>
      <p>Autoplaying, muted, looping, and paused whenever it scrolls out of view.</p>
      <button class="js-demo-destroy" data-selector="#demo-youtube">Destroy</button>
      <button class="js-demo-init" data-selector="#demo-youtube" data-src="https://www.youtube.com/watch?v=LC5rEhxGqT4">Re-initialize</button>
    </div>
  </div>
  <div data-target="#demo-youtube" class="seek-bar-wrapper js-seek-bar-wrap">
    <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
    <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
  </div>
</div>

```html
<div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA" data-vbg-load-background="true"></div>
```

<div class="example-marquee">
  <div id="demo-segment" data-vbg="https://www.youtube.com/watch?v=MgDZBqTuUuE" data-vbg-play-button="true" data-vbg-start-at="10" data-vbg-end-at="16" data-vbg-load-background="true"></div>
  <div class="content">
    <div class="inner">
      <h2>A slice of a video</h2>
      <p><code>start-at</code> skips the intro, <code>end-at</code> keeps the loop short. The play button is the plugin's own.</p>
    </div>
  </div>
  <div data-target="#demo-segment" class="seek-bar-wrapper js-seek-bar-wrap">
    <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
    <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
  </div>
</div>

```html
<div
  data-vbg="https://www.youtube.com/watch?v=MgDZBqTuUuE"
  data-vbg-play-button="true"
  data-vbg-start-at="10"
  data-vbg-end-at="16"
></div>
```

<div class="example-marquee">
  <div id="demo-sound" data-vbg="https://www.youtube.com/watch?v=DLzxrzFCyOs" data-vbg-play-button="true" data-vbg-mute-button="true" data-vbg-resolution="4:3" data-vbg-volume="0.15"></div>
  <div class="content">
    <div class="inner">
      <h2>Sound, and your own controls</h2>
      <p>Unmute with the plugin's button, or drive it from buttons of your own — those keep their name and carry the state in <code>aria-pressed</code>.</p>
      <button class="js-demo-play-toggle" data-target="#demo-sound">Play</button>
      <button class="js-demo-mute-toggle" data-target="#demo-sound">Mute</button>
      <button class="js-demo-src" data-src="https://www.youtube.com/watch?v=UIyoNvInzCI">Change source</button>
    </div>
  </div>
  <div data-target="#demo-sound" class="seek-bar-wrapper js-seek-bar-wrap">
    <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
    <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
  </div>
</div>

<div class="example-marquee">
  <div id="demo-vimeo" data-vbg="https://vimeo.com/137250145" data-vbg-play-button="true" data-vbg-mute-button="true"></div>
  <div class="content">
    <div class="inner">
      <h2>Vimeo</h2>
      <p>Same attributes, different platform. Unlisted links keep their hash.</p>
      <button class="js-demo-src" data-src="https://vimeo.com/64289386">Change source</button>
    </div>
  </div>
  <div data-target="#demo-vimeo" class="seek-bar-wrapper js-seek-bar-wrap">
    <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
    <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
  </div>
</div>

```html
<div data-vbg="https://vimeo.com/137250145" data-vbg-mute-button="true"></div>
<!-- unlisted -->
<div data-vbg="https://vimeo.com/304887422/34c51f7a09"></div>
```

<div class="example-marquee">
  <div id="demo-file" data-vbg="https://media.w3.org/2010/05/sintel/trailer.mp4" data-vbg-poster="https://media.w3.org/2010/05/sintel/poster.png" data-vbg-play-button="true" data-vbg-mute-button="true" data-vbg-start-at="10" data-vbg-end-at="25"></div>
  <div class="content">
    <div class="inner">
      <h2>A plain video file</h2>
      <p>Any <code>.mp4</code>, <code>.webm</code>, <code>.ogg</code>, <code>.avi</code>, <code>.mov</code>, <code>.m4v</code> or <code>.qt</code> URL, played in a native <code>&lt;video&gt;</code>.</p>
      <button class="js-demo-src" data-src="https://media.w3.org/2010/05/bunny/trailer.mp4">Change source</button>
    </div>
  </div>
  <div data-target="#demo-file" class="seek-bar-wrapper js-seek-bar-wrap">
    <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
    <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
  </div>
</div>

```html
<div
  data-vbg="https://media.w3.org/2010/05/sintel/trailer.mp4"
  data-vbg-poster="https://media.w3.org/2010/05/sintel/poster.png"
  data-vbg-start-at="10"
  data-vbg-end-at="25"
></div>
```

<div id="demo-group" class="example-marquee js-vbg-group">
  <div id="demo-group-1" data-vbg="https://www.youtube.com/watch?v=LC5rEhxGqT4" data-vbg-loop="false" data-vbg-load-background="true"></div>
  <div id="demo-group-2" data-vbg="https://vimeo.com/137250145" data-vbg-loop="false" data-vbg-autoplay="false" data-vbg-load-background="true" style="display: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></div>
  <div id="demo-group-3" data-vbg="https://media.w3.org/2010/05/bunny/trailer.mp4" data-vbg-loop="false" data-vbg-autoplay="false" data-vbg-start-at="5" data-vbg-end-at="20" data-vbg-poster="https://media.w3.org/2010/05/bunny/poster.png" style="display: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></div>
  <div class="content">
    <div class="inner">
      <h2>A group</h2>
      <p>Three backgrounds across all three source types, played as one playlist.</p>
      <button class="js-group-prev">Prev</button>
      <button class="js-group-play">Play</button>
      <button class="js-group-pause">Pause</button>
      <button class="js-group-next">Next</button>
      <button class="js-group-mute">Mute</button>
      <button class="js-group-unmute">Unmute</button>
    </div>
  </div>
  <div class="seek-bars">
    <div data-target="#demo-group-1" class="seek-bar-wrapper js-seek-bar-wrap">
      <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
      <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
    </div>
    <div data-target="#demo-group-2" class="seek-bar-wrapper js-seek-bar-wrap">
      <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
      <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
    </div>
    <div data-target="#demo-group-3" class="seek-bar-wrapper js-seek-bar-wrap">
      <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
      <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
    </div>
  </div>
</div>

```html
<div class="js-vbg-group">
  <div data-vbg="https://www.youtube.com/watch?v=LC5rEhxGqT4" data-vbg-loop="false" data-vbg-load-background="true"></div>
  <div data-vbg="https://vimeo.com/137250145" data-vbg-loop="false" data-vbg-autoplay="false" data-vbg-load-background="true" style="display: none"></div>
  <div data-vbg="https://media.w3.org/2010/05/bunny/trailer.mp4" data-vbg-loop="false" data-vbg-autoplay="false" data-vbg-end-at="20" style="display: none"></div>
</div>
```

A group only toggles `display` between its children, so stacking them is your CSS: the
demo above absolutely positions all three over the same box and hides every one but the
first. `loop="false"` is what makes a member end, and an ended member is what advances
the group, so a looping member would hold the playlist forever.

The video files are the Blender Foundation's [Sintel](https://durian.blender.org/) and
[Big Buck Bunny](https://peach.blender.org/) trailers, CC-BY 3.0, served from
`media.w3.org`.

## Usage

Point an empty element at a video and initialise:

```javascript
import { VideoBackgrounds } from "youtube-background";

new VideoBackgrounds("[data-vbg]");
```

Or from a script tag, where the bundle exposes `window.VideoBackgrounds`:

```html
<script src="youtube-background.min.js"></script>
```

The seek bars, play/mute toggles and group controls used above are optional and live in
a bundle of their own, with an optional stylesheet. Each control is a class over markup
you write, pointed at a background by `data-target`, and each has a `destroy()` that takes
its listeners back:

```html
<link rel="stylesheet" href="youtube-background-controls.min.css">
<script src="youtube-background-controls.min.js"></script>
```

## Options

Every option is settable as a `data-vbg-*` attribute on the element, or as a key in
the object passed to the constructor. Attributes win.

| Option | Default | What it does |
| --- | --- | --- |
| `autoplay` | `true` | Start as soon as the element is in view |
| `muted` | `true` | Start muted — required for autoplay to be allowed |
| `loop` | `true` | Restart when the video ends |
| `mobile` | `true` | Create the background on mobile too |
| `always-play` | `false` | Keep playing while off-screen |
| `start-at` | `0` | Seconds to start from |
| `end-at` | `0` | Seconds to stop at, `0` for the full duration |
| `volume` | `1` | `0`–`1`, applied on first unmute |
| `play-button` | `false` | Render the plugin's play/pause toggle |
| `mute-button` | `false` | Render the plugin's mute toggle |
| `poster` | `null` | Image shown until the first frame plays |
| `load-background` | `false` | Use the platform's own thumbnail as the poster |
| `resolution` | `'16:9'` | Aspect ratio used to cover the container |
| `fit-box` | `false` | Stretch to the container instead of covering it |
| `inline-styles` | `true` | Let the plugin write the positioning styles |
| `no-cookie` | `true` | Use the privacy-preserving embed domains |
| `lazyloading` | `false` | Add `loading="lazy"` to the iframe — YouTube and Vimeo only |
| `title` | `'Video background'` | Accessible name for the player frame |

## Limits

Since **May 2026** ([#77](https://github.com/stamat/youtube-background/issues/77)),
YouTube's player flashes its own round play/pause icon in the middle of the frame on every
playback toggle — `.ytp-bezel`, drawn inside the iframe, which the embed's `controls=0`
does not cover. The frame is cross-origin, so neither your CSS nor your script reaches it,
and the plugin's own play and mute buttons set it off like any other toggle. There is no
option that turns it off, here or upstream.

**Cosmetic filtering** hides it — an element-hiding rule in Adblock Plus / uBlock Origin
syntax, where `##` means *hide this selector on these domains*:

```text
www.youtube-nocookie.com,www.youtube.com##.html5-video-player .ytp-bezel
```

Both domains, because `no-cookie` defaults to `true` and puts the player on
`www.youtube-nocookie.com`.

> [!WARNING]
> That fixes the browser it is typed into and nothing further. A content blocker is an
> extension, and injecting a stylesheet into a cross-origin frame is a permission
> extensions have and pages do not — your CSS never enters the frame,
> `iframe.contentDocument` throws. So it is a development comfort on `localhost`, and every
> visitor without that filter still sees the bezel.

## Events

Every instance dispatches on its own element and bubbles:

`video-background-ready`, `video-background-play`, `video-background-pause`,
`video-background-ended`, `video-background-seeked`, `video-background-time-update`,
`video-background-state-change`, `video-background-mute`, `video-background-unmute`,
`video-background-volume-change`, `video-background-resize`,
`video-background-destroyed`.

```javascript
document.querySelector("#hero").addEventListener("video-background-ready", (event) => {
  console.log(event.detail.type, event.detail.currentState);
});
```

A group dispatches on the group element, with the group in `event.detail`:

`video-background-group-play`, `video-background-group-pause`,
`video-background-group-mute`, `video-background-group-unmute`,
`video-background-group-next`, `video-background-group-previous`,
`video-background-group-forward-rewind`, `video-background-group-backward-rewind`.

The last two fire when stepping past either end of the stack wraps around. Up to
and including 1.2.0 they never fired, and the unmute event was dispatched under
the misspelling `video-background-group-umnute`.

## API

```javascript
const backgrounds = new VideoBackgrounds("[data-vbg]");

const instance = backgrounds.get(document.querySelector("#hero"));
instance.play();
instance.pause();
instance.mute();
instance.unmute();
instance.setVolume(0.4);
instance.seek(50);          // percent
instance.seekTo(12);        // seconds
instance.setSource("https://vimeo.com/137250145");

backgrounds.pauseAll();
backgrounds.playAll();
backgrounds.add(element);
backgrounds.destroy(element);
backgrounds.destroyAll();
```

<script src="https://kit.fontawesome.com/228006f19a.js" crossorigin="anonymous"></script>
<script src="{{ relativePathPrefix }}youtube-background.min.js"></script>
<script src="{{ relativePathPrefix }}youtube-background-controls.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    window.VIDEO_BACKGROUNDS = new VideoBackgrounds('[data-vbg]');

    document.querySelectorAll('.js-seek-bar-wrap').forEach((el) => new SeekBar(el));
    document.querySelectorAll('.js-demo-play-toggle').forEach((el) => new PlayToggle(el));
    document.querySelectorAll('.js-demo-mute-toggle').forEach((el) => new MuteToggle(el));

    const marqueeInstance = (button) => {
      const element = button.closest('.example-marquee').querySelector('[data-vbg]');
      return element && window.VIDEO_BACKGROUNDS.get(element);
    };

    document.querySelectorAll('.js-demo-src').forEach((button) => {
      button.addEventListener('click', () => {
        const instance = marqueeInstance(button);
        if (instance) instance.setSource(button.getAttribute('data-src'));
      });
    });

    document.querySelectorAll('.js-demo-destroy').forEach((button) => {
      button.addEventListener('click', () => {
        const element = document.querySelector(button.getAttribute('data-selector'));
        if (element) window.VIDEO_BACKGROUNDS.destroy(element);
      });
    });

    document.querySelectorAll('.js-demo-init').forEach((button) => {
      button.addEventListener('click', () => {
        const element = document.querySelector(button.getAttribute('data-selector'));
        if (!element) return;
        if (element.getAttribute('data-vbg-uid')) window.VIDEO_BACKGROUNDS.destroy(element);
        element.setAttribute('data-vbg', button.getAttribute('data-src'));
        window.VIDEO_BACKGROUNDS.add(element);
      });
    });

    const groups = new VideoBackgroundGroups('.js-vbg-group');

    for (const id in groups.instances) {
      const group = groups.instances[id];
      const actions = {
        '.js-group-prev': () => group.prev(),
        '.js-group-next': () => group.next(),
        '.js-group-play': () => group.play(),
        '.js-group-pause': () => group.pause(),
        '.js-group-mute': () => group.mute(),
        '.js-group-unmute': () => group.unmute()
      };

      for (const selector in actions) {
        const button = group.element.querySelector(selector);
        if (button) button.addEventListener('click', actions[selector]);
      }
    }
  });
</script>
