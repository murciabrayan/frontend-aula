'use strict';
(() => {
  const paths={
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff:'<path d="m3 3 18 18M10.6 5.1 12 5c7 0 10 7 10 7a17 17 0 0 1-3 4m-3.1 2.4L12 19C5 19 2 12 2 12a18 18 0 0 1 4-5m4 3a3 3 0 0 0 4 4"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m2-15a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
    book:'<path d="M12 5c-3-2-7-2-10 0v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Zm0 0v15"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.2 7a8 8 0 0 1 13.3-1L20 8M4 16l1.5 2A8 8 0 0 0 19 17"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    link:'<path d="m10 14 4-4m-7 5-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 4 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(2 1)"/>',
    logout:'<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m4-4 4-4-4-4m-6 4h10"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    alert:'<path d="m10 4-8 14a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3L14 4a2.3 2.3 0 0 0-4 0Z"/><path d="M12 9v4m0 3h.01"/>',
    cloud:'<path d="M7 18a5 5 0 0 1-1-10 6 6 0 0 1 12 1 4.5 4.5 0 0 1-1 9M12 12v9m-3-3 3 3 3-3"/>',
    sparkle:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>',play:'<path d="m9 5 11 7-11 7V5Z"/>',
  };
  const icon=(name,extra='')=>`<svg class="ui-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.info}</svg>`;
  const hydrate=(root=document)=>root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
  function busy(button,value,label){
    if(!button)return;
    if(value){button.dataset.previousHtml=button.innerHTML;button.innerHTML=`<span class="ui-spinner" aria-hidden="true"></span><span>${label}</span>`;}
    else if(button.dataset.previousHtml){button.innerHTML=button.dataset.previousHtml;delete button.dataset.previousHtml;}
    button.disabled=value;button.setAttribute('aria-busy',String(value));
  }
  window.AulaUI={icon,hydrate,busy};hydrate();
})();
