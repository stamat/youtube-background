import { isArray, stringToType } from 'book-of-spells';

export function hasClass(element, className) {
  return element.classList.contains(className);
}

export function addClass(element, classNames) {
  const classes = classNames.split(' ');
  element.classList.add(...classes);
}

export function removeClass(element, classNames) {
  const classes = classNames.split(' ');
  element.classList.remove(...classes);
}

export function toogleClass(element, className) {
  element.classList.toggle(className);
}

export function parseProperties(params, defaults, element, attr_prefix) {
  let res_params = {};

  if (!params) {
    res_params = defaults;
  } else {
    for (let k in defaults) {
      if (!params.hasOwnProperty(k)) {
        //load in defaults if the param hasn't been set
        res_params[k] = defaults[k];
      }
    }
  }

  if (!element) return res_params;
  // load params from data attributes
  for (let k in res_params) {
    let data;

    if (isArray(attr_prefix)) {
      for (var i = 0; i < attr_prefix.length; i++) {
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
};

export function generateActionButton(obj, props) {
  const btn = document.createElement('button');
  btn.className = props.className;
  btn.innerHTML = props.innerHtml;
  addClass(btn.firstChild, props.stateChildClassNames[0]);

  //TODO: solve this with ARIA toggle states
  if (obj.params[props.condition_parameter] === props.initialState) {
    addClass(btn, props.stateClassName);
    removeClass(btn.firstChild, props.stateChildClassNames[0]);
    addClass(btn.firstChild, props.stateChildClassNames[1]);
  }

  btn.addEventListener('click', function(e) {
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
};

export function buildWrapperHTML() {
  const parent = this.element.parentNode;
  // wrap
  addClass(this.element, 'youtube-background video-background');

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
      if (this.type === 'youtube') wrapper_styles['background-image'] = 'url(https://img.youtube.com/vi/'+this.ytid+'/hqdefault.jpg)';
      if (this.type === 'vimeo') wrapper_styles['background-image'] = 'url(https://vumbnail.com/'+this.vid+'.jpg)';
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
