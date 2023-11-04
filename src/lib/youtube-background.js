import { SuperVideoBackground } from './super-video-background.js';

export class YoutubeBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid) {
    super(elem, params, id, uid, 'youtube');

    if (!id) return;
    this.injectScript();

    this.ytid = id;
    this.player = null;

    this.injectPlayer();
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

  onVideoPlayerReady(event) {
    this.seekTo(this.params['start-at']);
  
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      this.player.playVideo();
      this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
    }
  
    this.playerElement.style.opacity = 1;
  }

  onVideoStateChange(event) {
    if (event.data === 0 && this.params.loop) {
      this.seekTo(this.params['start-at']);
      this.player.playVideo();
    }
  
    if (event.data === -1 && this.params.autoplay) {
      this.seekTo(this.params['start-at']);
      this.player.playVideo();
      this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
    }
  
    this.params["onStatusChange"](event);
  }

  generatePlayerElement() {
    const playerElement = document.createElement('iframe');
    playerElement.setAttribute('frameborder', 0);
    playerElement.setAttribute('allow', 'autoplay; mute');

    return playerElement;
  }

  generateSrcURL() {
    let site = 'https://www.youtube.com/embed/';
    if (this.params['no-cookie']) {
      site = 'https://www.youtube-nocookie.com/embed/';
    }
    let src = `${site}${this.ytid}?&enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0`;

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
    this.src = this.generateSrcURL();
    this.playerElement.src = this.src;
    this.playerElement.id = this.uid;

    this.stylePlayerElement(this.playerElement);
    this.element.appendChild(this.playerElement);
    this.resize(this.playerElement);
  }

  /* ===== API ===== */

  seekTo(seconds, allowSeekAhead = true) {
    this.player.seekTo(seconds, allowSeekAhead);
  }

  softPause() {
    if (!this.state.playing || !this.player) return;
    this.player.pauseVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  softPlay() {
    if (!this.state.playing || !this.player) return;
    this.player.playVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  play() {
    if (!this.player) return;
    this.state.playing = true;
  
    if (this.params['start-at'] && this.player.getCurrentTime() < this.params['start-at'] ) {
      this.seekTo(this.params['start-at']);
    }
    this.player.playVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  pause() {
    this.state.playing = false;
  
    this.player.pauseVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  unmute() {
    if (!this.player) return;
    this.state.muted = false;
  
    if (!this.state.volume_once) {
      this.state.volume_once = true;
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
