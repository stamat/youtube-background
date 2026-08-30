import { RE_VIDEO } from 'book-of-spells';

import { SuperVideoBackground } from './super-video-background.mjs';

export const MIME_MAP = {
  'ogv' : 'video/ogg',
  'ogm' : 'video/ogg',
  'ogg' : 'video/ogg',
  'avi' : 'video/x-msvideo',
  'mp4' : 'video/mp4',
  'webm' : 'video/webm',
  'm4v' : 'video/x-m4v',
  'mov' : 'video/quicktime',
  'qt' : 'video/quicktime',
};

export class VideoBackground extends SuperVideoBackground {
  constructor(elem, params, vid_data, uid, factoryInstance) {
    super(elem, params, vid_data ? vid_data.link : null, uid, 'video', factoryInstance);
    if (!vid_data || !vid_data.link) return;
    if (this.is_mobile && !this.params.mobile) return;

    this.src = vid_data.link;
    this.player = null;

    this.MIME_MAP = MIME_MAP;

    this.setMimeType(vid_data.id);

    this.injectPlayer();

    this.mobileLowBatteryAutoplayHack();
    this.dispatchEvent('video-background-ready');
  }

  setMimeType(source) {
    this.ext = /(?:\.([^.]+))?$/.exec(source)[1];
    this.mime = this.ext ? this.MIME_MAP[this.ext.toLowerCase()] : undefined;
  }

  generatePlayerElement() {
    const playerElement = document.createElement('video');
    if (this.params.title) playerElement.setAttribute('title', this.params.title);
    playerElement.setAttribute('playsinline', '');
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      playerElement.setAttribute('autoplay', '');
      playerElement.autoplay = true;
    }
    if (this.muted) {
      playerElement.setAttribute('muted', '');
      playerElement.muted = true;
    }

    return playerElement;
  }

  // native loop wraps to 0:00 and never fires 'ended', which would skip start-at
  // - with start-at the loop is driven from onVideoEnded instead. Re-run on every
  // start-at change, the attribute outlives the value it was decided from.
  syncNativeLoop() {
    if (!this.player) return;
    if (this.params.loop && !this.params['start-at']) {
      this.player.setAttribute('loop', '');
    } else {
      this.player.removeAttribute('loop');
    }
  }

  injectPlayer() {
    this.player = this.generatePlayerElement();
    this.playerElement = this.player;
    this.syncNativeLoop();

    if (this.volume !== 1 && !this.muted) this.setVolume(this.volume);
  
    this.playerElement.setAttribute('id', this.uid)
    
    this.stylePlayerElement(this.playerElement);

    this.player.addEventListener('loadedmetadata', this.onVideoLoadedMetadata.bind(this));
    this.player.addEventListener('durationchange', this.onVideoLoadedMetadata.bind(this));
    this.player.addEventListener('canplay', this.onVideoCanPlay.bind(this));
    this.player.addEventListener('timeupdate', this.onVideoTimeUpdate.bind(this));
    this.player.addEventListener('play', this.onVideoPlay.bind(this));
    this.player.addEventListener('pause', this.onVideoPause.bind(this));
    this.player.addEventListener('waiting', this.onVideoBuffering.bind(this));
    this.player.addEventListener('ended', this.onVideoEnded.bind(this));

    this.element.appendChild(this.playerElement);
    const source = document.createElement('source');
    source.setAttribute('src', this.src);
    // an unknown extension is better left to the browser to sniff than mislabelled
    if (this.mime) source.setAttribute('type', this.mime);
    this.playerElement.appendChild(source);
    this.resize(this.playerElement);
  }

  updateState(state) {
    this.currentState = state;
    this.dispatchEvent('video-background-state-change');
  }

  /* ===== API ===== */

  setStartAt(startAt) {
    super.setStartAt(startAt);
    this.syncNativeLoop();
  }

  setSource(url) {
    const pts = url.match(RE_VIDEO);
    if (!pts || !pts.length) return;

    const start = this.startsAfterSwap();

    this.id = pts[1];
    this.setMimeType(this.id);
    this.playerElement.innerHTML = '';
    const source = document.createElement('source');
    source.setAttribute('src', url);
    if (this.mime) source.setAttribute('type', this.mime);
    this.playerElement.appendChild(source);
    this.src = url;
    this.resetProgress();

    // source children are read by the load algorithm and nowhere else - without this
    // the element plays on with the file it already has; load() also re-arms the
    // autoplay attribute, so a video that is to wait loses it first
    this.player.autoplay = start;
    this.player.load();
    if (start) this.player.play();

    this.writeSourceAttributes(url);
  }

  onVideoLoadedMetadata() {
    this.setDuration(this.player.duration);
  }

  onVideoCanPlay() {
    this.setDuration(this.player.duration);
  }

  onVideoTimeUpdate() {
    this.currentTime = this.player.currentTime;
    this.percentComplete = this.timeToPercentage(this.player.currentTime);
    this.dispatchEvent('video-background-time-update');

    if (this.params['end-at'] && this.currentTime >= this.duration) {
      this.onVideoEnded();
    }
  }

  onVideoPlay() {
    if (!this.initialPlay) {
      this.initialPlay = true;
      this.playerElement.style.opacity = 1;
    }
    
    const seconds = this.player.currentTime;
    if (this.params['start-at'] && seconds <= this.params['start-at']) {
      this.seekTo(this.params['start-at']);
    }

    if (this.duration && seconds >= this.duration) {
      this.seekTo(this.params['start-at']);
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
    if (this.paused || !this.params.loop) return this.pause();

    this.seekTo(this.params['start-at']);
    if (this.player.paused) {
      // native 'ended' stopped playback - restart it, the resulting 'play'
      // event drives onVideoPlay
      this.player.play();
    } else {
      // end-at cut in from timeupdate, playback never stopped - just
      // re-announce the state
      this.onVideoPlay();
    }
  }

  onVideoBuffering() {
    this.updateState('buffering');
  }

  seek(percentage) {
    this.seekTo(this.percentageToTime(percentage));
  }

  seekTo(seconds) {
    if (!this.player) return;
    if (typeof this.player.fastSeek === 'function') {
      this.player.fastSeek(seconds);
    } else {
      this.player.currentTime = seconds;
    }
    this.dispatchEvent('video-background-seeked');
  }

  softPause() {
    if (!this.player || this.currentState === 'paused') return;
    this.player.pause();
  }

  softPlay() {
    if (!this.player || this.currentState === 'playing') return;
    this.player.play();
  }

  play() {
    if (!this.player) return;
    this.paused = false;

    this.player.play();
  }

  pause() {
    if (!this.player) return;
    this.paused = true;
  
    this.player.pause();
  }

  unmute() {
    if (!this.player) return;
    this.muted = false;
  
    this.player.muted = false;
    if (!this.initialVolume) {
      this.initialVolume = true;
      this.setVolume(this.params.volume);
    }
    this.dispatchEvent('video-background-unmute');
  }

  mute() {
    if (!this.player) return;
    this.muted = true;
  
    this.player.muted = true;
    this.dispatchEvent('video-background-mute');
  }

  getVolume() {
    if (!this.player) return;
    return this.player.volume;
  }

  setVolume(volume) {
    if (!this.player) return;
    this.volume = volume;
  
    this.player.volume = volume;
    this.dispatchEvent('video-background-volume-change');
  }
}
