
export class SeekBar {
  constructor(element, vbgInstance) {
    this.lock = false;
    if (!element) return;
    this.element = element;
    this.progressElem = this.element.querySelector('.js-seek-bar-progress');
    this.inputElem = this.element.querySelector('.js-seek-bar');
    this.targetSelector = this.element.getAttribute('data-target');
    if (!this.targetSelector) return;
    this.targetElem = document.querySelector(this.targetSelector);
    if (!this.targetElem) return;

    if (vbgInstance) this.setVBGInstance(vbgInstance);
    
    this.targetElem.addEventListener('video-background-time-update', this.onTimeUpdate.bind(this));
    this.targetElem.addEventListener('video-background-play', this.onReady.bind(this));
    this.targetElem.addEventListener('video-background-ready', this.onReady.bind(this));
    this.targetElem.addEventListener('video-background-destroyed', this.onDestroyed.bind(this));

    this.inputElem.addEventListener('input', this.onInput.bind(this));
    this.inputElem.addEventListener('change', this.onChange.bind(this));
  }

  setVBGInstance(vbgInstance) {
    if (this.vbgInstance) return;
    this.vbgInstance = vbgInstance;
    this.element.setAttribute('data-target-uid', vbgInstance.uid);
  }

  onReady(event) {
    this.setVBGInstance(event.detail);
  }

  onTimeUpdate(event) {
    this.setVBGInstance(event.detail);
    if (!this.lock) requestAnimationFrame(() => this.setProgress(this.vbgInstance.percentComplete));
  }

  onDestroyed(event) {
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
        if (this.vbgInstance.playerElement && this.vbgInstance.playerElement.style.opacity === 0) this.vbgInstance.playerElement.style.opacity = 1;
    }
  }

  setProgress(value) {
      if (this.progressElem) this.progressElem.value = value;
      if (this.inputElem) this.inputElem.value = value;
  }
}

