import { SuperVideoBackground } from './super-video-background.js';

export class VimeoBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid) {
    super(elem, params, id, uid, 'vimeo');
    if (!id) return;
    if (this.is_mobile && !this.params.mobile) return;
    this.injectScript();

    this.player = null;

    this.injectPlayer();

    this.currentState = 'notstarted';
    this.currentTime = 0 || this.params['start-at'];
    this.duration = 0 || this.params['end-at'];
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
      this.player.on('play', this.onVideoPlay.bind(this));
      this.player.on('pause', this.onVideoPause.bind(this));
      this.player.on('bufferstart', this.onVideoBuffering.bind(this));
      this.player.on('timeupdate', this.onVideoTimeUpdate.bind(this));

      if (this.params.volume !== 1 && !this.params.muted) this.setVolume(this.params.volume);
    }
  }

  generatePlayerElement() {
    const playerElement = document.createElement('iframe');
    playerElement.setAttribute('frameborder', 0);
    playerElement.setAttribute('allow', 'autoplay; mute');

    return playerElement;
  }

  generateSrcURL(id) {
    let src = 'https://player.vimeo.com/video/'+id+'?background=1&controls=0';
  
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
    this.src = this.generateSrcURL(this.id);
    this.playerElement.src = this.src;
    this.playerElement.id = this.uid;
    
    this.stylePlayerElement(this.playerElement);
    this.element.appendChild(this.playerElement);
    this.resize(this.playerElement);
  }

  updateState(state) {
    this.currentState = state;
    this.element.dispatchEvent(new CustomEvent('video-background-state-change', { bubbles: true, detail: this }));
  }

  /* ===== API ===== */

  onVideoPlayerReady() {
    this.seekTo(this.params['start-at']);
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      this.player.play();
    }

    if (!this.params['end-at']) {
      this.player.getDuration().then((duration) => {
        this.duration = duration;
      });
    }
  
    this.playerElement.style.opacity = 1;
  }

  onVideoEnded() {
    this.updateState('ended');
    if (this.params['start-at'] && this.params.loop) {
      this.seekTo(this.params['start-at']);
      this.player.play();
    }
  }

  onVideoTimeUpdate(event) {
    this.currentTime = event.seconds;
    this.element.dispatchEvent(new CustomEvent('video-background-time-update', { bubbles: true, detail: this }));

    if (this.params['end-at'] && event.seconds >= this.params['end-at']) {
      this.updateState('ended');
      this.seekTo(this.params['start-at']);
      if (!this.params.loop) {
        this.pause();
        return;
      }
    }
  }

  onVideoBuffering() {
    this.updateState('buffering');
  }

  onVideoPlay() {
    this.updateState('playing');
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  onVideoPause() {
    this.updateState('paused');
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  seekTo(time) {
    this.player.setCurrentTime(time);
  }

  softPause() {
    if (!this.state.playing || !this.player) return;
    this.player.pause();
  }

  softPlay() {
    if (!this.state.playing || !this.player) return;
    this.player.play();
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
  }

  pause() {
    if (!this.player) return;
    this.state.playing = false;
  
    this.player.pause();
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
