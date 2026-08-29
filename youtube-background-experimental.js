/* youtube-background v1.2.0 | https://github.com/stamat/youtube-background | MIT License */
(() => {
  // src/lib/controls.mjs
  function attach(listeners) {
    for (const [element, eventName, handler] of listeners) element.addEventListener(eventName, handler);
  }
  function detach(listeners) {
    for (const [element, eventName, handler] of listeners) element.removeEventListener(eventName, handler);
  }
  function initToggle(element) {
    if (!element.hasAttribute("type")) element.setAttribute("type", "button");
    if (!element.hasAttribute("aria-pressed")) element.setAttribute("aria-pressed", "false");
    return element.getAttribute("aria-pressed") === "true";
  }
  function nameInput(input, name) {
    if (input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby")) return;
    if (input.labels && input.labels.length) return;
    input.setAttribute("aria-label", name);
  }
  var SeekBar = class {
    constructor(element, vbgInstance) {
      this.lock = false;
      if (!element) return;
      this.element = element;
      if (this.element.hasAttribute("data-target-uid")) return;
      this.progressElem = this.element.querySelector(".js-seek-bar-progress");
      this.inputElem = this.element.querySelector(".js-seek-bar");
      this.targetSelector = this.element.getAttribute("data-target");
      if (this.targetSelector) this.targetElem = document.querySelector(this.targetSelector);
      if (!this.targetSelector && vbgInstance) this.targetElem = vbgInstance.element;
      if (!this.targetElem) return;
      nameInput(this.inputElem, "Seek");
      if (vbgInstance) this.setVBGInstance(vbgInstance);
      this.listeners = [
        [this.targetElem, "video-background-time-update", this.onTimeUpdate.bind(this)],
        [this.targetElem, "video-background-play", this.onReady.bind(this)],
        [this.targetElem, "video-background-ready", this.onReady.bind(this)],
        [this.targetElem, "video-background-destroyed", this.onDestroyed.bind(this)],
        [this.inputElem, "input", this.onInput.bind(this)],
        [this.inputElem, "change", this.onChange.bind(this)]
      ];
      attach(this.listeners);
    }
    destroy() {
      if (!this.listeners) return;
      detach(this.listeners);
      this.listeners = null;
      this.vbgInstance = null;
      this.element.removeAttribute("data-target-uid");
    }
    setVBGInstance(vbgInstance) {
      if (this.vbgInstance) return;
      this.vbgInstance = vbgInstance;
      this.element.setAttribute("data-target-uid", vbgInstance.uid);
    }
    onReady(event) {
      this.setVBGInstance(event.detail);
    }
    onTimeUpdate(event) {
      this.setVBGInstance(event.detail);
      if (!this.lock) requestAnimationFrame(() => this.setProgress(this.vbgInstance.percentComplete));
    }
    onDestroyed() {
      this.vbgInstance = null;
      requestAnimationFrame(() => this.setProgress(0));
    }
    onInput(event) {
      this.lock = true;
      requestAnimationFrame(() => this.setProgress(event.target.value));
    }
    onChange(event) {
      this.lock = false;
      requestAnimationFrame(() => this.setProgress(event.target.value));
      if (this.vbgInstance) {
        this.vbgInstance.seek(event.target.value);
        if (this.vbgInstance.playerElement && parseFloat(this.vbgInstance.playerElement.style.opacity) === 0) this.vbgInstance.playerElement.style.opacity = 1;
      }
    }
    setProgress(value) {
      if (this.progressElem) this.progressElem.value = value;
      if (this.inputElem) this.inputElem.value = value;
    }
  };
  var VideoBackgroundGroup = class {
    constructor(selector, videoBackgroundSelector, videoBackgroundFactoryInstance) {
      this.element = selector;
      if (typeof this.element === "string") this.element = document.querySelector(selector);
      if (!this.element) return;
      this.elements = this.element.querySelectorAll(videoBackgroundSelector || "[data-vbg]");
      if (!this.elements.length) return;
      this.videoBackgroundFactoryInstance = videoBackgroundFactoryInstance;
      this.stack = [];
      this.map = /* @__PURE__ */ new Map();
      this.current = 0;
      this.currentElement = null;
      this.currentInstance = null;
      this.playing = false;
      this.muted = true;
      const boundSetFactoryInstance = this.setVideoBackgroundFactoryInstance.bind(this);
      this.listeners = [
        ["video-background-ended", this.onVideoEnded.bind(this)],
        ["video-background-seeked", this.onVideoSeeked.bind(this)],
        ["video-background-ready", this.onVideoReady.bind(this)],
        ["video-background-state-change", boundSetFactoryInstance, { once: true }],
        ["video-background-time-update", boundSetFactoryInstance, { once: true }]
      ];
      for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        if (!element.hasAttribute("data-vbg-uid") && this.videoBackgroundFactoryInstance) this.videoBackgroundFactoryInstance.add(element);
        this.stack.push(element);
        this.map.set(element, i);
        if (i === 0) {
          this.current = 0;
          this.currentElement = element;
          if (this.videoBackgroundFactoryInstance) this.currentInstance = this.videoBackgroundFactoryInstance.get(element);
        }
        for (let j = 0; j < this.listeners.length; j++) {
          const [eventName, handler, options] = this.listeners[j];
          element.addEventListener(eventName, handler, options);
        }
      }
    }
    setVideoBackgroundFactoryInstance(event) {
      if (this.videoBackgroundFactoryInstance) return;
      this.videoBackgroundFactoryInstance = event.detail.factoryInstance;
      if (!this.currentInstance) this.currentInstance = this.videoBackgroundFactoryInstance.get(this.currentElement);
    }
    onVideoReady(event) {
      if (this.stack[this.current] !== event.detail.element) return;
      this.setVideoBackgroundFactoryInstance(event);
      const videoBackground = event.detail;
      if (videoBackground.params.muted) this.muted = true;
      if (!videoBackground.isIntersecting) return;
      if (!videoBackground.params.autoplay) return;
      this.playing = true;
      if (videoBackground.currentState === "playing") return;
      videoBackground.softPlay();
    }
    levelSeekBars() {
      for (let i = 0; i < this.stack.length; i++) {
        if (i === this.current) continue;
        const seekBarElem = this.getSeekBar(this.videoBackgroundFactoryInstance.get(this.stack[i]));
        if (!seekBarElem) continue;
        if (i < this.current) {
          this.setProgress(seekBarElem, 100);
        } else {
          this.setProgress(seekBarElem, 0);
        }
      }
    }
    getSeekBar(currentInstance) {
      if (!currentInstance) return;
      const uid = currentInstance.uid;
      const element = document.querySelector(`.js-seek-bar-wrap[data-target-uid="${uid}"]`);
      if (!element) return;
      return element;
    }
    setProgress(seekBarElem, value) {
      if (!seekBarElem) return;
      const progressElem = seekBarElem.querySelector(".js-seek-bar-progress");
      const inputElem = seekBarElem.querySelector(".js-seek-bar");
      if (progressElem) progressElem.value = value;
      if (inputElem) inputElem.value = value;
    }
    onVideoSeeked(event) {
      const current = this.map.get(event.detail.element);
      if (this.current !== current) this.setCurrent(current, true);
    }
    setCurrent(index, seek) {
      const previous = this.current;
      const forwardRewind = index >= this.stack.length;
      const backwardRewind = index < 0;
      if (forwardRewind) index = 0;
      if (backwardRewind) index = this.stack.length - 1;
      const previousInstance = this.videoBackgroundFactoryInstance.get(this.stack[previous]);
      this.current = index;
      this.currentInstance = this.videoBackgroundFactoryInstance.get(this.stack[this.current]);
      this.currentElement = this.stack[this.current];
      this.stack[previous].style.display = "none";
      this.currentElement.style.display = "block";
      if (!seek) {
        const seekBarElem = this.getSeekBar(this.currentInstance);
        if (seekBarElem) this.setProgress(seekBarElem, 0);
        this.currentInstance.seek(0);
      }
      setTimeout(() => {
        if (this.currentInstance.currentState !== "playing") this.currentInstance.play();
      }, 100);
      if (previousInstance && previousInstance.currentState !== "paused") previousInstance.pause();
      setTimeout(this.levelSeekBars.bind(this), 100);
      if (forwardRewind) this.dispatchEvent("video-background-group-forward-rewind");
      if (backwardRewind) this.dispatchEvent("video-background-group-backward-rewind");
    }
    dispatchEvent(name) {
      this.element.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: this }));
    }
    onVideoEnded(event) {
      if (event.detail.element !== this.currentElement) return;
      this.next();
    }
    next() {
      this.setCurrent(this.current + 1);
      this.dispatchEvent("video-background-group-next");
    }
    prev() {
      this.setCurrent(this.current - 1);
      this.dispatchEvent("video-background-group-previous");
    }
    unmute() {
      for (let i = 0; i < this.stack.length; i++) {
        const instance = this.videoBackgroundFactoryInstance.get(this.stack[i]);
        if (!instance) continue;
        instance.unmute();
      }
      this.muted = false;
      this.dispatchEvent("video-background-group-unmute");
    }
    mute() {
      for (let i = 0; i < this.stack.length; i++) {
        const instance = this.videoBackgroundFactoryInstance.get(this.stack[i]);
        if (!instance) continue;
        instance.mute();
      }
      this.muted = true;
      this.dispatchEvent("video-background-group-mute");
    }
    pause() {
      this.currentInstance.pause();
      this.playing = false;
      this.dispatchEvent("video-background-group-pause");
    }
    play() {
      this.currentInstance.play();
      this.playing = true;
      this.dispatchEvent("video-background-group-play");
    }
    destroy() {
      if (!this.elements || !this.listeners) return;
      for (let i = 0; i < this.elements.length; i++) {
        const element = this.elements[i];
        for (let j = 0; j < this.listeners.length; j++) {
          const [eventName, handler] = this.listeners[j];
          element.removeEventListener(eventName, handler);
        }
      }
    }
  };
  var PlayToggle = class {
    constructor(playToggleElem, vbgInstance) {
      if (!playToggleElem) return;
      this.element = playToggleElem;
      this.targetSelector = this.element.getAttribute("data-target");
      if (!this.targetSelector) return;
      this.active = initToggle(this.element);
      this.targetElem = document.querySelector(this.targetSelector);
      if (!this.targetElem) return;
      if (vbgInstance) this.vbgInstance = vbgInstance;
      this.listeners = [
        [this.targetElem, "video-background-ready", this.onReady.bind(this)],
        [this.targetElem, "video-background-state-change", this.onStateChange.bind(this)],
        [this.targetElem, "video-background-play", this.onPlay.bind(this)],
        [this.targetElem, "video-background-pause", this.onPause.bind(this)],
        [this.targetElem, "video-background-destroyed", this.onDestroyed.bind(this)],
        [this.element, "click", this.onClick.bind(this)]
      ];
      attach(this.listeners);
    }
    destroy() {
      if (!this.listeners) return;
      detach(this.listeners);
      this.listeners = null;
      this.vbgInstance = null;
    }
    onReady(event) {
      this.vbgInstance = event.detail;
    }
    onStateChange(event) {
      if (!this.vbgInstance) this.vbgInstance = event.detail;
      this.active = this.vbgInstance.currentState === "playing" || this.vbgInstance.currentState === "buffering";
      this.element.setAttribute("aria-pressed", this.active);
    }
    onPlay(event) {
      if (!this.vbgInstance) this.vbgInstance = event.detail;
      this.active = true;
      this.element.setAttribute("aria-pressed", this.active);
    }
    onPause(event) {
      if (!this.vbgInstance) this.vbgInstance = event.detail;
      this.active = false;
      this.element.setAttribute("aria-pressed", this.active);
    }
    onDestroyed() {
      this.vbgInstance = null;
      this.active = false;
      this.element.setAttribute("aria-pressed", this.active);
    }
    onClick() {
      if (!this.vbgInstance) return;
      if (this.active) {
        this.vbgInstance.pause();
      } else {
        this.vbgInstance.play();
      }
    }
  };
  var MuteToggle = class {
    constructor(muteToggleElem, vbgInstance) {
      if (!muteToggleElem) return;
      this.element = muteToggleElem;
      this.targetSelector = this.element.getAttribute("data-target");
      if (!this.targetSelector) return;
      this.active = initToggle(this.element);
      this.targetElem = document.querySelector(this.targetSelector);
      if (!this.targetElem) return;
      if (vbgInstance) this.vbgInstance = vbgInstance;
      this.listeners = [
        [this.targetElem, "video-background-ready", this.onReady.bind(this)],
        [this.targetElem, "video-background-mute", this.onMute.bind(this)],
        [this.targetElem, "video-background-unmute", this.onUnmute.bind(this)],
        [this.targetElem, "video-background-destroyed", this.onDestroyed.bind(this)],
        [this.element, "click", this.onClick.bind(this)]
      ];
      attach(this.listeners);
    }
    destroy() {
      if (!this.listeners) return;
      detach(this.listeners);
      this.listeners = null;
      this.vbgInstance = null;
    }
    onReady(event) {
      this.vbgInstance = event.detail;
      if (this.vbgInstance.params.muted) {
        this.active = true;
        this.element.setAttribute("aria-pressed", this.active);
      }
    }
    onMute(event) {
      if (!this.vbgInstance) this.vbgInstance = event.detail;
      this.active = true;
      this.element.setAttribute("aria-pressed", this.active);
    }
    onUnmute(event) {
      if (!this.vbgInstance) this.vbgInstance = event.detail;
      this.active = false;
      this.element.setAttribute("aria-pressed", this.active);
    }
    onDestroyed() {
      this.vbgInstance = null;
      this.active = false;
      this.element.setAttribute("aria-pressed", this.active);
    }
    onClick() {
      if (!this.vbgInstance) return;
      if (this.active) {
        this.vbgInstance.unmute();
      } else {
        this.vbgInstance.mute();
      }
    }
  };
  var VideoBackgroundGroups = class {
    constructor(selector = ".js-vbg-group", videoBackgroundSelector, videoBackgroundFactoryInstance) {
      this.instances = {};
      this.selector = selector;
      this.elements = [];
      this.videoBackgroundSelector = videoBackgroundSelector;
      this.videoBackgroundFactoryInstance = videoBackgroundFactoryInstance;
      if (typeof selector === "string") this.elements = document.querySelectorAll(selector);
      if (selector instanceof Element) this.elements = [selector];
      if (selector instanceof NodeList) this.elements = selector;
      for (let i = 0; i < this.elements.length; i++) {
        this.add(this.elements[i]);
      }
    }
    generateUID() {
      let uid = Date.now().toString(36) + Math.random().toString(36).substring(2);
      while (Object.prototype.hasOwnProperty.call(this.instances, uid)) {
        uid = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
      return uid;
    }
    add(element) {
      if (!element) return;
      let id = element.getAttribute("id");
      if (!id || Object.prototype.hasOwnProperty.call(this.instances, id)) {
        id = element.getAttribute("data-uid");
        if (!id || Object.prototype.hasOwnProperty.call(this.instances, id)) {
          id = this.generateUID();
          element.setAttribute("data-uid", id);
        }
      }
      this.instances[id] = new VideoBackgroundGroup(element, this.videoBackgroundSelector, this.videoBackgroundFactoryInstance);
      return this.instances[id];
    }
    getID(element) {
      if (!element) return;
      if (typeof element === "string") return element;
      const id = element.getAttribute("id");
      if (id && Object.prototype.hasOwnProperty.call(this.instances, id)) return id;
      const uid = element.getAttribute("data-uid");
      if (uid && Object.prototype.hasOwnProperty.call(this.instances, uid)) return uid;
    }
    get(element) {
      const id = this.getID(element);
      if (id) return this.instances[id];
    }
    destroy(element) {
      const id = this.getID(element);
      if (!id) return;
      this.instances[id].destroy();
      delete this.instances[id];
    }
    destroyAll() {
      for (const id in this.instances) {
        this.instances[id].destroy();
        delete this.instances[id];
      }
    }
  };

  // src/experimental.mjs
  window.SeekBar = SeekBar;
  window.PlayToggle = PlayToggle;
  window.MuteToggle = MuteToggle;
  window.VideoBackgroundGroup = VideoBackgroundGroup;
  window.VideoBackgroundGroups = VideoBackgroundGroups;
})();
//# sourceMappingURL=youtube-background-experimental.js.map
