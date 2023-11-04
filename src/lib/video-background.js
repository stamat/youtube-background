import { SuperVideoBackground } from './super-video-background.js';

export class VideoBackground extends SuperVideoBackground {
  constructor(elem, params, vid_data, uid) {
    super(elem, params, vid_data.link, uid, 'video');

    this.src = vid_data.link;
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

  generatePlayerElement() {
    const playerElement = document.createElement('video');
    playerElement.toggleAttribute('playsinline', true);
    playerElement.toggleAttribute('loop', this.params.loop);
    playerElement.toggleAttribute('autoplay', this.params.autoplay && (this.params['always-play'] || this.isIntersecting));
    playerElement.toggleAttribute('muted', this.params.muted);

    return playerElement;
  }

  injectPlayer() {
    this.player = this.generatePlayerElement();
    this.playerElement = this.player;
  
    if (this.params.volume !== 1 && !this.params.muted) this.setVolume(this.params.volume);
  
    this.playerElement.setAttribute('id', this.uid)

    const source = document.createElement('source');
    source.setAttribute('src', this.src);
    source.setAttribute('type', this.mime);
    this.playerElement.appendChild(source);
    
  
    this.stylePlayerElement(this.playerElement);
    this.element.appendChild(this.playerElement);
    this.resize(this.playerElement);

    this.player.addEventListener('canplay', (e) => {
      e.target.style.opacity = 1;
    }, { once: true });
  
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
  }

  /* ===== API ===== */

  seekTo(seconds) {
    if (this.player.hasOwnProperty('fastSeek')) {
      this.player.fastSeek(seconds);
      return;
    }
    this.player.currentTime = seconds;
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
