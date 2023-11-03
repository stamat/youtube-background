import { isArray, stringToType } from 'book-of-spells';

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

function buttonOn(buttonObj) {
  if (!buttonObj) return;
  console.log(buttonObj);
  buttonObj.element.classList.add(buttonObj.stateClassName);
  buttonObj.element.firstChild.classList.remove(buttonObj.stateChildClassNames[0]);
  buttonObj.element.firstChild.classList.add(buttonObj.stateChildClassNames[1]);
}

function buttonOff(buttonObj) {
  if (!buttonObj) return;
  buttonObj.element.classList.remove(buttonObj.stateClassName);
  buttonObj.element.firstChild.classList.add(buttonObj.stateChildClassNames[0]);
  buttonObj.element.firstChild.classList.remove(buttonObj.stateChildClassNames[1]);
}

export function generateActionButton(obj, props) {
  const btn = document.createElement('button');
  btn.className = props.className;
  btn.innerHTML = props.innerHtml;
  btn.firstChild.classList.add(props.stateChildClassNames[0]);
  props.element = btn;

  //TODO: solve this with ARIA toggle states
  if (obj.params[props.condition_parameter] === props.initialState) {
    buttonOn(props);
  }

  btn.addEventListener('click', function(e) {
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
};
