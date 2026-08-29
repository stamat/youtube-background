
function setButtonState(buttonObj, active) {
  if (!buttonObj || !buttonObj.element) return;
  const element = buttonObj.element;

  element.classList.toggle(buttonObj.stateClassName, active);
  element.firstChild.classList.toggle(buttonObj.stateChildClassNames[0], !active);
  element.firstChild.classList.toggle(buttonObj.stateChildClassNames[1], active);

  // The name is the action the press will take - "Pause" while playing - and that swap is
  // the whole state: adding aria-pressed on top would say it twice, and ARIA asks for a
  // toggle button's name to never change.
  if (buttonObj.stateLabels) element.setAttribute('aria-label', buttonObj.stateLabels[active ? 1 : 0]);
}

export function generateActionButton(obj, props) {
  const btn = document.createElement('button');
  btn.className = props.className;
  btn.innerHTML = props.innerHtml;
  btn.setAttribute('type', 'button');
  props.element = btn;

  // the live instance flag, not params - params has no 'paused' key at all
  setButtonState(props, !!obj[props.condition_parameter]);

  btn.addEventListener('click', function() {
    const active = this.classList.contains(props.stateClassName);
    setButtonState(props, !active);
    obj[props.actions[active ? 0 : 1]]();
  });

  obj.buttons[props.name] = {
    element: btn,
    button_properties: props
  };

  obj.controls_element.appendChild(btn);
};
