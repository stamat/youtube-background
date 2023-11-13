
export class SeekBar {
  constructor(seekBarElem, vbgInstance) {
      this.lock = false;
      if (!seekBarElem) return;
      this.seekBarElem = seekBarElem;
      this.progressElem = this.seekBarElem.querySelector('.js-seek-bar-progress');
      this.inputElem = this.seekBarElem.querySelector('.js-seek-bar');
      this.targetSelector = this.seekBarElem.getAttribute('data-target');
      if (!this.targetSelector) return;
      this.targetElem = document.querySelector(this.targetSelector);
      if (!this.targetElem) return;

      if (vbgInstance) this.vbgInstance = vbgInstance;
      
      this.targetElem.addEventListener('video-background-time-update', this.onTimeUpdate.bind(this));
      this.targetElem.addEventListener('video-background-play', this.onReady.bind(this));
      this.targetElem.addEventListener('video-background-ready', this.onReady.bind(this));
      this.targetElem.addEventListener('video-background-destroyed', this.onDestroyed.bind(this));

      this.inputElem.addEventListener('input', this.onInput.bind(this));
      this.inputElem.addEventListener('change', this.onChange.bind(this));
  }

  onReady(event) {
    this.vbgInstance = event.detail;
  }

  onTimeUpdate(event) {
      if (!this.vbgInstance) this.vbgInstance = event.detail;
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
