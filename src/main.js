import { VideoBackgrounds } from './video-backgrounds.js';

if (typeof jQuery == 'function') {
  (function ($) {
    $.fn.youtube_background = function (params) {
      const $this = $(this);
      new VideoBackgrounds(this, params);
      return $this;
    };
  })(jQuery);
}

window.VideoBackgrounds = VideoBackgrounds;
