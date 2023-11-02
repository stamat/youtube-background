import { addClass, removeClass, parseProperties, generateActionButton } from './utils.js';
import { isMobile, parseResolutionString, proportionalParentCoverResize } from 'book-of-spells';

export class YoutubeBackground {
  constructor(elem, params, id, uid) {
    this.is_mobile = isMobile();

    this.element = elem;
    this.ytid = id;
    this.uid = uid;
    this.element.setAttribute('data-vbg-uid', uid);
    this.player = null;
    this.buttons = {};
    this.isIntersecting = false;

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
      'onStatusChange': function() {},
      'inline-styles': true,
      'fit-box': false,
      'offset': 100, // since showinfo is deprecated and ignored after September 25, 2018. we add +100 to hide it in the overflow
      'start-at': 0,
      'end-at': 0,
      'poster': null,
      'always-play': false,
      'volume': 1,
      'no-cookie': true
    };

    if (!this.ytid) return;

    this.injectScript();

    this.params = parseProperties(params, DEFAULTS, this.element, ['data-ytbg-', 'data-vbg-']);
    //pause deprecated
    if (this.params.pause) {
      this.params['play-button'] = this.params.pause;
    }
    this.params.resolution_mod = parseResolutionString(this.params.resolution);
    this.state.playing = this.params.autoplay;
    this.state.muted = this.params.muted;

    this.buildHTML();

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

  initYTPlayer() {
    const self = this;
    if (window.hasOwnProperty('YT') && this.player === null) {
      this.player = new YT.Player(this.uid, {
        events: {
          'onReady': this.onVideoPlayerReady.bind(this),
          'onStateChange': this.onVideoStateChange.bind(this),
          'onError' : function(event) {
            //console.error('player_api', event);
          }
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

  seekTo(seconds, allowSeekAhead = true) {
    this.player.seekTo(seconds, allowSeekAhead);
  }

  onVideoPlayerReady(event) {
    this.seekTo(this.params['start-at']);
  
    if (this.params.autoplay && (this.params['always-play'] || this.isIntersecting)) {
      this.player.playVideo();
      this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
    }
  
    this.iframe.style.opacity = 1;
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

  injectPlayer() {
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('frameborder', 0);
    this.iframe.setAttribute('allow', 'autoplay; mute');
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
  
    this.iframe.src = src;
  
    if (this.uid) {
      this.iframe.id = this.uid;
    }
  
    if (this.params['inline-styles']) {
      this.iframe.style.top = '50%';
      this.iframe.style.left = '50%';
      this.iframe.style.transform = 'translateX(-50%) translateY(-50%)';
      this.iframe.style.position = 'absolute';
      this.iframe.style.opacity = 0;
    }
  
    this.element.appendChild(this.iframe);
  
    if (this.params['fit-box']) {
      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
    } else {
      this.resize();
    }
  }

  resize() {
    if (this.params['fit-box']) return;
    proportionalParentCoverResize(this.iframe, this.params.resolution_mod, this.params.offset);
  }

  buildHTML() {
    const parent = this.element.parentNode;
    // wrap
    addClass(this.element, 'youtube-background video-background');
  
    //set css rules
    const wrapper_styles = {
      "height" : "100%",
      "width" : "100%",
      "z-index": "0",
      "position": "absolute",
      "overflow": "hidden",
      "top": 0, // added by @insad
      "left": 0,
      "bottom": 0,
      "right": 0
    };
  
    if (!this.params['mute-button']) {
      wrapper_styles["pointer-events"] = "none" // avoid right mouse click popup menu
    }
  
    if (this.params['load-background'] || this.params['poster']) {
      if (this.params['load-background']) wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/hqdefault.jpg)';
      if (this.params['poster']) wrapper_styles['background-image'] = this.params['poster'];
      wrapper_styles['background-size'] = 'cover';
      wrapper_styles['background-repeat'] = 'no-repeat';
      wrapper_styles['background-position'] = 'center';
    }
  
    if (this.params['inline-styles']) {
      for (let property in wrapper_styles) {
        this.element.style[property] = wrapper_styles[property];
      }
  
      if (!['absolute', 'fixed', 'relative', 'sticky'].indexOf(parent.style.position)) {
        parent.style.position = 'relative';
      }
    }
  
    // set play/mute controls wrap
    if (this.params['play-button'] || this.params['mute-button']) {
      const controls = document.createElement('div');
      controls.className = 'video-background-controls';
  
      controls.style.position = 'absolute';
      controls.style.top = '10px';
      controls.style.right = '10px';
      controls.style['z-index'] = 2;
  
      this.controls_element = controls;
      parent.appendChild(controls);
    }
  
    return this.element;
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
    //TODO: solve this with ARIA toggle states. P.S. warning repetitive code!!!
    if (this.buttons.hasOwnProperty('play')) {
      const btn_obj = this.buttons.play;
      removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
      addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
      removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
    }
  
    this.state.playing = true;
  
    if (this.params['start-at'] && this.player.getCurrentTime() < this.params['start-at'] ) {
      this.seekTo(this.params['start-at']);
    }
    this.player.playVideo();
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
  
    this.player.pauseVideo();
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
    this.player.unMute();
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
  
    this.player.mute();
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }

  setVolume(volume) {
    if (!this.player) return;
    
    this.player.setVolume(volume * 100);
    this.element.dispatchEvent(new CustomEvent('video-background-volume-change', { bubbles: true, detail: this }));
  }
}
