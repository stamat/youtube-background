# 📺 youtube-background

[![npm version](https://img.shields.io/npm/v/youtube-background)](https://www.npmjs.com/package/youtube-background)
[![CI](https://img.shields.io/github/actions/workflow/status/stamat/youtube-background/ci.yml?branch=master&label=CI)](https://github.com/stamat/youtube-background/actions/workflows/ci.yml)
[![gzip size](https://img.badgesize.io/stamat/youtube-background/master/jquery.youtube-background.min.js?compression=gzip&label=gzip%20size)](https://github.com/stamat/youtube-background/blob/master/jquery.youtube-background.js)

> Create video backgrounds from a YouTube, Vimeo or video file links.

> [!IMPORTANT]
> This package stays at **1.x**. Its successor is
> [stamat/video-background](https://github.com/stamat/video-background) —
> `<video-background src="…">`, the same providers as a custom element, no factory, no
> jQuery, and a map from every `[data-vbg]` option in its README. Support here continues;
> new features, if any, will go there.

[DEMO HERE ➡️](http://stamat.github.io/youtube-background/)

This project started as a simple 100 liner jQuery plugin for YouTube video backgrounds. The idea behind it was to have a straightforward minimal way to add a YouTube video as a background for a div, or any other HTML element. It was intended to be used on hero and banner elements mostly. You would add a data attribute `data-vbg` to the element, and the script would take care of the rest, no CSS required.

```html
<div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

<script type="text/javascript">
  const videoBackgrounds = new VideoBackgrounds("[data-vbg]");
</script>
```

Since it's creation it has evolved to support Vimeo and video files as well. Numerous features were added out of necessity on other projects or by community requests.

After numerous iterations it is now a fully fledged ES module, also available as a standalone script. The jQuery plugin is still here, deprecated.

## Features

- **No CSS required** - the script takes care of everything
- **YouTube**, **Vimeo** and **video files** support
- **ESM** module or standalone global — plus a **jQuery** plugin, deprecated
- **Lazyloading** - lazyload the iframe/video
- YouTube and Vimeo **cookies** are disabled by default
- YouTube and Vimeo player API scrips are loaded only when needed
- Optional **controls** — a seek bar, play and mute toggles, and a group that plays backgrounds in sequence — in a second bundle

## Installation

### As a ESM module

To install the package from NPM run:

```
npm install youtube-background
```

Then import the class just like from any other ESM module (if your bundler supports resolving `node_modules`, your import will look like this, otherwise you'll have to provide the full path to the script):

```javascript
import { VideoBackgrounds } from "youtube-background";
```

The jQuery plugin is not reachable this way and never was — it lives in the bundle,
and is deprecated.

### Over CDN

```
<script type="text/javascript" src="https://unpkg.com/youtube-background/jquery.youtube-background.js"></script>
```

or minified:

```
<script type="text/javascript" src="https://unpkg.com/youtube-background/jquery.youtube-background.min.js"></script>
```

## Usage

Initialize the factory class yourself. There is also a jQuery plugin, deprecated as of 1.2.0.

### Vanilla Way

Construct the factory class with a selector: `new VideoBackgrounds('[data-vbg]');`. jQuery has not been a dependency since 1.0.6.

```html
<div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>
```

```javascript
import { VideoBackgrounds } from "youtube-background";

const videoBackgrounds = new VideoBackgrounds("[data-vbg]");
```

`import` resolves to the ES module source and gives you the class. `require` and the
CDN get the prebuilt IIFE bundle instead, which has no exports — loading it is a side
effect that registers `window.VideoBackgrounds`, and the deprecated jQuery plugin if
jQuery is on the page.

`VideoBackgrounds` is a factory class - this means that it is used to create and index multiple instances of the video backgrounds depending on the link type: YouTube, Vimeo or video file. It accepts a selector as a parameter and properties object that will be applied to all of the instances queried by the selector. For the list of available properties, please refer to the [Properties](#properties) section.

In order to programmatically add a new element to the factory instance and initialize the video background, for instance on an async event. You can use the `add` function of the factory instance, which accepts the element object and the optional properties object. For the list of available properties, please refer to the [Properties](#properties) section.

```javascript
// get the first element
const firstElement = document.querySelector("[data-vbg]");

// add the element to the factory instance
videoBackgrounds.add(firstElement);
```

In order to automatically initialize video backgrounds on all elements that match the selector as they appear in the DOM, you will have to implement MutationObserver manually.

The factory instance also indexes all of the individual video background instances by generated UID in it's property `index`, so you can access them later on if you need to.

UID is assigned to all target elements as a `data-vbg-uid` attribute when the video background is initialized. You can get the instance of the element by using a `get` function of the factory instance, which accepts the UID string or element object with UID attribute.

```javascript
// get the first element
const firstElement = document.querySelector("[data-vbg]");

// get the first instance instance by UID
const firstInstance = videoBackgrounds.get(firstElement);
```

You can programmatically control the video playing in the background regardless of the provider and access all of it's properties via the instance object.

```javascript
// 'notstarted', 'ended', 'playing', 'paused' or 'buffering'
console.log(firstInstance.currentState);

// true if the video was paused through pause(), unaffected by scrolling out of view
console.log(firstInstance.paused);

// true if video is muted, false if video is not muted
console.log(firstInstance.muted);

// true if the video is intersecting the viewport, false if the video is not intersecting the viewport.
console.log(firstInstance.isIntersecting);

// current state of the video
console.log(firstInstance.currentState);

// current time of the video in seconds
console.log(firstInstance.currentTime);

// percentage of the video that has been played
console.log(firstInstance.percentComplete);

// the element that the video background is attached to. `firstElement` from the above example
console.log(firstInstance.element);

// the element of the video player, meaning either an iframe in case of YouTube and Vimeo, or a video element
console.log(firstInstance.playerElement);

// the video player object, meaning either a YouTube or Vimeo player object, or a video element in case of HTML5 video
console.log(firstInstance.player);

// the type of the video, can be `youtube`, `vimeo` or `video`
console.log(firstInstance.type);

// volume of the video from 0 to 1
console.log(firstInstance.volume);

// play the video
firstInstance.play();

// pause the video
firstInstance.pause();

// mute the video
firstInstance.mute();

// unmute the video
firstInstance.unmute();

// set the video source
firstInstance.setSource("https://www.youtube.com/watch?v=eEpEeyqGlxA");

// set the video volume
firstInstance.setVolume(0.5);

// volume of the video from 0 to 1, or in case of Vimeo a promise that resolves to the volume value
firstInstance.getVolume();

// seek the video to a specific percentage complete
firstInstance.seek(25);

// seek the video to a specific time in seconds
firstInstance.seekTo(1.25);

// set Start At seconds
firstInstance.setStartAt(10);

// set End At in seconds
firstInstance.setEndAt(20);
```

If you wish to tune to the videos events, you can add listeners to the element that you've initialized the video background on. In `event.detail` you will get the instance object of the video background. Do refer to the [Events](#events) section for the list of all events.

```javascript
firstElement.addEventListener("video-background-ready", function (event) {
  console.log("video-background-ready"); // the video instance object
  console.log(event.detail); // the video instance object
});
```

In order to destroy the video background instance and revert the element to it's pre-initialization state, you can use the `destroy` function of the factory instance.

```javascript
// destroy the video background by providing the element
videoBackgrounds.destroy(firstElement);

// or by providing the instance videoBackground.destroy(firstInstance);
```

To destroy all the instances in the index you can use `destroyAll` function of the factory instance. That empties the index but leaves the factory itself listening — if you are tearing the factory down for good, call `disconnect` instead, which also disconnects the observers and removes the `visibilitychange` and `resize` listeners.

```javascript
videoBackgrounds.disconnect();
```

Factory instance also implements the `IntersectionObserver` out of the box to keep track of the visible video backgrounds in order to toggle their play/pause state and preserve the bandwidth and improve the performance. Scrolling into view only starts a video that would start anyway — `autoplay` off, a pause you asked for, or a video that ended with `loop` off all stay put. You can find the instance of the `IntersectionObserver` in the `intersectionObserver` property of the factory instance.

For the resize events, the factory instance implements the `ResizeObserver` out of the box. You can find the instance of the `ResizeObserver` in the `resizeObserver` property of the factory instance. If the `resizeObserver` is not supported, the factory instance will fallback to the `window` resize event.

### jQuery Way

> [!WARNING]
> Deprecated as of 1.2.0. Calling the plugin warns once in the console. Everything below
> has a one-line vanilla equivalent — `new VideoBackgrounds('[data-vbg]')` — so porting is
> replacing the call, not rewriting the page.

The plugin ships only in the IIFE bundle, and only registers itself if jQuery is already on the page: `jQuery('[data-vbg]').youtube_background();`.

```html
<div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>
```

```javascript
jQuery(document).ready(function () {
  jQuery("[data-vbg]").youtube_background();
});
```

This function does exactly the same thing as if you would initialize the ES6 factory class. It will pass the selected elements and initialize the factory class in the global variable `VIDEO_BACKGROUNDS`. So everything that applies for the factory instance in the ES6 guide applies to this instance.

```javascript
// get the first element
const firstElement = $("[data-vbg]")[0];

// get the first instance instance by UID
const firstInstance = VIDEO_BACKGROUNDS.get(firstElement);
```

The plugin method accepts properties object as a parameter. For the list of available properties, please refer to the next [Properties](#properties) section.

```javascript
jQuery(document).ready(function () {
  jQuery("[data-vbg]").youtube_background({
    "play-button": true,
  });
});
```

## Properties

| Property                 | Default            | Accepts | Description                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **play-button**          | false              | boolean | Adds the plugin's own play/pause button, named for the action it will take                                                                                                                                                                                                                                                                                                                |
| **mute-button**          | false              | boolean | Adds the plugin's own mute button, named for the action it will take                                                                                                                                                                                                                                                                                                                      |
| **autoplay**             | true               | boolean | Autoplay loaded video                                                                                                                                                                                                                                                                                                                                                                     |
| **muted**                | true               | boolean | Load video muted                                                                                                                                                                                                                                                                                                                                                                          |
| **loop**                 | true               | boolean | Loop loaded video                                                                                                                                                                                                                                                                                                                                                                         |
| **mobile**               | true               | boolean | Keep the youtube embed on mobile                                                                                                                                                                                                                                                                                                                                                          |
| **fit-box**              | false              | boolean | Set iframe to fit the container, meaning `width: 100%; height: 100%`                                                                                                                                                                                                                                                                                                                      |
| **inline-styles**        | true               | boolean | Enable/disable inline styles from the iframe and wrapper. The default wrapper styles are: `background-size: cover;`, `background-repeat: no-repeat;` and `background-position: center;`; the default iframe styles are `top: 50%;`, `left: 50%;`, `transform: translateX(-50%) translateY(-50%);`, `position: absolute;`, and `opacity: 0;`                                               |
| **load-background**      | false              | boolean | Fetch background from youtube or vimeo **THIS DEFAULTS TO FALSE** since v1.0.18. It is recommended that you provide and host your own background photo preferably as an image element with `srcset` and `loading="lazy"` for performance reasons. Works only with **YouTube** and **Vimeo**.                                                                                              |
| **poster**               | null               | string  | Provide your own background                                                                                                                                                                                                                                                                                                                                                               |
| **offset**               | 100                | int     | showinfo:0 id deprecated since September 25, 2018. - this setting makes the video a bit larger than it's viewport to hide the info elements. This setting defaults to 100 only for **YouTube** videos.                                                                                                                                                                                    |
| **resolution**           | 16:9               | string  | declare video resolution (work in progress)                                                                                                                                                                                                                                                                                                                                               |
| **pause**                | false              | boolean | Adds a toggle pause button (deprecated)                                                                                                                                                                                                                                                                                                                                                   |
| **start-at**             | 0                  | int     | Video starts playing at desired time in seconds                                                                                                                                                                                                                                                                                                                                           |
| **end-at**               | 0                  | int     | Video ends playing at desired time in seconds. 0 means it will play to the end.                                                                                                                                                                                                                                                                                                           |
| **always-play**          | false              | boolean | Video will stop playing unless always-play is set to true.                                                                                                                                                                                                                                                                                                                                |
| **volume**               | 1                  | float   | From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Sets initial volume. Setting volume doesn't work on mobile, so this setting won't have an effect on mobile.                                                                                                                                                                                                                |
| **no-cookie**            | true               | boolean | Disable cookies. This will prevent **YouTube** and **Vimeo** from storing information and tracking you across the web. It is set to true by default.                                                                                                                                                                                                                                      |
| **force-on-low-battery** | false              | boolean | When mobile device is on battery saver mode, the videos will not autoplay. This setting will force autoplay on battery saver mode on user first interaction. This setting is set to false by default. Be mindful of your users and their data plans, and their battery life.                                                                                                              |
| **lazyloading**          | false              | boolean | Lazyload the YouTube/Vimeo iframe. No effect on video files — `loading` is not a valid attribute on `<video>`. This setting is set to false by default. Keep in mind that the script tracks the intersecting videos and pauses them when they are not visible for the reasons of improving the performance. Use lazyloading to minimize the data usage and improve performance even more. |
| **title**                | 'Video background' | string  | Title of the video for accessibility purposes. This setting is set to 'Video background' by default. Though if used as a background `aria-hidden="true"` attribute should be used on it's parent element. Setting this to false or null will remove the title attribute.                                                                                                                  |

Noted properties can be added as html attributes as:

- **data-vbg-play-button**
- **data-vbg-mute-button**
- **data-vbg-autoplay**
- **data-vbg-muted**
- **data-vbg-loop**
- **data-vbg-mobile**
- **data-vbg-offset**
- **data-vbg-resolution**
- **data-vbg-fit-box**
- **data-vbg-load-background**
- **data-vbg-poster**
- **data-vbg-inline-styles**
- **data-vbg-start-at**
- **data-vbg-end-at**
- **data-vbg-always-play**
- **data-vbg-volume**
- **data-vbg-no-cookie**
- **data-vbg-force-on-low-battery**
- **data-vbg-lazyloading**
- **data-vbg-title**

Every one of them is also accepted under the legacy `data-ytbg-` prefix, kept from the days when this only did YouTube. `data-vbg-` wins where both are present.

The source URL itself lives on `data-vbg`, and is also read from the legacy `data-youtube` and `data-ytbg`, in that order of precedence. `setSource()` writes the new URL back to whichever of the three the element already carries — it never adds one that was not there.

> [!NOTE]
> Attribute properties will override the properties passed on initialization. Always.

#### Example - Properties as HTML attributes

```html
<div
  data-vbg-play-button="true"
  data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"
></div>

<script type="text/javascript">
  const videoBackgrounds = new VideoBackgrounds("[data-vbg]");
</script>
```

#### Example - Properties as JSON

```html
<div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

<script type="text/javascript">
  const videoBackgrounds = new VideoBackgrounds("[data-vbg]", {
    "play-button": true,
  });
</script>
```

## Events

- **video-background-ready** - when the video is ready to play, this event is triggered. HTML5 videos are ready to play immediately.
- **video-background-time-update** - whenever the time of the video changes while video is playing, this event is triggered. The current time is available from the instance variable `event.detail.currentTime`. On Vimeo and YouTube this event is fired in 250ms intervals.
- **video-background-state-change** - video changes state. The state is available from the instance variable `event.detail.currentState`. It can be: `notstarted`, `ended`, `playing`, `paused`, `buffering`.
- **video-background-play** - video starts playing
- **video-background-pause** - video is paused
- **video-background-ended** - video ended event. Keep in mind that if loop is set to true the video will start playing from the start after this event.
- **video-background-seeked** - the video was seeked, either through `seek` / `seekTo` or by a seek bar.
- **video-background-mute** - video sound is muted
- **video-background-unmute** - video sound is unmuted
- **video-background-volume-change** - video volume is changed. The volume is available from the instance variable `event.detail.volume`.
- **video-background-resize** - when the video background is resized, this event is fired.
- **video-background-destroyed** - when the video background is destroyed using the `destroy` function of the instance and reverted to pre-initialization state, this event is fired.

### Group events

`VideoBackgroundGroup` from `youtube-background-experimental.js` dispatches on the group element, with the group instance in `event.detail`:

- **video-background-group-play** / **video-background-group-pause** - the whole group was started or stopped
- **video-background-group-mute** / **video-background-group-unmute** - the whole group was muted or unmuted
- **video-background-group-next** / **video-background-group-previous** - the group stepped to another video
- **video-background-group-forward-rewind** - `next()` ran past the last video and wrapped to the first
- **video-background-group-backward-rewind** - `prev()` ran past the first video and wrapped to the last

> [!IMPORTANT]
> Up to and including 1.1.8 the unmute event was dispatched under the misspelling
> `video-background-group-umnute`, and the two rewind events never fired at all. Listeners
> bound to the misspelling need updating.

Events bubble. If you go vanilla, you can get the video object via `event.detail` or `event.originalEvent.detail` in case of jQuery implementation.

You can add listeners to the events onto the element that you've initialized the video background on. If the ID of that element is `#video-background`, you can add listeners like this:

```javascript
document
  .querySelector("#video-background")
  .addEventListener("video-background-ready", function (event) {
    console.log("video-background-ready"); // the video instance object
    console.log(event.detail); // the video instance object
  });
```

or with jQuery:

```javascript
jQuery("#video-background").on("video-background-ready", function (event) {
  console.log("video-background-ready"); // the video instance object
  console.log(event.originalEvent.detail); // the video instance object
});
```

## Instance Methods

| Method         | Accepts | Description                                                                                                                                                                                   |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **play**       | -       | Play the video                                                                                                                                                                                |
| **pause**      | -       | Pause the video                                                                                                                                                                               |
| **mute**       | -       | Mute the video                                                                                                                                                                                |
| **unmute**     | -       | Unmute the video                                                                                                                                                                              |
| **setSource**  | string  | Set the video source, must be a link of the same type as the original video. Meaning, for example, if the original video was a YouTube video, the new source must be a YouTube video as well. |
| **setVolume**  | float   | Set the video volume. From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Setting volume doesn't work on mobile, so this setting won't have an effect on mobile.                   |
| **getVolume**  | -       | Get the video volume. From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Vimeo instance will return a promise that resolves to the volume value.                                  |
| **seek**       | int     | Seek the video to a specific percentage complete. From 0 to 100. 0 is the start of the video, 100 is the end of the video.                                                                    |
| **seekTo**     | int     | Seek the video to a specific time in seconds. From 0 to the duration of the video in seconds.                                                                                                 |
| **setStartAt** | int     | Set Start At seconds. From 0 to the duration of the video in seconds.                                                                                                                         |
| **setEndAt**   | int     | Set End At seconds. From 0 to the duration of the video in seconds.                                                                                                                           |
| **softPlay**   | -       | Play without clearing the `paused` flag. This is what the IntersectionObserver uses, so a video the visitor paused stays paused.                                                              |
| **softPause**  | -       | Pause without setting the `paused` flag.                                                                                                                                                      |
| **destroy**    | -       | Destroy this instance and revert its element to the pre-initialization state. Usually called through the factory's `destroy`.                                                                 |

## Instance variables

- **paused** - boolean, true if the video was paused through `pause`. Hard paused state, unaffected by the video being paused via IntersectionObserver or a hidden tab.
- **muted** - boolean, true if the video is muted, false if the video is not muted.
- **isIntersecting** - boolean, true if the video is intersecting the viewport, false if the video is not intersecting the viewport.
- **currentState** - the current state of the video. It can be: `notstarted`, `ended`, `playing`, `paused`, `buffering`.
- **currentTime** - the current time of the video in seconds
- **percentComplete** - the percentage of the video that has been played
- **element** - the element that the video background is attached to
- **playerElement** - the element of the video player, meaning either an iframe in case of YouTube and Vimeo, or a video element
- **player** - the video player object, meaning either a YouTube or Vimeo player object, or a video element in case of HTML5 video
- **type** - the type of the video, can be `youtube`, `vimeo` or `video`
- **volume** - volume of the video from 0 to 1

## Factory Instance Methods

| Method           | Accepts             | Description                                                                                                                                                                                                                                                |
| ---------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **add**          | element, parameters | Add an element to the factory instance, it will initialize the video background on that element. Parameters are optional.                                                                                                                                  |
| **get**          | element or UID      | Get the instance of the video background by UID or element. Returns the instance object.                                                                                                                                                                   |
| **destroy**      | element or instance | Destroy the video background instance and revert the element to it's pre-initialization state. Accepts either the element or the instance object.                                                                                                          |
| **destroyAll**   | -                   | Destroy all the instances in the index.                                                                                                                                                                                                                    |
| **disconnect**   | -                   | Full teardown: destroys every instance, disconnects both observers and removes the global listeners the factory registered. Use it when the factory itself is going away, otherwise it keeps listening to `visibilitychange` for the lifetime of the page. |
| **pauseAll**     | -                   | Pause all the instances in the index.                                                                                                                                                                                                                      |
| **playAll**      | -                   | Play all the instances in the index.                                                                                                                                                                                                                       |
| **muteAll**      | -                   | Mute all the instances in the index.                                                                                                                                                                                                                       |
| **unmuteAll**    | -                   | Unmute all the instances in the index.                                                                                                                                                                                                                     |
| **setVolumeAll** | float               | Set the volume of all the instances in the index. From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Setting volume doesn't work on mobile, so this setting won't have an effect on mobile.                                                    |

## Factory Instance Variables

- **index** - the index of all the instances of the video backgrounds. It is an object with keys being the UID of the element and values being the instance object.
- **intersectionObserver** - the instance of the `IntersectionObserver` that is used to track the intersecting video backgrounds.
- **resizeObserver** - the instance of the `ResizeObserver` that is used to track the resize events of the video backgrounds. If the `ResizeObserver` is not supported, the factory instance will fallback to the `window` resize event.

## Controls

Optional, and in a bundle of their own so the main script does not carry them:

```
<script src="https://unpkg.com/youtube-background/youtube-background-experimental.min.js"></script>
```

Each control is a class that takes an element carrying `data-target`, a selector for the
video background element, and tunes onto that element's events. You write the markup and
style it; the control only wires it.

```html
<div data-target="#hero" class="js-seek-bar-wrap">
  <progress
    class="js-seek-bar-progress"
    value="0"
    max="100"
    aria-hidden="true"
  ></progress>
  <input
    class="js-seek-bar"
    type="range"
    value="0"
    min="0"
    max="100"
    step="any"
    aria-label="Seek"
  />
</div>
<button data-target="#hero" class="js-play-toggle" aria-label="Play">⏯</button>
<button data-target="#hero" class="js-mute-toggle" aria-label="Mute">🔇</button>
```

```javascript
const seekBar = new SeekBar(document.querySelector(".js-seek-bar-wrap"));
const playToggle = new PlayToggle(document.querySelector(".js-play-toggle"));
const muteToggle = new MuteToggle(document.querySelector(".js-mute-toggle"));
```

| Class          | Markup it expects                                                                                                                                              | What it does                                                                                                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SeekBar**    | A wrapper with an `<input type="range">` from 0 to 100 marked `.js-seek-bar`, and optionally a `<progress>` marked `.js-seek-bar-progress` for the played fill | Moves on an animation frame while the video plays — providers report time about four times a second, which is visibly steppy — seeks on `change`, marks the wrapper `data-target-uid` once bound, and names the input `Seek` if you gave it no name |
| **PlayToggle** | A `<button>`                                                                                                                                                   | Writes `aria-pressed`, `true` while playing or buffering, and `type="button"` if you gave it none; a click plays or pauses                                                                                                                          |
| **MuteToggle** | A `<button>`                                                                                                                                                   | Writes `aria-pressed`, `true` while muted, and `type="button"` if you gave it none; a click mutes or unmutes                                                                                                                                        |

The toggles are [toggle buttons](https://www.w3.org/WAI/ARIA/apg/patterns/button/): the name
you give one never changes, and `aria-pressed` is the state. Pressed means what the name says
is in effect — name them `Play` and `Mute`, and a screen reader says "Play, toggle button,
pressed" while the video plays. Do not name one `Pause` or swap the name yourself; with
`aria-pressed` that says the state twice.

Each takes the instance as an optional second argument — `new SeekBar(element, instance)` —
in which case `data-target` can be left off and the instance's element is the target.

**Every control has a `destroy()`** that removes the listeners it attached. A control is held
alive by the element it points at for as long as that element lives, so a page that
re-renders its controls — a framework, a live editor — calls `destroy()` on the old ones
before making new ones, or every seek bar ever made keeps updating on each tick.

`VideoBackgroundGroup` plays the backgrounds inside one element in sequence, one visible at
a time, stepping on `video-background-ended`:

```javascript
const group = new VideoBackgroundGroup(
  "#stack",
  "[data-vbg]",
  videoBackgrounds,
);
group.next();
group.prev();
group.play();
group.pause();
group.mute();
group.unmute();
group.destroy();
```

`VideoBackgroundGroups('.js-vbg-group', '[data-vbg]', videoBackgrounds)` makes one for every
match and has `add`, `get`, `destroy` and `destroyAll`. The events a group dispatches are
under [Group events](#group-events).

## Known limits

**YouTube's play/pause bezel cannot be removed.** Every playback toggle flashes YouTube's
own big round icon in the middle of the frame — `.ytp-bezel`, drawn by the player inside the
iframe. It started showing on embeds in **May 2026**:
[#77](https://github.com/stamat/youtube-background/issues/77) is the first report here, on
the 5th, a second one followed on the 27th, and nothing on YouTube's side announces it — the
player parameter revision history has had no entry since August 2023. The embed already goes
out with `controls=0`, which takes away the control bar and not that. The iframe is
cross-origin: no stylesheet of yours selects into it, and script that reaches for its
document throws. This applies to the plugin's own `play-button` and `mute-button` toggles as
much as to a click on the background.

The one thing that does remove it is **cosmetic filtering** — an element-hiding rule in
Adblock Plus / uBlock Origin filter syntax, where `##` means _hide what this selector
matches on these domains_:

```text
www.youtube-nocookie.com,www.youtube.com##.html5-video-player .ytp-bezel
```

Both domains are listed because `no-cookie` defaults to `true`, which puts the player on
`www.youtube-nocookie.com`; turn it off and the frame is `www.youtube.com`.

> [!WARNING]
> **It fixes your browser, not your site.** The rule works because a content blocker is an
> extension with host permissions: it injects its stylesheet into every frame it is
> granted, whatever the origin. A page has no such permission. Your CSS stops at the iframe
> boundary and your script gets a `SecurityError` off `iframe.contentDocument`, so there is
> no way to ship that rule from the server, put it in your bundle, or hand it to the frame
> — and a visitor without the filter installed sees the bezel exactly as before. Paste it
> into your own blocker while developing against `localhost` if it bothers you; treat the
> bezel as part of the embed for everyone else.

## Browser Support

The bundles are built for **ES2019**, so that is the floor, desktop and mobile alike:

- Chrome 66+
- Firefox 58+
- Safari 11.1+
- Opera 53+
- Edge 79+

Recommended, for `ResizeObserver` and full `IntersectionObserver` support — without them the script still works, falling back to the `window` resize event and to always-play:

- Chrome 64+
- Firefox 69+
- Safari 13.1+
- Opera 51+
- Edge 79+

Tested with [BrowserStack](https://www.browserstack.com).

## Development

Development setup uses **POOPS bundler** to bundle ES modules into IIFE `jquery.youtube-background.js` and `jquery.youtube-background.min.js`

[POOPS](https://github.com/stamat/poops) is a simple bundler + static site builder that I've created, do give it a try and let me know what you think.

To install the required package for running **POOPS**, run:

```
npm install
```

To run the server on `http://localhost:4040`, run:

```
npm run dev
```

Code will automatically be packaged into IIFE and minified while you develop, and the served page will automatically reload on changes.

To just build the code, without running the local server, run:

```
npm run build
```

The build produces the two bundles at the repo root and the demo page in `_site/`, which is what gets deployed to GitHub Pages.

To run the tests ([jest](https://jestjs.io), in `src/__tests__`):

```
npm test
```

To lint ([ESLint](https://eslint.org), flat config in `eslint.config.mjs`):

```
npm run lint
```

Both run in CI on every push and pull request, along with a check that the checked-in build output is not stale.

A user-visible change goes in [CHANGELOG.md](CHANGELOG.md) under `## [Unreleased]` — that file explains the format, and how `script/publish` cuts the entry into a release.

### Code

Sources are ES modules with the `.mjs` extension — the package itself stays CommonJS so the published IIFE bundles remain `require()`-able.

- **main.mjs** - entry point of the IIFE bundle. Registers `window.VideoBackgrounds` and, when jQuery is on the page, the deprecated plugin.
- **video-backgrounds.mjs** - the main entry point of the ES6 module. It contains the factory class `VideoBackgrounds` that is used to create and index multiple instances of the video backgrounds depending on the link type: YouTube, Vimeo or video file.
- **experimental.mjs** - entry point of the second bundle, exposing the control classes below as globals.
- **lib/super-video-background.mjs** - It contains the super class `SuperVideoBackground` with all of the common methods and properties for all of the video background types. This class is inherited by the `YouTubeBackground`, `VimeoBackground` and `VideoBackground` classes.
- **lib/youtube-background.mjs** - It contains the `YouTubeBackground` class that is used to create and control YouTube video backgrounds. Inherits from `SuperVideoBackground`.
- **lib/vimeo-background.mjs** - It contains the `VimeoBackground` class that is used to create and control Vimeo video backgrounds. Inherits from `SuperVideoBackground`.
- **lib/video-background.mjs** - It contains the `VideoBackground` class that is used to create and control HTML5 video backgrounds. Inherits from `SuperVideoBackground`. It also owns `MIME_MAP`, whose keys are kept in step with book-of-spells' `RE_VIDEO` — the pattern detection runs through — by a test, so the containers the script claims to support and the ones it detects cannot drift apart.
- **lib/buttons.mjs** - It contains the play and pause automatic buttons and their functionality that are added to the video backgrounds. I seriously don't know why I created this in the first place.
- **lib/controls.mjs** - Module containing externalized control classes `SeekBar`, `PlayToggle`, `MuteToggle`, `VideoBackgroundGroup` and `VideoBackgroundGroups` which tune onto the video events and use the common API, they are not bundled with the main script, but are available through `youtube-background-experimental.js`.

The demo page is generated, not hand-written: `site/index.md` and `src/styles/prose.scss` are built through [poops-docs-theme](https://github.com/stamat/poops-docs-theme) into `_site/`.

Tu summarize, because YouTube, Vimeo and HTML5 Video API's are different - we need a way to generalize these APIs and provide a common interface for all of them. Due to a lot of common code we have the `SuperVideoBackground` class that is inherited by the `YouTubeBackground`, `VimeoBackground` and `VideoBackground` classes.

And lastly we have the `VideoBackgrounds` factory class that is used to create and index multiple instances of the video backgrounds depending on the link type: YouTube, Vimeo or video file and provide a single IntersectionObserver and ResizeObserver for all of the instances.

THE END.
