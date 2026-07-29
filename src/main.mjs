import { VideoBackgrounds } from './video-backgrounds.mjs';

if (typeof jQuery == 'function') {
  (function ($) {
    $.fn.youtube_background = function (params) {
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
