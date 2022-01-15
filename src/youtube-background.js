import { isMobile, addClass, hasClass, removeClass, parseProperties, parseResolutionString } from './utils.js';

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

export function YoutubeBackground(elem, params, id, uid) {
  this.is_mobile = isMobile();

  this.element = elem;
  this.ytid = id;
  this.uid = uid;
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
    'mobile': false,
    'load-background': true,
    'resolution': '16:9',
    'onStatusChange': function() {},
    'inline-styles': true,
    'fit-box': false,
    'offset': 200,
    'start-at': 0,
    'end-at': 0,
    'poster': null
  };

  this.__init__ = function () {
    if (!this.ytid) {
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
    this.injectPlayer();


    if (this.params['play-button']) {
      this.generateActionButton({
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
      this.generateActionButton({
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

  this.__init__();
}

YoutubeBackground.prototype.initYTPlayer = function () {
  const self = this;
  if (window.hasOwnProperty('YT')) {
    this.player = new YT.Player(this.uid, {
      events: {
        'onReady': function(event) {
          self.onVideoPlayerReady(event);
        },
        'onStateChange': function(event) {
          self.onVideoStateChange(event);
        },
        'onError' : function(event) {
          //console.error('player_api', event);
        }
      }
    });
  }
};

YoutubeBackground.prototype.seekTo = function (seconds) {
  if (seconds > 0) {
    this.player.seekTo(seconds, true);
  }
}

YoutubeBackground.prototype.onVideoPlayerReady = function (event) {
  if (this.params.autoplay) {
    this.seekTo(this.params['start-at']);
    this.player.playVideo();
  }
};

YoutubeBackground.prototype.onVideoStateChange = function (event) {
  if (event.data === 0 && this.params.loop) {
    this.seekTo(this.params['start-at']);
    this.player.playVideo();
  }

  if (event.data === -1 && this.params.autoplay) {
    this.seekTo(this.params['start-at']);
    this.player.playVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }

  if (event.data === 1) {
    this.iframe.style.opacity = 1;
  }

  this.params["onStatusChange"](event);
};

YoutubeBackground.prototype.injectPlayer = function () {
  this.iframe = document.createElement('iframe');
  this.iframe.setAttribute('frameborder', 0);
  this.iframe.setAttribute('allow', 'autoplay; mute');
  let src = `https://www.youtube.com/embed/${this.ytid}?&enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0`;

  if (this.params.muted) {
    src += '&mute=1';
  }

  if (this.params.autoplay) {
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
    const self = this;

    //TODO❗️: maybe a spacer or at least add requestAnimationFrame
    function onResize() {
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
    }

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
};

YoutubeBackground.prototype.buildHTML = function () {
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
    if (this.params['load-background']) wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/maxresdefault.jpg)';
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

  if (this.is_mobile && !this.params.mobile) {
    return this.element;
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

YoutubeBackground.prototype.play = function () {
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
    this.player.playVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }
}

YoutubeBackground.prototype.pause = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('play')) {
    const btn_obj = this.buttons.play;
    addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.pauseVideo();
    this.element.dispatchEvent(new CustomEvent('video-background-pause', { bubbles: true, detail: this }));
  }
}

YoutubeBackground.prototype.unmute = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('mute')) {
    const btn_obj = this.buttons.mute;
    removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.unMute();
    this.element.dispatchEvent(new CustomEvent('video-background-unmute', { bubbles: true, detail: this }));
  }
}

YoutubeBackground.prototype.mute = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('mute')) {
    const btn_obj = this.buttons.mute;
    addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.mute();
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }
}

//TODO: refactor states to be equal for all buttons
YoutubeBackground.prototype.generateActionButton = function (obj) {
  const btn = document.createElement('button');
  btn.className = obj.className;
  btn.innerHTML = obj.innerHtml;
  addClass(btn.firstChild, obj.stateChildClassNames[0]);

  //TODO: solve this with ARIA toggle states
  if (this.params[obj.condition_parameter] === obj.initialState) {
    addClass(btn, obj.stateClassName);
    removeClass(btn.firstChild, obj.stateChildClassNames[0]);
    addClass(btn.firstChild, obj.stateChildClassNames[1]);
  }

  const self = this;
  btn.addEventListener('click', function(e) {
    if (hasClass(this, obj.stateClassName)) {
      self.state[obj.name] = false;
      self[obj.actions[0]]();
    } else {
      self.state[obj.name] = true;
      self[obj.actions[1]]();
    }
  });

  this.buttons[obj.name] = {
    element: btn,
    button_properties: obj
  };

  this.controls_element.appendChild(btn);
};
