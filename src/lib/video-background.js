import { SuperVideoBackground } from './super-video-background.js';

export class VideoBackground extends SuperVideoBackground {
  constructor(elem, params, vid_data, uid) {
    super(elem, params, vid_data.link, uid, 'video');
    if (!vid_data || !vid_data.link) return;
    if (this.is_mobile && !this.params.mobile) return;

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

    this.currentState = 'notstarted';
    this.timeUpdateTimer = null;
    this.currentTime = 0 || this.params['start-at'];
    this.duration = 0 || this.params['end-at'];
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

    const self = this;

    this.player.addEventListener('loadedmetadata', this.onVideoLoadedMetadata.bind(this), { once: true });
    this.player.addEventListener('durationchange', this.onVideoLoadedMetadata.bind(this), { once: true });
    this.player.addEventListener('canplay', this.onVideoCanPlay.bind(this), { once: true });
    this.player.addEventListener('timeupdate', this.onVideoTimeUpdate.bind(this));
    this.player.addEventListener('play', this.onVideoPlay.bind(this));
    this.player.addEventListener('pause', this.onVideoPause.bind(this));
    this.player.addEventListener('waiting', this.onVideoBuffering.bind(this));
    this.player.addEventListener('ended', this.onVideoEnded.bind(this));
  }

  updateDuration() {
    if (!this.player) return;
    if (!this.duration && !this.params['end-at']) this.duration = this.player.duration;
  }

  updateState(state) {
    this.currentState = state;
    this.element.dispatchEvent(new CustomEvent('video-background-state-change', { bubbles: true, detail: this }));
  }

  /* ===== API ===== */

  onVideoLoadedMetadata() {
    this.updateDuration();
  }

  onVideoCanPlay() {
    this.updateDuration();
    this.playerElement.style.opacity = 1;

    if (this.params['start-at'] && this.params.autoplay) {
      this.seekTo(this.params['start-at']);
    }
  }

  onVideoTimeUpdate() {
    this.currentTime = this.player.currentTime;
    this.element.dispatchEvent(new CustomEvent('video-background-time-update', { bubbles: true, detail: this }));

    if (this.currentTime >= this.duration) {
      this.onVideoEnded();
    }
  }

  onVideoPlay() {
    this.updateState('playing');
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  onVideoPause() {
    this.updateState('paused');
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  onVideoEnded() {
    this.updateState('ended');

    if (this.params['start-at'] && this.params.loop) {
      this.seekTo(this.params['start-at']);
      this.play();
    }
  }

  onVideoBuffering() {
    this.updateState('buffering');
  }

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
      if (this.params['start-at'] && seconds <= this.params['start-at']) {
        this.seekTo(this.params['start-at']);
      }
  
      if (this.params['end-at'] && seconds >= this.params['end-at']) {
        this.seekTo(this.params['start-at']);
      }
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
