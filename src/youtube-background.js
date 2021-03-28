import { isMobile, addClass, hasClass, removeClass, parseResolutionString } from './utils.js';

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
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
		'onStatusChange': function() {},
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
	var self = this;

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

YoutubeBackground.prototype.onVideoPlayerReady = function (event) {
	if (this.params.autoplay) {
		event.target.playVideo();
	}
};

YoutubeBackground.prototype.onVideoStateChange = function (event) {
	if (event.data === 0 && this.params.loop) {
		event.target.playVideo();
	}

	if (event.data === -1 && this.params.autoplay) {
		event.target.playVideo();
	}

	if (event.data === 1) {
		this.iframe.style.opacity = 1;
	}

	this.params["onStatusChange"](event);
};

YoutubeBackground.prototype.parseProperties = function (params) {
	if (!params) {
		this.params = this.defaults;
	} else {
		for (var k in this.defaults) {
			if (!params.hasOwnProperty(k)) {
				//load in defaults if the param hasn't been set
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

YoutubeBackground.prototype.injectIFrame = function () {
	this.iframe = document.createElement('iframe');
	this.iframe.setAttribute('frameborder', 0);
	this.iframe.setAttribute('allow', ['autoplay; mute']);
	var src = 'https://www.youtube.com/embed/'+this.ytid+'?enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0&origin='+window.location.origin;

	if (this.params.muted) {
		src += '&mute=1';
	}

	if (this.params.autoplay) {
		src += '&autoplay=1';
	}

	if (this.params.loop) {
		src += '&loop=1';
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

YoutubeBackground.prototype.buildHTML = function () {
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
		wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/maxresdefault.jpg)';
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

	// set play/mute controls wrap
	if (this.params['play-button'] || this.params['mute-button']) {
		var controls = document.createElement('div');
		controls.className = 'video-background-controls';

		controls.style.position = 'absolute';
		controls.style.top = '10px';
		controls.style.right = '10px';
		controls.style['z-index'] = 2;

		this.controls_element = controls;
		wrapper.parentNode.appendChild(controls);
	}

	return wrapper;
};

YoutubeBackground.prototype.play = function () {
	if (this.buttons.hasOwnProperty('play')) {
		var btn_obj = this.buttons.play;
		removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
	}

	if (this.player) {
		this.player.playVideo();
	}
}

YoutubeBackground.prototype.pause = function () {
	if (this.buttons.hasOwnProperty('play')) {
		var btn_obj = this.buttons.play;
		addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
	}

	if (this.player) {
		this.player.pauseVideo();
	}
}

YoutubeBackground.prototype.unmute = function () {
	if (this.buttons.hasOwnProperty('mute')) {
		var btn_obj = this.buttons.mute;
		removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
	}

	if (this.player) {
		this.player.unMute();
	}
}

YoutubeBackground.prototype.mute = function () {
	if (this.buttons.hasOwnProperty('mute')) {
		var btn_obj = this.buttons.mute;
		addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0])
		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
	}

	if (this.player) {
		this.player.mute();
	}
}

//TODO: refactor states to be equal for all buttons
YoutubeBackground.prototype.generateActionButton = function (obj) {
	var btn = document.createElement('button');
	btn.className = obj.className;
	btn.innerHTML = obj.innerHtml;
	addClass(btn.firstChild, obj.stateChildClassNames[0]);

	if (this.params[obj.condition_parameter] === obj.initialState) {
		addClass(btn, obj.stateClassName);
		removeClass(btn.firstChild, obj.stateChildClassNames[0]);
		addClass(btn.firstChild, obj.stateChildClassNames[1]);
	}

	var self = this;
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
