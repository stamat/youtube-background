import { addClass, removeClass, parseProperties, generateActionButton } from './utils.js';
import { isMobile, parseResolutionString, proportionalParentCoverResize } from 'book-of-spells';

import { SuperVideoBackground } from './super-video-background.js';

export class VimeoBackground extends SuperVideoBackground {
  constructor(elem, params, id, uid) {
    super(elem, params, id, uid);

    this.type = 'vimeo';

    this.is_mobile = isMobile();

    this.element = elem;
    this.vid = id;
    this.uid = uid;
    this.element.setAttribute('data-vbg-uid', uid);
    this.player = null;
    this.buttons = {};

    this.state = {};
    this.state.playing = false;
    this.state.muted = false;
    this.state.volume_once = false;

    this.params = {};

    const DEFAULTS = {
      'pause': false, //deprecated
      'play-button': false,
      'mute-button': false,
      'autoplay': true,
      'muted': true,
      'loop': true,
      'mobile': true,
      'load-background': false,
      'resolution': '16:9',
      'inline-styles': true,
      'fit-box': false,
      'offset': 2,
      'start-at': 0,
      'end-at': 0,
      'poster': null,
      'always-play': false,
      'volume': 1,
      'no-cookie': true,
    };

    this.injectScript();

    if (!this.vid) {
      return;
    }

    this.params = parseProperties(params, DEFAULTS, this.element, ['data-ytbg-', 'data-vbg-']);
    
    //pause deprecated
    if (this.params.pause) {
      this.params['play-button'] = this.params.pause;
    }
    this.params.resolution_mod = parseResolutionString(this.params.resolution);
    this.state.playing = this.params.autoplay;
    this.state.muted = this.params.muted;

    this.buildWrapperHTML();

    if (this.is_mobile && !this.params.mobile) {
      return;
    }

    this.injectPlayer();

    if (this.params['play-button']) {
      generateActionButton(this, {
        name: 'play',
        className: 'play-toggle',
        innerHtml: '<i class="fa"></i>',
        initialState: false,
        stateClassName: 'paused',
        condition_parameter: 'autoplay',
        stateChildClassNames: ['fa-pause-circle', 'fa-play-circle'],
        actions: ['play', 'pause']
      });
    }

    if (this.params['mute-button']) {
      generateActionButton(this, {
        name: 'mute',
        className: 'mute-toggle',
        innerHtml: '<i class="fa"></i>',
        initialState: true,
        stateClassName: 'muted',
        condition_parameter: 'muted',
        stateChildClassNames: ['fa-volume-up', 'fa-volume-mute'],
        actions: ['unmute', 'mute']
      });
    }
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
      this.player = new Vimeo.Player(this.iframe);
  
      this.player.on('loaded', this.onVideoPlayerReady.bind(this));
      this.player.on('ended', this.onVideoEnded.bind(this));
      
      if (this.params['end-at'] > 0) this.player.on('timeupdate', this.onVideoTimeUpdate.bind(this));
      if (this.params.volume !== 1 && !this.params.muted) this.setVolume(this.params.volume);
    }
  }

  resize() {
    if (this.params['fit-box']) return;
    proportionalParentCoverResize(this.iframe, this.params.resolution_mod, this.params.offset);
  }

  seekTo(time) {
    this.player.setCurrentTime(time);
  }

  onVideoPlayerReady() {
    this.seekTo(this.params['start-at']);
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      this.player.play();
      this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
    }
  
    this.iframe.style.opacity = 1;
  }

  onVideoEnded() {
    if (this.params['start-at'] && this.params.loop) {
      this.seekTo(this.params['start-at']);
      this.player.play();
    }
  }

  onVideoTimeUpdate(event) {
    if (event.seconds >= this.params['end-at']) {
      this.seekTo(this.params['start-at']);
      if (!this.params.loop) this.pause();
    }
  }

  injectPlayer() {
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('frameborder', 0);
    this.iframe.setAttribute('allow', ['autoplay; mute']);
    let src = 'https://player.vimeo.com/video/'+this.vid+'?background=1&controls=0';
  
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
  
    //WARN❗️ this is a hash not a query param
    if (this.params['start-at']) {
      src += '#t=' + this.params['start-at'] + 's';
    }
  
    this.iframe.src = src;
  
    if (this.uid) {
      this.iframe.id = this.uid;
    }
  
    if (this.params['inline-styles']) {
      this.iframe.style.top = '50%';
      this.iframe.style.left = '50%';
      this.iframe.style.transform = 'translateX(-50%) translateY(-50%)';
      this.iframe.style.position = 'absolute';
      this.iframe.style.opacity = 1;
    }
  
    this.element.appendChild(this.iframe);
  
    if (this.params['fit-box']) {
      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
    } else {
      this.resize();
    }
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
  
    //TODO: solve this with ARIA toggle states. P.S. warning repetitive code!!!
    if (this.buttons.hasOwnProperty('play')) {
      const btn_obj = this.buttons.play;
      removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
      addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
      removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
    }
  
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
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  pause() {
    if (!this.player) return;
  
    //TODO: solve this with ARIA toggle states
    if (this.buttons.hasOwnProperty('play')) {
      const btn_obj = this.buttons.play;
      addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
      removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
      addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
    }
  
    this.state.playing = false;
  
    this.player.pause();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }

  unmute() {
    if (!this.player) return;
  
    //TODO: solve this with ARIA toggle states
    if (this.buttons.hasOwnProperty('mute')) {
      const btn_obj = this.buttons.mute;
      removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
      addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
      removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
    }
  
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
  
    //TODO: solve this with ARIA toggle states
    if (this.buttons.hasOwnProperty('mute')) {
      const btn_obj = this.buttons.mute;
      addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
      removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
      addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
    }
  
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
