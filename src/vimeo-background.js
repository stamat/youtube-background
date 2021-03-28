import { isMobile, parseResolutionString } from './utils.js';

export function VimeoBackground(elem, params, id, uid) {
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

	this.defaults = {
		'pause': false, //deprecated
		'play-button': false,
		'mute-button': false,
		'autoplay': true,
		'muted': true,
		'loop': true,
		'mobile': false,
		'load-background': true,
		'resolution': '16:9',
    'inline-styles': true,
    'fit-box': false,
		'offset': 200
	};

	this.__init__ = function () {
		if (!this.ytid) {
			return;
		}

		this.parseProperties(params);
		this.params.resolution_mod = parseResolutionString(this.params.resolution);
		this.state.playing = this.params.autoplay;
		this.state.muted = this.params.muted;

		this.buildHTML();
		this.injectIFrame();
	}

	this.__init__();
}

VimeoBackground.prototype.parseProperties = function (params) {
	if (!params) {
		this.params = this.defaults;
	} else {
		//load in defaults
		for (var k in this.defaults) {
			if (!this.params.hasOwnProperty(k)) {
				this.params[k] = this.defaults[k];
			}
		}
	}

	// load params from data attributes
	for (var k in this.params) {
		var data = this.element.getAttribute('data-ytbg-'+k);

		if (data !== undefined && data !== null) {
			data = data === 'false' ? false : data;
			this.params[k] = data;
		}
	}

	//pause deprecated
	if (this.params.pause) {
		this.params['play-button'] = this.params.pause;
	}
};

VimeoBackground.prototype.injectIFrame = function () {
	this.iframe = document.createElement('iframe');
	this.iframe.setAttribute('frameborder', 0);
	this.iframe.setAttribute('allow', ['autoplay; mute']);
	var src = 'https://player.vimeo.com/video/'+this.ytid+'?background=1&controls=0';

	if (this.params.muted) {
		src += '&muted=1';
	}

	if (this.params.autoplay) {
		src += '&autoplay=1';
	}

	if (this.params.loop) {
		src += '&loop=1&autopause=0';
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

	this.element.parentNode.appendChild(this.iframe);
	this.iframe.parentNode.removeChild(this.element);

  if (this.params['fit-box']) {
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
  } else {
    var self = this;

    function onResize() {
      var h = self.iframe.parentNode.offsetHeight + self.params.offset; // since showinfo is deprecated and ignored after September 25, 2018. we add +200 to hide it in the overflow
      var w = self.iframe.parentNode.offsetWidth + self.params.offset;
      var res = self.params.resolution_mod;

      if (res > w/h) {
        self.iframe.style.width = h*res + 'px';
        self.iframe.style.height = h + 'px';
      } else {
        self.iframe.style.width = w + 'px';
        self.iframe.style.height = w/res + 'px';
      }
    }

    window.addEventListener('resize', onResize);
    onResize();
  }
};

VimeoBackground.prototype.buildHTML = function () {
	var parent = this.element.parentNode;
	// wrap
	var wrapper = document.createElement('div');
	wrapper.className = 'youtube-background';
	parent.insertBefore(wrapper, this.element);
	wrapper.appendChild(this.element);
	var id = this.element.id;
	this.element.id = '';
	wrapper.id = id;

	//set css rules
	var wrapper_styles = {
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

	if (this.params['load-background']) {
		//TODO: wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/maxresdefault.jpg)';
		wrapper_styles['background-size'] = 'cover';
		wrapper_styles['background-repeat'] = 'no-repeat';
		wrapper_styles['background-position'] = 'center';
	}

  if (this.params['inline-styles']) {
  	for (var property in wrapper_styles) {
  		wrapper.style[property] = wrapper_styles[property];
  	}

    wrapper.parentNode.style.position = 'relative';
  }

	if (this.is_mobile && !this.params.mobile) {
		return wrapper;
	}

	return wrapper;
};
