/* youtube-background v1.0.21 | https://github.com/stamat/youtube-background | MIT License */
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // node_modules/book-of-spells/src/helpers.mjs
  function stringToBoolean(str) {
    if (/^\s*(true|false)\s*$/i.test(str))
      return str === "true";
  }
  function stringToNumber(str) {
    if (/^\s*\d+\s*$/.test(str))
      return parseInt(str);
    if (/^\s*[\d.]+\s*$/.test(str))
      return parseFloat(str);
  }
  function stringToArray(str) {
    if (!/^\s*\[.*\]\s*$/.test(str))
      return;
    try {
      return JSON.parse(str);
    } catch (e) {
    }
  }
  function stringToObject(str) {
    if (!/^\s*\{.*\}\s*$/.test(str))
      return;
    try {
      return JSON.parse(str);
    } catch (e) {
    }
  }
  function stringToRegex(str) {
    if (!/^\s*\/.*\/g?i?\s*$/.test(str))
      return;
    try {
      return new RegExp(str);
    } catch (e) {
    }
  }
  function stringToType(str) {
    if (/^\s*null\s*$/.test(str))
      return null;
    const bool = stringToBoolean(str);
    if (bool !== void 0)
      return bool;
    return stringToNumber(str) || stringToArray(str) || stringToObject(str) || stringToRegex(str) || str;
  }
  function isArray(o) {
    return Array.isArray(o);
  }
  function isString(o) {
    return typeof o === "string";
  }
  function randomIntInclusive(min, max) {
    if (min > max)
      [min, max] = [max, min];
    if (min === max)
      return min;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function parseResolutionString(res) {
    const DEFAULT_RESOLUTION = 1.7777777778;
    if (!res || !res.length || /16[\:x\-\/]{1}9/i.test(res))
      return DEFAULT_RESOLUTION;
    const pts = res.split(/\s?[\:x\-\/]{1}\s?/i);
    if (pts.length < 2)
      return DEFAULT_RESOLUTION;
    const w = parseInt(pts[0]);
    const h = parseInt(pts[1]);
    if (w === 0 || h === 0)
      return DEFAULT_RESOLUTION;
    if (isNaN(w) || isNaN(h))
      return DEFAULT_RESOLUTION;
    return w / h;
  }

  // node_modules/book-of-spells/src/dom.mjs
  function query(selector, from = document) {
    if (selector instanceof Array || selector instanceof NodeList)
      return selector;
    if (selector instanceof Element)
      return [selector];
    if (from instanceof Element || from instanceof Document)
      return from.querySelectorAll(selector);
    if (isString(from))
      from = query(from);
    if (!from instanceof Array && !from instanceof NodeList)
      return [];
    const res = [];
    for (const element of from) {
      res.push(...element.querySelectorAll(selector));
    }
    return res;
  }
  function proportionalParentCoverResize(elements, ratio = 1, offset = 0) {
    if (elements instanceof Element)
      elements = [elements];
    if (typeof elements === "string")
      elements = query(elements);
    for (const element of elements) {
      const h = element.parentNode.offsetHeight + offset;
      const w = element.parentNode.offsetWidth + offset;
      if (ratio > w / h) {
        element.style.width = h * ratio + "px";
        element.style.height = h + "px";
      } else {
        element.style.width = w + "px";
        element.style.height = w / ratio + "px";
      }
    }
  }

  // node_modules/book-of-spells/src/regex.mjs
  var RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  var RE_VIMEO = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
  var RE_VIDEO = /(.*\/[^\/]+\.mp4|ogg|ogv|ogm|webm|avi)\s?$/i;

  // node_modules/book-of-spells/src/browser.mjs
  function isUserAgentMobile(str) {
    return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(str) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(str);
  }
  function isMobile() {
    if ("maxTouchPoints" in navigator)
      return navigator.maxTouchPoints > 0;
    if ("matchMedia" in window)
      return !!matchMedia("(pointer:coarse)").matches;
    if ("orientation" in window)
      return true;
    return isUserAgentMobile(navigator.userAgent);
  }

  // src/lib/utils.js
  function hasClass(element, className) {
    return element.classList.contains(className);
  }
  function addClass(element, classNames) {
    const classes = classNames.split(" ");
    element.classList.add(...classes);
  }
  function removeClass(element, classNames) {
    const classes = classNames.split(" ");
    element.classList.remove(...classes);
  }
  function parseProperties(params, defaults, element, attr_prefix) {
    let res_params = {};
    if (!params) {
      res_params = defaults;
    } else {
      for (let k in defaults) {
        if (!params.hasOwnProperty(k)) {
          res_params[k] = defaults[k];
        }
      }
    }
    if (!element)
      return res_params;
    for (let k in res_params) {
      let data;
      if (isArray(attr_prefix)) {
        for (var i = 0; i < attr_prefix.length; i++) {
          const temp_data = element.getAttribute(attr_prefix[i] + k);
          if (temp_data) {
            data = temp_data;
            break;
          }
        }
      } else {
        data = element.getAttribute(attr_prefix + k);
      }
      if (data !== void 0 && data !== null) {
        res_params[k] = stringToType(data);
      }
    }
    return res_params;
  }
  function generateActionButton(obj, props) {
    const btn = document.createElement("button");
    btn.className = props.className;
    btn.innerHTML = props.innerHtml;
    addClass(btn.firstChild, props.stateChildClassNames[0]);
    if (obj.params[props.condition_parameter] === props.initialState) {
      addClass(btn, props.stateClassName);
      removeClass(btn.firstChild, props.stateChildClassNames[0]);
      addClass(btn.firstChild, props.stateChildClassNames[1]);
    }
    btn.addEventListener("click", function(e) {
      if (hasClass(this, props.stateClassName)) {
        obj.state[props.name] = false;
        obj[props.actions[0]]();
      } else {
        obj.state[props.name] = true;
        obj[props.actions[1]]();
      }
    });
    obj.buttons[props.name] = {
      element: btn,
      button_properties: props
    };
    obj.controls_element.appendChild(btn);
  }

  // src/lib/super-video-background.js
  var SuperVideoBackground = class {
    buildWrapperHTML() {
      const parent = this.element.parentNode;
      this.element.classList.add("video-background video-background".split(" "));
      const wrapper_styles = {
        "height": "100%",
        "width": "100%",
        "z-index": "0",
        "position": "absolute",
        "overflow": "hidden",
        "top": 0,
        // added by @insad
        "left": 0,
        "bottom": 0,
        "right": 0
      };
      if (!this.params["mute-button"]) {
        wrapper_styles["pointer-events"] = "none";
      }
      if (this.params["load-background"] || this.params["poster"]) {
        if (this.params["load-background"]) {
          if (this.type === "youtube")
            wrapper_styles["background-image"] = "url(https://img.youtube.com/vi/" + this.ytid + "/hqdefault.jpg)";
          if (this.type === "vimeo")
            wrapper_styles["background-image"] = "url(https://vumbnail.com/" + this.vid + ".jpg)";
        }
        if (this.params["poster"])
          wrapper_styles["background-image"] = this.params["poster"];
        wrapper_styles["background-size"] = "cover";
        wrapper_styles["background-repeat"] = "no-repeat";
        wrapper_styles["background-position"] = "center";
      }
      if (this.params["inline-styles"]) {
        for (let property in wrapper_styles) {
          this.element.style[property] = wrapper_styles[property];
        }
        if (!["absolute", "fixed", "relative", "sticky"].indexOf(parent.style.position)) {
          parent.style.position = "relative";
        }
      }
      if (this.params["play-button"] || this.params["mute-button"]) {
        const controls = document.createElement("div");
        controls.className = "video-background-controls";
        controls.style.position = "absolute";
        controls.style.top = "10px";
        controls.style.right = "10px";
        controls.style["z-index"] = 2;
        this.controls_element = controls;
        parent.appendChild(controls);
      }
      return this.element;
    }
  };

  // src/lib/youtube-background.js
  var YoutubeBackground = class extends SuperVideoBackground {
    constructor(elem, params, id, uid) {
      super(elem, params, id, uid);
      this.type = "youtube";
      this.is_mobile = isMobile();
      this.element = elem;
      this.ytid = id;
      this.uid = uid;
      this.element.setAttribute("data-vbg-uid", uid);
      this.player = null;
      this.buttons = {};
      this.isIntersecting = false;
      this.state = {};
      this.state.playing = false;
      this.state.muted = false;
      this.state.volume_once = false;
      this.params = {};
      const DEFAULTS = {
        "pause": false,
        //deprecated
        "play-button": false,
        "mute-button": false,
        "autoplay": true,
        "muted": true,
        "loop": true,
        "mobile": true,
        "load-background": false,
        "resolution": "16:9",
        "onStatusChange": function() {
        },
        "inline-styles": true,
        "fit-box": false,
        "offset": 100,
        // since showinfo is deprecated and ignored after September 25, 2018. we add +100 to hide it in the overflow
        "start-at": 0,
        "end-at": 0,
        "poster": null,
        "always-play": false,
        "volume": 1,
        "no-cookie": true
      };
      if (!this.ytid)
        return;
      this.injectScript();
      this.params = parseProperties(params, DEFAULTS, this.element, ["data-ytbg-", "data-vbg-"]);
      if (this.params.pause) {
        this.params["play-button"] = this.params.pause;
      }
      this.params.resolution_mod = parseResolutionString(this.params.resolution);
      this.state.playing = this.params.autoplay;
      this.state.muted = this.params.muted;
      this.buildWrapperHTML();
      if (this.is_mobile && !this.params.mobile) {
        return;
      }
      this.injectPlayer();
      if (this.params["play-button"]) {
        generateActionButton(this, {
          name: "play",
          className: "play-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: false,
          stateClassName: "paused",
          condition_parameter: "autoplay",
          stateChildClassNames: ["fa-pause-circle", "fa-play-circle"],
          actions: ["play", "pause"]
        });
      }
      if (this.params["mute-button"]) {
        generateActionButton(this, {
          name: "mute",
          className: "mute-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: true,
          stateClassName: "muted",
          condition_parameter: "muted",
          stateChildClassNames: ["fa-volume-up", "fa-volume-mute"],
          actions: ["unmute", "mute"]
        });
      }
    }
    initYTPlayer() {
      const self2 = this;
      if (window.hasOwnProperty("YT") && this.player === null) {
        this.player = new YT.Player(this.uid, {
          events: {
            "onReady": this.onVideoPlayerReady.bind(this),
            "onStateChange": this.onVideoStateChange.bind(this),
            "onError": function(event) {
            }
          }
        });
      }
    }
    injectScript() {
      if (window.hasOwnProperty("YT") || document.querySelector('script[src="https://www.youtube.com/player_api"]'))
        return;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/player_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    seekTo(seconds, allowSeekAhead = true) {
      this.player.seekTo(seconds, allowSeekAhead);
    }
    onVideoPlayerReady(event) {
      this.seekTo(this.params["start-at"]);
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        this.player.playVideo();
        this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
      }
      this.iframe.style.opacity = 1;
    }
    onVideoStateChange(event) {
      if (event.data === 0 && this.params.loop) {
        this.seekTo(this.params["start-at"]);
        this.player.playVideo();
      }
      if (event.data === -1 && this.params.autoplay) {
        this.seekTo(this.params["start-at"]);
        this.player.playVideo();
        this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
      }
      this.params["onStatusChange"](event);
    }
    injectPlayer() {
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute("frameborder", 0);
      this.iframe.setAttribute("allow", "autoplay; mute");
      let site = "https://www.youtube.com/embed/";
      if (this.params["no-cookie"]) {
        site = "https://www.youtube-nocookie.com/embed/";
      }
      let src = `${site}${this.ytid}?&enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0`;
      if (this.params.muted) {
        src += "&mute=1";
      }
      if (this.params.autoplay && this.params["always-play"]) {
        src += "&autoplay=1";
      }
      if (this.params.loop) {
        src += "&loop=1";
      }
      if (this.params["end-at"] > 0) {
        src += `&end=${this.params["end-at"]}`;
      }
      this.iframe.src = src;
      if (this.uid) {
        this.iframe.id = this.uid;
      }
      if (this.params["inline-styles"]) {
        this.iframe.style.top = "50%";
        this.iframe.style.left = "50%";
        this.iframe.style.transform = "translateX(-50%) translateY(-50%)";
        this.iframe.style.position = "absolute";
        this.iframe.style.opacity = 0;
      }
      this.element.appendChild(this.iframe);
      if (this.params["fit-box"]) {
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
      } else {
        this.resize();
      }
    }
    resize() {
      if (this.params["fit-box"])
        return;
      proportionalParentCoverResize(this.iframe, this.params.resolution_mod, this.params.offset);
    }
    softPause() {
      if (!this.state.playing || !this.player)
        return;
      this.player.pauseVideo();
      this.element.dispatchEvent(new CustomEvent("video-background-pause", { bubbles: true, detail: this }));
    }
    softPlay() {
      if (!this.state.playing || !this.player)
        return;
      this.player.playVideo();
      this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
    }
    play() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("play")) {
        const btn_obj = this.buttons.play;
        removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.playing = true;
      if (this.params["start-at"] && this.player.getCurrentTime() < this.params["start-at"]) {
        this.seekTo(this.params["start-at"]);
      }
      this.player.playVideo();
      this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
    }
    pause() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("play")) {
        const btn_obj = this.buttons.play;
        addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.playing = false;
      this.player.pauseVideo();
      this.element.dispatchEvent(new CustomEvent("video-background-pause", { bubbles: true, detail: this }));
    }
    unmute() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("mute")) {
        const btn_obj = this.buttons.mute;
        removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.muted = false;
      if (!this.state.volume_once) {
        this.state.volume_once = true;
        this.setVolume(this.params.volume);
      }
      this.player.unMute();
      this.element.dispatchEvent(new CustomEvent("video-background-unmute", { bubbles: true, detail: this }));
    }
    mute() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("mute")) {
        const btn_obj = this.buttons.mute;
        addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.muted = true;
      this.player.mute();
      this.element.dispatchEvent(new CustomEvent("video-background-mute", { bubbles: true, detail: this }));
    }
    setVolume(volume) {
      if (!this.player)
        return;
      this.player.setVolume(volume * 100);
      this.element.dispatchEvent(new CustomEvent("video-background-volume-change", { bubbles: true, detail: this }));
    }
  };

  // src/lib/vimeo-background.js
  var VimeoBackground = class extends SuperVideoBackground {
    constructor(elem, params, id, uid) {
      super(elem, params, id, uid);
      this.type = "vimeo";
      this.is_mobile = isMobile();
      this.element = elem;
      this.vid = id;
      this.uid = uid;
      this.element.setAttribute("data-vbg-uid", uid);
      this.player = null;
      this.buttons = {};
      this.state = {};
      this.state.playing = false;
      this.state.muted = false;
      this.state.volume_once = false;
      this.params = {};
      const DEFAULTS = {
        "pause": false,
        //deprecated
        "play-button": false,
        "mute-button": false,
        "autoplay": true,
        "muted": true,
        "loop": true,
        "mobile": true,
        "load-background": false,
        "resolution": "16:9",
        "inline-styles": true,
        "fit-box": false,
        "offset": 2,
        "start-at": 0,
        "end-at": 0,
        "poster": null,
        "always-play": false,
        "volume": 1,
        "no-cookie": true
      };
      this.injectScript();
      if (!this.vid) {
        return;
      }
      this.params = parseProperties(params, DEFAULTS, this.element, ["data-ytbg-", "data-vbg-"]);
      if (this.params.pause) {
        this.params["play-button"] = this.params.pause;
      }
      this.params.resolution_mod = parseResolutionString(this.params.resolution);
      this.state.playing = this.params.autoplay;
      this.state.muted = this.params.muted;
      this.buildWrapperHTML();
      if (this.is_mobile && !this.params.mobile) {
        return;
      }
      this.injectPlayer();
      if (this.params["play-button"]) {
        generateActionButton(this, {
          name: "play",
          className: "play-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: false,
          stateClassName: "paused",
          condition_parameter: "autoplay",
          stateChildClassNames: ["fa-pause-circle", "fa-play-circle"],
          actions: ["play", "pause"]
        });
      }
      if (this.params["mute-button"]) {
        generateActionButton(this, {
          name: "mute",
          className: "mute-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: true,
          stateClassName: "muted",
          condition_parameter: "muted",
          stateChildClassNames: ["fa-volume-up", "fa-volume-mute"],
          actions: ["unmute", "mute"]
        });
      }
    }
    injectScript() {
      if (window.hasOwnProperty("Vimeo") || document.querySelector('script[src="https://player.vimeo.com/api/player.js"]'))
        return;
      const tag = document.createElement("script");
      if (window.hasOwnProperty("onVimeoIframeAPIReady") && typeof window.onVimeoIframeAPIReady === "function")
        tag.addEventListener("load", () => {
          window.onVimeoIframeAPIReady();
        });
      tag.src = "https://player.vimeo.com/api/player.js";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    initVimeoPlayer() {
      if (window.hasOwnProperty("Vimeo") && this.player === null) {
        this.player = new Vimeo.Player(this.iframe);
        this.player.on("loaded", this.onVideoPlayerReady.bind(this));
        this.player.on("ended", this.onVideoEnded.bind(this));
        if (this.params["end-at"] > 0)
          this.player.on("timeupdate", this.onVideoTimeUpdate.bind(this));
        if (this.params.volume !== 1 && !this.params.muted)
          this.setVolume(this.params.volume);
      }
    }
    resize() {
      if (this.params["fit-box"])
        return;
      proportionalParentCoverResize(this.iframe, this.params.resolution_mod, this.params.offset);
    }
    seekTo(time) {
      this.player.setCurrentTime(time);
    }
    onVideoPlayerReady() {
      this.seekTo(this.params["start-at"]);
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        this.player.play();
        this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
      }
      this.iframe.style.opacity = 1;
    }
    onVideoEnded() {
      if (this.params["start-at"] && this.params.loop) {
        this.seekTo(this.params["start-at"]);
        this.player.play();
      }
    }
    onVideoTimeUpdate(event) {
      if (event.seconds >= this.params["end-at"]) {
        this.seekTo(this.params["start-at"]);
        if (!this.params.loop)
          this.pause();
      }
    }
    injectPlayer() {
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute("frameborder", 0);
      this.iframe.setAttribute("allow", ["autoplay; mute"]);
      let src = "https://player.vimeo.com/video/" + this.vid + "?background=1&controls=0";
      if (this.params.muted) {
        src += "&muted=1";
      }
      if (this.params.autoplay && this.params["always-play"]) {
        src += "&autoplay=1";
      }
      if (this.params.loop) {
        src += "&loop=1&autopause=0";
      }
      if (this.params["no-cookie"]) {
        src += "&dnt=1";
      }
      if (this.params["start-at"]) {
        src += "#t=" + this.params["start-at"] + "s";
      }
      this.iframe.src = src;
      if (this.uid) {
        this.iframe.id = this.uid;
      }
      if (this.params["inline-styles"]) {
        this.iframe.style.top = "50%";
        this.iframe.style.left = "50%";
        this.iframe.style.transform = "translateX(-50%) translateY(-50%)";
        this.iframe.style.position = "absolute";
        this.iframe.style.opacity = 1;
      }
      this.element.appendChild(this.iframe);
      if (this.params["fit-box"]) {
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
      } else {
        this.resize();
      }
    }
    softPause() {
      if (!this.state.playing || !this.player)
        return;
      this.player.pause();
      this.element.dispatchEvent(new CustomEvent("video-background-pause", { bubbles: true, detail: this }));
    }
    softPlay() {
      if (!this.state.playing || !this.player)
        return;
      this.player.play();
      this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
    }
    play() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("play")) {
        const btn_obj = this.buttons.play;
        removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      if (this.params["start-at"] || this.params["end-at"]) {
        const self2 = this;
        this.player.getCurrentTime().then(function(seconds) {
          if (self2.params["start-at"] && seconds < self2.params["start-at"]) {
            self2.seekTo(self2.params["start-at"]);
          }
          if (self2.params["end-at"] && seconds > self2.params["end-at"]) {
            self2.seekTo(self2.params["start-at"]);
          }
        });
      }
      this.state.playing = true;
      this.player.play();
      this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
    }
    pause() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("play")) {
        const btn_obj = this.buttons.play;
        addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.playing = false;
      this.player.pause();
      this.element.dispatchEvent(new CustomEvent("video-background-pause", { bubbles: true, detail: this }));
    }
    unmute() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("mute")) {
        const btn_obj = this.buttons.mute;
        removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.muted = false;
      if (!this.state.volume_once) {
        this.state.volume_once = true;
        this.setVolume(this.params.volume);
      }
      this.player.setMuted(false);
      this.element.dispatchEvent(new CustomEvent("video-background-unmute", { bubbles: true, detail: this }));
    }
    mute() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("mute")) {
        const btn_obj = this.buttons.mute;
        addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.muted = true;
      this.player.setMuted(true);
      this.element.dispatchEvent(new CustomEvent("video-background-mute", { bubbles: true, detail: this }));
    }
    setVolume(volume) {
      if (!this.player)
        return;
      this.player.setVolume(volume);
      this.element.dispatchEvent(new CustomEvent("video-background-volume-change", { bubbles: true, detail: this }));
    }
  };

  // src/lib/video-background.js
  var VideoBackground = class extends SuperVideoBackground {
    constructor(elem, params, vid_data, uid) {
      super(elem, params, vid_data, uid);
      this.type = "video";
      this.is_mobile = isMobile();
      this.element = elem;
      this.link = vid_data.link;
      this.ext = /(?:\.([^.]+))?$/.exec(vid_data.id)[1];
      this.uid = uid;
      this.element.setAttribute("data-vbg-uid", uid);
      this.player = null;
      this.buttons = {};
      this.state = {};
      this.state.playing = false;
      this.state.muted = false;
      this.state.volume_once = false;
      this.params = {};
      this.ready = false;
      const MIME_MAP = {
        "ogv": "video/ogg",
        "ogm": "video/ogg",
        "ogg": "video/ogg",
        "avi": "video/avi",
        "mp4": "video/mp4",
        "webm": "video/webm"
      };
      const DEFAULTS = {
        "pause": false,
        //deprecated
        "play-button": false,
        "mute-button": false,
        "autoplay": true,
        "muted": true,
        "loop": true,
        "mobile": true,
        "resolution": "16:9",
        "inline-styles": true,
        "fit-box": false,
        "offset": 2,
        "start-at": 0,
        "end-at": 0,
        "poster": null,
        "always-play": false,
        "volume": 1
      };
      if (!this.link || !this.ext)
        return;
      this.mime = MIME_MAP[this.ext.toLowerCase()];
      this.params = parseProperties(params, DEFAULTS, this.element, ["data-ytbg-", "data-vbg-"]);
      if (this.params.pause) {
        this.params["play-button"] = this.params.pause;
      }
      this.params.resolution_mod = parseResolutionString(this.params.resolution);
      this.state.playing = this.params.autoplay;
      this.state.muted = this.params.muted;
      this.buildWrapperHTML();
      if (this.is_mobile && !this.params.mobile) {
        return;
      }
      this.injectPlayer();
      if (this.params["play-button"]) {
        generateActionButton(this, {
          name: "play",
          className: "play-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: false,
          stateClassName: "paused",
          condition_parameter: "autoplay",
          stateChildClassNames: ["fa-pause-circle", "fa-play-circle"],
          actions: ["play", "pause"]
        });
      }
      if (this.params["mute-button"]) {
        generateActionButton(this, {
          name: "mute",
          className: "mute-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: true,
          stateClassName: "muted",
          condition_parameter: "muted",
          stateChildClassNames: ["fa-volume-up", "fa-volume-mute"],
          actions: ["unmute", "mute"]
        });
      }
    }
    seekTo(seconds) {
      if (this.player.hasOwnProperty("fastSeek")) {
        this.player.fastSeek(seconds);
        return;
      }
      this.player.currentTime = seconds;
    }
    injectPlayer() {
      this.player = document.createElement("video");
      this.player.toggleAttribute("playsinline", true);
      this.player.toggleAttribute("loop", this.params.loop);
      this.player.toggleAttribute("autoplay", this.params.autoplay && (this.params["always-play"] || this.isIntersecting));
      this.player.toggleAttribute("muted", this.params.muted);
      if (this.params.volume !== 1 && !this.params.muted)
        this.setVolume(this.params.volume);
      this.player.setAttribute("id", this.uid);
      if (this.params["inline-styles"]) {
        this.player.style.top = "50%";
        this.player.style.left = "50%";
        this.player.style.transform = "translateX(-50%) translateY(-50%)";
        this.player.style.position = "absolute";
        this.player.style.opacity = 0;
        this.player.addEventListener("canplay", (e) => {
          e.target.style.opacity = 1;
        });
      }
      const self2 = this;
      if (this.params["start-at"] && this.params.autoplay) {
        this.player.addEventListener("canplay", (e) => {
          self2.seekTo(this.params["start-at"]);
        }, { once: true });
      }
      if (this.params["end-at"]) {
        this.player.addEventListener("timeupdate", (e) => {
          if (self2.player.currentTime >= self2.params["end-at"]) {
            self2.seekTo(this.params["start-at"]);
          }
        });
      }
      const source = document.createElement("source");
      source.setAttribute("src", this.link);
      source.setAttribute("type", this.mime);
      this.player.appendChild(source);
      this.element.appendChild(this.player);
      if (this.params["fit-box"]) {
        this.player.style.width = "100%";
        this.player.style.height = "100%";
      } else {
        this.resize();
      }
    }
    resize() {
      if (this.params["fit-box"])
        return;
      proportionalParentCoverResize(this.player, this.params.resolution_mod, this.params.offset);
    }
    softPause() {
      if (!this.state.playing || !this.player)
        return;
      this.player.pause();
      this.element.dispatchEvent(new CustomEvent("video-background-pause", { bubbles: true, detail: this }));
    }
    softPlay() {
      if (!this.state.playing || !this.player)
        return;
      this.player.play();
      this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
    }
    play() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("play")) {
        const btn_obj = this.buttons.play;
        removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      if (this.params["start-at"] || this.params["end-at"]) {
        const seconds = this.player.currentTime;
        if (this.params["start-at"] && seconds < this.params["start-at"]) {
          this.seekTo(self.params["start-at"]);
        }
        if (this.params["end-at"] && seconds > this.params["end-at"]) {
          this.seekTo(self.params["start-at"]);
        }
      }
      this.state.playing = true;
      this.player.play();
      this.element.dispatchEvent(new CustomEvent("video-background-play", { bubbles: true, detail: this }));
    }
    pause() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("play")) {
        const btn_obj = this.buttons.play;
        addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.playing = false;
      this.player.pause();
      this.element.dispatchEvent(new CustomEvent("video-background-pause", { bubbles: true, detail: this }));
    }
    unmute() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("mute")) {
        const btn_obj = this.buttons.mute;
        removeClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.muted = false;
      this.player.muted = false;
      if (!this.state.volume_once) {
        this.state.volume_once = true;
        this.setVolume(this.params.volume);
      }
      this.element.dispatchEvent(new CustomEvent("video-background-unmute", { bubbles: true, detail: this }));
    }
    mute() {
      if (!this.player)
        return;
      if (this.buttons.hasOwnProperty("mute")) {
        const btn_obj = this.buttons.mute;
        addClass(btn_obj.element, btn_obj.button_properties.stateClassName);
        removeClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[0]);
        addClass(btn_obj.element.firstChild, btn_obj.button_properties.stateChildClassNames[1]);
      }
      this.state.muted = true;
      this.player.muted = true;
      this.element.dispatchEvent(new CustomEvent("video-background-mute", { bubbles: true, detail: this }));
    }
    setVolume(volume) {
      if (!this.player)
        return;
      this.player.volume = volume;
      this.element.dispatchEvent(new CustomEvent("video-background-volume-change", { bubbles: true, detail: this }));
    }
  };

  // src/video-backgrounds.js
  var VideoBackgrounds = class {
    constructor(selector, params) {
      __publicField(this, "generateUID", function(pref) {
        let uid = pref + "-" + randomIntInclusive(0, 9999);
        while (this.index.hasOwnProperty(uid)) {
          uid = pref + "-" + randomIntInclusive(0, 9999);
        }
        return uid;
      });
      this.elements = selector;
      if (typeof selector === "string") {
        this.elements = document.querySelectorAll(selector);
      }
      this.index = {};
      this.re = {};
      this.re.YOUTUBE = RE_YOUTUBE;
      this.re.VIMEO = RE_VIMEO;
      this.re.VIDEO = RE_VIDEO;
      const self2 = this;
      this.intersectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          const uid = entry.target.getAttribute("data-vbg-uid");
          if (uid && self2.index.hasOwnProperty(uid) && entry.isIntersecting) {
            self2.index[uid].isIntersecting = true;
            try {
              if (self2.index[uid].player && self2.index[uid].params.autoplay)
                self2.index[uid].softPlay();
            } catch (e) {
            }
          } else {
            self2.index[uid].isIntersecting = false;
            try {
              if (self2.index[uid].player)
                self2.index[uid].softPause();
            } catch (e) {
            }
          }
        });
      });
      this.resizeObserver = null;
      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(function(entries) {
          entries.forEach(function(entry) {
            const uid = entry.target.getAttribute("data-vbg-uid");
            if (uid && self2.index.hasOwnProperty(uid)) {
              window.requestAnimationFrame(() => self2.index[uid].resize());
            }
          });
        });
      } else {
        window.addEventListener("resize", function() {
          for (let k in self2.index) {
            window.requestAnimationFrame(() => self2.index[k].resize());
          }
        });
      }
      this.initPlayers();
      for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        this.add(element, params);
      }
    }
    add(element, params) {
      const link = element.getAttribute("data-youtube") || element.getAttribute("data-vbg");
      const vid_data = this.getVidID(link);
      if (!vid_data) {
        return;
      }
      const uid = this.generateUID(vid_data.id);
      if (!uid) {
        return;
      }
      switch (vid_data.type) {
        case "YOUTUBE":
          const yb = new YoutubeBackground(element, params, vid_data.id, uid);
          this.index[uid] = yb;
          break;
        case "VIMEO":
          const vm = new VimeoBackground(element, params, vid_data.id, uid);
          this.index[uid] = vm;
          break;
        case "VIDEO":
          const vid = new VideoBackground(element, params, vid_data, uid);
          this.index[uid] = vid;
          break;
      }
      if (this.resizeObserver) {
        this.resizeObserver.observe(element);
      }
      if (!this.index[uid].params["always-play"]) {
        this.intersectionObserver.observe(element);
      }
    }
    getVidID(link) {
      if (link !== void 0 && link !== null) {
        for (let k in this.re) {
          const pts = link.match(this.re[k]);
          if (pts && pts.length) {
            this.re[k].lastIndex = 0;
            return {
              id: pts[1],
              type: k,
              regex_pts: pts,
              link
            };
          }
        }
      }
      return null;
    }
    pauseVideos() {
      for (let k in this.index) {
        this.index[k].pause();
      }
    }
    playVideos() {
      for (let k in this.index) {
        this.index[k].play();
      }
    }
    initPlayers(callback) {
      const self2 = this;
      window.onYouTubeIframeAPIReady = function() {
        for (let k in self2.index) {
          if (self2.index[k] instanceof YoutubeBackground) {
            self2.index[k].initYTPlayer();
          }
        }
        if (callback) {
          setTimeout(callback, 100);
        }
      };
      if (window.hasOwnProperty("YT") && window.YT.loaded) {
        window.onYouTubeIframeAPIReady();
      }
      window.onVimeoIframeAPIReady = function() {
        for (let k in self2.index) {
          if (self2.index[k] instanceof VimeoBackground) {
            self2.index[k].initVimeoPlayer();
          }
        }
        if (callback) {
          setTimeout(callback, 100);
        }
      };
      if (window.hasOwnProperty("Vimeo") && window.Vimeo.hasOwnProperty("Player")) {
        window.onVimeoIframeAPIReady();
      }
    }
  };

  // src/main.js
  if (typeof jQuery == "function") {
    (function($) {
      $.fn.youtube_background = function(params) {
        const $this = $(this);
        if (window.hasOwnProperty("VIDEO_BACKGROUNDS")) {
          window.VIDEO_BACKGROUNDS.add($this, params);
          return $this;
        }
        window.VIDEO_BACKGROUNDS = new VideoBackgrounds(this, params);
        return $this;
      };
    })(jQuery);
  }
  window.VideoBackgrounds = VideoBackgrounds;
})();
//# sourceMappingURL=jquery.youtube-background.js.map
