import { isMobile, addClass, parseResolutionString, parseProperties } from './utils.js';

export function VimeoBackground(elem, params, id, uid) {
  this.is_mobile = isMobile();

  this.element = elem;
  this.vid = id;
  this.uid = uid;
  this.player = null;
  this.buttons = {};

  this.state = {};
  this.state.play = false;
  this.state.mute = false;

  this.params = {};

  const DEFAULTS = {
//    'pause': false, //deprecated
//    'play-button': false,
//    'mute-button': false,
    'autoplay': true,
    'muted': true,
    'loop': true,
    'mobile': false,
//    'load-background': true,
    'resolution': '16:9',
    'inline-styles': true,
    'fit-box': false,
    'offset': 200,
    'start-at': 0,
    'poster': null
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
    this.injectPlayer();
  };

  this.__init__();
}

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

  return this.element;
};
