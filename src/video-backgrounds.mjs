import { YoutubeBackground } from './lib/youtube-background.mjs';
import { VimeoBackground } from './lib/vimeo-background.mjs';
import { VideoBackground } from './lib/video-background.mjs';

import { randomIntInclusive, RE_VIDEO, RE_VIMEO, RE_YOUTUBE } from 'book-of-spells';

// probed in order, so the platform patterns get first refusal on a link
const SOURCE_PATTERNS = {
  YOUTUBE: RE_YOUTUBE,
  VIMEO: RE_VIMEO,
  VIDEO: RE_VIDEO
};

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
          if (!uid || !Object.prototype.hasOwnProperty.call(self.index, uid)) return;

          const instance = self.index[uid];
          instance.isIntersecting = entry.isIntersecting;

          try {
            if (entry.isIntersecting) {
              if (instance.player && !instance.paused) instance.softPlay();
            } else {
              if (instance.player) instance.softPause();
            }
          } catch {
            // console.log(e);
          }
        });
      });
    }

    this.resizeObserver = null;

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          const uid = entry.target.getAttribute('data-vbg-uid');

          if (uid && Object.prototype.hasOwnProperty.call(self.index, uid)) {
            window.requestAnimationFrame(() => self.index[uid].resize());
          }
        });
      });
    } else {
      // bound once and kept, so disconnect() can hand back the same function object
      this.onResize = function () {
        for (let k in self.index) {
          window.requestAnimationFrame(() => self.index[k].resize(self.index[k].playerElement));
        }
      };
      window.addEventListener('resize', this.onResize);
    }

    this.initPlayers();

    // attached before the element loop bails out: elements can still arrive via add()
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    if (!this.elements || !this.elements.length) return;
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      this.add(element, params);
    }
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

    // copy, don't mutate - the caller's object is shared across elements
    if (!this.intersectionObserver) {
      params = Object.assign({}, params, { 'always-play': true });
    }

    const link = element.getAttribute('data-youtube') || element.getAttribute('data-vbg');
    const vid_data = this.getVidID(link);
  
    if (!vid_data) return;
    
    const uid = this.generateUID(vid_data.id);
  
    if (!uid) return;
  
    switch (vid_data.type) {
      case 'YOUTUBE':
        this.index[uid] = new YoutubeBackground(element, params, vid_data.id, uid, this);
        break;
      case 'VIMEO':
        this.index[uid] = new VimeoBackground(element, params, vid_data, uid, this);
        break;
      case 'VIDEO':
        this.index[uid] = new VideoBackground(element, params, vid_data, uid, this);
        break;
      default:
        return;
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
    if (uid && Object.prototype.hasOwnProperty.call(this.index, uid)) {
      if (!this.index[uid].params['always-play'] && this.intersectionObserver) this.intersectionObserver.unobserve(element);
      if (this.resizeObserver) this.resizeObserver.unobserve(element);
      this.index[uid].destroy();
      delete this.index[uid];
    }
  }

  destroyAll() {
    // the wrapper, not the player: data-vbg-uid only ever lands on the wrapper
    for (let k in this.index) {
      this.destroy(this.index[k].element);
    }
  }

  // Full teardown. destroyAll() only clears the index - the observers and the two
  // global listeners outlive it, and nothing else can reach them once the factory
  // goes out of scope.
  disconnect() {
    this.destroyAll();

    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();

    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.onResize) window.removeEventListener('resize', this.onResize);
  }

  getVidID(link) {
    if (!link) return;

    for (let k in SOURCE_PATTERNS) {
      const pts = link.match(SOURCE_PATTERNS[k]);

      if (pts && pts.length) {
        SOURCE_PATTERNS[k].lastIndex = 0;
        const data = {
          id: pts[1],
          type: k,
          regex_pts: pts,
          link: link
        };
        
        if (k === 'VIMEO') {
          const unlistedQueryRegex = /(\?|&)h=([^=&#?]+)/;
          const unlistedPathRegex = /\/[^/:.]+(:|\/)([^:?/]+)\s?$/;
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
    while (Object.prototype.hasOwnProperty.call(this.index, uid)) {
      uid = pref +'-'+ randomIntInclusive(0, 9999);
    }
  
    return uid;
  }

  get(element) {
    const uid = typeof element === 'string' ? element : element.getAttribute('data-vbg-uid');
    if (uid && Object.prototype.hasOwnProperty.call(this.index, uid)) return this.index[uid];
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

    // these are global hooks the APIs call exactly once - chain whatever was
    // already there so another instance, or the host page, still gets notified
    const previousYouTubeReady = window.onYouTubeIframeAPIReady;
    const previousVimeoReady = window.onVimeoIframeAPIReady;

    window.onYouTubeIframeAPIReady = function () {
      if (typeof previousYouTubeReady === 'function') previousYouTubeReady();

      for (let k in self.index) {
        if (self.index[k] instanceof YoutubeBackground) {
          self.index[k].initYTPlayer();
        }
      }
  
      if (callback) {
        setTimeout(callback, 100);
      }
    };
  
    if (Object.prototype.hasOwnProperty.call(window, 'YT') && window.YT.loaded) {
      window.onYouTubeIframeAPIReady();
    }
  
    window.onVimeoIframeAPIReady = function () {
      if (typeof previousVimeoReady === 'function') previousVimeoReady();

      for (let k in self.index) {
        if (self.index[k] instanceof VimeoBackground) {
          self.index[k].initVimeoPlayer();
        }
      }
  
      if (callback) {
        setTimeout(callback, 100);
      }
    }
  
    if (Object.prototype.hasOwnProperty.call(window, 'Vimeo') && Object.prototype.hasOwnProperty.call(window.Vimeo, 'Player')) {
      window.onVimeoIframeAPIReady();
    }
  }
}
