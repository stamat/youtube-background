import { VideoBackgrounds } from './video-backgrounds.js';

if (typeof jQuery == 'function') {
  (function ($) {
    $.fn.youtube_background = function (params) {
      const $this = $(this);
      if (window.hasOwnProperty('VIDEO_BACKGROUNDS')) {
        window.VIDEO_BACKGROUNDS.add($this, params);
        return $this;
      }
      window.VIDEO_BACKGROUNDS = new VideoBackgrounds(this, params);
      return $this;
    };
  })(jQuery);
}

window.VideoBackgrounds = VideoBackgrounds;
