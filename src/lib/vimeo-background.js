import { proportionalParentCoverResize } from 'book-of-spells';

import { SuperVideoBackground } from './super-video-background.js';

export class VimeoBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid) {
    super(elem, params, id, uid, 'vimeo');
    if (!id) return;
    if (this.is_mobile && !this.params.mobile) return;
    this.injectScript();

    this.vid = id;
    this.player = null;

    this.injectPlayer();
  }

  injectScript() {
    if (window.hasOwnProperty('Vimeo') || document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) return;
    const tag = document.createElement('script');
    if (window.hasOwnProperty('onVimeoIframeAPIReady') && typeof window.onVimeoIframeAPIReady === 'function') tag.addEventListener('load', () => {
      window.onVimeoIframeAPIReady();
    });
    tag.src = 'https://player.vimeo.com/api/player.js';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  initVimeoPlayer() {
    if (window.hasOwnProperty('Vimeo') && this.player === null) {
      this.player = new Vimeo.Player(this.playerElement);
  
      this.player.on('loaded', this.onVideoPlayerReady.bind(this));
      this.player.on('ended', this.onVideoEnded.bind(this));
      
      if (this.params['end-at'] > 0) this.player.on('timeupdate', this.onVideoTimeUpdate.bind(this));
      if (this.params.volume !== 1 && !this.params.muted) this.setVolume(this.params.volume);
    }
  }

  onVideoPlayerReady() {
    this.seekTo(this.params['start-at']);
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      this.player.play();
      this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
    }
  
    this.playerElement.style.opacity = 1;
  }

  onVideoEnded() {
    if (this.params['start-at'] && this.params.loop) {
      this.seekTo(this.params['start-at']);
      this.player.play();
    }
  }

  onVideoTimeUpdate(event) {
    if (event.seconds >= this.params['end-at']) {
      this.seekTo(this.params['start-at']);
      if (!this.params.loop) this.pause();
    }
  }

  generatePlayerElement() {
    const playerElement = document.createElement('iframe');
    playerElement.setAttribute('frameborder', 0);
    playerElement.setAttribute('allow', 'autoplay; mute');

    return playerElement;
  }

  generateSrcURL() {
    let src = 'https://player.vimeo.com/video/'+this.vid+'?background=1&controls=0';
  
    if (this.params.muted) {
      src += '&muted=1';
    }
  
    if (this.params.autoplay && this.params['always-play']) {
      src += '&autoplay=1';
    }
  
    if (this.params.loop) {
      src += '&loop=1&autopause=0';
    }
  
    if (this.params['no-cookie']) {
      src += '&dnt=1';
    }
  
    //WARN❗️: this is a hash not a query param
    if (this.params['start-at']) {
      src += '#t=' + this.params['start-at'] + 's';
    }

    return src;
  }

  injectPlayer() {
    this.playerElement = this.generatePlayerElement();
    this.src = this.generateSrcURL();
    this.playerElement.src = this.src;
    this.playerElement.id = this.uid;
    
    this.stylePlayerElement(this.playerElement);
    this.element.appendChild(this.playerElement);
    this.resize(this.playerElement);
  }

  /* ===== API ===== */

  seekTo(time) {
    this.player.setCurrentTime(time);
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
      const self = this;
      this.player.getCurrentTime().then(function(seconds) {
        if (self.params['start-at'] && seconds < self.params['start-at']) {
          self.seekTo(self.params['start-at']);
        }
  
        if (self.params['end-at'] && seconds > self.params['end-at']) {
          self.seekTo(self.params['start-at']);
        }
      });
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
  
    if (!this.state.volume_once) {
      this.state.volume_once = true;
      this.setVolume(this.params.volume);
    }
    this.player.setMuted(false);
    this.element.dispatchEvent(new CustomEvent('video-background-unmute', { bubbles: true, detail: this }));
  }

  mute() {
    if (!this.player) return;
    this.state.muted = true;
  
    this.player.setMuted(true);
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }

  setVolume(volume) {
    if (!this.player) return;
  
    this.player.setVolume(volume);
    this.element.dispatchEvent(new CustomEvent('video-background-volume-change', { bubbles: true, detail: this }));
  }
}
