import { generateActionButton } from './buttons.js';
import { isArray, stringToType, isMobile, parseResolutionString, proportionalParentCoverResize, percentage, fixed } from 'book-of-spells';

export class SuperVideoBackground {
  constructor(elem, params, id, uid, type, factoryInstance) {
    if (!id) return;
    this.is_mobile = isMobile();
    this.type = type;
    this.id = id;
    this.factoryInstance = factoryInstance;

    this.element = elem;
    this.playerElement = null;
    this.uid = uid;
    this.element.setAttribute('data-vbg-uid', uid);

    this.buttons = {};
    this.isIntersecting = false;

    this.paused = false; // user requested pause. used for blocking intersection softPlay
    this.muted = false;
    this.currentState = 'notstarted';

    this.initialPlay = false;
    this.initialVolume = false;

    this.volume = 1;

    this.params = {};

    const DEFAULTS = {
      'pause': false, //deprecated
      'play-button': false,
      'mute-button': false,
      'autoplay': true,
      'muted': true,
      'loop': true,
      'mobile': true,
      'load-background': false,
      'resolution': '16:9',
      'inline-styles': true,
      'fit-box': false,
      'offset': 100, // since showinfo is deprecated and ignored after September 25, 2018. we add +100 to hide it in the overflow
      'start-at': 0,
      'end-at': 0,
      'poster': null,
      'always-play': false,
      'volume': 1,
      'no-cookie': true,
      'force-on-low-battery': false,
      'lazyloading': false,
      'title': 'Video background'
    };

    this.params = this.parseProperties(params, DEFAULTS, this.element, ['data-ytbg-', 'data-vbg-']);

    //pause deprecated
    if (this.params.pause) {
      this.params['play-button'] = this.params.pause;
    }

    this.params.resolution_mod = parseResolutionString(this.params.resolution);

    this.muted = this.params.muted;

    this.volume = this.params.volume;

    this.currentTime = this.params['start-at'] || 0;
    this.duration = this.params['end-at'] || 0;
    this.percentComplete = 0;
    if (this.params['start-at']) this.percentComplete = this.timeToPercentage(this.params['start-at']);

    this.buildWrapperHTML();

    if (this.is_mobile && !this.params.mobile) return;

    if (this.params['play-button']) {
      generateActionButton(this, {
        name: 'playing',
        className: 'play-toggle',
        innerHtml: '<i class="fa"></i>',
        initialState: !this.paused,
        stateClassName: 'paused',
        condition_parameter: 'paused',
        stateChildClassNames: ['fa-pause-circle', 'fa-play-circle'],
        actions: ['play', 'pause']
      });
    }

    if (this.params['mute-button']) {
      generateActionButton(this, {
        name: 'muted',
        className: 'mute-toggle',
        innerHtml: '<i class="fa"></i>',
        initialState: this.muted,
        stateClassName: 'muted',
        condition_parameter: 'muted',
        stateChildClassNames: ['fa-volume-up', 'fa-volume-mute'],
        actions: ['unmute', 'mute']
      });
    }
  }

  timeToPercentage(time) {
    if (time <= this.params['start-at']) return 0;
    if (time >= this.duration) return 100;
    if (time <= 0) return 0;
    time -= this.params['start-at']; // normalize
    const duration = this.duration - this.params['start-at']; // normalize
    return percentage(time, duration);
  }

  percentageToTime(percentage) {
    if (!this.duration) return this.params['start-at'] || 0;
    if (percentage > 100) return this.duration;
    if (percentage <= 0) return this.params['start-at'] || 0;
    const duration = this.duration - this.params['start-at']; // normalize
    let time = percentage * duration / 100;
    time = fixed(time, 3)
    if (time > duration) time = duration;
    if (this.params['start-at']) time += this.params['start-at']; // normalize
    return time;
  }

  resize(element) {
    if (!this.params['fit-box']) proportionalParentCoverResize(element || this.playerElement, this.params.resolution_mod, this.params.offset);
    this.dispatchEvent('video-background-resize');
  }

  stylePlayerElement(element) {
    if (!element) return;

    if (this.params['inline-styles']) {
      element.style.top = '50%';
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%) translateY(-50%)';
      element.style.position = 'absolute';
      element.style.opacity = 0;
    }

