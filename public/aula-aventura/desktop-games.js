'use strict';
(() => {
  const G=window.ClassGames,L=window.DesktopLab,{frame,toolbar,finish,completed,escape}=G.shared;
  const descriptions={paint:'Dibujo tiene herramientas para crear imágenes.',photos:'Mis fotos permite mirar imágenes.',stories:'Lectura abre un cuento.',sound:'Música permite escuchar sonidos.',folder:'Mis dibujos ayuda a encontrar los trabajos guardados.'};
  const bind=(element,event,fn,context)=>element.addEventListener(event,fn,{signal:context.signal});
  function done(root,c){if(c.store.complete){completed(root,c);return true;}return false;}
  function search(root,c){
    if(done(root,c))return;const s=c.store,ui=frame(root,c),tasks=c.finalStation?[
      ['folder','¿Dónde buscarías un dibujo que ya guardaste?'],['stories','Quieres abrir un cuento para leer con el grupo.'],['paint','Necesitas un programa para dibujar.'],['photos','Quieres mirar las imágenes de un álbum.'],
    ]:[['paint','Busca el icono del programa para dibujar.'],['folder','Busca la carpeta que guarda nuestros dibujos.'],['photos','Busca el icono para mirar imágenes.'],['stories','Busca el programa para leer un cuento.'],['sound','¿Qué icono te permite escuchar una melodía?'],['paint','Quieres pintar una flor. ¿Qué icono eliges?'],['folder','Ya guardaste un trabajo. ¿Dónde volverías a buscarlo?']].slice(0,c.extended?7:4);
    s.round??=0;s.lab??={};
    function render(){
      ui.progress(`Pista ${s.round+1} de ${tasks.length}`,s.round/tasks.length);ui.body.innerHTML=`<div class="desktop-game-layout"><p class="desktop-goal">${tasks[s.round][1]}</p><div class="desktop-engine-host"></div></div>`;toolbar(ui,'',null,c.signal);
      L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,allowOpen:false,onAction(action,data){if(action!=='select'||s.roundDone)return;if(data.app!==tasks[s.round][0]){c.feedback(descriptions[data.app]+' Busca el icono que corresponde a la consigna.','retry');return;}s.roundDone=true;c.feedback('¡Ese es el icono que necesitábamos!','correct');c.celebrate();next();}});
      if(s.roundDone)next();
    }
    function next(){toolbar(ui,s.round===tasks.length-1?'Terminar la búsqueda ✓':'Otra pista →',()=>{s.round++;s.roundDone=false;if(s.round===tasks.length){finish(root,c,'Reconociste los iconos por lo que permiten hacer.');return;}s.lab={};render();},c.signal);}
    render();
  }
  function launch(root,c){
    if(done(root,c))return;const s=c.store,ui=frame(root,c),tasks=[['paint','Abre Dibujo para crear una imagen.'],['photos','Abre Mis fotos para observar imágenes.'],['stories','Abre Lectura para mirar el cuento.'],['sound','Abre Música para escuchar una melodía.']].slice(0,c.finalStation?3:c.extended?4:2);s.round??=0;s.lab??={};
    function render(){ui.progress(`Programa ${s.round+1} de ${tasks.length}`,s.round/tasks.length);ui.body.innerHTML=`<div class="desktop-game-layout"><p class="desktop-goal">${tasks[s.round][1]}</p><p class="desktop-control-hint">Haz doble clic izquierdo sobre el icono, o clic derecho y elige «Abrir» en el menú.</p><div class="desktop-engine-host"></div></div>`;toolbar(ui,'',null,c.signal);
      L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,onAction(action,data){if(action!=='open'||s.roundDone)return;if(data.app!==tasks[s.round][0]){c.feedback(descriptions[data.app]+' Puedes cerrar esta ventana y elegir otra.','retry');return;}s.roundDone=true;c.feedback('Abriste el programa adecuado y apareció su ventana.','correct');c.celebrate();next();}});if(s.roundDone)next();}
    function next(){toolbar(ui,s.round===tasks.length-1?'Terminar práctica ✓':'Abrir otro programa →',()=>{s.round++;s.roundDone=false;if(s.round===tasks.length){finish(root,c,'Elegiste y abriste programas según lo que necesitabas.');return;}s.lab={};render();},c.signal);}render();
  }
  function layout(root,c){
    if(done(root,c))return;const s=c.store,ui=frame(root,c);s.task??=0;s.lab??={};const tasks=['Mueve el icono Dibujo a otro lugar. Arrástralo o usa sus flechas al enfocarlo.','Cambia el fondo del escritorio.','Selecciona otra vez el icono Dibujo. Su función sigue siendo la misma.','Abre Dibujo. Comprueba que el programa no cambió con el fondo.'];
    ui.body.innerHTML='<div class="desktop-game-layout"><p class="desktop-goal"></p><div class="desktop-engine-host"></div><div class="desktop-extra-controls"><button type="button" class="demo-button" data-wallpaper>Cambiar fondo</button></div></div>';
    const update=()=>{ui.progress(`Acción ${Math.min(s.task+1,4)} de 4`,s.task/4);ui.body.querySelector('.desktop-goal').textContent=tasks[s.task]||'El escritorio cambió de aspecto y Dibujo sigue siendo Dibujo.';if(s.task===4)toolbar(ui,'Terminar práctica ✓',()=>finish(root,c,'Moviste un icono y comprobaste que cambiar el fondo no cambia un programa.'),c.signal);};
    const lab=L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,moveIcons:true,onAction(action,data){if((s.task===0&&action==='move-icon'&&data.app==='paint')||(s.task===2&&action==='select'&&data.app==='paint')||(s.task===3&&action==='open'&&data.app==='paint')){s.task++;update();c.feedback('¡Bien! Ahora observa la siguiente consigna.','correct');}}});
    bind(ui.body.querySelector('[data-wallpaper]'),'click',()=>{if(c.paused())return;s.lab.wallpaper=s.lab.wallpaper==='garden'?'valley':'garden';lab.render();if(s.task===1)s.task++;update();},c);update();
  }
  function painting(root,c){
    const s=c.store,ui=frame(root,c);s.lab??={windows:{paint:{open:true,x:.5,y:.2,z:1}}};
    ui.body.innerHTML='<div class="desktop-game-layout"><p class="desktop-goal">Dibuja un trazo y coloca al menos dos figuras en la hoja.</p><div class="desktop-engine-host"></div></div>';
    const update=()=>{const p=s.lab.project,count=(p?.strokes.some(item=>item.points.length>2)?1:0)+Math.min(2,p?.stamps.length||0);ui.progress(`Mi creación · ${count} de 3 pasos`,count/3);toolbar(ui,'',null,c.signal);if(s.complete)ui.body.querySelector('.desktop-goal').textContent='Tu creación sigue aquí. Puedes continuar o reiniciar la práctica.';if(count===3&&!s.complete)toolbar(ui,'Mostrar mi dibujo ✓',()=>{if(!p.strokes.some(item=>item.points.length>2)||p.stamps.length<2)return;s.complete=true;c.complete();c.celebrate();ui.body.querySelector('.desktop-goal').textContent='¡Tu creación está lista! Podemos observarla antes de continuar.';ui.toolbar.innerHTML='';},c.signal);};
    L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,onAction:()=>update()});update();
  }
  function classify(root,c){
    if(done(root,c))return;const s=c.store,ui=frame(root,c),items=[['paint','Programa Dibujo','program'],['folder','Carpeta Mis dibujos','folder'],['work','Trabajo MI SOL','work'],['stories','Programa Lectura','program'],['photos','Archivo de imagen','work'],['sound','Programa Música','program']].slice(0,c.extended?6:4);s.placed??=[];
    function render(){ui.progress(`${s.placed.length} de ${items.length} elementos`,s.placed.length/items.length);ui.body.innerHTML=`<div class="desktop-sort"><p class="desktop-goal">¿Es una herramienta, una carpeta o un trabajo?</p><div class="desktop-sort-bank">${items.map(([id,label],i)=>`<button type="button" class="desktop-sort-card ${s.selected===i?'is-selected':''}" data-sort-item="${i}" ${s.placed.includes(i)?'disabled':''}>${L.art(id)}<span>${label}</span></button>`).join('')}</div><div class="desktop-sort-zones">${[['program','Programa','Tiene herramientas'],['folder','Carpeta','Organiza trabajos'],['work','Trabajo','Es una creación o archivo']].map(([id,title,caption])=>`<button type="button" data-sort-zone="${id}"><strong>${title}</strong><small>${caption}</small><span>${s.placed.filter(i=>items[i][2]===id).map(i=>L.art(items[i][0])).join('')}</span></button>`).join('')}</div></div>`;
      const place=(index,zone)=>{if(c.paused()||s.placed.includes(index))return;if(items[index][2]!==zone){c.feedback('Piensa en su función: ¿tiene herramientas, organiza o es un trabajo?','retry');return;}s.placed.push(index);delete s.selected;render();c.feedback('¡Lo relacionaste con su función!','correct');c.celebrate();};
      ui.body.querySelectorAll('[data-sort-item]').forEach(button=>{const index=Number(button.dataset.sortItem);let start,dragged=false;bind(button,'pointerdown',event=>{if(c.paused()||event.button!==0)return;start=[event.clientX,event.clientY];dragged=false;button.setPointerCapture(event.pointerId);},c);bind(button,'pointermove',event=>{if(!start||c.paused())return;const dx=event.clientX-start[0],dy=event.clientY-start[1];if(Math.abs(dx)+Math.abs(dy)>8){dragged=true;button.style.transform=`translate(${dx}px,${dy}px)`;button.classList.add('is-dragging');}},c);bind(button,'pointerup',event=>{button.style.transform='';button.classList.remove('is-dragging');if(start&&dragged){const zone=document.elementsFromPoint(event.clientX,event.clientY).map(el=>el.closest('[data-sort-zone]')).find(Boolean);if(zone)place(index,zone.dataset.sortZone);}start=null;},c);bind(button,'pointercancel',()=>{start=null;button.style.transform='';button.classList.remove('is-dragging');},c);bind(button,'click',()=>{if(c.paused()||dragged)return;s.selected=index;render();},c);});
      ui.body.querySelectorAll('[data-sort-zone]').forEach(button=>bind(button,'click',()=>{if(s.selected!==undefined)place(s.selected,button.dataset.sortZone);else c.feedback('Selecciona un elemento o arrástralo a su grupo.');},c));
      if(s.placed.length===items.length)toolbar(ui,'Terminar clasificación ✓',()=>finish(root,c,'Distinguiste herramientas, carpetas y trabajos.'),c.signal);
    }render();
  }
  function windows(root,c){
    if(done(root,c))return;const s=c.store,ui=frame(root,c);s.task??=0;s.lab??={windows:{photos:{open:true,x:.05,y:.05,z:2},stories:{open:true,x:.95,y:.95,z:1}},z:2};
    const tasks=c.finalStation?[
      ['move','photos','Mueve la ventana Mis fotos desde su barra de título.'],['minimize','photos','Minimiza Mis fotos. Su botón queda en la barra de tareas.'],['restore','photos','Recupera Mis fotos desde la barra de tareas.'],['maximize','photos','Amplía Mis fotos con el botón del cuadrado.'],['close','stories','Muestra Lectura desde la barra de tareas y cierra solo esa ventana.'],
    ]:[['move','photos','Mueve Mis fotos arrastrando su barra de título. También puedes enfocar la barra y usar flechas.'],['minimize','photos','Minimiza la ventana Mis fotos.'],['restore','photos','Pulsa Mis fotos en la barra de tareas para recuperarla.'],['close','stories','Muestra Lectura desde la barra de tareas y cierra su ventana.'],['maximize','photos','Amplía Mis fotos para observar mejor la imagen.'],...(c.extended?[['normal','photos','Devuelve Mis fotos a su tamaño anterior.'],['minimize','photos','Minimiza nuevamente Mis fotos.'],['restore','photos','Recupera una vez más la ventana desde la barra de tareas.']]:[])];
    ui.body.innerHTML='<div class="desktop-game-layout"><p class="desktop-goal"></p><div class="desktop-engine-host"></div></div>';
    const update=()=>{ui.progress(`Control ${Math.min(s.task+1,tasks.length)} de ${tasks.length}`,s.task/tasks.length);ui.body.querySelector('.desktop-goal').textContent=tasks[s.task]?.[2]||'¡Las ventanas están organizadas!';if(s.task===tasks.length)toolbar(ui,'Terminar práctica ✓',()=>finish(root,c,'Moviste ventanas, las recuperaste y elegiste cuál cerrar.'),c.signal);};
    L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,onAction(action,data){const task=tasks[s.task];if(!task)return;const actual=action==='maximize'&&!data.maximized?'normal':action;if(actual===task[0]&&data.app===task[1]){s.task++;update();c.feedback('¡Bien! Observa el cambio y continúa con la siguiente consigna.','correct');c.celebrate();}else if(['close','minimize','maximize'].includes(action))c.feedback('Revisa qué ventana y qué control pide la consigna. Puedes volver a abrir un programa.','retry');}});update();
  }
  function files(root,c){
    if(done(root,c))return;const s=c.store,ui=frame(root,c),targets=(c.extended?['MI FLOR','MI AVE','MI SOL']:['MI SOL','MI FLOR']);s.round??=0;s.lab??={windows:{folder:{open:true,x:.5,y:.2,z:1}}};
    function render(){ui.progress(`Archivo ${s.round+1} de ${targets.length}`,s.round/targets.length);ui.body.innerHTML=`<div class="desktop-game-layout"><p class="desktop-goal">Abre el archivo de ejemplo que se llama <strong>${targets[s.round]}</strong>.</p><div class="desktop-engine-host"></div></div>`;toolbar(ui,'',null,c.signal);
      L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,examples:true,onAction(action,data){if(action!=='example-open'||s.roundDone)return;if(data.name!==targets[s.round]){c.feedback('Mira el nombre del archivo. Puedes volver a Mis dibujos desde la barra de tareas.','retry');return;}s.roundDone=true;c.feedback('Abriste el archivo que pedía el nombre.','correct');next();}});
      if(s.roundDone)next();
    }
    function next(){toolbar(ui,s.round===targets.length-1?'Terminar práctica ✓':'Buscar otro archivo →',()=>{s.round++;s.roundDone=false;if(s.round===targets.length){finish(root,c,'Usaste la carpeta y el nombre para recuperar un archivo.');return;}s.lab={windows:{folder:{open:true,x:.5,y:.2,z:1}}};render();},c.signal);}
    render();
  }
  function project(root,c){
    const s=c.store,ui=frame(root,c);s.lab??={windows:{paint:{open:true,x:.5,y:.2,z:1}}};
    ui.body.innerHTML='<div class="desktop-game-layout"><p class="desktop-goal"></p><div class="project-checklist" aria-label="Pasos del trabajo"></div><div class="desktop-engine-host"></div></div>';
    const update=()=>{
      const p=s.lab.project,drawn=p?.strokes.some(item=>item.points.length>2)&&p?.stamps.length>=2,titled=!!p?.title?.trim(),saved=!!p?.saved&&!p?.dirty,recovered=!!p?.recovered&&!p?.dirty;
      const checks=[drawn,titled,saved,recovered];ui.progress(`Mi trabajo · ${checks.filter(Boolean).length} de 4 pasos`,checks.filter(Boolean).length/4);
      ui.body.querySelector('.project-checklist').innerHTML=['Dibujar','Dar un nombre','Guardar','Volver a abrir'].map((label,i)=>`<span class="${checks[i]?'is-done':''}">${checks[i]?'✓':i+1} ${label}</span>`).join('');
      ui.body.querySelector('.desktop-goal').textContent=!drawn?'Dibuja un trazo y coloca dos figuras. Puedes usar el botón «Trazo de apoyo».':!titled?'Escribe un nombre para tu dibujo. Puedes usar MI SOL.':!saved?'Pulsa Guardar y elige la carpeta Mis dibujos.':!recovered?'Cierra Dibujo. Abre Mis dibujos y vuelve a abrir tu trabajo.':'¡Volviste a encontrar tu trabajo guardado!';
      toolbar(ui,'',null,c.signal);
      if(recovered&&!s.complete)toolbar(ui,'Presentar mi trabajo ✓',()=>{if(p.dirty||!p.saved||!p.recovered){c.feedback('Guarda tus cambios y vuelve a abrir el dibujo antes de presentarlo.','retry');return;}s.complete=true;c.complete();c.celebrate();ui.toolbar.innerHTML='<p class="desktop-completion-note">Trabajo presentado. Puedes observarlo antes de continuar.</p>';ui.body.querySelector('.desktop-engine-host').inert=true;},c.signal);
    };
    L.mount(ui.body.querySelector('.desktop-engine-host'),{...c,store:s.lab,requireSave:true,onAction:()=>update()});update();if(s.complete)ui.body.querySelector('.desktop-engine-host').inert=true;
  }
  const stations=[['Encuentra lo que necesitas','desktop-search'],['Abre el programa adecuado','desktop-launch'],['Organiza tus ventanas','desktop-windows'],['Crea, guarda y recupera','desktop-project']];
  Object.assign(window.ClassChallenges,{'desktop-search':search,'desktop-launch':launch,'desktop-layout':layout,'desktop-paint':painting,'desktop-classify':classify,'desktop-windows':windows,'desktop-files':files,'desktop-project':project,'desktop-final':(root,c)=>G.runFinal(root,{...c,finalMessage:'Reconociste iconos, usaste ventanas y recuperaste tu propio trabajo guardado.'},stations)});
  window.DesktopLessons={render(step,root,c){
    const kind=step.demo;safelyPrepare(c);c.store.lab??={};const labStore=c.store.lab;
    if(['desktop-program','desktop-work','desktop-save'].includes(kind)&&!labStore.windows)labStore.windows={paint:{open:true,x:.5,y:.2,z:1}};
    if(['desktop-titlebar','desktop-minimize','desktop-close'].includes(kind)&&!labStore.windows)labStore.windows={photos:{open:true,x:.2,y:.1,z:1}};
    if(['desktop-folder','desktop-recover'].includes(kind)&&!labStore.windows)labStore.windows={folder:{open:true,x:.5,y:.2,z:1}};
    root.innerHTML='<div class="desktop-demo"><div class="desktop-engine-host"></div><div class="desktop-demo-actions"></div></div>';
    const lab=L.mount(root.querySelector('.desktop-engine-host'),{...c,store:labStore,moveIcons:kind==='desktop-move',examples:['desktop-folder','desktop-recover'].includes(kind),allowOpen:!['desktop-areas','desktop-background','desktop-move'].includes(kind),onAction(action,data){if(action==='select')c.feedback(descriptions[data.app]);if(action==='open')c.feedback(`Abriste ${L.apps[data.app].name}. Ahora vemos su ventana.`,'correct');if(action==='minimize')c.feedback('La ventana se ocultó, pero el programa sigue en la barra de tareas.');if(action==='restore')c.feedback('La ventana volvió. El programa no se había cerrado.','correct');if(action==='close')c.feedback('Cerraste esa ventana. El escritorio sigue disponible.');if(action==='move')c.feedback('Moviste la ventana desde su barra de título.');if(action==='example-open')c.feedback(`Abriste el archivo de ejemplo ${data.name}.`,'correct');}});
    const actions=root.querySelector('.desktop-demo-actions');
    if(kind==='desktop-background'){actions.innerHTML='<button type="button" class="demo-button">Cambiar el fondo</button>';bind(actions.querySelector('button'),'click',()=>{if(c.paused())return;labStore.wallpaper=labStore.wallpaper==='garden'?'valley':'garden';lab.render();c.feedback('Cambió la imagen del fondo. Los iconos siguen siendo los mismos.');},c);}
    if(kind==='desktop-areas'){actions.innerHTML=['icons','area','taskbar'].map((id,i)=>`<button type="button" class="demo-button" data-area="${id}">${['Iconos','Área de trabajo','Barra de tareas'][i]}</button>`).join('');actions.querySelectorAll('[data-area]').forEach(button=>bind(button,'click',()=>{if(c.paused())return;root.querySelector('.lab-desktop').dataset.focus=button.dataset.area;c.feedback({icons:'Los iconos representan programas, carpetas o archivos.',area:'En esta zona vemos las ventanas y trabajamos.',taskbar:'La barra de tareas ayuda a volver a los programas que siguen abiertos.'}[button.dataset.area]);},c));}
  }};
  function safelyPrepare(c){L.ready().catch(error=>c.feedback(error.message,'retry'));}
})();
