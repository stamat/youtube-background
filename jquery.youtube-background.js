/**
 * jquery.youtube-background v1.0.8 | Nikola Stamatovic <@stamat> | MIT
 */

(function () {
  'use strict';

  function hasClass(element, className) {
    if (element.classList) {
      return element.classList.contains(className);
    }
    return new RegExp('\\b'+ className+'\\b').test(element.className);
  }

  function addClass(element, className) {
    if (element.classList) {
      element.classList.add(className);
      return;
    }

    if (!hasClass(element, className)) {
      element.className += ' ' + className;
    }
  }

  function removeClass(element, className) {
    if (element.classList) {
      element.classList.remove(className);
      return;
    }

    element.className = element.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
  }

  function isMobile() {
    let is_mobile = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) is_mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);

    return is_mobile;
  }

  function parseResolutionString(res) {
    var pts = res.split(/\s?:\s?/i);
    if (pts.length < 2) {
      return 16/9;
    }

    var w = parseInt(pts[0], 10);
    var h = parseInt(pts[1], 10);

    if (isNaN(w) || isNaN(h)) {
      return 16/9;
    }

    return w/h;
  }

  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function YoutubeBackground(elem, params, id, uid) {
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
  	};

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
  		wrapper_styles["pointer-events"] = "none"; // avoid right mouse click popup menu
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
  		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
  		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  	}

  	if (this.player) {
  		this.player.playVideo();
  	}
  };

  YoutubeBackground.prototype.pause = function () {
  	if (this.buttons.hasOwnProperty('play')) {
  		var btn_obj = this.buttons.play;
  		addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
  		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
  		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  	}

  	if (this.player) {
  		this.player.pauseVideo();
  	}
  };

  YoutubeBackground.prototype.unmute = function () {
  	if (this.buttons.hasOwnProperty('mute')) {
  		var btn_obj = this.buttons.mute;
  		removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
  		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
  		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  	}

  	if (this.player) {
  		this.player.unMute();
  	}
  };

  YoutubeBackground.prototype.mute = function () {
  	if (this.buttons.hasOwnProperty('mute')) {
  		var btn_obj = this.buttons.mute;
  		addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
  		removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
  		addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
  	}

  	if (this.player) {
  		this.player.mute();
  	}
  };

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

  function VideoBackgrounds(selector, params) {
  	this.elements = selector;

  	if (typeof selector === 'string') {
  		this.elements = document.querySelectorAll(selector);
  	}

  	this.index = {};
  	this.re = {};
  	this.re.YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    this.re.VIMEO = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;

  	this.__init__ = function () {
  		for (var i = 0; i < this.elements.length; i++) {
  			var element = this.elements[i];

  			var link = element.getAttribute('data-youtube');
  			var vid_data = this.getVidID(link);

        if (!vid_data) {
          continue;
        }

  			var uid = this.generateUID(vid_data.id);

        if (!uid) {
  				continue;
  			}

        if (vid_data.type === 'YOUTUBE') {
          var yb = new YoutubeBackground(element, params, vid_data.id, uid);
          this.index[uid] = yb;
        }
  		}

  		this.initYTPlayers();
  	};

  	this.__init__();
  }

  VideoBackgrounds.prototype.getVidID = function (link) {
    if (link !== undefined && link !== null) {
      for (var k in this.re) {
        var pts = link.match(this.re[k]);

        if (pts && pts.length) {
          this.re[k].lastIndex = 0;

          return {
            id: pts[1],
            type: k
          };
        }
      }
    }

  	return null;
  };


  VideoBackgrounds.prototype.generateUID = function (pref) {
  	//index the instance
  	function getRandomIntInclusive(min, max) {
  		min = Math.ceil(min);
  		max = Math.floor(max);
  		return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  	}

  	var uid = pref +'-'+ getRandomIntInclusive(0, 9999);
  	while (this.index.hasOwnProperty(uid)) {
  		uid = pref +'-'+ getRandomIntInclusive(0, 9999);
  	}

  	return uid;
  };

  VideoBackgrounds.prototype.pauseVideos = function () {
  	for (var k in this.index) {
  		this.index[k].pause();
  	}
  };

  VideoBackgrounds.prototype.playVideos = function () {
  	for (var k in this.index) {
  		this.index[k].play();
  	}
  };

  VideoBackgrounds.prototype.initYTPlayers = function (callback) {
  	var self = this;

  	window.onYouTubeIframeAPIReady = function () {
  		for (var k in self.index) {
        if (self.index[k] instanceof YoutubeBackground) {
          self.index[k].initYTPlayer();
        }
  		}

  		if (callback) {
  			setTimeout(callback, 100);
  		}
  	};

  	if (window.hasOwnProperty('YT') && window.YT.loaded) {
  		window.onYouTubeIframeAPIReady();
  	}
  };

  if (typeof jQuery == 'function') {
  	(function ($) {
  		$.fn.youtube_background = function (params) {
  			var $this = $(this);
  			new VideoBackgrounds(this, params);
  			return $this;
  		};
  	})(jQuery);
  }

  window.VideoBackgrounds = VideoBackgrounds;

}());
