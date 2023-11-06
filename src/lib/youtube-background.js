import { SuperVideoBackground } from './super-video-background.js';

export class YoutubeBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid) {
    super(elem, params, id, uid, 'youtube');

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
      '5': 'videocued'
    };

    this.currentState = 'notstarted';
    this.timeUpdateTimer = null;
    this.currentTime = 0 || this.params['start-at'];
    this.duration = 0 || this.params['end-at'];

    this.timeUpdateInterval = 250;
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
    if (window.hasOwnProperty('YT') && this.player === null) {
      this.player = new YT.Player(this.uid, {
        events: {
          'onReady': this.onVideoPlayerReady.bind(this),
          'onStateChange': this.onVideoStateChange.bind(this)
        }
      });
    }
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
  
    if (this.params.autoplay && this.params['always-play']) {
      src += '&autoplay=1';
    }
  
    if (this.params.loop) {
      src += '&loop=1';
    }
  
    if (this.params['end-at'] > 0) {
      src += `&end=${this.params['end-at']}`;
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

  onVideoTimeUpdate() {
    const ctime = this.player.getCurrentTime();
    if (ctime === this.currentTime) return;
    this.currentTime = ctime;
    if (this.params['end-at'] && this.currentTime >= this.params['end-at']) {
      this.currentState = 'ended';
      this.element.dispatchEvent(new CustomEvent('video-background-state-change', { bubbles: true, detail: this }));
      this.onVideoEnded();
    }
    this.element.dispatchEvent(new CustomEvent('video-background-time-update', { bubbles: true, detail: this }));
  }

  onVideoPlayerReady() {
    this.mobileLowBatteryAutoplayHack();
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      if (this.params['start-at']) this.seekTo(this.params['start-at']);
      this.player.playVideo();
    }

    if (!this.params['end-at']) {
      this.duration = this.player.getDuration();
    }

    this.element.dispatchEvent(new CustomEvent('video-background-ready', { bubbles: true, detail: this }));
  }

  onVideoStateChange(event) {
    this.currentState = this.convertState(event.data);

    if (this.currentState === 'ended') {
      this.onVideoEnded();
    }
  
    if (this.currentState === 'notstarted' && this.params.autoplay) {
      this.seekTo(this.params['start-at']);
      this.player.playVideo();
    }

    if (this.currentState === 'playing') {
      if (!this.initialPlay) {
        this.initialPlay = true;
        this.playerElement.style.opacity = 1;
      }
      
      if (!this.duration && !this.params['end-at']) {
        this.duration = this.player.getDuration();
      }
      this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
      this.startTimeUpdateTimer();
    } else {
      this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
      this.stopTimeUpdateTimer();
    }

    this.element.dispatchEvent(new CustomEvent('video-background-state-change', { bubbles: true, detail: this }));
  }

  onVideoEnded() {
    if (this.params.loop) {
      this.seekTo(this.params['start-at']);
      this.player.playVideo();
    } else {
      this.player.pause();
    }

    this.element.dispatchEvent(new CustomEvent('video-background-ended', { bubbles: true, detail: this }));
  }

  seekTo(seconds, allowSeekAhead = true) {
    this.player.seekTo(seconds, allowSeekAhead);
  }

  softPause() {
    if (!this.state.playing || !this.player) return;
    this.player.pauseVideo();
  }

  softPlay() {
    if (!this.state.playing || !this.player) return;
    this.player.playVideo();
  }

  play() {
    if (!this.player) return;
    this.state.playing = true;
  
    if (this.params['start-at'] && this.player.getCurrentTime() < this.params['start-at'] ) {
      this.seekTo(this.params['start-at']);
    }
    this.player.playVideo();
  }

  pause() {
    this.state.playing = false;
    this.player.pauseVideo();
  }

  unmute() {
    if (!this.player) return;
    this.state.muted = false;
  
    if (!this.initialVolume) {
      this.initialVolume = true;
      this.setVolume(this.params.volume);
    }
    this.player.unMute();
    this.element.dispatchEvent(new CustomEvent('video-background-unmute', { bubbles: true, detail: this }));
  }

  mute() {
    if (!this.player) return;
    this.state.muted = true;
  
    this.player.mute();
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }

  setVolume(volume) {
    if (!this.player) return;
    
    this.player.setVolume(volume * 100);
    this.element.dispatchEvent(new CustomEvent('video-background-volume-change', { bubbles: true, detail: this }));
  }
}
