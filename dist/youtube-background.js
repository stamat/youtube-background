/* youtube-background v1.2.1 | https://github.com/stamat/youtube-background | MIT License */
(() => {
  // src/lib/buttons.mjs
  function setButtonState(buttonObj, active) {
    if (!buttonObj || !buttonObj.element) return;
    const element = buttonObj.element;
    element.classList.toggle(buttonObj.stateClassName, active);
    element.firstChild.classList.toggle(buttonObj.stateChildClassNames[0], !active);
    element.firstChild.classList.toggle(buttonObj.stateChildClassNames[1], active);
    if (buttonObj.stateLabels) element.setAttribute("aria-label", buttonObj.stateLabels[active ? 1 : 0]);
  }
  function generateActionButton(obj, props) {
    const btn = document.createElement("button");
    btn.className = props.className;
    btn.innerHTML = props.innerHtml;
    btn.setAttribute("type", "button");
    props.element = btn;
    setButtonState(props, !!obj[props.condition_parameter]);
    btn.addEventListener("click", function() {
      const active = this.classList.contains(props.stateClassName);
      setButtonState(props, !active);
      obj[props.actions[active ? 0 : 1]]();
    });
    obj.buttons[props.name] = {
      element: btn,
      button_properties: props
    };
    obj.controls_element.appendChild(btn);
  }

  // node_modules/book-of-spells/src/helpers.mjs
  var objProto = Object.prototype;
  var foldF64 = new Float64Array(1);
  var foldU32 = new Uint32Array(foldF64.buffer);
  function stringToBoolean(str) {
    if (/^\s*(true|false)\s*$/i.test(str)) return str.trim().toLowerCase() === "true";
  }
  function stringToNumber(str) {
    if (/^\s*-?\d+\s*$/.test(str)) return parseInt(str);
    if (/^\s*-?\d+\.\d+\s*$/.test(str)) return parseFloat(str);
  }
  function stringToArray(str) {
    if (!/^\s*\[.*\]\s*$/.test(str)) return;
    try {
      return JSON.parse(str);
    } catch (e) {
    }
  }
  function stringToObject(str) {
    if (!/^\s*\{.*\}\s*$/.test(str)) return;
    try {
      return JSON.parse(str);
    } catch (e) {
    }
  }
  function stringToRegex(str) {
    if (typeof str !== "string") return;
    const match = str.match(/^\s*\/(.*?)\/([gimsuy]*)\s*$/);
    if (!match) return;
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
    }
  }
  function stringToType(str) {
    var _a, _b, _c, _d;
    if (/^\s*null\s*$/.test(str)) return null;
    const bool = stringToBoolean(str);
    if (bool !== void 0) return bool;
    return (_d = (_c = (_b = (_a = stringToNumber(str)) != null ? _a : stringToArray(str)) != null ? _b : stringToObject(str)) != null ? _c : stringToRegex(str)) != null ? _d : str;
  }
  function isArray(o) {
    return Array.isArray(o);
  }
  function isString(o) {
    return typeof o === "string";
  }
  var PLAIN = {
    \u00C6: "AE",
    \u00E6: "ae",
    \u0152: "OE",
    \u0153: "oe",
    \u00DF: "ss",
    "\u1E9E": "SS",
    \u00DE: "TH",
    \u00FE: "th",
    \u0110: "D",
    \u0111: "d",
    \u00D0: "D",
    \u00F0: "d",
    \u00D8: "O",
    \u00F8: "o",
    \u0141: "L",
    \u0142: "l",
    \u013F: "L",
    \u0140: "l",
    \u0126: "H",
    \u0127: "h",
    \u0166: "T",
    \u0167: "t",
    \u01E4: "G",
    \u01E5: "g",
    \u014A: "N",
    \u014B: "n",
    \u0131: "i"
  };
  var PLAIN_RE = new RegExp(`[${Object.keys(PLAIN).join("")}]`, "g");
  function randomIntInclusive(min, max, safe = false) {
    min = Number(min);
    max = Number(max);
    if (isNaN(min) || isNaN(max)) throw new TypeError("Both min and max must be numbers");
    if (min > max) [min, max] = [max, min];
    min = Math.round(min);
    max = Math.round(max);
    if (min === max) return min;
    const rand = safe ? random() : Math.random();
    return Math.floor(rand * (max - min + 1)) + min;
  }
  function fixed(number, digits) {
    if (!digits) return parseInt(number);
    return parseFloat(number.toFixed(digits));
  }
  function percentage(num, total) {
    if (Number.isNaN(num) || Number.isNaN(total) || total === 0) return 0;
    return num / total * 100;
  }
  function random() {
    if (typeof crypto === "undefined") return Math.random();
    if (crypto.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    return Math.random();
  }

  // node_modules/book-of-spells/src/dom.mjs
  function query(selector, from = document) {
    if (selector instanceof Array || selector instanceof NodeList) return selector;
    if (selector instanceof Element) return [selector];
    if (from instanceof Element || from instanceof Document) return from.querySelectorAll(selector);
    if (isString(from)) from = query(from);
    if (!(from instanceof Array || from instanceof NodeList)) return [];
    const res = [];
    for (const element of from) {
      res.push(...element.querySelectorAll(selector));
    }
    return res;
  }
  function proportionalParentCoverResize(elements, ratio = 1, offset = 0) {
    if (elements instanceof Element) elements = [elements];
    if (typeof elements === "string") elements = query(elements);
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
  var RE_VIDEO = /\/([^\/?#]+\.(?:mp4|m4v|ogg|ogv|ogm|webm|avi|mov|qt))(?:[?#][^\/]*)?\s*$/i;

  // node_modules/book-of-spells/src/parsers.mjs
  function parseResolutionString(res) {
    const DEFAULT_RESOLUTION = 1.7777777778;
    if (!res || !res.length || /16[\:x\-\/]{1}9/i.test(res)) return DEFAULT_RESOLUTION;
    const pts = res.split(/\s?[\:x\-\/]{1}\s?/i);
    if (pts.length < 2) return DEFAULT_RESOLUTION;
    const w = parseInt(pts[0]);
    const h = parseInt(pts[1]);
    if (w === 0 || h === 0) return DEFAULT_RESOLUTION;
    if (isNaN(w) || isNaN(h)) return DEFAULT_RESOLUTION;
    return w / h;
  }

  // node_modules/book-of-spells/src/browser.mjs
  function isUserAgentMobile(str) {
    return /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(str) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(str);
  }
  function isMobile() {
    if ("maxTouchPoints" in navigator) return navigator.maxTouchPoints > 0;
    if ("matchMedia" in window) return !!matchMedia("(pointer:coarse)").matches;
    if ("orientation" in window) return true;
    return isUserAgentMobile(navigator.userAgent);
  }

  // node_modules/book-of-spells/src/keyboard.mjs
  var MODIFIERS = ["Meta", "Control", "Alt", "Shift"];
  var MODIFIER_KEYS = new Set(MODIFIERS);

  // src/lib/super-video-background.mjs
  var SOURCE_ATTRIBUTES = ["data-vbg", "data-youtube", "data-ytbg"];
  var SuperVideoBackground = class {
    constructor(elem, params, id, uid, type, factoryInstance) {
      if (!id) return;
      this.is_mobile = isMobile();
      this.type = type;
      this.id = id;
      this.factoryInstance = factoryInstance;
      this.element = elem;
      this.playerElement = null;
      this.uid = uid;
      this.element.setAttribute("data-vbg-uid", uid);
      this.buttons = {};
      this.isIntersecting = false;
      this.paused = false;
      this.muted = false;
      this.currentState = "notstarted";
      this.initialPlay = false;
      this.initialVolume = false;
      this.volume = 1;
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
        "lazyloading": false,
        "title": "Video background"
      };
      this.params = this.parseProperties(params, DEFAULTS, this.element, ["data-ytbg-", "data-vbg-"]);
      if (this.params.pause) {
        this.params["play-button"] = this.params.pause;
      }
      this.params.resolution_mod = parseResolutionString(this.params.resolution);
      this.muted = this.params.muted;
      this.volume = this.params.volume;
      this.currentTime = this.params["start-at"] || 0;
      this.duration = this.params["end-at"] || 0;
      this.percentComplete = 0;
      this.originalStyle = this.element.getAttribute("style");
      this.buildWrapperHTML();
      if (this.is_mobile && !this.params.mobile) return;
      if (this.params["play-button"]) {
        generateActionButton(this, {
          name: "playing",
          className: "play-toggle",
          innerHtml: '<i class="fa"></i>',
          stateClassName: "paused",
          condition_parameter: "paused",
          stateChildClassNames: ["fa-pause-circle", "fa-play-circle"],
          stateLabels: ["Pause", "Play"],
          actions: ["play", "pause"]
        });
      }
      if (this.params["mute-button"]) {
        generateActionButton(this, {
          name: "muted",
          className: "mute-toggle",
          innerHtml: '<i class="fa"></i>',
          stateClassName: "muted",
          condition_parameter: "muted",
          stateChildClassNames: ["fa-volume-up", "fa-volume-mute"],
          stateLabels: ["Mute", "Unmute"],
          actions: ["unmute", "mute"]
        });
      }
    }
    timeToPercentage(time) {
      if (time <= this.params["start-at"]) return 0;
      if (!this.duration) return 0;
      if (time >= this.duration) return 100;
      if (time <= 0) return 0;
      time -= this.params["start-at"];
      const duration = this.duration - this.params["start-at"];
      return percentage(time, duration);
    }
    percentageToTime(percentage2) {
      if (!this.duration) return this.params["start-at"] || 0;
      if (percentage2 > 100) return this.duration;
      if (percentage2 <= 0) return this.params["start-at"] || 0;
      const duration = this.duration - this.params["start-at"];
      let time = percentage2 * duration / 100;
      time = fixed(time, 3);
      if (time > duration) time = duration;
      if (this.params["start-at"]) time += this.params["start-at"];
      return time;
    }
    resize(element) {
      if (!this.params["fit-box"]) proportionalParentCoverResize(element || this.playerElement, this.params.resolution_mod, this.params.offset);
      this.dispatchEvent("video-background-resize");
    }
    stylePlayerElement(element) {
      if (!element) return;
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
        this.loadBackground(this.id);
        if (this.params["poster"]) wrapper_styles["background-image"] = `url(${this.params["poster"]})`;
        wrapper_styles["background-size"] = "cover";
        wrapper_styles["background-repeat"] = "no-repeat";
        wrapper_styles["background-position"] = "center";
      }
      if (this.params["inline-styles"]) {
        for (let property in wrapper_styles) {
          this.element.style[property] = wrapper_styles[property];
        }
        if (window.getComputedStyle(parent).position === "static") {
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
    loadBackground(id) {
      if (!this.params["load-background"]) return;
      if (!id) return;
      if (this.type === "youtube") this.element.style["background-image"] = `url(https://img.youtube.com/vi/${id}/hqdefault.jpg)`;
      if (this.type === "vimeo") this.element.style["background-image"] = `url(https://vumbnail.com/${id}.jpg)`;
    }
    destroy() {
      if (this.playerElement) this.playerElement.remove();
      this.element.classList.remove("youtube-background", "video-background");
      this.element.removeAttribute("data-vbg-uid");
      if (this.originalStyle) {
        this.element.setAttribute("style", this.originalStyle);
      } else {
        this.element.removeAttribute("style");
      }
      if (this.controls_element) this.controls_element.remove();
      if (this.timeUpdateTimer) clearInterval(this.timeUpdateTimer);
      this.dispatchEvent("video-background-destroyed");
    }
    setDuration(duration) {
      this.duration = this.params["end-at"] ? Math.min(duration, this.params["end-at"]) : duration;
    }
    // the URL the caller gave, not the generated embed URL - the factory has to be
    // able to read back what it read in
    writeSourceAttributes(url) {
      for (const attribute of SOURCE_ATTRIBUTES) {
        if (this.element.hasAttribute(attribute)) this.element.setAttribute(attribute, url);
      }
    }
    setStartAt(startAt) {
      this.params["start-at"] = startAt;
    }
    setEndAt(endAt) {
      this.params["end-at"] = endAt;
      if (this.duration > endAt) this.duration = endAt;
      if (this.currentTime > endAt) this.onVideoEnded();
    }
    dispatchEvent(name) {
      this.element.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: this }));
    }
    // playback the user did not ask to stop - buffering is playing that is still catching up
    isPlaying() {
      return !this.paused && (this.currentState === "playing" || this.currentState === "buffering");
    }
    // what a swapped-in video does: plays on if the old one was, starts if a fresh build
    // would - autoplay on and in view - and waits otherwise; a held pause stops both
    startsAfterSwap() {
      if (this.paused) return false;
      return this.isPlaying() || this.params.autoplay && (this.params["always-play"] || this.isIntersecting);
    }
    // duration and progress describe the video being replaced, and a stale duration
    // ends the new one early - every setSource clears them before the swap
    resetProgress() {
      this.duration = 0;
      this.currentTime = this.params["start-at"] || 0;
      this.percentComplete = 0;
    }
    shouldPlay() {
      if (this.paused) return false;
      if (this.currentState === "ended" && !this.params.loop) return false;
      if (this.params["always-play"] && this.currentState !== "playing") return true;
      if (this.isIntersecting && this.params.autoplay && this.currentState !== "playing") return true;
      return false;
    }
    mobileLowBatteryAutoplayHack() {
      if (!this.params["force-on-low-battery"]) return;
      if (!this.is_mobile && this.params.mobile) return;
      const forceAutoplay = function() {
        if (!this.initialPlay && this.params.autoplay && this.params.muted) {
          this.softPlay();
          if (!this.isIntersecting && !this.params["always-play"]) {
            this.softPause();
          }
        }
      };
      document.addEventListener("touchstart", forceAutoplay.bind(this), { once: true });
    }
    parseProperties(params, defaults, element, attr_prefix) {
      let res_params = {};
      if (!params) {
        res_params = defaults;
      } else {
        for (let k in defaults) {
          res_params[k] = !Object.prototype.hasOwnProperty.call(params, k) ? defaults[k] : params[k];
        }
      }
      if (!element) return res_params;
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

  // src/lib/youtube-background.mjs
  var YoutubeBackground = class extends SuperVideoBackground {
    constructor(elem, params, id, uid, factoryInstance) {
      super(elem, params, id, uid, "youtube", factoryInstance);
      if (!id) return;
      if (this.is_mobile && !this.params.mobile) return;
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
      this.timeUpdateTimer = null;
      this.timeUpdateInterval = 250;
      this.initYTPlayer();
    }
    startTimeUpdateTimer() {
      if (this.timeUpdateTimer) return;
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
      if (!Object.prototype.hasOwnProperty.call(window, "YT") || this.player !== null) return;
      this.player = new YT.Player(this.uid, {
        events: {
          "onReady": this.onVideoPlayerReady.bind(this),
          "onStateChange": this.onVideoStateChange.bind(this)
        }
      });
      if (this.volume !== 1 && !this.muted) this.setVolume(this.volume);
    }
    injectScript() {
      const src = "https://www.youtube.com/player_api";
      if (Object.prototype.hasOwnProperty.call(window, "YT") || document.querySelector(`script[src="${src}"]`)) return;
      const tag = document.createElement("script");
      tag.async = true;
      tag.src = src;
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    generatePlayerElement() {
      const playerElement = document.createElement("iframe");
      if (this.params.title) playerElement.setAttribute("title", this.params.title);
      playerElement.setAttribute("frameborder", 0);
      playerElement.setAttribute("allow", "autoplay; mute");
      if (this.params["lazyloading"]) playerElement.setAttribute("loading", "lazy");
      return playerElement;
    }
    generateSrcURL(id) {
      let site = "https://www.youtube.com/embed/";
      if (this.params["no-cookie"]) {
        site = "https://www.youtube-nocookie.com/embed/";
      }
      let src = `${site}${id}?&enablejsapi=1&disablekb=1&controls=0&rel=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&showinfo=0&modestbranding=1&fs=0`;
      if (this.muted) {
        src += "&mute=1";
      }
      if (!this.paused && this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        src += "&autoplay=1";
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
    setSource(url) {
      const pts = url.match(RE_YOUTUBE);
      if (!pts || !pts.length) return;
      const start = this.startsAfterSwap();
      this.id = pts[1];
      this.src = this.generateSrcURL(this.id);
      this.resetProgress();
      if (this.player && this.player.loadVideoById) {
        const request = { videoId: this.id, startSeconds: this.params["start-at"] || 0 };
        if (start) {
          this.player.loadVideoById(request);
        } else {
          this.player.cueVideoById(request);
        }
      } else if (this.playerElement) {
        this.playerElement.src = this.src;
      }
      this.writeSourceAttributes(url);
      this.loadBackground(this.id);
    }
    onVideoTimeUpdate() {
      const ctime = this.player.getCurrentTime();
      if (ctime === this.currentTime) return;
      this.currentTime = ctime;
      this.percentComplete = this.timeToPercentage(this.currentTime);
      if (this.params["end-at"] && this.duration && this.currentTime >= this.duration) {
        this.currentState = "ended";
        this.dispatchEvent("video-background-state-change");
        this.onVideoEnded();
        this.stopTimeUpdateTimer();
        return;
      }
      this.dispatchEvent("video-background-time-update");
    }
    onVideoPlayerReady() {
      this.mobileLowBatteryAutoplayHack();
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        if (this.params["start-at"]) this.seekTo(this.params["start-at"]);
        this.player.playVideo();
      }
      this.setDuration(this.player.getDuration());
      this.dispatchEvent("video-background-ready");
    }
    onVideoStateChange(event) {
      this.currentState = this.convertState(event.data);
      if (this.currentState === "ended") this.onVideoEnded();
      if (this.currentState === "notstarted" && this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        this.seekTo(this.params["start-at"]);
        this.player.playVideo();
      }
      if (this.currentState === "playing") this.onVideoPlay();
      if (this.currentState === "paused") this.onVideoPause();
      this.dispatchEvent("video-background-state-change");
    }
    onVideoPlay() {
      if (!this.initialPlay) {
        this.initialPlay = true;
        this.playerElement.style.opacity = 1;
      }
      const seconds = this.player.getCurrentTime();
      if (this.params["start-at"] && seconds < this.params["start-at"]) {
        this.seekTo(this.params["start-at"]);
      }
      if (this.duration && seconds >= this.duration) {
        this.seekTo(this.params["start-at"]);
      }
      if (!this.duration) {
        this.setDuration(this.player.getDuration());
      }
      this.dispatchEvent("video-background-play");
      this.startTimeUpdateTimer();
    }
    onVideoPause() {
      this.stopTimeUpdateTimer();
      this.dispatchEvent("video-background-pause");
    }
    onVideoEnded() {
      this.dispatchEvent("video-background-ended");
      if (this.paused || !this.params.loop) return this.pause();
      this.seekTo(this.params["start-at"]);
      this.player.playVideo();
    }
    seek(percentage2) {
      this.seekTo(this.percentageToTime(percentage2), true);
    }
    seekTo(seconds, allowSeekAhead = true) {
      if (!this.player) return;
      this.player.seekTo(seconds, allowSeekAhead);
      this.dispatchEvent("video-background-seeked");
    }
    softPause() {
      if (!this.player || this.currentState === "paused") return;
      this.stopTimeUpdateTimer();
      this.player.pauseVideo();
    }
    softPlay() {
      if (!this.player || this.currentState === "playing") return;
      this.player.playVideo();
    }
    play() {
      if (!this.player) return;
      this.paused = false;
      this.player.playVideo();
    }
    pause() {
      if (!this.player) return;
      this.paused = true;
      this.stopTimeUpdateTimer();
      this.player.pauseVideo();
    }
    unmute() {
      if (!this.player) return;
      this.muted = false;
      if (!this.initialVolume) {
        this.initialVolume = true;
        this.setVolume(this.params.volume);
      }
      this.player.unMute();
      this.dispatchEvent("video-background-unmute");
    }
    mute() {
      if (!this.player) return;
      this.muted = true;
      this.player.mute();
      this.dispatchEvent("video-background-mute");
    }
    getVolume() {
      if (!this.player) return;
      return this.player.getVolume() / 100;
    }
    setVolume(volume) {
      if (!this.player) return;
      this.volume = volume;
      this.player.setVolume(volume * 100);
      this.dispatchEvent("video-background-volume-change");
    }
  };

  // src/lib/vimeo-background.mjs
  var RE_VIMEO_UNLISTED_PATH = /\/\d+\/([^/?#\s]+)\/?\s*$/;
  var RE_VIMEO_UNLISTED_QUERY = /[?&]h=([^&#]+)/;
  function getVimeoUnlistedHash(url) {
    if (!url) return;
    const pts = url.match(RE_VIMEO_UNLISTED_PATH) || url.match(RE_VIMEO_UNLISTED_QUERY);
    if (pts) return pts[1];
  }
  var VimeoBackground = class extends SuperVideoBackground {
    constructor(elem, params, id, uid, factoryInstance) {
      super(elem, params, id ? id.id : null, uid, "vimeo", factoryInstance);
      if (!id) return;
      this.unlisted = id.unlisted;
      if (this.is_mobile && !this.params.mobile) return;
      this.injectScript();
      this.player = null;
      this.injectPlayer();
      this.initVimeoPlayer();
    }
    injectScript() {
      const src = "https://player.vimeo.com/api/player.js";
      if (Object.prototype.hasOwnProperty.call(window, "Vimeo") || document.querySelector(`script[src="${src}"]`)) return;
      const tag = document.createElement("script");
      tag.async = true;
      if (Object.prototype.hasOwnProperty.call(window, "onVimeoIframeAPIReady") && typeof window.onVimeoIframeAPIReady === "function") tag.addEventListener("load", () => {
        window.onVimeoIframeAPIReady();
      });
      tag.src = src;
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    initVimeoPlayer() {
      if (!Object.prototype.hasOwnProperty.call(window, "Vimeo") || this.player !== null) return;
      this.player = new Vimeo.Player(this.playerElement);
      this.player.on("loaded", this.onVideoPlayerReady.bind(this));
      this.player.on("ended", this.onVideoEnded.bind(this));
      this.player.on("play", this.onVideoPlay.bind(this));
      this.player.on("pause", this.onVideoPause.bind(this));
      this.player.on("bufferstart", this.onVideoBuffering.bind(this));
      this.player.on("timeupdate", this.onVideoTimeUpdate.bind(this));
      if (this.volume !== 1 && !this.muted) this.setVolume(this.volume);
    }
    generatePlayerElement() {
      const playerElement = document.createElement("iframe");
      if (this.params.title) playerElement.setAttribute("title", this.params.title);
      playerElement.setAttribute("frameborder", 0);
      playerElement.setAttribute("allow", "autoplay; mute");
      if (this.params["lazyloading"]) playerElement.setAttribute("loading", "lazy");
      return playerElement;
    }
    generateSrcURL(id, unlisted) {
      unlisted = unlisted ? `h=${unlisted}&` : "";
      let src = `https://player.vimeo.com/video/${id}?${unlisted}background=1&controls=0`;
      if (this.muted) {
        src += "&muted=1";
      }
      if (!this.paused && this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
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
      this.src = this.generateSrcURL(this.id, this.unlisted);
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
    setSource(url) {
      const pts = url.match(RE_VIMEO);
      if (!pts || !pts.length) return;
      const start = this.startsAfterSwap();
      this.id = pts[1];
      this.unlisted = getVimeoUnlistedHash(url);
      this.src = this.generateSrcURL(this.id, this.unlisted);
      this.resetProgress();
      if (this.player && this.player.loadVideo) {
        const video = `https://vimeo.com/${this.id}` + (this.unlisted ? `?h=${this.unlisted}` : "");
        this.player.loadVideo({ url: video }).then(() => {
          this.player.setLoop(this.params.loop);
          this.player.setMuted(this.muted);
          if (start) {
            this.player.play();
          } else {
            this.player.pause();
          }
        }).catch(() => {
          this.playerElement.src = this.src;
        });
      } else if (this.playerElement) {
        this.playerElement.src = this.src;
      }
      this.writeSourceAttributes(url);
      this.loadBackground(this.id);
    }
    onVideoPlayerReady() {
      this.mobileLowBatteryAutoplayHack();
      if (this.params["start-at"]) this.seekTo(this.params["start-at"]);
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        this.player.play();
      }
      this.player.getDuration().then((duration) => {
        this.setDuration(duration);
      });
      this.dispatchEvent("video-background-ready");
    }
    onVideoEnded() {
      this.updateState("ended");
      this.dispatchEvent("video-background-ended");
      if (this.paused || !this.params.loop) return this.pause();
      this.seekTo(this.params["start-at"]);
      this.updateState("playing");
      this.dispatchEvent("video-background-play");
    }
    onVideoTimeUpdate(event) {
      this.currentTime = event.seconds;
      this.percentComplete = this.timeToPercentage(event.seconds);
      this.dispatchEvent("video-background-time-update");
      this.setDuration(event.duration);
      if (this.params["end-at"] && this.duration && event.seconds >= this.duration) {
        this.onVideoEnded();
      }
    }
    onVideoBuffering() {
      this.updateState("buffering");
    }
    onVideoPlay(event) {
      this.setDuration(event.duration);
      if (!this.initialPlay) {
        this.initialPlay = true;
        this.playerElement.style.opacity = 1;
        this.player.setLoop(this.params.loop);
        if (!(this.params.autoplay && (this.params["always-play"] || this.isIntersecting))) {
          return this.player.pause();
        }
      }
      const seconds = event.seconds;
      if (this.params["start-at"] && seconds < this.params["start-at"]) {
        this.seekTo(this.params["start-at"]);
      }
      if (this.duration && seconds >= this.duration) {
        this.seekTo(this.params["start-at"]);
      }
      this.updateState("playing");
      this.dispatchEvent("video-background-play");
    }
    onVideoPause() {
      this.updateState("paused");
      this.dispatchEvent("video-background-pause");
    }
    seek(percentage2) {
      this.seekTo(this.percentageToTime(percentage2));
    }
    seekTo(time) {
      if (!this.player) return;
      this.player.setCurrentTime(time);
      this.dispatchEvent("video-background-seeked");
    }
    softPause() {
      if (!this.player || this.currentState === "paused") return;
      this.player.pause();
    }
    softPlay() {
      if (!this.player || this.currentState === "playing") return;
      this.player.play();
    }
    play() {
      if (!this.player) return;
      this.paused = false;
      this.player.play();
    }
    pause() {
      if (!this.player) return;
      this.paused = true;
      this.player.pause();
    }
    unmute() {
      if (!this.player) return;
      this.muted = false;
      if (!this.initialVolume) {
        this.initialVolume = true;
        this.setVolume(this.params.volume);
      }
      this.player.setMuted(false);
      this.dispatchEvent("video-background-unmute");
    }
    mute() {
      if (!this.player) return;
      this.muted = true;
      this.player.setMuted(true);
      this.dispatchEvent("video-background-mute");
    }
    getVolume() {
      if (!this.player) return;
      return this.player.getVolume();
    }
    setVolume(volume) {
      if (!this.player) return;
      this.volume = volume;
      this.player.setVolume(volume);
      this.dispatchEvent("video-background-volume-change");
    }
  };

  // src/lib/video-background.mjs
  var MIME_MAP = {
    "ogv": "video/ogg",
    "ogm": "video/ogg",
    "ogg": "video/ogg",
    "avi": "video/x-msvideo",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "m4v": "video/x-m4v",
    "mov": "video/quicktime",
    "qt": "video/quicktime"
  };
  var VideoBackground = class extends SuperVideoBackground {
    constructor(elem, params, vid_data, uid, factoryInstance) {
      super(elem, params, vid_data ? vid_data.link : null, uid, "video", factoryInstance);
      if (!vid_data || !vid_data.link) return;
      if (this.is_mobile && !this.params.mobile) return;
      this.src = vid_data.link;
      this.player = null;
      this.MIME_MAP = MIME_MAP;
      this.setMimeType(vid_data.id);
      this.injectPlayer();
      this.mobileLowBatteryAutoplayHack();
      this.dispatchEvent("video-background-ready");
    }
    setMimeType(source) {
      this.ext = /(?:\.([^.]+))?$/.exec(source)[1];
      this.mime = this.ext ? this.MIME_MAP[this.ext.toLowerCase()] : void 0;
    }
    generatePlayerElement() {
      const playerElement = document.createElement("video");
      if (this.params.title) playerElement.setAttribute("title", this.params.title);
      playerElement.setAttribute("playsinline", "");
      if (this.params.autoplay && (this.params["always-play"] || this.isIntersecting)) {
        playerElement.setAttribute("autoplay", "");
        playerElement.autoplay = true;
      }
      if (this.muted) {
        playerElement.setAttribute("muted", "");
        playerElement.muted = true;
      }
      return playerElement;
    }
    // native loop wraps to 0:00 and never fires 'ended', which would skip start-at
    // - with start-at the loop is driven from onVideoEnded instead. Re-run on every
    // start-at change, the attribute outlives the value it was decided from.
    syncNativeLoop() {
      if (!this.player) return;
      if (this.params.loop && !this.params["start-at"]) {
        this.player.setAttribute("loop", "");
      } else {
        this.player.removeAttribute("loop");
      }
    }
    injectPlayer() {
      this.player = this.generatePlayerElement();
      this.playerElement = this.player;
      this.syncNativeLoop();
      if (this.volume !== 1 && !this.muted) this.setVolume(this.volume);
      this.playerElement.setAttribute("id", this.uid);
      this.stylePlayerElement(this.playerElement);
      this.player.addEventListener("loadedmetadata", this.onVideoLoadedMetadata.bind(this));
      this.player.addEventListener("durationchange", this.onVideoLoadedMetadata.bind(this));
      this.player.addEventListener("canplay", this.onVideoCanPlay.bind(this));
      this.player.addEventListener("timeupdate", this.onVideoTimeUpdate.bind(this));
      this.player.addEventListener("play", this.onVideoPlay.bind(this));
      this.player.addEventListener("pause", this.onVideoPause.bind(this));
      this.player.addEventListener("waiting", this.onVideoBuffering.bind(this));
      this.player.addEventListener("ended", this.onVideoEnded.bind(this));
      this.element.appendChild(this.playerElement);
      const source = document.createElement("source");
      source.setAttribute("src", this.src);
      if (this.mime) source.setAttribute("type", this.mime);
      this.playerElement.appendChild(source);
      this.resize(this.playerElement);
    }
    updateState(state) {
      this.currentState = state;
      this.dispatchEvent("video-background-state-change");
    }
    /* ===== API ===== */
    setStartAt(startAt) {
      super.setStartAt(startAt);
      this.syncNativeLoop();
    }
    setSource(url) {
      const pts = url.match(RE_VIDEO);
      if (!pts || !pts.length) return;
      const start = this.startsAfterSwap();
      this.id = pts[1];
      this.setMimeType(this.id);
      this.playerElement.innerHTML = "";
      const source = document.createElement("source");
      source.setAttribute("src", url);
      if (this.mime) source.setAttribute("type", this.mime);
      this.playerElement.appendChild(source);
      this.src = url;
      this.resetProgress();
      this.player.autoplay = start;
      this.player.load();
      if (start) this.player.play();
      this.writeSourceAttributes(url);
    }
    onVideoLoadedMetadata() {
      this.setDuration(this.player.duration);
    }
    onVideoCanPlay() {
      this.setDuration(this.player.duration);
    }
    onVideoTimeUpdate() {
      this.currentTime = this.player.currentTime;
      this.percentComplete = this.timeToPercentage(this.player.currentTime);
      this.dispatchEvent("video-background-time-update");
      if (this.params["end-at"] && this.currentTime >= this.duration) {
        this.onVideoEnded();
      }
    }
    onVideoPlay() {
      if (!this.initialPlay) {
        this.initialPlay = true;
        this.playerElement.style.opacity = 1;
      }
      const seconds = this.player.currentTime;
      if (this.params["start-at"] && seconds <= this.params["start-at"]) {
        this.seekTo(this.params["start-at"]);
      }
      if (this.duration && seconds >= this.duration) {
        this.seekTo(this.params["start-at"]);
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
      this.dispatchEvent("video-background-ended");
      if (this.paused || !this.params.loop) return this.pause();
      this.seekTo(this.params["start-at"]);
      if (this.player.paused) {
        this.player.play();
      } else {
        this.onVideoPlay();
      }
    }
    onVideoBuffering() {
      this.updateState("buffering");
    }
    seek(percentage2) {
      this.seekTo(this.percentageToTime(percentage2));
    }
    seekTo(seconds) {
      if (!this.player) return;
      if (typeof this.player.fastSeek === "function") {
        this.player.fastSeek(seconds);
      } else {
        this.player.currentTime = seconds;
      }
      this.dispatchEvent("video-background-seeked");
    }
    softPause() {
      if (!this.player || this.currentState === "paused") return;
      this.player.pause();
    }
    softPlay() {
      if (!this.player || this.currentState === "playing") return;
      this.player.play();
    }
    play() {
      if (!this.player) return;
      this.paused = false;
      this.player.play();
    }
    pause() {
      if (!this.player) return;
      this.paused = true;
      this.player.pause();
    }
    unmute() {
      if (!this.player) return;
      this.muted = false;
      this.player.muted = false;
      if (!this.initialVolume) {
        this.initialVolume = true;
        this.setVolume(this.params.volume);
      }
      this.dispatchEvent("video-background-unmute");
    }
    mute() {
      if (!this.player) return;
      this.muted = true;
      this.player.muted = true;
      this.dispatchEvent("video-background-mute");
    }
    getVolume() {
      if (!this.player) return;
      return this.player.volume;
    }
    setVolume(volume) {
      if (!this.player) return;
      this.volume = volume;
      this.player.volume = volume;
      this.dispatchEvent("video-background-volume-change");
    }
  };

  // src/video-backgrounds.mjs
  var SOURCE_PATTERNS = {
    YOUTUBE: RE_YOUTUBE,
    VIMEO: RE_VIMEO,
    VIDEO: RE_VIDEO
  };
  var VideoBackgrounds = class {
    constructor(selector, params) {
      this.elements = selector;
      if (this.elements instanceof Element) this.elements = [this.elements];
      if (typeof this.elements === "string") this.elements = document.querySelectorAll(selector);
      this.index = {};
      const self = this;
      this.intersectionObserver = null;
      if ("IntersectionObserver" in window) {
        this.intersectionObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            const uid = entry.target.getAttribute("data-vbg-uid");
            if (!uid || !Object.prototype.hasOwnProperty.call(self.index, uid)) return;
            const instance = self.index[uid];
            instance.isIntersecting = entry.isIntersecting;
            try {
              if (entry.isIntersecting) {
                if (instance.player && instance.shouldPlay()) instance.softPlay();
              } else {
                if (instance.player) instance.softPause();
              }
            } catch {
            }
          });
        });
      }
      this.resizeObserver = null;
      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(function(entries) {
          entries.forEach(function(entry) {
            const uid = entry.target.getAttribute("data-vbg-uid");
            if (uid && Object.prototype.hasOwnProperty.call(self.index, uid)) {
              window.requestAnimationFrame(() => self.index[uid].resize());
            }
          });
        });
      } else {
        this.onResize = function() {
          for (let k in self.index) {
            window.requestAnimationFrame(() => self.index[k].resize(self.index[k].playerElement));
          }
        };
        window.addEventListener("resize", this.onResize);
      }
      this.initPlayers();
      this.onVisibilityChange = this.onVisibilityChange.bind(this);
      document.addEventListener("visibilitychange", this.onVisibilityChange);
      if (!this.elements || !this.elements.length) return;
      for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        this.add(element, params);
      }
    }
    onVisibilityChange() {
      if (document.hidden) return;
      for (let k in this.index) {
        const instance = this.index[k];
        if (instance.shouldPlay()) {
          instance.softPlay();
        }
      }
    }
    add(element, params) {
      if (!element) return;
      if (element.hasAttribute("data-vbg-uid")) return;
      if (!this.intersectionObserver) {
        params = Object.assign({}, params, { "always-play": true });
      }
      let link = null;
      for (const attribute of SOURCE_ATTRIBUTES) {
        link = element.getAttribute(attribute);
        if (link) break;
      }
      const vid_data = this.getVidID(link);
      if (!vid_data) return;
      const uid = this.generateUID(vid_data.id);
      if (!uid) return;
      switch (vid_data.type) {
        case "YOUTUBE":
          this.index[uid] = new YoutubeBackground(element, params, vid_data.id, uid, this);
          break;
        case "VIMEO":
          this.index[uid] = new VimeoBackground(element, params, vid_data, uid, this);
          break;
        case "VIDEO":
          this.index[uid] = new VideoBackground(element, params, vid_data, uid, this);
          break;
        default:
          return;
      }
      if (this.resizeObserver) {
        this.resizeObserver.observe(element);
      }
      if (!this.index[uid].params["always-play"] && this.intersectionObserver) {
        this.intersectionObserver.observe(element);
      }
    }
    destroy(element) {
      const uid = element.uid || element.getAttribute("data-vbg-uid");
      if (uid && Object.prototype.hasOwnProperty.call(this.index, uid)) {
        if (!this.index[uid].params["always-play"] && this.intersectionObserver) this.intersectionObserver.unobserve(element);
        if (this.resizeObserver) this.resizeObserver.unobserve(element);
        this.index[uid].destroy();
        delete this.index[uid];
      }
    }
    destroyAll() {
      for (let k in this.index) {
        this.destroy(this.index[k].element);
      }
    }
    // Full teardown. destroyAll() only clears the index - the observers and the two
    // global listeners outlive it, and nothing else can reach them once the factory
    // goes out of scope.
    disconnect() {
      this.destroyAll();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
      if (this.onResize) window.removeEventListener("resize", this.onResize);
    }
    getVidID(link) {
      if (!link) return;
      for (let k in SOURCE_PATTERNS) {
        const pts = link.match(SOURCE_PATTERNS[k]);
        if (pts && pts.length) {
          const data = {
            id: pts[1],
            type: k,
            regex_pts: pts,
            link
          };
          if (k === "VIMEO") {
            const unlisted = getVimeoUnlistedHash(link);
            if (unlisted) data.unlisted = unlisted;
          }
          return data;
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
      while (Object.prototype.hasOwnProperty.call(this.index, uid)) {
        uid = pref + "-" + randomIntInclusive(0, 9999);
      }
      return uid;
    }
    get(element) {
      const uid = typeof element === "string" ? element : element.getAttribute("data-vbg-uid");
      if (uid && Object.prototype.hasOwnProperty.call(this.index, uid)) return this.index[uid];
    }
    pauseAll() {
      for (let k in this.index) {
        this.index[k].pause();
      }
    }
    playAll() {
      for (let k in this.index) {
        this.index[k].play();
      }
    }
    muteAll() {
      for (let k in this.index) {
        this.index[k].mute();
      }
    }
    unmuteAll() {
      for (let k in this.index) {
        this.index[k].unmute();
      }
    }
    setVolumeAll(volume) {
      for (let k in this.index) {
        this.index[k].setVolume(volume);
      }
    }
    initPlayers(callback) {
      const self = this;
      const previousYouTubeReady = window.onYouTubeIframeAPIReady;
      const previousVimeoReady = window.onVimeoIframeAPIReady;
      window.onYouTubeIframeAPIReady = function() {
        if (typeof previousYouTubeReady === "function") previousYouTubeReady();
        for (let k in self.index) {
          if (self.index[k] instanceof YoutubeBackground) {
            self.index[k].initYTPlayer();
          }
        }
        if (callback) {
          setTimeout(callback, 100);
        }
      };
      if (Object.prototype.hasOwnProperty.call(window, "YT") && window.YT.loaded) {
        window.onYouTubeIframeAPIReady();
      }
      window.onVimeoIframeAPIReady = function() {
        if (typeof previousVimeoReady === "function") previousVimeoReady();
        for (let k in self.index) {
          if (self.index[k] instanceof VimeoBackground) {
            self.index[k].initVimeoPlayer();
          }
        }
        if (callback) {
          setTimeout(callback, 100);
        }
      };
      if (Object.prototype.hasOwnProperty.call(window, "Vimeo") && Object.prototype.hasOwnProperty.call(window.Vimeo, "Player")) {
        window.onVimeoIframeAPIReady();
      }
    }
  };

  // src/main.mjs
  window.VideoBackgrounds = VideoBackgrounds;
})();
//# sourceMappingURL=youtube-background.js.map