    if (this.params['fit-box']) {
      element.style.width = '100%';
      element.style.height = '100%';
    }
  }

  buildWrapperHTML() {
    const parent = this.element.parentNode;
    // wrap
    this.element.classList.add('youtube-background', 'video-background');
  
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
  
    if (!this.params['mute-button']) {
      wrapper_styles["pointer-events"] = "none" // avoid right mouse click popup menu
    }
  
    if (this.params['load-background'] || this.params['poster']) {
      this.loadBackground(this.id);
      if (this.params['poster']) wrapper_styles['background-image'] = `url(${ this.params['poster'] })`;
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
  
    // set play/mute controls wrap
    if (this.params['play-button'] || this.params['mute-button']) {
      const controls = document.createElement('div');
      controls.className = 'video-background-controls';
  
      controls.style.position = 'absolute';
      controls.style.top = '10px';
      controls.style.right = '10px';
      controls.style['z-index'] = 2;
  
      this.controls_element = controls;
      parent.appendChild(controls);
    }
  
    return this.element;
  }

  loadBackground(id) {
    if (!this.params['load-background']) return;
    if (!id) return;
    if (this.type === 'youtube') this.element.style['background-image'] = `url(https://img.youtube.com/vi/${id}/hqdefault.jpg)`;
    if (this.type === 'vimeo') this.element.style['background-image'] = `url(https://vumbnail.com/${id}.jpg)`;
  }

  destroy() {
    this.playerElement.remove();
    this.element.classList.remove('youtube-background', 'video-background');
    this.element.removeAttribute('data-vbg-uid');
    this.element.style = '';

    if (this.params['play-button'] || this.params['mute-button']) {
      this.controls_element.remove();
    }

    if (this.timeUpdateTimer) clearInterval(this.timeUpdateTimer);
    this.dispatchEvent('video-background-destroyed');
  }

  setDuration(duration) {
    if (this.duration === duration) return;

    if (this.params['end-at']) {
      if (duration > this.params['end-at']) {
        this.duration = this.params['end-at'];
        return;
      }
      if (duration < this.params['end-at']) {
        this.duration = duration;
        return;
      }
    } else {
      this.duration = duration;
      return;
    }

    if (duration <= 0) this.duration = this.params['end-at'];
  }

  setStartAt(startAt) {
    this.params['start-at'] = startAt;
  }

  setEndAt(endAt) {
    this.params['end-at'] = endAt;
    if (this.duration > endAt) this.duration = endAt;
    if (this.currentTime > endAt) this.onVideoEnded();
  }

  dispatchEvent(name) {
    this.element.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: this }));
  }

  shouldPlay() {
    if (this.currentState === 'ended' && !this.params.loop) return false;
    if (this.params['always-play'] && this.currentState !== 'playing') return true;
    if (this.isIntersecting && this.params.autoplay && this.currentState !== 'playing') return true;
    return false;
  }

  mobileLowBatteryAutoplayHack() {
    if (!this.params['force-on-low-battery']) return;
    if (!this.is_mobile && this.params.mobile) return;

    const forceAutoplay = function() {
      if (!this.initialPlay && this.params.autoplay && this.params.muted) {
        this.softPlay();

        if (!this.isIntersecting && !this.params['always-play']) {
          this.softPause();
        }
      }
    }
    
    document.addEventListener('touchstart', forceAutoplay.bind(this), { once: true });
  }

  parseProperties(params, defaults, element, attr_prefix) {
    let res_params = {};
  
    if (!params) {
      res_params = defaults;
    } else {
      for (let k in defaults) {
        //load in defaults if the param hasn't been set
        res_params[k] = !params.hasOwnProperty(k) ? defaults[k] : params[k];
      }
    }
  
    if (!element) return res_params;
    // load params from data attributes
    for (let k in res_params) {
      let data;
  
      if (isArray(attr_prefix)) {
        for (let i = 0; i < attr_prefix.length; i++) {
          const temp_data = element.getAttribute(attr_prefix[i]+k);
          if (temp_data) {
            data = temp_data;
            break;
          }
        }
      } else {
        data = element.getAttribute(attr_prefix+k);
      }
  
      if (data !== undefined && data !== null) {
        res_params[k] = stringToType(data);
      }
    }
  
    return res_params;
  }
}
