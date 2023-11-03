import { proportionalParentCoverResize } from 'book-of-spells';

import { SuperVideoBackground } from './super-video-background.js';

export class VideoBackground extends SuperVideoBackground {
  constructor(elem, params, vid_data, uid) {
    super(elem, params, vid_data.link, uid, 'video');

    this.link = vid_data.link;
    this.ext = /(?:\.([^.]+))?$/.exec(vid_data.id)[1];
    this.uid = uid;
    this.element.setAttribute('data-vbg-uid', uid);
    this.player = null;
    this.buttons = {};

    const MIME_MAP = {
      'ogv' : 'video/ogg',
      'ogm' : 'video/ogg',
      'ogg' : 'video/ogg',
      'avi' : 'video/avi',
      'mp4' : 'video/mp4',
      'webm' : 'video/webm'
    };

    this.mime = MIME_MAP[this.ext.toLowerCase()];

    this.injectPlayer();
  }

  seekTo(seconds) {
    if (this.player.hasOwnProperty('fastSeek')) {
      this.player.fastSeek(seconds);
      return;
    }
    this.player.currentTime = seconds;
  }

  injectPlayer() {
    this.player = document.createElement('video');
    this.player.toggleAttribute('playsinline', true);
    this.player.toggleAttribute('loop', this.params.loop);
    this.player.toggleAttribute('autoplay', this.params.autoplay && (this.params['always-play'] || this.isIntersecting));
    this.player.toggleAttribute('muted', this.params.muted);
  
    if (this.params.volume !== 1 && !this.params.muted) this.setVolume(this.params.volume);
  
    this.player.setAttribute('id', this.uid)
  
    if (this.params['inline-styles']) {
      this.player.style.top = '50%';
      this.player.style.left = '50%';
      this.player.style.transform = 'translateX(-50%) translateY(-50%)';
      this.player.style.position = 'absolute';
      this.player.style.opacity = 0;
  
      this.player.addEventListener('canplay', (e) => {
        e.target.style.opacity = 1;
      });
    }
  
    const self = this;
  
    if (this.params['start-at'] && this.params.autoplay) {
      this.player.addEventListener('canplay', (e) => {
        self.seekTo(this.params['start-at']);
      }, { once: true });
    }
  
    if (this.params['end-at']) {
      this.player.addEventListener('timeupdate', (e) => {
        if (self.player.currentTime >= self.params['end-at']) {
          self.seekTo(this.params['start-at']);
        }
      });
    }
  
    const source = document.createElement('source');
    source.setAttribute('src', this.link);
    source.setAttribute('type', this.mime);
    this.player.appendChild(source);
    this.element.appendChild(this.player);
  
    if (this.params['fit-box']) {
      this.player.style.width = '100%';
      this.player.style.height = '100%';
    } else {
      this.resize();
    }
  }

  resize() {
    if (this.params['fit-box']) return;
    proportionalParentCoverResize(this.player, this.params.resolution_mod, this.params.offset);
  }

  softPause() {
    if (!this.state.playing || !this.player) return;
    this.player.pause();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  softPlay() {
    if (!this.state.playing || !this.player) return;
    this.player.play();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  play() {
    if (!this.player) return;
  
    if (this.params['start-at'] || this.params['end-at']) {
      const seconds = this.player.currentTime;
      if (this.params['start-at'] && seconds < this.params['start-at']) {
        this.seekTo(self.params['start-at']);
      }
  
      if (this.params['end-at'] && seconds > this.params['end-at']) {
        this.seekTo(self.params['start-at']);
      }
    }
  
    this.state.playing = true;
  
    this.player.play();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  pause() {
    if (!this.player) return;
    this.state.playing = false;
  
    this.player.pause();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  unmute() {
    if (!this.player) return;
    this.state.muted = false;
  
    this.player.muted = false;
    if (!this.state.volume_once) {
      this.state.volume_once = true;
      this.setVolume(this.params.volume);
    }
    this.element.dispatchEvent(new CustomEvent('video-background-unmute', { bubbles: true, detail: this }));
  }

  mute() {
    if (!this.player) return;
    this.state.muted = true;
  
    this.player.muted = true;
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }

  setVolume(volume) {
    if (!this.player) return;
  
    this.player.volume = volume;
    this.element.dispatchEvent(new CustomEvent('video-background-volume-change', { bubbles: true, detail: this }));
  }
}
