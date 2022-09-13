# 📺 youtube-background
[![npm version](https://img.shields.io/npm/v/youtube-background)](https://www.npmjs.com/package/youtube-background)
[![CSS gzip size](https://img.badgesize.io/stamat/youtube-background/master/jquery.youtube-background.min.js?compression=gzip&label=gzip%20size)](https://github.com/stamat/youtube-background/blob/master/jquery.youtube-background.js)

~~Another 100 liner in a form of a~~ simple script (or jQuery plugin) to facilitate YouTube embeds as a cover background using YouTube Embed API.

I wrote this code several times over the years and never bothered to make it reusable. Now when I needed it again I could not even find where I wrote it last...

Goodbye careless days... I'm getting old...

[DEMO HERE ➡️](http://stamat.github.io/youtube-background/)

## Features

* Fade in CSS animation *(Youtube and HTML5 videos only)*
* Play/Pause button *(Youtube and HTML5 videos only)*
* Mute/Unmute button *(Youtube and HTML5 videos only)*
* No CSS required
* No longer jQuery dependant

## Installation

### As a JS module

To install the package from NPM run the good old command
```
npm install youtube-background
```

To import it in your script add:

```
import 'youtube-background';
```

Don't forget to point your bundler to use `node_modules` as an include path.

If you wish to use it as a jQuery plugin, make sure you import jQuery as well.

### Over CDN

```
<script type="text/javascript" src="https://unpkg.com/youtube-background/jquery.youtube-background.js"></script>
```
or minified:
```
<script type="text/javascript" src="https://unpkg.com/youtube-background/jquery.youtube-background.min.js"></script>
```

## Usage

Usage is pretty simple, add a data attribute **data-vbg** containing a full YouTube, Vimeo or video file link or just the YouTube or Vimeo ID.

You can trigger all elements containing the noted attribute with `$("[data-vbg]").youtube_background();`, or specify your selector, on jQuery document ready event.

**Note:** From version 1.0.6 **jQuery is no longer a dependency**, but purely optional. To initialise youtube video backgrounds without jQuery use: `new VideoBackgrounds('[data-vbg]');`.

P.S. *https://www.youtube.com/player_api* is injected automatically, only once per script init. I've seen some implementations like Elementor WP plugin that inject it several times, for no reason. Anyway, you're welcome.

### Quick Example

```html
	<style>
		/* optional css fade in animation */
		iframe {
			transition: opacity 500ms ease-in-out;
			transition-delay: 250ms;
		}
	</style>

	<!-- target element -->
    <div data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            jQuery('[data-vbg]').youtube_background();
        });
    </script>
```

### Properties

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
**load-background** | true | boolean | Fetch background from youtube
**poster** | null | string | Provide your own background
**offset** | 200 | int | showinfo:0 id deprecated since September 25, 2018. - this setting makes the video a bit larger than it's viewport to hide the info elements
**resolution** | 16:9 | string | declare video resolution (work in progress)
**pause** | false | boolean | Adds a toggle pause button (deprecated)
**start-at** | 0 | int | Video starts playing at desired time in seconds
**end-at** | 0 | int | Video ends playing at desired time in seconds. 0 means it will play to the end.

Noted properties can be added as html attributes as:

* **data-vbg-play-button**
* **data-vbg-mute-button**
* **data-vbg-autoplay**
* **data-vbg-mooted**
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

#### Vimeo support

Available properties for Vimeo backgrounds:

* muted
* loop
* mobile
* resolution
* inline-styles
* fit-box
* offset
* start-at
* poster

#### HTML5 Video support

Available properties for HTML5 Video backgrounds:

* autoplay
* muted
* loop
* mobile
* resolution
* inline-styles
* fit-box
* offset
* play-button
* mute-button
* poster

#### Example - Properties as HTML attributes

```html
    <div data-vbg-play-button="true" data-vbg="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            jQuery('[data-vbg]').youtube_background();
        });
    </script>
```

#### Example - Properties as JSON

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

### Events - Youtube and HTML5 video

* **video-background-play** - video starts playing
* **video-background-pause** - video is paused
* **video-background-mute** - video sound is muted
* **video-background-unmute** - video sound is unmuted

Events bubble. If you go vanilla, you can get the video object via `event.detail`.

## Development

Development setup uses **GULP with Rollup** to bundle ES modules into IIFE `jquery.youtube-background.js` and  `jquery.youtube-background.min.js`

To install the required packages for running **GULP**, run:

```
npm install
```

To run the server on `http://localhost:4040`, run:

```
gulp
```

Code will automatically be packaged into IIFE while you develop.

To generate minified version of the code, run:

```
gulp build --production
```

## todo
- [x] Autoplay property
- [x] Mute property and button #4
- [x] Add another wrapper so video can fade in when loaded
- [x] Add play-pause, mute-unmute events
- [x] Test the execution order
- [x] Refactor the code to provide foundation for unified solution from multiple providers and sources called video-background
- [x] https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
- [ ] Pause and mute on inactivity option - Play only when in viewport if IntersectionObserver available, also can be toggled as an option
- [ ] Perform final tests on BrowserStack and comment the code

THE END.
