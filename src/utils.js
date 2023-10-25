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

export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

export function parseResolutionString(res) {
  const pts = res.split(/\s?:\s?/i);
  const DEFAULT_RESOLUTION = 16/9;
  if (pts.length < 2) {
    return DEFAULT_RESOLUTION;
  }

  const w = parseInt(pts[0], 10);
  const h = parseInt(pts[1], 10);

  if (isNaN(w) || isNaN(h)) {
    return DEFAULT_RESOLUTION;
  }

  return w/h;
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
