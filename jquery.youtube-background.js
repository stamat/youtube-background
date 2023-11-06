/* youtube-background v1.0.22 | https://github.com/stamat/youtube-background | MIT License */
(() => {
  // src/lib/buttons.js
  function buttonOn(buttonObj) {
    if (!buttonObj)
      return;
    buttonObj.element.classList.add(buttonObj.stateClassName);
    buttonObj.element.firstChild.classList.remove(buttonObj.stateChildClassNames[0]);
    buttonObj.element.firstChild.classList.add(buttonObj.stateChildClassNames[1]);
    buttonObj.element.setAttribute("aria-checked", false);
  }
  function buttonOff(buttonObj) {
    if (!buttonObj)
      return;
    buttonObj.element.classList.remove(buttonObj.stateClassName);
    buttonObj.element.firstChild.classList.add(buttonObj.stateChildClassNames[0]);
    buttonObj.element.firstChild.classList.remove(buttonObj.stateChildClassNames[1]);
    buttonObj.element.setAttribute("aria-checked", true);
  }
  function generateActionButton(obj, props) {
    const btn = document.createElement("button");
    btn.className = props.className;
    btn.innerHTML = props.innerHtml;
    btn.setAttribute("role", "switch");
    btn.firstChild.classList.add(props.stateChildClassNames[0]);
    btn.setAttribute("aria-checked", !props.initialState);
    props.element = btn;
    if (obj.params[props.condition_parameter] === props.initialState) {
      buttonOn(props);
    }
    btn.addEventListener("click", function(e) {
      if (this.classList.contains(props.stateClassName)) {
        buttonOff(props);
        obj[props.actions[0]]();
      } else {
        buttonOn(props);
        obj[props.actions[1]]();
      }
    });
    obj.buttons[props.name] = {
      element: btn,
      button_properties: props
    };
    obj.controls_element.appendChild(btn);
  }

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
  function percentage(num, total) {
    if (!num || !total || Number.isNaN(num) || Number.isNaN(total))
      return 0;
    return num / total * 100;
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

  // src/lib/super-video-background.js
  var SuperVideoBackground = class {
    constructor(elem, params, id, uid, type) {
      if (!id)
        return;
      this.is_mobile = isMobile();
      this.type = type;
      this.id = id;
      this.element = elem;
      this.playerElement = null;
      this.uid = uid;
      this.element.setAttribute("data-vbg-uid", uid);
      this.buttons = {};
      this.isIntersecting = false;
      this.state = {};
      this.state.playing = false;
      this.state.muted = false;
      this.initialPlay = false;
      this.initialVolume = false;
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
        "offset": 100,
        // since showinfo is deprecated and ignored after September 25, 2018. we add +100 to hide it in the overflow
        "start-at": 0,
        "end-at": 0,
        "poster": null,
        "always-play": false,
        "volume": 1,
        "no-cookie": true,
        "force-on-low-battery": false,
        "lazyloading": false
      };
      this.params = this.parseProperties(params, DEFAULTS, this.element, ["data-ytbg-", "data-vbg-"]);
      if (this.params.pause) {
        this.params["play-button"] = this.params.pause;
      }
      this.params.resolution_mod = parseResolutionString(this.params.resolution);
      this.state.playing = this.params.autoplay;
      this.state.muted = this.params.muted;
      this.buildWrapperHTML();
      if (this.is_mobile && !this.params.mobile)
        return;
      if (this.params["play-button"]) {
        generateActionButton(this, {
          name: "playing",
          className: "play-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: !this.state.playing,
          stateClassName: "paused",
          condition_parameter: "autoplay",
          stateChildClassNames: ["fa-pause-circle", "fa-play-circle"],
          actions: ["play", "pause"]
        });
      }
      if (this.params["mute-button"]) {
        generateActionButton(this, {
          name: "muted",
          className: "mute-toggle",
          innerHtml: '<i class="fa"></i>',
          initialState: this.state.muted,
          stateClassName: "muted",
          condition_parameter: "muted",
          stateChildClassNames: ["fa-volume-up", "fa-volume-mute"],
          actions: ["unmute", "mute"]
        });
      }
    }
    timeToPercentage(time) {
      if (!this.duration)
        return 0;
      if (this.params["start-at"])
        time -= this.params["start-at"];
      if (time >= this.duration)
        return 100;
      if (this.params["end-at"] && time >= this.params["end-at"])
        return 100;
      if (time <= 0)
        return 0;
      if (this.params["start-at"] && time <= this.params["start-at"])
        return 0;
      return percentage(time, this.duration);
    }
    percentageToTime(percentage2) {
      if (!this.duration)
        return 0;
      if (percentage2 > 100)
        return this.duration;
      if (percentage2 < 0)
        return 0;
      let time = percentage2 * this.duration / 100;
      if (this.params["start-at"])
        time += this.params["start-at"];
      return time;
    }
    resize(element) {
      if (this.params["fit-box"])
        return;
      proportionalParentCoverResize(element || this.playerElement, this.params.resolution_mod, this.params.offset);
    }
    stylePlayerElement(element) {
      if (!element)
        return;
      if (this.params["inline-styles"]) {
        element.style.top = "50%";
        element.style.left = "50%";
        element.style.transform = "translateX(-50%) translateY(-50%)";
        element.style.position = "absolute";
        element.style.opacity = 0;
      }
      if (this.params["fit-box"]) {
        element.style.width = "100%";
        element.style.height = "100%";
      }
    }
    buildWrapperHTML() {
      const parent = this.element.parentNode;
      this.element.classList.add("youtube-background", "video-background");
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
            wrapper_styles["background-image"] = "url(https://img.youtube.com/vi/" + this.id + "/hqdefault.jpg)";
          if (this.type === "vimeo")
            wrapper_styles["background-image"] = "url(https://vumbnail.com/" + this.id + ".jpg)";
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
    dispatchEvent(name) {
      this.element.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: this }));
    }
    mobileLowBatteryAutoplayHack() {
      if (!this.params["force-on-low-battery"])
        return;
      if (!this.is_mobile && this.params.mobile)
        return;
      document.addEventListener("touchstart", () => {
        if (!this.initialPlay && this.params.autoplay && this.params.muted) {
          this.softPlay();
          if (!this.isIntersecting && !this.params["always-play"]) {
            this.softPause();
          }
        }
      }, { once: true });
    }
    parseProperties(params, defaults, element, attr_prefix) {
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
          for (let i = 0; i < attr_prefix.length; i++) {
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
  };

  // src/lib/youtube-background.js
  var YoutubeBackground = class extends SuperVideoBackground {
    constructor(elem, params, id, uid) {
      super(elem, params, id, uid, "youtube");
      if (!id)
        return;
      if (this.is_mobile && !this.params.mobile)
        return;
      this.injectScript();
      this.player = null;
      this.injectPlayer();
      this.STATES = {
        "-1": "notstarted",
        "0": "ended",
        "1": "playing",
        "2": "paused",
        "3": "buffering",
        "5": "cued"
      };
      this.currentState = "notstarted";
      this.timeUpdateTimer = null;
      this.currentTime = this.params["start-at"];
      this.duration = this.params["end-at"];
      this.timeUpdateInterval = 250;
    }
    startTimeUpdateTimer() {
      if (this.timeUpdateTimer)
        return;
      this.timeUpdateTimer = setInterval(this.onVideoTimeUpdate.bind(this), this.timeUpdateInterval);
    }
    stopTimeUpdateTimer() {
      clearInterval(this.timeUpdateTimer);
      this.timeUpdateTimer = null;
    }
    convertState(state) {
      return this.STATES[state];
    }
    initYTPlayer() {
      if (window.hasOwnProperty("YT") && this.player === null) {
        this.player = new YT.Player(this.uid, {
          events: {
            "onReady": this.onVideoPlayerReady.bind(this),
            "onStateChange": this.onVideoStateChange.bind(this)
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
    generatePlayerElement() {
      const playerElement = document.createElement("iframe");
      playerElement.setAttribute("frameborder", 0);
      playerElement.setAttribute("allow", "autoplay; mute");
      if (this.params["lazyloading"])
        playerElement.setAttribute("loading", "lazy");
      return playerElement;
    }
    generateSrcURL(id) {
      let site = "https://www.youtube.com/embed/";
      if (this.params["no-cookie"]) {
        site = "https://www.youtube-nocookie.com/embed/";
      }
      let src = `${site}${id}?&enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0`;
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
      return src;
    }
    injectPlayer() {
      this.playerElement = this.generatePlayerElement();
      this.src = this.generateSrcURL(this.id);
      this.playerElement.src = this.src;
      this.playerElement.id = this.uid;
      this.stylePlayerElement(this.playerElement);
      this.element.appendChild(this.playerElement);
      this.resize(this.playerElement);
    }
    /* ===== API ===== */
    onVideoTimeUpdate() {
      const ctime = this.player.getCurrentTime();
      if (ctime === this.currentTime)
        return;
      this.currentTime = ctime;
      if (this.params["end-at"] && this.currentTime >= this.params["end-at"]) {
        this.currentState = "ended";
        this.dispatchEvent("video-background-state-change");
        this.onVideoEnded();
      }
      this.dispatchEvent("video-background-time-update");
    }
    onVideoPlayerReady() {
      this.mobileLowBatteryAutoplayHack();
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        if (this.params["start-at"])
          this.seekTo(this.params["start-at"]);
        this.player.playVideo();
      }
      if (!this.params["end-at"]) {
        this.duration = this.player.getDuration();
      }
      this.dispatchEvent("video-background-ready");
    }
    onVideoStateChange(event) {
      this.currentState = this.convertState(event.data);
      if (this.currentState === "ended") {
        this.onVideoEnded();
      }
      if (this.currentState === "notstarted" && this.params.autoplay) {
        this.seekTo(this.params["start-at"]);
        this.player.playVideo();
      }
      if (this.currentState === "playing") {
        if (!this.initialPlay) {
          this.initialPlay = true;
          this.playerElement.style.opacity = 1;
        }
        if (!this.duration && !this.params["end-at"]) {
          this.duration = this.player.getDuration();
        }
        this.dispatchEvent("video-background-play");
        this.startTimeUpdateTimer();
      } else {
        this.dispatchEvent("video-background-pause");
        this.stopTimeUpdateTimer();
      }
      this.dispatchEvent("video-background-state-change");
    }
    onVideoEnded() {
      if (this.params.loop) {
        this.seekTo(this.params["start-at"]);
        this.player.playVideo();
      } else {
        this.player.pause();
      }
      this.dispatchEvent("video-background-ended");
    }
    seekTo(seconds, allowSeekAhead = true) {
      this.player.seekTo(seconds, allowSeekAhead);
    }
    softPause() {
      if (!this.state.playing || !this.player)
        return;
      this.player.pauseVideo();
    }
    softPlay() {
      if (!this.state.playing || !this.player)
        return;
      this.player.playVideo();
    }
    play() {
      if (!this.player)
        return;
      this.state.playing = true;
      if (this.params["start-at"] && this.player.getCurrentTime() < this.params["start-at"]) {
        this.seekTo(this.params["start-at"]);
      }
      this.player.playVideo();
    }
    pause() {
      this.state.playing = false;
      this.player.pauseVideo();
    }
    unmute() {
      if (!this.player)
        return;
      this.state.muted = false;
      if (!this.initialVolume) {
        this.initialVolume = true;
        this.setVolume(this.params.volume);
      }
      this.player.unMute();
      this.dispatchEvent("video-background-unmute");
    }
    mute() {
      if (!this.player)
        return;
      this.state.muted = true;
      this.player.mute();
      this.dispatchEvent("video-background-mute");
    }
    setVolume(volume) {
      if (!this.player)
        return;
      this.player.setVolume(volume * 100);
      this.dispatchEvent("video-background-volume-change");
    }
  };

  // src/lib/vimeo-background.js
  var VimeoBackground = class extends SuperVideoBackground {
    constructor(elem, params, id, uid) {
      super(elem, params, id, uid, "vimeo");
      if (!id)
        return;
      if (this.is_mobile && !this.params.mobile)
        return;
      this.injectScript();
      this.player = null;
      this.injectPlayer();
      this.currentState = "notstarted";
      this.currentTime = this.params["start-at"];
      this.duration = this.params["end-at"];
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
        this.player = new Vimeo.Player(this.playerElement);
        this.player.on("loaded", this.onVideoPlayerReady.bind(this));
        this.player.on("ended", this.onVideoEnded.bind(this));
        this.player.on("play", this.onVideoPlay.bind(this));
        this.player.on("pause", this.onVideoPause.bind(this));
        this.player.on("bufferstart", this.onVideoBuffering.bind(this));
        this.player.on("timeupdate", this.onVideoTimeUpdate.bind(this));
        if (this.params.volume !== 1 && !this.params.muted)
          this.setVolume(this.params.volume);
      }
    }
    generatePlayerElement() {
      const playerElement = document.createElement("iframe");
      playerElement.setAttribute("frameborder", 0);
      playerElement.setAttribute("allow", "autoplay; mute");
      if (this.params["lazyloading"])
        playerElement.setAttribute("loading", "lazy");
      return playerElement;
    }
    generateSrcURL(id) {
      let src = "https://player.vimeo.com/video/" + id + "?background=1&controls=0";
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
      return src;
    }
    injectPlayer() {
      this.playerElement = this.generatePlayerElement();
      this.src = this.generateSrcURL(this.id);
      this.playerElement.src = this.src;
      this.playerElement.id = this.uid;
      this.stylePlayerElement(this.playerElement);
      this.element.appendChild(this.playerElement);
      this.resize(this.playerElement);
    }
    updateState(state) {
      this.currentState = state;
      this.dispatchEvent("video-background-state-change");
    }
    /* ===== API ===== */
    onVideoPlayerReady() {
      this.mobileLowBatteryAutoplayHack();
      this.seekTo(this.params["start-at"]);
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        this.player.play();
      }
      if (!this.params["end-at"]) {
        this.player.getDuration().then((duration) => {
          this.duration = duration;
        });
      }
      this.dispatchEvent("video-background-ready");
    }
    onVideoEnded() {
      this.updateState("ended");
      if (this.params["start-at"] && this.params.loop) {
        this.seekTo(this.params["start-at"]);
        this.player.play();
      }
      this.dispatchEvent("video-background-ended");
    }
    onVideoTimeUpdate(event) {
      this.currentTime = event.seconds;
      this.dispatchEvent("video-background-time-update");
      if (this.params["end-at"] && event.seconds >= this.params["end-at"]) {
        this.onVideoEnded();
      }
    }
    onVideoBuffering() {
      this.updateState("buffering");
    }
    onVideoPlay(event) {
      if (!this.initialPlay) {
        this.initialPlay = true;
        this.playerElement.style.opacity = 1;
      }
      const seconds = event.seconds;
      if (self.params["start-at"] && seconds < self.params["start-at"]) {
        self.seekTo(self.params["start-at"]);
      }
      if (self.params["end-at"] && seconds > self.params["end-at"]) {
        self.seekTo(self.params["start-at"]);
      }
      this.updateState("playing");
      this.dispatchEvent("video-background-play");
    }
    onVideoPause() {
      this.updateState("paused");
      this.dispatchEvent("video-background-pause");
    }
    seekTo(time) {
      this.player.setCurrentTime(time);
    }
    softPause() {
      if (!this.state.playing || !this.player)
        return;
      this.player.pause();
    }
    softPlay() {
      if (!this.state.playing || !this.player)
        return;
      this.player.play();
    }
    play() {
      if (!this.player)
        return;
      this.state.playing = true;
      this.player.play();
    }
    pause() {
      if (!this.player)
        return;
      this.state.playing = false;
      this.player.pause();
    }
    unmute() {
      if (!this.player)
        return;
      this.state.muted = false;
      if (!this.initialVolume) {
        this.initialVolume = true;
        this.setVolume(this.params.volume);
      }
      this.player.setMuted(false);
      this.dispatchEvent("video-background-unmute");
    }
    mute() {
      if (!this.player)
        return;
      this.state.muted = true;
      this.player.setMuted(true);
      this.dispatchEvent("video-background-mute");
    }
    setVolume(volume) {
      if (!this.player)
        return;
      this.player.setVolume(volume);
      this.dispatchEvent("video-background-volume-change");
    }
  };

  // src/lib/video-background.js
  var VideoBackground = class extends SuperVideoBackground {
    constructor(elem, params, vid_data, uid) {
      super(elem, params, vid_data.link, uid, "video");
      if (!vid_data || !vid_data.link)
        return;
      if (this.is_mobile && !this.params.mobile)
        return;
      this.src = vid_data.link;
      this.ext = /(?:\.([^.]+))?$/.exec(vid_data.id)[1];
      this.uid = uid;
      this.element.setAttribute("data-vbg-uid", uid);
      this.player = null;
      this.buttons = {};
      const MIME_MAP = {
        "ogv": "video/ogg",
        "ogm": "video/ogg",
        "ogg": "video/ogg",
        "avi": "video/avi",
        "mp4": "video/mp4",
        "webm": "video/webm"
      };
      this.mime = MIME_MAP[this.ext.toLowerCase()];
      this.injectPlayer();
      this.currentState = "notstarted";
      this.timeUpdateTimer = null;
      this.currentTime = this.params["start-at"];
      this.duration = this.params["end-at"];
      this.mobileLowBatteryAutoplayHack();
      this.dispatchEvent("video-background-ready");
    }
    generatePlayerElement() {
      const playerElement = document.createElement("video");
      playerElement.toggleAttribute("playsinline", true);
      playerElement.toggleAttribute("loop", this.params.loop);
      playerElement.toggleAttribute("autoplay", this.params.autoplay && (this.params["always-play"] || this.isIntersecting));
      playerElement.toggleAttribute("muted", this.params.muted);
      if (this.params["lazyloading"])
        playerElement.setAttribute("loading", "lazy");
      return playerElement;
    }
    injectPlayer() {
      this.player = this.generatePlayerElement();
      this.playerElement = this.player;
      if (this.params.volume !== 1 && !this.params.muted)
        this.setVolume(this.params.volume);
      this.playerElement.setAttribute("id", this.uid);
      const source = document.createElement("source");
      source.setAttribute("src", this.src);
      source.setAttribute("type", this.mime);
      this.playerElement.appendChild(source);
      this.stylePlayerElement(this.playerElement);
      this.element.appendChild(this.playerElement);
      this.resize(this.playerElement);
      this.player.addEventListener("loadedmetadata", this.onVideoLoadedMetadata.bind(this), { once: true });
      this.player.addEventListener("durationchange", this.onVideoLoadedMetadata.bind(this), { once: true });
      this.player.addEventListener("canplay", this.onVideoCanPlay.bind(this), { once: true });
      this.player.addEventListener("timeupdate", this.onVideoTimeUpdate.bind(this));
      this.player.addEventListener("play", this.onVideoPlay.bind(this));
      this.player.addEventListener("pause", this.onVideoPause.bind(this));
      this.player.addEventListener("waiting", this.onVideoBuffering.bind(this));
      this.player.addEventListener("ended", this.onVideoEnded.bind(this));
    }
    updateDuration() {
      if (!this.player)
        return;
      if (!this.duration && !this.params["end-at"])
        this.duration = this.player.duration;
    }
    updateState(state) {
      this.currentState = state;
      this.dispatchEvent("video-background-state-change");
    }
    /* ===== API ===== */
    onVideoLoadedMetadata() {
      this.updateDuration();
    }
    onVideoCanPlay() {
      this.updateDuration();
      if (this.params["start-at"] && this.params.autoplay) {
        this.seekTo(this.params["start-at"]);
      }
    }
    onVideoTimeUpdate() {
      this.currentTime = this.player.currentTime;
      this.dispatchEvent("video-background-time-update");
      if (this.currentTime >= this.duration) {
        this.onVideoEnded();
      }
    }
    onVideoPlay() {
      if (!this.initialPlay) {
        this.initialPlay = true;
        this.playerElement.style.opacity = 1;
      }
      this.updateState("playing");
      this.dispatchEvent("video-background-play");
    }
    onVideoPause() {
      this.updateState("paused");
      this.dispatchEvent("video-background-pause");
    }
    onVideoEnded() {
      this.updateState("ended");
      if (this.params["start-at"] && this.params.loop) {
        this.seekTo(this.params["start-at"]);
        this.play();
      }
      this.dispatchEvent("video-background-ended");
    }
    onVideoBuffering() {
      this.updateState("buffering");
    }
    seekTo(seconds) {
      if (this.player.hasOwnProperty("fastSeek")) {
        this.player.fastSeek(seconds);
        return;
      }
      this.player.currentTime = seconds;
    }
    softPause() {
      if (!this.state.playing || !this.player)
        return;
      this.player.pause();
    }
    softPlay() {
      if (!this.state.playing || !this.player)
        return;
      this.player.play();
    }
    play() {
      if (!this.player)
        return;
      if (this.params["start-at"] || this.params["end-at"]) {
        const seconds = this.player.currentTime;
        if (this.params["start-at"] && seconds <= this.params["start-at"]) {
          this.seekTo(this.params["start-at"]);
        }
        if (this.params["end-at"] && seconds >= this.params["end-at"]) {
          this.seekTo(this.params["start-at"]);
        }
      }
      this.state.playing = true;
      this.player.play();
    }
    pause() {
      if (!this.player)
        return;
      this.state.playing = false;
      this.player.pause();
    }
    unmute() {
      if (!this.player)
        return;
      this.state.muted = false;
      this.player.muted = false;
      if (!this.initialVolume) {
        this.initialVolume = true;
        this.setVolume(this.params.volume);
      }
      this.dispatchEvent("video-background-unmute");
    }
    mute() {
      if (!this.player)
        return;
      this.state.muted = true;
      this.player.muted = true;
      this.dispatchEvent("video-background-mute");
    }
    setVolume(volume) {
      if (!this.player)
        return;
      this.player.volume = volume;
      this.dispatchEvent("video-background-volume-change");
    }
  };

  // src/video-backgrounds.js
  var VideoBackgrounds = class {
    constructor(selector, params) {
      this.elements = selector;
      if (typeof selector === "string") {
        this.elements = document.querySelectorAll(selector);
      }
      this.index = {};
      this.re = {};
      this.re.YOUTUBE = RE_YOUTUBE;
      this.re.VIMEO = RE_VIMEO;
      this.re.VIDEO = /\/([^\/]+\.(?:mp4|ogg|ogv|ogm|webm|avi))\s*$/i;
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
            window.requestAnimationFrame(() => self2.index[k].resize(self2.index[k].playerElement));
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
      if (!vid_data)
        return;
      const uid = this.generateUID(vid_data.id);
      if (!uid)
        return;
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
      if (link === void 0 && link === null)
        return;
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
      return;
    }
    generateUID(pref) {
      pref = pref.replace(/[^a-zA-Z0-9\-_]/g, "-");
      pref = pref.replace(/-{2,}/g, "-");
      pref = pref.replace(/^-+/, "").replace(/-+$/, "");
      pref = "vbg-" + pref;
      let uid = pref + "-" + randomIntInclusive(0, 9999);
      while (this.index.hasOwnProperty(uid)) {
        uid = pref + "-" + randomIntInclusive(0, 9999);
      }
      return uid;
    }
    get(element) {
      const uid = typeof element === "string" ? element : element.getAttribute("data-vbg-uid");
      if (uid && this.index.hasOwnProperty(uid))
        return this.index[uid];
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
