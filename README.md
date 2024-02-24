# 📺 youtube-background
[![npm version](https://img.shields.io/npm/v/youtube-background)](https://www.npmjs.com/package/youtube-background)
[![CSS gzip size](https://img.badgesize.io/stamat/youtube-background/master/jquery.youtube-background.min.js?compression=gzip&label=gzip%20size)](https://github.com/stamat/youtube-background/blob/master/jquery.youtube-background.js)

> Create video backgrounds from a YouTube, Vimeo or video file links.

**⚠️ Future development will be moved to [stamat/video-backgrounds](https://github.com/stamat/video-backgrounds).** Support will still be provided for this repo.

[DEMO HERE ➡️](http://stamat.github.io/youtube-background/)

This project started as a simple 100 liner jQuery plugin for YouTube video backgrounds. The idea behind it was to have a straightforward minimal way to add a YouTube video as a background for a div, or any other HTML element. It was intended to be used on hero and banner elements mostly. You would add a data attribute `data-vbg` to the element, and the script would take care of the rest, no CSS required.

**Vanilla**

```html
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        const videoBackgrounds = new VideoBackgrounds('[data-vbg]');
    </script>
```
**jQuery**
```html
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            jQuery('[data-vbg]').youtube_background();

            const videoBackgrounds = VIDEO_BACKGROUNDS;
        });
    </script>
```

Since it's creation it has evolved to support Vimeo and video files as well. Numerous features were added out of necessity on other projects or by community requests.

After numerous iterations and is now a fully fledged ES module that can be used with or without jQuery. It is also available as a standalone script.

## Features

* **No CSS required** - the script takes care of everything
* **YouTube**, **Vimeo** and **video files** support
* **jQuery** plugin and **ESM** module
* **Lazyloading** - lazyload the iframe/video
* YouTube and Vimeo **cookies** are disabled by default
* YouTube and Vimeo player API scrips are loaded only when needed

## Installation

### As a ESM module

To install the package from NPM run:
```
npm install youtube-background
```

Then import the script just like any other ESM module (if your bundler supports resolving `node_modules`, your import will look like this, otherwise you'll have to provide the full path to the script):

```
import 'youtube-background';
```

If you are using a bundler and you wish to use this script as a jQuery plugin, don't forget to import jQuery too.

### Over CDN

```
<script type="text/javascript" src="https://unpkg.com/youtube-background/jquery.youtube-background.js"></script>
```
or minified:
```
<script type="text/javascript" src="https://unpkg.com/youtube-background/jquery.youtube-background.min.js"></script>
```

## Usage

There are two ways to use this script: vanilla implementation or as a jQuery plugin.

### Vanilla Way
 **As of version 1.0.6 jQuery is no longer a dependency**, but purely optional. To initialize video backgrounds without jQuery use the global class: `new VideoBackgrounds('[data-vbg]');`.

 ```html
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>
```

```javascript
    import VideoBackgrounds from 'youtube-background'; // or if you are loading it from CDN as a standalone script, you can use the global variable `VideoBackgrounds`

    const videoBackgrounds = new VideoBackgrounds('[data-vbg]');
```

`VideoBackgrounds` is a factory class - this means that it is used to create and index multiple instances of the video backgrounds depending on the link type: YouTube, Vimeo or video file. It accepts a selector as a parameter and properties object that will be applied to all of the instances queried by the selector. For the list of available properties, please refer to the [Properties](#properties) section.

In order to programmatically add a new element to the factory instance and initialize the video background, for instance on an async event. You can use the `add` function of the factory instance, which accepts the element object and the optional properties object. For the list of available properties, please refer to the [Properties](#properties) section.

```javascript
    // get the first element
    const firstElement = document.querySelector('[data-vbg]');

    // add the element to the factory instance
    videoBackgrounds.add(firstElement);
```

In order to automatically initialize video backgrounds on all elements that match the selector as they appear in the DOM, you will have to implement MutationObserver manually.

The factory instance also indexes all of the individual video background instances by generated UID in it's property `index`, so you can access them later on if you need to.

UID is assigned to all target elements as a `data-vbg-uid` attribute when the video background is initialized. You can get the instance of the element by using a `get` function of the factory instance, which accepts the UID string or element object with UID attribute. 

```javascript
    // get the first element
    const firstElement = document.querySelector('[data-vbg]');

    // get the first instance instance by UID
    const firstInstance = videoBackgrounds.get(firstElement);
```

You can programmatically control the video playing in the background regardless of the provider and access all of it's properties via the instance object.

```javascript
    // true if the video is playing, false if the video is not playing
    console.log(firstInstance.playing);

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
    console.log(firstInstance.type)

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
    firstInstance.setSource('https://www.youtube.com/watch?v=eEpEeyqGlxA');

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
    firstElement.addEventListener('video-background-ready', function(event) {
        console.log('video-background-ready'); // the video instance object
        console.log(event.detail); // the video instance object
    })
```

In order to destroy the video background instance and revert the element to it's pre-initialization state, you can use the `destroy` function of the factory instance.

```javascript
    // destroy the video background by providing the element
    videoBackgrounds.destroy(firstElement);

    // or by providing the instance videoBackground.destroy(firstInstance);
```

To destroy all the instances in the index you can use `destroyAll` function of the factory instance.

Factory instance also implements the `IntersectionObserver` out of the box to keep track of the visible video backgrounds in order to toggle their play/pause state and preserve the bandwidth and improve the performance. You can find the instance of the `IntersectionObserver` in the `intersectionObserver` property of the factory instance.

For the resize events, the factory instance implements the `ResizeObserver` out of the box. You can find the instance of the `ResizeObserver` in the `resizeObserver` property of the factory instance. If the `resizeObserver` is not supported, the factory instance will fallback to the `window` resize event.

### jQuery Way

jQuery is no longer a dependency, but purely optional. To initialize video backgrounds with jQuery use the global function: `jQuery('[data-vbg]').youtube_background();`.

```html
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>
```

```javascript
    jQuery(document).ready(function() {
        jQuery('[data-vbg]').youtube_background();
    });
```

This function does exactly the same thing as if you would initialize the ES6 factory class. It will pass the selected elements and initialize the factory class in the global variable `VIDEO_BACKGROUNDS`. So everything that applies for the factory instance in the ES6 guide applies to this instance.

```javascript
    // get the first element
    const firstElement = $('[data-vbg]')[0];

    // get the first instance instance by UID
    const firstInstance = VIDEO_BACKGROUNDS.get(firstElement);
```

The plugin method accepts properties object as a parameter. For the list of available properties, please refer to the next [Properties](#properties) section.

```javascript
    jQuery(document).ready(function() {
        jQuery('[data-vbg]').youtube_background({
            'play-button': true
        });
    });
```

## Properties

Property | Default | Accepts | Description
-------- | ------- | ------- | -----------
**play-button** | false | boolean | Adds a toggle pause button
**mute-button** | false | boolean | Adds a toggle mute button
**autoplay** | true | boolean | Autoplay loaded video
**muted** | true | boolean | Load video muted
**loop** | true | boolean | Loop loaded video
**mobile** | false | boolean | Keep the youtube embed on mobile
**fit-box** | false | boolean | Set iframe to fit the container, meaning `width: 100%; height: 100%`
**inline-styles** | true | boolean | Enable/disable inline styles from the iframe and wrapper. The default wrapper styles are: `background-size: cover;`, `background-repeat: no-repeat;` and `background-position: center;`; the default iframe styles are `top: 50%;`, `left: 50%;`, `transform: translateX(-50%) translateY(-50%);`, `position: absolute;`, and `opacity: 0;`
**load-background** | false | boolean | Fetch background from youtube or vimeo **THIS DEFAULTS TO FALSE** since v1.0.18. It is recommended that you provide and host your own background photo preferably as an image element with `srcset` and `loading="lazy"` for performance reasons. Works only with **YouTube** and **Vimeo**.
**poster** | null | string | Provide your own background
**offset** | 100 | int | showinfo:0 id deprecated since September 25, 2018. - this setting makes the video a bit larger than it's viewport to hide the info elements. This setting defaults to 100 only for **YouTube** videos.
**resolution** | 16:9 | string | declare video resolution (work in progress)
**pause** | false | boolean | Adds a toggle pause button (deprecated)
**start-at** | 0 | int | Video starts playing at desired time in seconds
**end-at** | 0 | int | Video ends playing at desired time in seconds. 0 means it will play to the end.
**always-play** | false | boolean | Video will stop playing unless always-play is set to true.
**volume** | 1 | float | From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Sets initial volume. Setting volume doesn't work on mobile, so this setting won't have an effect on mobile.
**no-cookie** | true | boolean | Disable cookies. This will prevent **YouTube** and **Vimeo** from storing information and tracking you across the web. It is set to true by default.
**force-on-low-battery** | false | boolean | When mobile device is on battery saver mode, the videos will not autoplay. This setting will force autoplay on battery saver mode on user first interaction. This setting is set to false by default. Be mindful of your users and their data plans, and their battery life.
**lazyloading** | false | boolean | Lazyload the ifreame/video. This setting is set to false by default. Keep in mind that the script tracks the intersecting videos and pauses them when they are not visible for the reasons of improving the performance. Use lazyloading to minimize the data usage and improve performance even more.
**title** | 'Video background' | string | Title of the video for accessibility purposes. This setting is set to 'Video background' by default. Though if used as a background `aria-hidden="true"` attribute should be used on it's parent element. Setting this to false or null will remove the title attribute.

Noted properties can be added as html attributes as:

* **data-vbg-play-button**
* **data-vbg-mute-button**
* **data-vbg-autoplay**
* **data-vbg-muted**
* **data-vbg-loop**
* **data-vbg-mobile**
* **data-vbg-offset**
* **data-vbg-resolution**
* **data-vbg-fit-box**
* **data-vbg-load-background**
* **data-vbg-poster**
* **data-vbg-inline-styles**
* **data-vbg-start-at**
* **data-vbg-end-at**
* **data-vbg-always-play**
* **data-vbg-volume**
* **data-vbg-no-cookie**
* **data-vbg-force-on-low-battery**
* **data-vbg-lazyloading**

**⚠️ Note:** Attribute properties will override the properties passed on initialization. Always.

#### Example - Properties as HTML attributes

**Vanilla**
```html
    <div data-vbg-play-button="true" data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        const videoBackgrounds = new VideoBackgrounds('[data-vbg]');
    </script>
```
**jQuery**
```html
    <div data-vbg-play-button="true" data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            jQuery('[data-vbg]').youtube_background();
        });
    </script>
```

#### Example - Properties as JSON
**Vanilla**
```html
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        const videoBackgrounds = new VideoBackgrounds('[data-vbg]', {
            'play-button': true
        });
    </script>
```
**jQuery**
```html
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            jQuery('[data-vbg]').youtube_background({
                'play-button': true
            });
        });
    </script>
```


## Events

* **video-background-ready** - when the video is ready to play, this event is triggered. HTML5 videos are ready to play immediately.
* **video-background-time-update** - whenever the time of the video changes while video is playing, this event is triggered. The current time is available from the instance variable `event.detail.currentTime`. On Vimeo and YouTube this event is fired in 250ms intervals.
* **video-background-state-change** - video changes state. The state is available from the instance variable `event.detail.currentState`. It can be: `notstarted`, `ended`, `playing`, `paused`, `buffering`.
* **video-background-play** - video starts playing
* **video-background-pause** - video is paused
* **video-background-ended** - video ended event. Keep in mind that if loop is set to true the video will start playing from the start after this event.
* **video-background-mute** - video sound is muted
* **video-background-unmute** - video sound is unmuted
* **video-background-volume-change** - video volume is changed. The volume is available from the instance variable `event.detail.volume`.
* **video-background-resize** - when the video background is resized, this event is fired.
* **video-background-destroyed** - when the video background is destroyed using the `destroy` function of the instance and reverted to pre-initialization state, this event is fired.

Events bubble. If you go vanilla, you can get the video object via `event.detail` or `event.originalEvent.detail` in case of jQuery implementation.

You can add listeners to the events onto the element that you've initialized the video background on. If the ID of that element is `#video-background`, you can add listeners like this:

```javascript
document.querySelector('#video-background').addEventListener('video-background-ready', function(event) {
    console.log('video-background-ready'); // the video instance object
    console.log(event.detail); // the video instance object
});
```

or with jQuery:

```javascript
jQuery('#video-background').on('video-background-ready', function(event) {
    console.log('video-background-ready'); // the video instance object
    console.log(event.originalEvent.detail); // the video instance object
});
```

## Instance Methods

Method | Accepts | Description
-------- | ------- | -----------
**play** | - | Play the video
**pause** | - | Pause the video
**mute** | - | Mute the video
**unmute**  | - | Unmute the video
**setSource** | string | Set the video source, must be a link of the same type as the original video. Meaning, for example, if the original video was a YouTube video, the new source must be a YouTube video as well.
**setVolume** | float | Set the video volume. From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Setting volume doesn't work on mobile, so this setting won't have an effect on mobile.
**getVolume** | - | Get the video volume. From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Vimeo instance will return a promise that resolves to the volume value.
**seek** | int | Seek the video to a specific percentage complete. From 0 to 100. 0 is the start of the video, 100 is the end of the video.
**seekTo** | int | Seek the video to a specific time in seconds. From 0 to the duration of the video in seconds.
**setStartAt** | int | Set Start At seconds. From 0 to the duration of the video in seconds.
**setEndAt** | int | Set End At seconds. From 0 to the duration of the video in seconds.

## Instance variables
* **playing** - boolean, true if the video is playing, false if the video is not playing. Hard playing state, doesn't change on video being paused via IntersectionObserver.
* **muted** - boolean, true if the video is muted, false if the video is not muted.
* **isIntersecting** - boolean, true if the video is intersecting the viewport, false if the video is not intersecting the viewport.
* **currentState** - the current state of the video. It can be: `notstarted`, `ended`, `playing`, `paused`, `buffering`.
* **currentTime** - the current time of the video in seconds
* **percentComplete** - the percentage of the video that has been played
* **element** - the element that the video background is attached to
* **playerElement** - the element of the video player, meaning either an iframe in case of YouTube and Vimeo, or a video element
* **player** - the video player object, meaning either a YouTube or Vimeo player object, or a video element in case of HTML5 video
* **type** - the type of the video, can be `youtube`, `vimeo` or `video`
* **volume** - volume of the video from 0 to 1

## Factory Instance Methods

Method | Accepts | Description
-------- | ------- | -----------
**add** | element, parameters | Add an element to the factory instance, it will initialize the video background on that element. Parameters are optional.
**get** | element or UID | Get the instance of the video background by UID or element. Returns the instance object.
**destroy** | element or instance | Destroy the video background instance and revert the element to it's pre-initialization state. Accepts either the element or the instance object.
**destroyAll** | - | Destroy all the instances in the index.
**pauseAll** | - | Pause all the instances in the index.
**playAll** | - | Play all the instances in the index.
**muteAll** | - | Mute all the instances in the index.
**unmuteAll** | - | Unmute all the instances in the index.
**setVolumeAll** | float | Set the volume of all the instances in the index. From 0 to 1. 0 is muted, 1 is full volume. 0.5 is half volume. Setting volume doesn't work on mobile, so this setting won't have an effect on mobile.

## Factory Instance Variables
* **index** - the index of all the instances of the video backgrounds. It is an object with keys being the UID of the element and values being the instance object.
* **intersectionObserver** - the instance of the `IntersectionObserver` that is used to track the intersecting video backgrounds.
* **resizeObserver** - the instance of the `ResizeObserver` that is used to track the resize events of the video backgrounds. If the `ResizeObserver` is not supported, the factory instance will fallback to the `window` resize event.

## Browser Support

Minimum supported browsers are both desktop and mobile:
* Chrome 49+
* Firefox 44+
* Safari 10+
* Opera 18+
* Edge 14+

Recommended browsers are both desktop and mobile:
* Chrome 51+
* Firefox 55+
* Safari 12.1+
* Opera 38+
* Edge 17+

Tested with [BrowserStack](https://www.browserstack.com). 

## Development

Development setup uses **POOPS bundler** to bundle ES modules into IIFE `jquery.youtube-background.js` and  `jquery.youtube-background.min.js`

[POOPS](https://github.com/stamat/poops) is a simple bundler + static site builder that I've created, do give it a try and let me know what you think. It's still in early development, but it's already quite useful.

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

### Code

The code is structured like this:

* **main.js** - the main entry point of the script. Used to initialize the jQuery plugin.
* **video-backgrounds.js** - the main entry point of the ES6 module. It contains the factory class `VideoBackgrounds` that is used to create and index multiple instances of the video backgrounds depending on the link type: YouTube, Vimeo or video file.
* **lib/super-video-background.js** - It contains the super class `SuperVideoBackground` with all of the common methods and properties for all of the video background types. This class is inherited by the `YouTubeBackground`, `VimeoBackground` and `VideoBackground` classes.
* **lib/youtube-background.js** - It contains the `YouTubeBackground` class that is used to create and control YouTube video backgrounds.Inherits from `SuperVideoBackground`.
* **lib/vimeo-background.js** - It contains the `VimeoBackground` class that is used to create and control Vimeo video backgrounds. Inherits from `SuperVideoBackground`.
* **lib/video-background.js** - It contains the `VideoBackground` class that is used to create and control HTML5 video backgrounds. Inherits from `SuperVideoBackground`.
* **lib/buttons.js** - It contains the play and pause automatic buttons and their functionality that are added to the video backgrounds. I seriously don't know why I created this in the first place.
* **lib/controls.js** - Module containing externalized control classes `SeekBar`, `PlayToggle`, `MuteToggle` which tune onto the video events and use the common API, they are not bundled with the script, but are available as a standalone module exports.

Tu summarize, because YouTube, Vimeo and HTML5 Video API's are different - we need a way to generalize these APIs and provide a common interface for all of them. Due to a lot of common code we have the `SuperVideoBackground` class that is inherited by the `YouTubeBackground`, `VimeoBackground` and `VideoBackground` classes.

And lastly we have the `VideoBackgrounds` factory class that is used to create and index multiple instances of the video backgrounds depending on the link type: YouTube, Vimeo or video file and provide a single IntersectionObserver and ResizeObserver for all of the instances.

THE END.
