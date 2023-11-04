import { parseProperties, generateActionButton } from './utils.js';
import { isMobile, parseResolutionString, proportionalParentCoverResize } from 'book-of-spells';

export class SuperVideoBackground {
  constructor(elem, params, id, uid, type) {
    if (!id) return;
    this.is_mobile = isMobile();
    this.type = type;
    this.id = id;

    this.element = elem;
    this.playerElement = null;
    this.uid = uid;
    this.element.setAttribute('data-vbg-uid', uid);

    this.buttons = {};
    this.isIntersecting = false;

    this.state = {};
    this.state.playing = false;
    this.state.muted = false;
    this.state.volume_once = false;

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
      'onStatusChange': function() {},
      'inline-styles': true,
      'fit-box': false,
      'offset': 100, // since showinfo is deprecated and ignored after September 25, 2018. we add +100 to hide it in the overflow
      'start-at': 0,
      'end-at': 0,
      'poster': null,
      'always-play': false,
      'volume': 1,
      'no-cookie': true
    };

    this.params = parseProperties(params, DEFAULTS, this.element, ['data-ytbg-', 'data-vbg-']);

    //pause deprecated
    if (this.params.pause) {
      this.params['play-button'] = this.params.pause;
    }

    this.params.resolution_mod = parseResolutionString(this.params.resolution);
    this.state.playing = this.params.autoplay;
    this.state.muted = this.params.muted;


    this.buildWrapperHTML();

    if (this.is_mobile && !this.params.mobile) return;

    if (this.params['play-button']) {
      generateActionButton(this, {
        name: 'playing',
        className: 'play-toggle',
        innerHtml: '<i class="fa"></i>',
        initialState: !this.state.playing,
        stateClassName: 'paused',
        condition_parameter: 'autoplay',
        stateChildClassNames: ['fa-pause-circle', 'fa-play-circle'],
        actions: ['play', 'pause']
      });
    }

    if (this.params['mute-button']) {
      generateActionButton(this, {
        name: 'muted',
        className: 'mute-toggle',
        innerHtml: '<i class="fa"></i>',
        initialState: this.state.muted,
        stateClassName: 'muted',
        condition_parameter: 'muted',
        stateChildClassNames: ['fa-volume-up', 'fa-volume-mute'],
        actions: ['unmute', 'mute']
      });
    }
  }

  resize(element) {
    if (this.params['fit-box']) return;
    proportionalParentCoverResize(element || this.playerElement, this.params.resolution_mod, this.params.offset);
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
      if (this.params['load-background']) {
        if (this.type === 'youtube') wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.id+'/hqdefault.jpg)';
        if (this.type === 'vimeo') wrapper_styles['background-image'] = 'url(https://vumbnail.com/'+this.id+'.jpg)';
      }
      if (this.params['poster']) wrapper_styles['background-image'] = this.params['poster'];
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
}
