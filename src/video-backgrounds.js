import { YoutubeBackground } from './lib/youtube-background.js';
import { VimeoBackground } from './lib/vimeo-background.js';
import { VideoBackground } from './lib/video-background.js';

import { randomIntInclusive, RE_VIDEO, RE_VIMEO, RE_YOUTUBE } from 'book-of-spells';

export class VideoBackgrounds {
  constructor(selector, params) {
    this.elements = selector;

    if (typeof selector === 'string') {
      this.elements = document.querySelectorAll(selector);
    }

    this.index = {};
    this.re = {};
    this.re.YOUTUBE = RE_YOUTUBE;
    this.re.VIMEO = RE_VIMEO;
    this.re.VIDEO = RE_VIDEO;

    const self = this;

    this.intersectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const uid = entry.target.getAttribute('data-vbg-uid');

        if (uid && self.index.hasOwnProperty(uid) && entry.isIntersecting) {
          self.index[uid].isIntersecting = true;
          try {
            if (self.index[uid].player && self.index[uid].params.autoplay) self.index[uid].softPlay();
          } catch (e) {
            // console.log(e);
          }
        } else {
          self.index[uid].isIntersecting = false;
          try {
            if (self.index[uid].player) self.index[uid].softPause();
          } catch (e) {
            // console.log(e);
          }
        }
      });
    });

    this.resizeObserver = null;

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          const uid = entry.target.getAttribute('data-vbg-uid');

          if (uid && self.index.hasOwnProperty(uid)) {
            window.requestAnimationFrame(() => self.index[uid].resize());
          }
        });
      });
    } else {
      window.addEventListener('resize', function () {
        for (let k in self.index) {
          window.requestAnimationFrame(() => self.index[k].resize(self.index[k].playerElement));
        }
      });
    }
    
    this.initPlayers();

    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      this.add(element, params);
    }
  }

  add(element, params) {
    const link = element.getAttribute('data-youtube') || element.getAttribute('data-vbg');
    const vid_data = this.getVidID(link);
  
    if (!vid_data) {
      return;
    }
  
    const uid = this.generateUID(vid_data.id);
  
    if (!uid) {
      return;
    }
  
    switch (vid_data.type) {
      case 'YOUTUBE':
        const yb = new YoutubeBackground(element, params, vid_data.id, uid);
        this.index[uid] = yb;
        break;
      case 'VIMEO':
        const vm = new VimeoBackground(element, params, vid_data.id, uid);
        this.index[uid] = vm;
        break;
      case 'VIDEO':
        const vid = new VideoBackground(element, params, vid_data, uid);
        this.index[uid] = vid;
        break;
    }

    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
  
    if (!this.index[uid].params['always-play']) {
      this.intersectionObserver.observe(element);
    }
  }

  getVidID(link) {
    if (link !== undefined && link !== null) {
      for (let k in this.re) {
        const pts = link.match(this.re[k]);
  
        if (pts && pts.length) {
          this.re[k].lastIndex = 0;
          return {
            id: pts[1],
            type: k,
            regex_pts: pts,
            link: link
          };
        }
      }
    }
  
    return null;
  }

  generateUID = function (pref) {
    //index the instance
    let uid = pref +'-'+ randomIntInclusive(0, 9999);
    while (this.index.hasOwnProperty(uid)) {
      uid = pref +'-'+ randomIntInclusive(0, 9999);
    }
  
    return uid;
  }

  pauseVideos() {
    for (let k in this.index) {
      this.index[k].pause();
    }
  }

  playVideos() {
    for (let k in this.index) {
      this.index[k].play();
    }
  }

  initPlayers(callback) {
    const self = this;
  
    window.onYouTubeIframeAPIReady = function () {
      for (let k in self.index) {
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
  
    window.onVimeoIframeAPIReady = function () {
      for (let k in self.index) {
        if (self.index[k] instanceof VimeoBackground) {
          self.index[k].initVimeoPlayer();
        }
      }
  
      if (callback) {
        setTimeout(callback, 100);
      }
    }
  
    if (window.hasOwnProperty('Vimeo') && window.Vimeo.hasOwnProperty('Player')) {
      window.onVimeoIframeAPIReady();
    }
  }
}
