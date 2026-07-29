---
layout: poops-docs-theme/prose
---

# 📺 Youtube Background

ESM / jQuery plugin for turning a YouTube, Vimeo or plain video file link into a
cover background — with autoplay, looping, play/mute controls, seek bars and
playlist groups.

```bash
npm install youtube-background
```

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
      <p>Unmute with the plugin's button, or drive it from buttons of your own.</p>
      <button class="js-demo-play-toggle" data-target="#demo-sound">Toggle play</button>
      <button class="js-demo-mute-toggle" data-target="#demo-sound">Toggle mute</button>
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
  <div id="demo-file" data-vbg="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" data-vbg-poster="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg" data-vbg-play-button="true" data-vbg-mute-button="true" data-vbg-start-at="10" data-vbg-end-at="60"></div>
  <div class="content">
    <div class="inner">
      <h2>A plain video file</h2>
      <p>Any <code>.mp4</code>, <code>.webm</code>, <code>.ogg</code>, <code>.avi</code>, <code>.mov</code>, <code>.m4v</code> or <code>.qt</code> URL, played in a native <code>&lt;video&gt;</code>.</p>
      <button class="js-demo-src" data-src="https://download.samplelib.com/mp4/sample-5s.mp4">Change source</button>
    </div>
  </div>
  <div data-target="#demo-file" class="seek-bar-wrapper js-seek-bar-wrap">
    <progress class="seek-bar-progress js-seek-bar-progress" value="0" max="100" aria-hidden="true"></progress>
    <input type="range" value="0" min="0" max="100" step="any" aria-label="Seek" class="seek-bar js-seek-bar">
  </div>
</div>

<div id="demo-group" class="example-marquee js-vbg-group">
  <div id="demo-group-1" data-vbg="https://www.youtube.com/watch?v=LC5rEhxGqT4" data-vbg-loop="false" data-vbg-poster="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"></div>
  <div id="demo-group-2" data-vbg="https://vimeo.com/137250145" data-vbg-loop="false" data-vbg-autoplay="false" data-vbg-poster="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg" style="display: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></div>
  <div id="demo-group-3" data-vbg="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" data-vbg-loop="false" data-vbg-autoplay="false" data-vbg-start-at="10" data-vbg-end-at="60" data-vbg-poster="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg" style="display: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></div>
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

## Usage

Point an empty element at a video and initialise. Without jQuery:

```javascript
import { VideoBackgrounds } from "youtube-background";

new VideoBackgrounds("[data-vbg]");
```

With jQuery:

```javascript
jQuery("[data-vbg]").youtube_background();
```

Or from a script tag, where the plugin exposes `window.VideoBackgrounds` and, once
initialised through jQuery, `window.VIDEO_BACKGROUNDS`:

```html
<script src="jquery.youtube-background.min.js"></script>
```

The seek bars, play/mute toggles and group controls used above live in a separate
experimental bundle:

```html
<script src="youtube-background-experimental.min.js"></script>
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
| `lazyloading` | `false` | Add `loading="lazy"` to the player |
| `title` | `'Video background'` | Accessible name for the player frame |

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

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://kit.fontawesome.com/228006f19a.js" crossorigin="anonymous"></script>
<script src="{{ relativePathPrefix }}jquery.youtube-background.min.js"></script>
<script src="{{ relativePathPrefix }}youtube-background-experimental.min.js"></script>
<script>
  jQuery(function () {
    jQuery('[data-vbg]').youtube_background();

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
