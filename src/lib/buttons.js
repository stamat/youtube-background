
function buttonOn(buttonObj) {
  if (!buttonObj) return;
  buttonObj.element.classList.add(buttonObj.stateClassName);
  buttonObj.element.firstChild.classList.remove(buttonObj.stateChildClassNames[0]);
  buttonObj.element.firstChild.classList.add(buttonObj.stateChildClassNames[1]);
  buttonObj.element.setAttribute('aria-checked', false);
}

function buttonOff(buttonObj) {
  if (!buttonObj) return;
  buttonObj.element.classList.remove(buttonObj.stateClassName);
  buttonObj.element.firstChild.classList.add(buttonObj.stateChildClassNames[0]);
  buttonObj.element.firstChild.classList.remove(buttonObj.stateChildClassNames[1]);
  buttonObj.element.setAttribute('aria-checked', true);
}

export function generateActionButton(obj, props) {
  const btn = document.createElement('button');
  btn.className = props.className;
  btn.innerHTML = props.innerHtml;
  btn.setAttribute('role', 'switch');
  btn.firstChild.classList.add(props.stateChildClassNames[0]);
  btn.setAttribute('aria-checked', !props.initialState);
  props.element = btn;

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
