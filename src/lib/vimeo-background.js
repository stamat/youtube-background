import { SuperVideoBackground } from './super-video-background.js';

export class VimeoBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid) {
    super(elem, params, id, uid, 'vimeo');
    if (!id) return;
    if (this.is_mobile && !this.params.mobile) return;
    this.injectScript();

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
    if (this.params['lazyloading']) playerElement.setAttribute('loading', 'lazy');

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
    this.dispatchEvent('video-background-state-change');
  }

  /* ===== API ===== */

  onVideoPlayerReady() {
    this.mobileLowBatteryAutoplayHack();
    this.seekTo(this.params['start-at']);

    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      this.player.play();
    }

    this.player.getDuration().then((duration) => {
      this.setDuration(duration);
    });

    this.dispatchEvent('video-background-ready');
  }

  onVideoEnded() {
    this.updateState('ended');
    this.dispatchEvent('video-background-ended');
    if (!this.params.loop) return this.pause();
      
    this.updateState('playing');
    this.dispatchEvent('video-background-play');
  }

  onVideoTimeUpdate(event) {
    this.currentTime = event.seconds;
    this.dispatchEvent('video-background-time-update');

    if (this.duration && event.seconds >= this.duration) {
      this.onVideoEnded();
    }
  }

  onVideoBuffering() {
    this.updateState('buffering');
  }

  onVideoPlay(event) {
    if (!this.initialPlay) {
      this.initialPlay = true;
      this.playerElement.style.opacity = 1;
    }

    this.setDuration(event.duration);

    const seconds = event.seconds;
    if (self.params['start-at'] && seconds < self.params['start-at']) {
      self.seekTo(self.params['start-at']);
    }

    if (self.duration && seconds >= self.duration) {
      self.seekTo(self.params['start-at']);
    }

    this.updateState('playing');
    this.dispatchEvent('video-background-play');
  }

  onVideoPause() {
    this.updateState('paused');
    this.dispatchEvent('video-background-pause');
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
  
    if (!this.initialVolume) {
      this.initialVolume = true;
      this.setVolume(this.params.volume);
    }
    this.player.setMuted(false);
    this.dispatchEvent('video-background-unmute');
  }

  mute() {
    if (!this.player) return;
    this.state.muted = true;
  
    this.player.setMuted(true);
    this.dispatchEvent('video-background-mute');
  }

  setVolume(volume) {
    if (!this.player) return;
  
    this.player.setVolume(volume);
    this.dispatchEvent('video-background-volume-change');
  }
}
