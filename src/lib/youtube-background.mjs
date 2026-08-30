import { SuperVideoBackground } from './super-video-background.mjs';
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
    if (!Object.prototype.hasOwnProperty.call(window, 'YT') || this.player !== null) return;

    this.player = new YT.Player(this.uid, {
      events: {
        'onReady': this.onVideoPlayerReady.bind(this),
        'onStateChange': this.onVideoStateChange.bind(this)
      }
    });

    if (this.volume !== 1 && !this.muted) this.setVolume(this.volume);
  }

  injectScript() {
    const src = 'https://www.youtube.com/player_api';
    if (Object.prototype.hasOwnProperty.call(window, 'YT') || document.querySelector(`script[src="${src}"]`)) return
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = src;
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

    // the live state, not the initial params: a reload after the user unmuted or
    // paused has to come back the way they left it
    if (this.muted) {
      src += '&mute=1';
    }
  
    if (!this.paused && this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      src += '&autoplay=1';
    }
  
    // no &loop=1 here: the embed ignores it unless it is paired with a playlist
    // parameter, and looping is driven from onVideoEnded() anyway so it honours start-at

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

    const start = this.startsAfterSwap();

    this.id = pts[1];
    this.src = this.generateSrcURL(this.id);
    this.resetProgress();

    // A new iframe src navigates away from the document the API shook hands with: no
    // more state changes, so no more loop, and the fresh embed takes mute and autoplay
    // from the URL rather than from the player. Only a swap before the player exists
    // has to pay that.
    // the API attaches the playback methods on its handshake, so a player object alone
    // is not one that can be driven yet
    if (this.player && this.player.loadVideoById) {
      const request = { videoId: this.id, startSeconds: this.params['start-at'] || 0 };
      if (start) {
        this.player.loadVideoById(request);
      } else {
        this.player.cueVideoById(request);
      }
    } else if (this.playerElement) {
      this.playerElement.src = this.src;
    }

    this.writeSourceAttributes(url);
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
  
    // same gate as onVideoPlayerReady: YT fires 'notstarted' on load, and
    // an unconditional play here started lazy videos that were offscreen
    if (this.currentState === 'notstarted' && this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
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

    if (this.paused || !this.params.loop) return this.pause();
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
 