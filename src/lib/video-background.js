import { SuperVideoBackground } from './super-video-background.js';
import { RE_VIDEO } from 'book-of-spells';

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

    this.MIME_MAP = {
      'ogv' : 'video/ogg',
      'ogm' : 'video/ogg',
      'ogg' : 'video/ogg',
      'avi' : 'video/avi',
      'mp4' : 'video/mp4',
      'webm' : 'video/webm'
    };

    this.mime = this.MIME_MAP[this.ext.toLowerCase()];

    this.injectPlayer();

    this.mobileLowBatteryAutoplayHack();
    this.dispatchEvent('video-background-ready');
  }

  generatePlayerElement() {
    const playerElement = document.createElement('video');
    playerElement.toggleAttribute('playsinline', true);
    playerElement.toggleAttribute('loop', this.params.loop);
    playerElement.toggleAttribute('autoplay', this.params.autoplay && (this.params['always-play'] || this.isIntersecting));
    playerElement.toggleAttribute('muted', this.params.muted);
    if (this.params['lazyloading']) playerElement.setAttribute('loading', 'lazy');

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

    this.player.addEventListener('loadedmetadata', this.onVideoLoadedMetadata.bind(this));
    this.player.addEventListener('durationchange', this.onVideoLoadedMetadata.bind(this));
    this.player.addEventListener('canplay', this.onVideoCanPlay.bind(this));
    this.player.addEventListener('timeupdate', this.onVideoTimeUpdate.bind(this));
    this.player.addEventListener('play', this.onVideoPlay.bind(this));
    this.player.addEventListener('pause', this.onVideoPause.bind(this));
    this.player.addEventListener('waiting', this.onVideoBuffering.bind(this));
    this.player.addEventListener('ended', this.onVideoEnded.bind(this));
  }

  updateState(state) {
    this.currentState = state;
    this.dispatchEvent('video-background-state-change');
  }

  /* ===== API ===== */

  setSource(url) {
    const pts = url.match(RE_VIDEO);
    if (!pts || !pts.length) return;
    this.id = pts[1];
    this.ext = /(?:\.([^.]+))?$/.exec(this.id)[1];
    this.mime = this.MIME_MAP[this.ext.toLowerCase()];
    this.playerElement.innerHTML = '';
    const source = document.createElement('source');
    source.setAttribute('src', url);
    source.setAttribute('type', this.mime);
    this.playerElement.appendChild(source);
    this.src = url;

    if (this.element.hasAttribute('data-vbg')) this.element.setAttribute('data-vbg', this.src);
    if (this.element.hasAttribute('data-ytbg')) this.element.setAttribute('data-ytbg', this.src);
  }

  onVideoLoadedMetadata() {
    this.setDuration(this.player.duration);
  }

  onVideoCanPlay() {
    this.setDuration(this.player.duration);

    if (this.params['start-at'] && this.params.autoplay) {
      this.seekTo(this.params['start-at']);
    }
  }

  onVideoTimeUpdate() {
    this.currentTime = this.player.currentTime;
    this.percentComplete = this.timeToPercentage(this.player.currentTime);
    this.dispatchEvent('video-background-time-update');

    if (this.currentTime >= this.duration) {
      this.onVideoEnded();
    }
  }

  onVideoPlay() {
    if (!this.initialPlay) {
      this.initialPlay = true;
      this.playerElement.style.opacity = 1;
    }

    this.updateState('playing');
    this.dispatchEvent('video-background-play');
  }

  onVideoPause() {
    this.updateState('paused');
    this.dispatchEvent('video-background-pause');
  }

  onVideoEnded() {
    this.updateState('ended');
    this.dispatchEvent('video-background-ended');
    if (!this.params.loop) return this.pause();
      
    this.seekTo(this.params['start-at']);
    this.onVideoPlay();
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
  }

  softPlay() {
    if (!this.state.playing || !this.player) return;
    this.player.play();
  }

  play() {
    if (!this.player) return;
  
    const seconds = this.player.currentTime;
    
    if (this.params['start-at'] && seconds <= this.params['start-at']) {
      this.seekTo(this.params['start-at']);
    }

    if (this.duration && seconds >= this.duration) {
      this.seekTo(this.params['start-at']);
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
    if (!this.initialVolume) {
      this.initialVolume = true;
      this.setVolume(this.params.volume);
    }
    this.dispatchEvent('video-background-unmute');
  }

  mute() {
    if (!this.player) return;
    this.state.muted = true;
  
    this.player.muted = true;
    this.dispatchEvent('video-background-mute');
  }

  setVolume(volume) {
    if (!this.player) return;
  
    this.player.volume = volume;
    this.dispatchEvent('video-background-volume-change');
  }
}
