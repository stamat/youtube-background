import { addClass, removeClass, hasClass, parseResolutionString, parseProperties, generateActionButton } from './utils.js';
import { isMobile } from 'book-of-spells';
import Player from '@vimeo/player';

export function VimeoBackground(elem, params, id, uid) {
  this.is_mobile = isMobile();

  this.element = elem;
  this.vid = id;
  this.uid = uid;
  this.element.setAttribute('data-vbg-uid', uid);
  this.player = null;
  this.buttons = {};

  this.state = {};
  this.state.play = false;
  this.state.mute = false;

  this.params = {};

  const DEFAULTS = {
    'pause': false, //deprecated
    'play-button': false,
    'mute-button': false,
    'autoplay': true,
    'muted': true,
    'loop': true,
    'mobile': true,
//    'load-background': true,
    'resolution': '16:9',
    'inline-styles': true,
    'fit-box': false,
    'offset': 200,
    'start-at': 0,
    'end-at': 0,
    'poster': null,
    'always-play': false
  };

  this.__init__ = function () {
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
  };

  this.__init__();
}

VimeoBackground.prototype.seekTo = function (time) {
  this.player.setCurrentTime(time);
};


VimeoBackground.prototype.onVideoPlayerReady = function (event) {
  this.seekTo(this.params['start-at']);
  if (this.params.autoplay && this.params['always-play']) {
    this.player.play();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  this.iframe.style.opacity = 1;
};

VimeoBackground.prototype.onVideoEnded = function (event) {
  if (this.params.loop) {
    this.seekTo(this.params['start-at']);
    this.player.play();
  }
};

VimeoBackground.prototype.onVideoProgress = function (event) {
  if (event.seconds >= this.params['end-at']) {
    this.seekTo(this.params['start-at']);
  }
};

VimeoBackground.prototype.injectPlayer = function () {
  this.iframe = document.createElement('iframe');
  this.iframe.setAttribute('frameborder', 0);
  this.iframe.setAttribute('allow', ['autoplay; mute']);
  let src = 'https://player.vimeo.com/video/'+this.vid+'?background=1&controls=0';

  if (this.params.muted) {
    src += '&muted=1';
  }

  if (this.params.autoplay) {
    src += '&autoplay=1';
  }

  if (this.params.loop) {
    src += '&loop=1&autopause=0';
  }

  //WARN❗️ this is a hash not a query param
  if (this.params['start-at']) {
    src += '#t=' + this.params['start-at'] + 's';
  }

  this.iframe.src = src;

  if (this.uid) {
    this.iframe.id = this.uid;
  }

  if (this.params['load-background'] || this.params['poster']) {
    //if (this.params['load-background']) wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/maxresdefault.jpg)';
    if (this.params['poster']) wrapper_styles['background-image'] = this.params['poster'];
    wrapper_styles['background-size'] = 'cover';
    wrapper_styles['background-repeat'] = 'no-repeat';
    wrapper_styles['background-position'] = 'center';
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
    const self = this;

    const onResize = function() {
      const h = self.iframe.parentNode.offsetHeight + self.params.offset; // since showinfo is deprecated and ignored after September 25, 2018. we add +200 to hide it in the overflow
      const w = self.iframe.parentNode.offsetWidth + self.params.offset;
      const res = self.params.resolution_mod;

      if (res > w/h) {
        self.iframe.style.width = h*res + 'px';
        self.iframe.style.height = h + 'px';
      } else {
        self.iframe.style.width = w + 'px';
        self.iframe.style.height = w/res + 'px';
      }
    };

    if (window.hasOwnProperty('ResizeObserver')) {
      const resize_observer = new ResizeObserver(() => {
        window.requestAnimationFrame(onResize);
      });
      resize_observer.observe(this.element);
    } else {
      window.addEventListener('resize', () => {
        window.requestAnimationFrame(onResize);
      });
    }
    onResize();
  }

  this.player = new Player(this.iframe);
  this.player.on('loaded', this.onVideoPlayerReady.bind(this));
  this.player.on('ended', this.onVideoEnded.bind(this));
  
  if (this.params['end-at'] > 0) this.player.on('progress', this.onVideoProgress.bind(this));
};

VimeoBackground.prototype.buildHTML = function () {
  const parent = this.element.parentNode;
  // wrap
  addClass(this.element, 'youtube-background');

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

  if (this.params['load-background'] || this.params['poster']) {
    //if (this.params['load-background']) wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/maxresdefault.jpg)';
    if (this.params['poster']) wrapper_styles['background-image'] = this.params['poster'];
    wrapper_styles['background-size'] = 'cover';
    wrapper_styles['background-repeat'] = 'no-repeat';
    wrapper_styles['background-position'] = 'center';
  }

  if (!this.params['mute-button']) {
    wrapper_styles["pointer-events"] = "none"; // avoid right mouse click popup menu
  }

  if (this.params['load-background']) {
    //TODO: wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.vid+'/maxresdefault.jpg)';
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
};

VimeoBackground.prototype.play = function () {
  //TODO: solve this with ARIA toggle states. P.S. warning repetitive code!!!
  if (this.buttons.hasOwnProperty('play')) {
    const btn_obj = this.buttons.play;
    removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    if (this.params['start-at'] && this.player.getCurrentTime() < this.params['start-at'] ) {
      this.seekTo(this.params['start-at']);
    }
    this.player.play();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }
};

VimeoBackground.prototype.pause = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('play')) {
    const btn_obj = this.buttons.play;
    addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.pause();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }
};

VimeoBackground.prototype.unmute = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('mute')) {
    const btn_obj = this.buttons.mute;
    removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.setMuted(false);
    this.element.dispatchEvent(new CustomEvent('video-background-unmute', { bubbles: true, detail: this }));
  }
};

VimeoBackground.prototype.mute = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('mute')) {
    const btn_obj = this.buttons.mute;
    addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.setMuted(true);
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }
};
