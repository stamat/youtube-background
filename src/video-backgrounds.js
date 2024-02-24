import { YoutubeBackground } from './lib/youtube-background.js';
import { VimeoBackground } from './lib/vimeo-background.js';
import { VideoBackground } from './lib/video-background.js';

import { randomIntInclusive, RE_VIMEO, RE_YOUTUBE, RE_VIDEO } from 'book-of-spells';

export class VideoBackgrounds {
  constructor(selector, params) {
    this.elements = selector;
    if (this.elements instanceof Element) this.elements = [this.elements];
    if (typeof this.elements === 'string') this.elements = document.querySelectorAll(selector);

    this.index = {};

    const self = this;

    this.intersectionObserver = null;

    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          const uid = entry.target.getAttribute('data-vbg-uid');
  
          if (uid && self.index.hasOwnProperty(uid) && entry.isIntersecting) {
            self.index[uid].isIntersecting = true;
            try {
              if (self.index[uid].player && !self.index[uid].paused) self.index[uid].softPlay();
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
    }

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

    if (!this.elements || !this.elements.length) return;
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      this.add(element, params);
    }

    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  }

  onVisibilityChange() {
    if (document.hidden) return;

    for (let k in this.index) {
      const instance = this.index[k];
      if (instance.shouldPlay()) {
        instance.softPlay();
      }
    }
  }

  add(element, params) {
    if (!element) return;
    if (element.hasAttribute('data-vbg-uid')) return;

    if (!this.intersectionObserver) {
      if (!params) params = {};
      params['always-play'] = true;
    }

    const link = element.getAttribute('data-youtube') || element.getAttribute('data-vbg');
    const vid_data = this.getVidID(link);
  
    if (!vid_data) return;
    
    const uid = this.generateUID(vid_data.id);
  
    if (!uid) return;
  
    switch (vid_data.type) {
      case 'YOUTUBE':
        const yb = new YoutubeBackground(element, params, vid_data.id, uid, this);
        this.index[uid] = yb;
        break;
      case 'VIMEO':
        const vm = new VimeoBackground(element, params, vid_data, uid, this);
        this.index[uid] = vm;
        break;
      case 'VIDEO':
        const vid = new VideoBackground(element, params, vid_data, uid, this);
        this.index[uid] = vid;
        break;
    }

    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
  
    if (!this.index[uid].params['always-play'] && this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
  }

  destroy(element) {
    const uid = element.uid || element.getAttribute('data-vbg-uid');
    if (uid && this.index.hasOwnProperty(uid)) {
      if (!this.index[uid].params['always-play'] && this.intersectionObserver) this.intersectionObserver.unobserve(element);
      if (this.resizeObserver) this.resizeObserver.unobserve(element);
      this.index[uid].destroy();
      delete this.index[uid];
    }
  }

  destroyAll() {
    for (let k in this.index) {
      this.destroy(this.index[k].playerElement);
    }
  }

  getVidID(link) {
    if (link === undefined && link === null) return;

    this.re = {};
    this.re.YOUTUBE = RE_YOUTUBE;
    this.re.VIMEO = RE_VIMEO;
    this.re.VIDEO = RE_VIDEO;
    
    for (let k in this.re) {
      const pts = link.match(this.re[k]);

      if (pts && pts.length) {
        this.re[k].lastIndex = 0;
        const data = {
          id: pts[1],
          type: k,
          regex_pts: pts,
          link: link
        };
        
        if (k === 'VIMEO') {
          const unlistedQueryRegex = /(\?|&)h=([^=&#?]+)/;
          const unlistedPathRegex = /\/[^\/\:\.]+(\:|\/)([^:?\/]+)\s?$/;
          const unlistedQuery = link.match(unlistedPathRegex) || link.match(unlistedQueryRegex);
          if (unlistedQuery) data.unlisted = unlistedQuery[2];
        }

        return data;
      }
    }
  
    return;
  }

  generateUID(pref) {
    //index the instance
    pref = pref.replace(/[^a-zA-Z0-9\-_]/g, '-'); //sanitize id
    pref = pref.replace(/-{2,}/g, '-'); //remove double dashes
    pref = pref.replace(/^-+/, '').replace(/-+$/, ''); //trim dashes
    pref = 'vbg-'+ pref; //prefix id with 'vbg-

    let uid = pref +'-'+ randomIntInclusive(0, 9999);
    while (this.index.hasOwnProperty(uid)) {
      uid = pref +'-'+ randomIntInclusive(0, 9999);
    }
  
    return uid;
  }

  get(element) {
    const uid = typeof element === 'string' ? element : element.getAttribute('data-vbg-uid');
    if (uid && this.index.hasOwnProperty(uid)) return this.index[uid];
  }

  pauseAll() {
    for (let k in this.index) {
      this.index[k].pause();
    }
  }

  playAll() {
    for (let k in this.index) {
      this.index[k].play();
    }
  }

  muteAll() {
    for (let k in this.index) {
      this.index[k].mute();
    }
  }

  unmuteAll() {
    for (let k in this.index) {
      this.index[k].unmute();
    }
  }

  setVolumeAll(volume) {
    for (let k in this.index) {
      this.index[k].setVolume(volume);
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
