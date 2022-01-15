import { isMobile, addClass, hasClass, removeClass, parseResolutionString, parseProperties } from './utils.js';

export function VideoBackground(elem, params, vid_data, uid) {
  this.is_mobile = isMobile();

  this.element = elem;
  this.link = vid_data.link;
  this.ext = vid_data.id;
  this.uid = uid;
  this.player = null;
  this.buttons = {};

  this.state = {};
  this.state.play = false;
  this.state.mute = false;

  this.params = {};

  const MIME_MAP = {
    'ogv' : 'video/ogg',
    'ogm' : 'video/ogg',
    'ogg' : 'video/ogg',
    'avi' : 'video/avi',
    'mp4' : 'video/mp4',
    'webm' : 'video/webm'
  };

  const DEFAULTS = {
    'pause': false, //deprecated
    'play-button': false,
    'mute-button': false,
    'autoplay': true,
    'muted': true,
    'loop': true,
    'mobile': false,
    'resolution': '16:9',
    'inline-styles': true,
    'fit-box': false,
    'offset': 200,
//    'start-at': 0,
//    'end-at': 0,
    'poster': null
  };

  this.__init__ = function () {
    if (!this.link || !this.ext) {
      return;
    }

    this.mime = MIME_MAP[this.ext.toLowerCase()];
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

VideoBackground.prototype.seekTo = function (seconds) {
  if (this.player.hasOwnProperty('fastSeek')) {
    this.player.fastSeek(seconds);
    return;
  }
  this.player.currentTime = seconds;
}

VideoBackground.prototype.injectPlayer = function () {
  this.player = document.createElement('video');
  this.player.muted = this.params.muted;
  this.player.autoplay = this.params.autoplay;
  this.player.loop = this.params.loop;
  this.player.playsinline = true;

  this.player.setAttribute('id', this.uid)

  if (this.params['inline-styles']) {
    this.player.style.top = '50%';
    this.player.style.left = '50%';
    this.player.style.transform = 'translateX(-50%) translateY(-50%)';
    this.player.style.position = 'absolute';
    this.player.style.opacity = 0;

    this.player.addEventListener('canplay', (e) => {
      e.target.style.opacity = 1;
    });
  }

  const self = this;
  /*
  this.player.addEventListener('canplay', (e) => {
    if (self.params['start-at'] && self.params.autoplay) {
      self.seekTo(self.params['start-at']);
    }
  });

  this.player.addEventListener('canplaythrough', (e) => {
    if (self.params['end-at'] > 0) {
    self.player.addEventListener('timeupdate', (e) => {
      if (self.params['end-at'] >= self.player.currentTime) {
        self.seekTo(self.params['start-at']);
      }
    });
  }
  });
  */

  const source = document.createElement('source');
  source.setAttribute('src', this.link);
  source.setAttribute('type', this.mime);
  this.player.appendChild(source);
  this.element.appendChild(this.player);

  if (this.params['fit-box']) {
    this.player.style.width = '100%';
    this.player.style.height = '100%';
  } else {
    //TODO❗️: maybe a spacer or at least add requestAnimationFrame
    function onResize() {
      const h = self.player.parentNode.offsetHeight + self.params.offset; // since showinfo is deprecated and ignored after September 25, 2018. we add +200 to hide it in the overflow
      const w = self.player.parentNode.offsetWidth + self.params.offset;
      const res = self.params.resolution_mod;

      if (res > w/h) {
        self.player.style.width = h*res + 'px';
        self.player.style.height = h + 'px';
      } else {
        self.player.style.width = w + 'px';
        self.player.style.height = w/res + 'px';
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

VideoBackground.prototype.buildHTML = function () {
  const parent = this.element.parentNode;
  // wrap
  addClass(this.element, 'video-background');

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
    if (this.params['poster']) wrapper_styles['background-image'] = `url('${this.params['poster']}')`;
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

VideoBackground.prototype.play = function () {
  //TODO: solve this with ARIA toggle states. P.S. warning repetitive code!!!
  if (this.buttons.hasOwnProperty('play')) {
    const btn_obj = this.buttons.play;
    removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    /* if (this.params['start-at'] && this.player.currentTime < this.params['start-at'] ) {
      this.seekTo(this.params['start-at']);
    } */
    this.player.play();
    this.element.dispatchEvent(new CustomEvent('video-background-play', { bubbles: true, detail: this }));
  }
}

VideoBackground.prototype.pause = function () {
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
}

VideoBackground.prototype.unmute = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('mute')) {
    const btn_obj = this.buttons.mute;
    removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.muted = false;
    this.element.dispatchEvent(new CustomEvent('video-background-unmute', { bubbles: true, detail: this }));
  }
}

VideoBackground.prototype.mute = function () {
  //TODO: solve this with ARIA toggle states
  if (this.buttons.hasOwnProperty('mute')) {
    const btn_obj = this.buttons.mute;
    addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
    removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
    addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  }

  if (this.player) {
    this.player.muted = true;
    this.element.dispatchEvent(new CustomEvent('video-background-mute', { bubbles: true, detail: this }));
  }
}

//TODO: refactor states to be equal for all buttons
VideoBackground.prototype.generateActionButton = function (obj) {
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
