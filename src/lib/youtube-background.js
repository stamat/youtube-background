import { SuperVideoBackground } from './super-video-background.js';
import { RE_YOUTUBE } from 'book-of-spells';

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
      '5': 'cued'
    };

    this.timeUpdateTimer = null;
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
      src += `&end=${Math.ceil(this.params['end-at'])}`;
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

  setDuration(duration) {
    if (this.duration === duration) return;
    if (this.params['end-at'] && duration > this.params['end-at']) this.duration = this.params['end-at'];
    if (duration < this.params['end-at']) {
      this.duration = duration;
    }
    if (duration <= 0) this.duration = this.params['end-at'];
  }

  /* ===== API ===== */

  setSource(url) {
    const pts = url.match(RE_YOUTUBE);
    if (!pts || !pts.length) return;

    this.id = pts[1];
    this.src = this.generateSrcURL(this.id);
    this.playerElement.src = this.src;
  }

  onVideoTimeUpdate() {
    const ctime = this.player.getCurrentTime();
    if (ctime === this.currentTime) return;
    this.currentTime = ctime;
    if (this.duration && this.currentTime >= this.duration) {
      this.currentState = 'ended';
      this.dispatchEvent('video-background-state-change');
      this.onVideoEnded();
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
      
      if (!this.duration) {
        this.setDuration(this.player.getDuration());
      }
      this.dispatchEvent('video-background-play');
      this.startTimeUpdateTimer();
    } else {
      this.dispatchEvent('video-background-pause');
      this.stopTimeUpdateTimer();
    }

    this.dispatchEvent('video-background-state-change');
  }

  onVideoEnded() {
    this.dispatchEvent('video-background-ended');

    if (!this.params.loop) return this.player.pause();
    this.seekTo(this.params['start-at']);
    this.player.playVideo();
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
    this.dispatchEvent('video-background-unmute');
  }

  mute() {
    if (!this.player) return;
    this.state.muted = true;
  
    this.player.mute();
    this.dispatchEvent('video-background-mute');
  }

  setVolume(volume) {
    if (!this.player) return;
    
    this.player.setVolume(volume * 100);
    this.dispatchEvent('video-background-volume-change');
  }
}
