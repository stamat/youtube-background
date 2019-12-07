# jquery.youtube-background

Another 100 liner in a form of a jQuery plugin created to facilitate YouTube embeds as a cover background using YouTube Embed API.

I wrote this code several times over the years and never bothered to make it reusable. Now when I needed it again I could not even find where I wrote it last...

Goodbye careless days... I'm getting old...

[DEMO HERE ⤻](http://stamat.github.io/jquery.youtube-background/)

## Usage

Usage is pretty simple, add a data attribute **data-youtube** containing a full YouTube link or just the YouTube ID.

You can trigger all elements containing the noted attribute with `$("[data-youtube]").youtube_background();`, or specify your selector, on jQuery document ready event.

P.S. *https://www.youtube.com/player_api* is injected automatically, only once per script init. I've seen some implementations like Elementor WP plugin that inject it several times, for no reason. Anyway, you're welcome.

### Quick Example

```
    <div id="ytbg" data-youtube="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            $('[data-youtube]').youtube_background();
        });
    </script>
```
### Properties

Property | Default | Accepts | Description
-------- | ------- | ------- | -----------
**pause** | false | boolean | Adds a toggle pause button
**mobile** | false | boolean | Keep the youtube embed on mobile
**load-background** | true | boolean | Fetch background from youtube

Noted properties can be added as html attributes as:

* **data-ytbg-pause**
* **data-ytbg-mobile**
* **data-ytbg-load-background**

#### Example - Properties as HTML attributes

```
    <div id="ytbg" data-ytbg-pause="true" data-youtube="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            $('[data-youtube]').youtube_background();
        });
    </script>
```

#### Example - Properties as JSON

```
    <div id="ytbg" data-youtube="https://www.youtube.com/watch?v=eEpEeyqGlxA"></div>

    <script type="text/javascript">
        jQuery(document).ready(function() {
            $('[data-youtube]').youtube_background({
				'pause': true
			});
        });
    </script>
```

## todo
- [ ] Make a unified solution with support for Vimeo, Brightcove, Slate and DailyMotion, regardless of the name youtube-background

THE END.
