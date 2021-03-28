import { YoutubeBackground } from './youtube-background.js';

export function VideoBackgrounds(selector, params) {
	this.elements = selector;

	if (typeof selector === 'string') {
		this.elements = document.querySelectorAll(selector);
	}

	this.index = {};
	this.re = {};
	this.re.YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  this.re.VIMEO = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;

	this.__init__ = function () {
		for (var i = 0; i < this.elements.length; i++) {
			var element = this.elements[i];

			var link = element.getAttribute('data-youtube');
			var vid_data = this.getVidID(link);

      if (!vid_data) {
        continue;
      }

			var uid = this.generateUID(vid_data.id);

      if (!uid) {
				continue;
			}

      if (vid_data.type === 'YOUTUBE') {
        var yb = new YoutubeBackground(element, params, vid_data.id, uid);
        this.index[uid] = yb;
      }
		}

		var self = this;

		this.initYTPlayers();
	};

	this.__init__();
}

VideoBackgrounds.prototype.getVidID = function (link) {
  if (link !== undefined && link !== null) {
    for (var k in this.re) {
      var pts = link.match(this.re[k]);

      if (pts && pts.length) {
        this.re[k].lastIndex = 0;

        return {
          id: pts[1],
          type: k
        };
      }
    }
  }

	return null;
};


VideoBackgrounds.prototype.generateUID = function (pref) {
	//index the instance
	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
	}

	var uid = pref +'-'+ getRandomIntInclusive(0, 9999);
	while (this.index.hasOwnProperty(uid)) {
		uid = pref +'-'+ getRandomIntInclusive(0, 9999);
	}

	return uid;
};

VideoBackgrounds.prototype.pauseVideos = function () {
	for (var k in this.index) {
		this.index[k].pause();
	}
};

VideoBackgrounds.prototype.playVideos = function () {
	for (var k in this.index) {
		this.index[k].play();
	}
};

VideoBackgrounds.prototype.initYTPlayers = function (callback) {
	var self = this;

	window.onYouTubeIframeAPIReady = function () {
		for (var k in self.index) {
      if (self.index[k] instanceof YoutubeBackground) {
        self.index[k].initYTPlayer();
      }
		}

		if (callback) {
			setTimeout(callback, 100);
		}
	};

	if (window.hasOwnProperty('YT') && window.YT.loaded) {
		window.onYouTubeIframeAPIReady();
	}
};
