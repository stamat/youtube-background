export class SuperVideoBackground {
  buildWrapperHTML() {
    const parent = this.element.parentNode;
    // wrap
    this.element.classList.add('video-background video-background'.split(' '));
  
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
}
