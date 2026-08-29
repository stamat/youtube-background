import { VideoBackgrounds } from './video-backgrounds.mjs';

let deprecationWarned = false;

if (typeof jQuery == 'function') {
  (function ($) {
    $.fn.youtube_background = function (params) {
      if (!deprecationWarned) {
        deprecationWarned = true;
        console.warn('youtube-background: the jQuery plugin is deprecated and will be removed in 2.0.0. Use `new VideoBackgrounds(\'[data-vbg]\')` instead.');
      }

      const $this = $(this);
      if (Object.prototype.hasOwnProperty.call(window, 'VIDEO_BACKGROUNDS')) {
        $this.each(function () {
          window.VIDEO_BACKGROUNDS.add(this, params);
        });
        return $this;
      }
      window.VIDEO_BACKGROUNDS = new VideoBackgrounds(this, params);
      return $this;
    };
  })(jQuery);
}

window.VideoBackgrounds = VideoBackgrounds;
