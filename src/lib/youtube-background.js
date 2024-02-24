import { SuperVideoBackground } from './super-video-background.js';
import { RE_YOUTUBE } from 'book-of-spells';

export class YoutubeBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid, factoryInstance) {
    super(elem, params, id, uid, 'youtube', factoryInstance);

    if (!id) return;
    if (this.is_mobile && !this.params.mobile) return;
    this.injectScript();

    this.player = null;

    this.injectPlayer();

    this.STATES = {
      '-1': 'notstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'cued'
    };

    this.timeUpdateTimer = null;
    this.timeUpdateInterval = 250;

    this.initYTPlayer();
  }

  startTimeUpdateTimer() {
    if (this.timeUpdateTimer) return;
    this.timeUpdateTimer = setInterval(this.onVideoTimeUpdate.bind(this), this.timeUpdateInterval);
  };

  stopTimeUpdateTimer() {
    clearInterval(this.timeUpdateTimer);
    this.timeUpdateTimer = null;
  };

  convertState(state) {
    return this.STATES[state];
  }

  initYTPlayer() {
    if (!window.hasOwnProperty('YT') || this.player !== null) return;

    this.player = new YT.Player(this.uid, {
      events: {
        'onReady': this.onVideoPlayerReady.bind(this),
        'onStateChange': this.onVideoStateChange.bind(this),
        // 'onError': this.onVideoError.bind(this)
      }
    });

    if (this.volume !== 1 && !this.muted) this.setVolume(this.volume);
  }

  onVideoError(event) {
    console.error(event);
  }

  injectScript() {
    if (window.hasOwnProperty('YT') || document.querySelector('script[src="https://www.youtube.com/player_api"]')) return
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  generatePlayerElement() {
    const playerElement = document.createElement('iframe');
    if (this.params.title) playerElement.setAttribute('title', this.params.title);
    playerElement.setAttribute('frameborder', 0);
    playerElement.setAttribute('allow', 'autoplay; mute');
    if (this.params['lazyloading']) playerElement.setAttribute('loading', 'lazy');

    return playerElement;
  }

  generateSrcURL(id) {
    let site = 'https://www.youtube.com/embed/';
    if (this.params['no-cookie']) {
      site = 'https://www.youtube-nocookie.com/embed/';
    }
    let src = `${site}${id}?&enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0`;

    if (this.params.muted) {
      src += '&mute=1';
    }
  
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      src += '&autoplay=1';
    }
  
    if (this.params.loop) {
      src += '&loop=1';
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

  /* ===== API ===== */

  setSource(url) {
    const pts = url.match(RE_YOUTUBE);
    if (!pts || !pts.length) return;

    this.id = pts[1];
    this.src = this.generateSrcURL(this.id);
    this.playerElement.src = this.src;

    if (this.element.hasAttribute('data-vbg')) this.element.setAttribute('data-vbg', this.src);
    if (this.element.hasAttribute('data-ytbg')) this.element.setAttribute('data-ytbg', this.src);
    this.loadBackground(this.id);
  }

  onVideoTimeUpdate() {
    const ctime = this.player.getCurrentTime();
    if (ctime === this.currentTime) return;
    this.currentTime = ctime;
    this.percentComplete = this.timeToPercentage(this.currentTime);
    if (this.params['end-at'] && this.duration && this.currentTime >= this.duration) {
      this.currentState = 'ended';
      this.dispatchEvent('video-background-state-change');
      this.onVideoEnded();
      this.stopTimeUpdateTimer();
      return;
    }
    this.dispatchEvent('video-background-time-update');
  }

  onVideoPlayerReady() {
    this.mobileLowBatteryAutoplayHack();

    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      if (this.params['start-at']) this.seekTo(this.params['start-at']);
      this.player.playVideo();
    }

    this.setDuration(this.player.getDuration());

    this.dispatchEvent('video-background-ready');
  }

  onVideoStateChange(event) {
    this.currentState = this.convertState(event.data);

    if (this.currentState === 'ended') this.onVideoEnded();
  
    if (this.currentState === 'notstarted' && this.params.autoplay) {
      this.seekTo(this.params['start-at']);
      this.player.playVideo();
    }

    if (this.currentState === 'playing') this.onVideoPlay();
    
    if (this.currentState === 'paused') this.onVideoPause();

    this.dispatchEvent('video-background-state-change');
  }

  onVideoPlay() {
    if (!this.initialPlay) {
      this.initialPlay = true;
      this.playerElement.style.opacity = 1;
    }

    const seconds = this.player.getCurrentTime();
    if (this.params['start-at'] && seconds < this.params['start-at'] ) {
      this.seekTo(this.params['start-at']);
    }

    if (this.duration && seconds >= this.duration) {
      this.seekTo(this.params['start-at']);
    }

    if (!this.duration) {
      this.setDuration(this.player.getDuration());
    }

    this.dispatchEvent('video-background-play');
    this.startTimeUpdateTimer();
  }

  onVideoPause() {
    this.stopTimeUpdateTimer();
    this.dispatchEvent('video-background-pause');
  }

  onVideoEnded() {
    this.dispatchEvent('video-background-ended');

    if (!this.params.loop) return this.pause();
    this.seekTo(this.params['start-at']);
    this.player.playVideo();
  }

  seek(percentage) {
    this.seekTo(this.percentageToTime(percentage), true);
  }

  seekTo(seconds, allowSeekAhead = true) {
    if (!this.player) return;
    this.player.seekTo(seconds, allowSeekAhead);
    this.dispatchEvent('video-background-seeked');
  }

  softPause() {
    if (!this.player || this.currentState === 'paused') return;
    this.stopTimeUpdateTimer();
    this.player.pauseVideo();
  }

  softPlay() {
    if (!this.player || this.currentState === 'playing') return;
    this.player.playVideo();
  }

  play() {
    if (!this.player) return;
    this.paused = false;
  
    this.player.playVideo();
  }

  pause() {
    if (!this.player) return;
    this.paused = true;
    this.stopTimeUpdateTimer();
    this.player.pauseVideo();
  }

  unmute() {
    if (!this.player) return;
    this.muted = false;
  
    if (!this.initialVolume) {
      this.initialVolume = true;
      this.setVolume(this.params.volume);
    }
    this.player.unMute();
    this.dispatchEvent('video-background-unmute');
  }

  mute() {
    if (!this.player) return;
    this.muted = true;
  
    this.player.mute();
    this.dispatchEvent('video-background-mute');
  }

  getVolume() {
    if (!this.player) return;
    return this.player.getVolume() / 100;
  }

  setVolume(volume) {
    if (!this.player) return;
    this.volume = volume;
    
    this.player.setVolume(volume * 100);
    this.dispatchEvent('video-background-volume-change');
  }
}
 