class VideoBackgroundGroup {
  constructor(selector, factoryInstance) {
    this.elements = selector;
    if (this.elements instanceof Element) this.elements = [this.elements];
    if (typeof this.elements === 'string') this.elements = document.querySelectorAll(selector);
    if (!this.elements || !this.elements.length) return;

    this.factoryInstance = factoryInstance;
    this.stack = [];
    this.map = new Map();

    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      if (!element.hasAttribute('data-vbg-uid')) this.factoryInstance.add(element);
      this.stack.push(element);
      this.map.set(element, i);
      
      if (i === 0) {
        this.current = 0;
        this.currentElement = element;
        this.currentInstance = this.factoryInstance.get(element);
      }
      element.addEventListener('video-background-ended', this.onVideoEnded.bind(this));
      element.addEventListener('video-background-seeked', this.onVideoSeeked.bind(this));
      element.addEventListener('video-background-pause', this.onVideoPause.bind(this));
    }
  }

  onVideoPause(event) {
    const stackIndex = this.map.get(event.detail.element);
    if (stackIndex === this.current) return;

    this.levelSeekBars();
  }

  levelSeekBars() {
    for (let i = 0; i < this.stack.length; i++) {
      if (i === this.current) continue;
      const seekBarElem = this.getSeekBar(this.factoryInstance.get(this.stack[i]));
      if (!seekBarElem) continue;
      if (i < this.current) {
        requestAnimationFrame(() => this.setProgress(seekBarElem, 100));
      } else {
        requestAnimationFrame(() => this.setProgress(seekBarElem, 0));
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
    const progressElem = seekBarElem.querySelector('.js-seek-bar-progress');
    const inputElem = seekBarElem.querySelector('.js-seek-bar');
    if (progressElem) progressElem.value = value;
    if (inputElem) inputElem.value = value;
  }

  onVideoSeeked(event) {
    const current = this.map.get(event.detail.element);
    if (this.current !== current) this.setCurrent(current, true);
  }

  setCurrent(index, seek) {
    const previous = this.current;
    if (index >= this.stack.length) index = 0;
    if (index < 0) index = this.stack.length - 1;
    this.current = index;
    this.currentInstance = this.factoryInstance.get(this.stack[this.current]);
    this.currentElement = this.stack[this.current];
    
    this.stack[previous].style.display = 'none';
    this.currentElement.style.display = 'block';
    if (!seek) {
      const seekBarElem = this.getSeekBar(this.currentInstance);
      if (seekBarElem) this.setProgress(seekBarElem, 0);
      this.currentInstance.seek(0);
    }

    if (!this.currentInstance.playing) this.currentInstance.play();
  }

  onVideoEnded(event) {
    if (event.detail.element !== this.currentElement) return;
    this.next()
  }

  next() {
    this.setCurrent(this.current + 1);
  }

  prev() {
    this.setCurrent(this.current - 1);
  }
}

export class PlayToggle {
  constructor(playToggleElem, vbgInstance) {
      if (!playToggleElem) return;
      
      this.element = playToggleElem;
      this.targetSelector = this.element.getAttribute('data-target');

      if (!this.targetSelector) return;
      this.active = false;

      if (this.element.hasAttribute('aria-checked')) {
        this.active = this.element.getAttribute('aria-checked') === 'true';
      } else {
        this.element.setAttribute('aria-checked', this.active);
      }

      this.element.setAttribute('role', 'switch');

      this.targetElem = document.querySelector(this.targetSelector);
      if (!this.targetElem) return;

      if (vbgInstance) this.vbgInstance = vbgInstance;

      this.targetElem.addEventListener('video-background-ready', this.onReady.bind(this));
      this.targetElem.addEventListener('video-background-state-change', this.onStateChange.bind(this));
      this.targetElem.addEventListener('video-background-play', this.onPlay.bind(this));
      this.targetElem.addEventListener('video-background-pause', this.onPause.bind(this));
      this.targetElem.addEventListener('video-background-destroyed', this.onDestroyed.bind(this));

      this.element.addEventListener('click', this.onClick.bind(this));
  }

  onReady(event) {
    this.vbgInstance = event.detail;
  }

  onStateChange(event) {
    if (!this.vbgInstance) this.vbgInstance = event.detail;
    this.active = this.vbgInstance.currentState === 'playing';
    this.element.setAttribute('aria-checked', this.active);
  }

  onPlay(event) {
    if (!this.vbgInstance) this.vbgInstance = event.detail;
    this.active = true;
    this.element.setAttribute('aria-checked', this.active);
  }

  onPause(event) {
    if (!this.vbgInstance) this.vbgInstance = event.detail;
    this.active = false;
    this.element.setAttribute('aria-checked', this.active);
  }

  onDestroyed(event) {
    this.vbgInstance = null;
    this.active = false;
    this.element.setAttribute('aria-checked', this.active);
  }

  onClick(event) {
    if (!this.vbgInstance) return;
    if (this.active) {
      this.vbgInstance.pause();
    } else {
      this.vbgInstance.play();
    }
  }
}

export class MuteToggle {
  constructor(muteToggleElem, vbgInstance) {
      if (!muteToggleElem) return;
      
      this.element = muteToggleElem;
      this.targetSelector = this.element.getAttribute('data-target');

      if (!this.targetSelector) return;
      this.active = false;

      if (this.element.hasAttribute('aria-checked')) {
        this.active = this.element.getAttribute('aria-checked') === 'true';
      } else {
        this.element.setAttribute('aria-checked', this.active);
      }

      this.element.setAttribute('role', 'switch');

      this.targetElem = document.querySelector(this.targetSelector);
      if (!this.targetElem) return;

      if (vbgInstance) this.vbgInstance = vbgInstance;

      this.targetElem.addEventListener('video-background-ready', this.onReady.bind(this));
      this.targetElem.addEventListener('video-background-mute', this.onMute.bind(this));
      this.targetElem.addEventListener('video-background-unmute', this.onUnmute.bind(this));
      this.targetElem.addEventListener('video-background-destroyed', this.onDestroyed.bind(this));

      this.element.addEventListener('click', this.onClick.bind(this));
  }

  onReady(event) {
    this.vbgInstance = event.detail;
    if (this.vbgInstance.params.muted) {
      this.active = true;
      this.element.setAttribute('aria-checked', this.active);
    }
  }

  onMute(event) {
    if (!this.vbgInstance) this.vbgInstance = event.detail;
    this.active = true;
    this.element.setAttribute('aria-checked', this.active);
  }

  onUnmute(event) {
    if (!this.vbgInstance) this.vbgInstance = event.detail;
    this.active = false;
    this.element.setAttribute('aria-checked', this.active);
  }

  onDestroyed(event) {
    this.vbgInstance = null;
    this.active = false;
    this.element.setAttribute('aria-checked', this.active);
  }

  onClick(event) {
    if (!this.vbgInstance) return;
    if (this.active) {
      this.vbgInstance.unmute();
    } else {
      this.vbgInstance.mute();
    }
  }
}
