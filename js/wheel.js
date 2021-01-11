let createWheel = (data) => {
  let r = 45, C = 2 * Math.PI * r;
  let v = (data.value / (data.max || 100));
  let perc = Math.round(v*100);
  let cssClass = 'bad';
  if (data.smallerIsBetter)
  {
    cssClass = 'good';
    if (v >= 0.75) {
      cssClass = 'bad';
    }
    else if (v >= 0.5) {
      cssClass = 'warn';
    }
    if (data.value >=1){
      cssClass = 'bad';
    }
  }
  else
  {
    cssClass = 'bad';
    if (v >= 0.75) {
      cssClass = 'good';
    }
    else if (v >= 0.5) {
      cssClass = 'warn';
    }
  }
  v = C * v;

  return `<div class="wheel ${cssClass}"><a href="#${data.title}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle class="back-ring" cx="50" cy="50" r="${r}" stroke-width="8"></circle>
      <circle class="value" fill="none" cx="50" cy="50" r="${r}" stroke-width="8" stroke-dasharray="${v} ${C}" ></circle>
      <text
        text-anchor="middle"
        font-size="30" font-family="Lato"
        transform="rotate(90 50,50)"
        lengthAdjust="spacingAndGlyphs" x="50" y="62">${perc}%</text>
    </svg>
    <div class="wheel-title"><span class="wheel-main">${data.title || ''}</span><br>${data.value}/${data.max}<span class="wheel-sub">${data.subtitle}</span></div></a>
    </div>`;
};
