'use strict';
(() => {
  const G=window.ClassGames,escape=G.shared.escape;
  const apps={folder:{name:'Mis dibujos',frame:0},paint:{name:'Dibujo',frame:1},photos:{name:'Mis fotos',frame:2},stories:{name:'Lectura',frame:3},sound:{name:'Música',frame:4},work:{name:'Mi trabajo',frame:5}};
  const art=(id,extra='')=>`<span class="desktop-art desktop-art-${id} ${extra}" aria-hidden="true"></span>`;
  const control=(kind)=>`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${kind==='close'?'<path d="m5 5 10 10M5 15 15 5"/>':kind==='minimize'?'<path d="M4 13h12"/>':'<rect x="4" y="4" width="12" height="12" rx="2"/>'}</svg>`;
  const images={};let preparing;
  function ready(){return preparing??=Promise.all([['pictures','assets/learning-pictures-v1.png'],['animals','assets/animals-v3.png'],['icons','assets/desktop-icons-v1.png']].map(([id,src])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{images[id]=image;resolve();};image.onerror=()=>{preparing=null;reject(Error('No pudimos cargar las ilustraciones del escritorio.'));};image.src=src;})));}
  function drawProject(canvas,project){
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.fillStyle='#fffef8';ctx.fillRect(0,0,w,h);
    for(const stroke of project.strokes||[]){if(!stroke.points?.length)continue;ctx.beginPath();ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width||5;ctx.lineCap='round';ctx.lineJoin='round';stroke.points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.stroke();}
    for(const stamp of project.stamps||[]){const animal=['rabbit','frog','bird'].includes(stamp.id),image=images[animal?'animals':'pictures'];if(!image)continue;const frame=animal?{rabbit:0,frog:4,bird:6}[stamp.id]:{sun:0,flower:4,apple:5}[stamp.id],cols=animal?4:3,rows=2,size=96;ctx.drawImage(image,frame%cols*image.width/cols,Math.floor(frame/cols)*image.height/rows,image.width/cols,image.height/rows,stamp.x*w-size/2,stamp.y*h-size/2,size,size);}
  }
  function mount(root,options){
    const {store:s,signal,paused=()=>false,feedback=()=>{},onAction=()=>{}}=options;
    s.windows??={};s.z??=1;s.project??={title:'',strokes:[],stamps:[],tool:'pen',color:'#527046',width:6};s.iconPositions??={};
    const p=s.project;let destroyed=false,audio,paperObserver,contextMenu;
    const emit=(action,data={})=>{if(!destroyed)onAction(action,data);};
    const on=(el,event,callback)=>el?.addEventListener(event,callback,{signal});
    signal.addEventListener('abort',()=>{destroyed=true;closeMenu();audio?.close();paperObserver?.disconnect();},{once:true});
    function closeMenu(returnFocus=false){if(!contextMenu)return;const {element,target,controller}=contextMenu;controller.abort();element.remove();contextMenu=null;if(returnFocus&&target.isConnected)target.focus({preventScroll:true});}
    function showMenu(event,target,label,activate){
      event.preventDefault();event.stopPropagation();closeMenu();if(paused()||options.allowOpen===false)return;
      const desktop=root.querySelector('.lab-desktop'),bounds=desktop.getBoundingClientRect(),rect=target.getBoundingClientRect();
      const menu=document.createElement('div');menu.className='desktop-context-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label',`Opciones de ${label}`);
      const button=document.createElement('button');button.type='button';button.setAttribute('role','menuitem');button.dataset.contextOpen='';button.textContent='Abrir';menu.append(button);desktop.append(menu);
      const controller=new AbortController();contextMenu={element:menu,target,controller};
      const x=event.clientX||rect.left+rect.width/2,y=event.clientY||rect.top+rect.height/2;
      const left=Math.max(5,-bounds.left+5),top=Math.max(5,-bounds.top+5),right=Math.min(desktop.clientWidth-5,innerWidth-bounds.left-5),bottom=Math.min(desktop.clientHeight-5,innerHeight-bounds.top-5);
      menu.style.left=Math.max(left,Math.min(right-menu.offsetWidth,x-bounds.left))+'px';menu.style.top=Math.max(top,Math.min(bottom-menu.offsetHeight,y-bounds.top))+'px';
      button.addEventListener('click',()=>{closeMenu();if(!paused())activate();},{signal:controller.signal});
      menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeMenu(true);}if(e.key==='Tab')closeMenu();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();button.focus();}},{signal:controller.signal});
      document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))closeMenu();},{signal:controller.signal,capture:true});
      document.addEventListener('scroll',()=>closeMenu(),{signal:controller.signal,capture:true});window.addEventListener('resize',()=>closeMenu(),{signal:controller.signal});
      button.focus({preventScroll:true});
    }
    function bindItem(button,label,choose,activate){
      let held=false;
      on(button,'click',()=>{if(held){held=false;return;}if(paused())return;closeMenu();choose();button.focus({preventScroll:true});});
      on(button,'dblclick',event=>{if(event.button===0&&!paused()){closeMenu();activate();}});
      on(button,'contextmenu',event=>{if(!paused())choose();showMenu(event,button,label,activate);});
      on(button,'keydown',event=>{if(paused())return;if(event.key==='Enter'){event.preventDefault();closeMenu();activate();}else if(event.key==='ContextMenu'||event.key==='F10'&&event.shiftKey){choose();showMenu(event,button,label,activate);}});
      // Touch devices have no right button: hold an item to display the same menu.
      let hold;
      on(button,'pointerdown',event=>{held=false;if(event.pointerType!=='touch')return;const x=event.clientX,y=event.clientY;hold={x,y,timer:setTimeout(()=>{if(!paused()){held=true;choose();showMenu({preventDefault(){},stopPropagation(){},clientX:x,clientY:y},button,label,activate);}},650)};});
      const cancelHold=()=>{if(hold)clearTimeout(hold.timer);hold=null;};
      on(button,'pointermove',event=>{if(hold&&Math.hypot(event.clientX-hold.x,event.clientY-hold.y)>8)cancelHold();});on(button,'pointerup',cancelHold);on(button,'pointercancel',cancelHold);signal.addEventListener('abort',cancelHold,{once:true});
    }
    function open(id){if(paused()||!apps[id])return;if(options.allowOpen===false){feedback('En esta práctica basta con seleccionar el icono.');return;}const w=s.windows[id]??={x:.7,y:.25};w.open=true;w.minimized=false;w.z=++s.z;s.active=id;render();emit('open',{app:id});}
    function action(id,kind){
      if(paused())return;const w=s.windows[id];if(!w)return;
      if(kind==='close'&&id==='paint'&&options.requireSave&&(!p.saved||p.dirty)){feedback('Primero guarda tu dibujo y sus cambios. Después podremos cerrar esta ventana.','retry');return;}
      if(kind==='close'){w.open=false;w.minimized=false;}
      if(kind==='minimize')w.minimized=true;
      if(kind==='restore'){w.minimized=false;w.open=true;w.z=++s.z;}
      if(kind==='maximize'){w.maximized=!w.maximized;w.z=++s.z;}
      render();emit(kind,{app:id,maximized:!!w.maximized});
    }
    function select(id){s.selected=id;root.querySelectorAll('[data-desktop-icon]').forEach(el=>{el.classList.toggle('is-selected',el.dataset.desktopIcon===id);el.setAttribute('aria-pressed',String(el.dataset.desktopIcon===id));});const text=root.querySelector('.desktop-selection');if(text)text.textContent=`${apps[id].name} está seleccionado`;emit('select',{app:id});}
    function render(){
      if(destroyed)return;
      closeMenu();
      root.innerHTML=`<div class="desktop-lab"><div class="desktop-practice-caption"><span>ESCRITORIO DE PRÁCTICA</span><small>Las acciones ocurren dentro de esta actividad.</small></div><div class="lab-desktop ${s.wallpaper==='garden'?'wallpaper-garden':''}" role="group" aria-label="Escritorio de práctica"><span class="desktop-area-label">Área de trabajo</span><div class="desktop-shortcuts">${Object.keys(apps).filter(id=>id!=='work').map((id,i)=>`<button type="button" class="desktop-shortcut ${s.selected===id?'is-selected':''}" data-desktop-icon="${id}" aria-pressed="${s.selected===id}" aria-label="Icono ${apps[id].name}">${art(id)}<span>${apps[id].name}</span></button>`).join('')}</div><div class="desktop-window-layer">${Object.entries(s.windows).filter(([,w])=>w.open&&!w.minimized).map(([id,w])=>`<section class="desk-window ${w.maximized?'is-maximized':''}" data-window="${id}" aria-label="Ventana de ${escape(id==='work'?(p.saved?.title||'Mi trabajo'):apps[id].name)}"><div class="desk-titlebar" tabindex="0" role="group" aria-label="Barra de título de ${apps[id].name}; arrastra o usa flechas para mover"><span class="desk-title">${art(id)}<strong>${escape(id==='work'?(p.saved?.title||'Mi trabajo'):apps[id].name)}</strong></span><div class="desk-window-controls"><button type="button" data-window-action="minimize" aria-label="Minimizar ${apps[id].name}">${control('minimize')}</button><button type="button" data-window-action="maximize" aria-label="${w.maximized?'Restaurar tamaño de':'Ampliar'} ${apps[id].name}" aria-pressed="${!!w.maximized}">${control('maximize')}</button><button type="button" data-window-action="close" aria-label="Cerrar ${apps[id].name}">${control('close')}</button></div></div><div class="desk-window-body">${body(id)}</div></section>`).join('')}</div><div class="desktop-taskbar" role="group" aria-label="Barra de tareas"><span class="taskbar-home">${control('maximize')}</span><span class="taskbar-label">Programas abiertos</span><div class="taskbar-programs">${Object.entries(s.windows).filter(([,w])=>w.open).map(([id,w])=>`<button type="button" data-taskbar="${id}" class="${w.minimized?'is-minimized':''}" aria-label="${w.minimized?'Restaurar':'Mostrar'} ${apps[id].name}">${art(id)}<span>${escape(apps[id].name)}</span></button>`).join('')}</div></div></div><div class="desktop-lab-actions"><span class="desktop-selection">${s.selected?`${apps[s.selected].name} está seleccionado`:'Un clic selecciona un icono.'}</span><p class="desktop-opening-hint">${options.allowOpen===false?'En esta pr\u00e1ctica solo seleccionamos iconos.':'Para abrir: doble clic, o clic derecho y Abrir. Con teclado: Enter. En pantalla t\u00e1ctil: mant\u00e9n pulsado.'}</p></div></div>`;
      const desktop=root.querySelector('.lab-desktop');
      root.querySelectorAll('[data-desktop-icon]').forEach((button,i)=>{
        const id=button.dataset.desktopIcon,pos=s.iconPositions[id]||iconDefault(i,desktop,button);positionIcon(button,pos);
        bindItem(button,apps[id].name,()=>select(id),()=>open(id));
        on(button,'keydown',event=>{if(paused()||!options.moveIcons||!event.key.startsWith('Arrow'))return;event.preventDefault();const d={ArrowLeft:[-.06,0],ArrowRight:[.06,0],ArrowUp:[0,-.06],ArrowDown:[0,.06]}[event.key];if(!d)return;const old=s.iconPositions[id]||pos;s.iconPositions[id]=clearIconPosition(id,{x:old.x+d[0],y:old.y+d[1]},desktop,button,old);positionIcon(button,s.iconPositions[id]);emit('move-icon',{app:id});});
        if(options.moveIcons)bindIconDrag(button,id,pos,desktop);
      });
      root.querySelectorAll('[data-taskbar]').forEach(button=>on(button,'click',()=>action(button.dataset.taskbar,'restore')));
      root.querySelectorAll('[data-window]').forEach(windowElement=>{
        const id=windowElement.dataset.window,w=s.windows[id];windowElement.style.zIndex=w.z||1;placeWindow(windowElement,w);
        on(windowElement,'pointerdown',()=>{if(paused())return;w.z=++s.z;windowElement.style.zIndex=w.z;s.active=id;});
        windowElement.querySelectorAll('[data-window-action]').forEach(button=>on(button,'click',event=>{event.stopPropagation();action(id,button.dataset.windowAction);}));
        bindWindowDrag(windowElement,id,desktop);
        if(id==='paint')bindPaint(windowElement);
        if(id==='folder'){
          const canvas=windowElement.querySelector('.saved-thumbnail');if(canvas)paintWhenReady(canvas,p.saved);
          const work=windowElement.querySelector('[data-open-work]');if(work)bindItem(work,p.saved.title,()=>selectFile('saved'),()=>{if(!p.saved)return;p.recovered=true;delete s.exampleProject;open('work');emit('recover',{title:p.saved.title});});
          windowElement.querySelectorAll('[data-example]').forEach(button=>bindItem(button,button.querySelector('strong').textContent,()=>selectFile(button.dataset.example),()=>{const examples={sun:'MI SOL',flower:'MI FLOR',bird:'MI AVE'},pic=button.dataset.example;s.exampleProject={title:examples[pic],strokes:[],stamps:[{id:pic,x:.5,y:.5}]};open('work');emit('example-open',{name:examples[pic]});}));
        }
        if(id==='work'){const title=s.exampleProject?.title||p.saved?.title||'Mi trabajo';windowElement.querySelector('.desk-title strong').textContent=title;windowElement.setAttribute('aria-label',`Ventana de ${title}`);paintWhenReady(windowElement.querySelector('canvas'),s.exampleProject||p.saved);}
        if(id==='photos')windowElement.querySelectorAll('[data-photo]').forEach(button=>on(button,'click',()=>{if(paused())return;s.photo=button.dataset.photo;render();emit('photo',{picture:s.photo});}));
        if(id==='stories')on(windowElement.querySelector('[data-next-page]'),'click',()=>{if(paused())return;s.page=((s.page||0)+1)%3;render();emit('page',{page:s.page});});
        if(id==='sound')on(windowElement.querySelector('[data-play-notes]'),'click',playNotes);
      });
      if(options.highlight)root.querySelector(`[data-desktop-icon="${options.highlight}"]`)?.classList.add('is-highlighted');
    }
    function selectFile(id){s.fileSelection=id;root.querySelectorAll('[data-open-work],[data-example]').forEach(el=>{const chosen=(el.dataset.example||'saved')===id;el.classList.toggle('is-selected',chosen);el.setAttribute('aria-pressed',String(chosen));});const label=id==='saved'?p.saved.title:{sun:'MI SOL',flower:'MI FLOR',bird:'MI AVE'}[id];const status=root.querySelector('.desktop-selection');if(status)status.textContent=label+' est\u00e1 seleccionado';}
    function body(id){
      if(id==='paint')return `<div class="lab-paint"><div class="paint-tools"><button type="button" data-paint-tool="pen" class="${p.tool==='pen'?'is-selected':''}" aria-pressed="${p.tool==='pen'}">Lápiz</button>${['#527046','#317d9d','#d69b37','#bb6874'].map(color=>`<button type="button" class="paint-color ${p.color===color?'is-selected':''}" data-color="${color}" aria-label="Color ${{'#527046':'verde','#317d9d':'azul','#d69b37':'amarillo','#bb6874':'rosa'}[color]}" aria-pressed="${p.color===color}"></button>`).join('')}<button type="button" data-undo>Deshacer</button><details class="stamp-options"><summary>Figuras</summary><div>${['sun','flower','rabbit','bird'].map(stamp=>`<button type="button" data-stamp="${stamp}" aria-label="Elegir figura ${G.shared.names[stamp]}">${G.picture(stamp)}</button>`).join('')}</div></details><button type="button" data-draw-line>Trazo de apoyo</button></div><canvas class="drawing-paper" width="720" height="420" tabindex="0" aria-label="Hoja de dibujo: mueve el mouse con el botón izquierdo pulsado para dibujar. Con una figura elegida, pulsa para colocarla."></canvas><p class="paint-hint">${p.tool==='stamp'?'Pulsa sobre la hoja para colocar tu figura.':'Dibuja con el botón izquierdo pulsado. Puedes elegir figuras.'}</p><form class="lab-save-form"><label>Nombre del dibujo<input data-project-title maxlength="24" autocomplete="off" spellcheck="false" placeholder="Por ejemplo: MI SOL" value="${escape(p.title)}"></label><button type="submit" class="demo-button" data-save>Guardar</button><button type="button" class="quiet-button" data-export ${p.saved?'':'disabled'}>Descargar PNG</button></form>${p.choosingFolder?`<div class="lab-folder-picker" role="group" aria-label="Elige una carpeta para guardar"><strong>¿Dónde guardarás tu dibujo?</strong><div><button type="button" data-save-folder="drawings">${art('folder')}Mis dibujos</button><button type="button" data-save-folder="photos">${art('photos')}Mis fotos</button><button type="button" data-cancel-save>Volver</button></div></div>`:''}${p.saved?'<p class="paint-saved">✓ Guardado en Mis dibujos de esta actividad.</p>':''}</div>`;
      if(id==='folder')return p.saved?`<div class="saved-files"><p>Mis dibujos · 1 trabajo</p><button type="button" class="saved-file ${s.fileSelection==='saved'?'is-selected':''}" aria-pressed="${s.fileSelection==='saved'}" data-open-work><canvas class="saved-thumbnail" width="180" height="105" aria-hidden="true"></canvas><strong>${escape(p.saved.title)}</strong><span>Archivo de dibujo</span></button></div>`:options.examples?`<div class="example-files"><p>Archivos de ejemplo del aula</p><div>${[['sun','MI SOL'],['flower','MI FLOR'],['bird','MI AVE']].map(([pic,name])=>`<button type="button" class="example-file ${s.fileSelection===pic?'is-selected':''}" aria-pressed="${s.fileSelection===pic}" data-example="${pic}">${G.picture(pic)}<strong>${name}</strong><span>Archivo de dibujo</span></button>`).join('')}</div></div>`:`<div class="lab-empty-folder">${art('folder')}<strong>Mis dibujos</strong><p>Todavía no guardaste un trabajo aquí.</p></div>`;
      if(id==='work')return `<div class="recovered-work"><span class="recovered-badge">${s.exampleProject?'Archivo de ejemplo abierto':'✓ Volviste a encontrar tu trabajo'}</span><canvas width="720" height="420" aria-label="Dibujo: ${escape((s.exampleProject||p.saved)?.title||'Mi trabajo')}"></canvas></div>`;
      if(id==='photos')return `<div class="lab-photo-view">${G.picture(s.photo||'rabbit')}<p>Álbum de imágenes</p><div class="lab-photo-options">${['rabbit','frog','bird','flower'].map(pic=>`<button type="button" data-photo="${pic}" aria-label="Ver ${G.shared.names[pic]}">${G.picture(pic)}</button>`).join('')}</div></div>`;
      if(id==='stories')return `<div class="lab-story">${G.picture('owl')}<strong>El cuaderno de la lechuza</strong><p>${['La lechuza dibujó un sol y una flor. Quería compartir su dibujo con sus amigos.','Guardó el dibujo en su carpeta. Le puso un nombre para encontrarlo después.','Volvió a abrir la carpeta. Allí estaba su dibujo, listo para mostrarlo.'][s.page||0]}</p><button type="button" class="demo-button" data-next-page>Otra página →</button><small>Página ${(s.page||0)+1} de 3</small></div>`;
      return `<div class="lab-sound">${art('sound')}<strong>Escuchemos una melodía</strong><div class="sound-notes" aria-hidden="true">♪ ♫ ♪</div><button type="button" class="demo-button" data-play-notes>Escuchar cuatro notas</button></div>`;
    }
    function paintWhenReady(canvas,data){if(!canvas||!data)return;drawProject(canvas,data);ready().then(()=>{if(canvas.isConnected&&!destroyed)drawProject(canvas,data);}).catch(()=>feedback('No pudimos cargar una figura. Revisa la conexión.','retry'));}
    function bindPaint(windowElement){
      const canvas=windowElement.querySelector('.drawing-paper');
      const stage=document.createElement('div');stage.className='paint-paper-stage';canvas.before(stage);stage.append(canvas);
      const fit=()=>{const width=Math.min(stage.clientWidth,stage.clientHeight*12/7);canvas.style.width=Math.max(1,width)+'px';canvas.style.height=Math.max(1,width*7/12)+'px';};paperObserver?.disconnect();paperObserver=new ResizeObserver(fit);paperObserver.observe(stage);fit();paintWhenReady(canvas,p);let stroke=null;
      const syncSaving=()=>{const download=windowElement.querySelector('[data-export]');if(download)download.disabled=!p.saved||!!p.dirty;const status=windowElement.querySelector('.paint-saved');if(status){status.textContent=p.dirty?'Cambiaste el dibujo. Pulsa Guardar otra vez.':'✓ Guardado en Mis dibujos de esta actividad.';status.classList.toggle('is-pending',!!p.dirty);}};
      const markDirty=()=>{p.dirty=true;p.recovered=false;syncSaving();};
      const changed=()=>{markDirty();emit('draw',{strokes:p.strokes.length,stamps:p.stamps.length});};
      const point=event=>{const r=canvas.getBoundingClientRect();return[Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))];};
      on(canvas,'pointerdown',event=>{if(paused()||event.button!==0)return;event.preventDefault();canvas.focus({preventScroll:true});const[x,y]=point(event);if(p.tool==='stamp'){if(p.stamps.length>=30){feedback('Tu hoja ya tiene muchas figuras. Puedes deshacer una.');return;}p.stamps.push({id:p.stamp||'sun',x:Math.max(.08,Math.min(.92,x)),y:Math.max(.13,Math.min(.87,y))});drawProject(canvas,p);changed();return;}if(p.strokes.length>=40){feedback('Puedes deshacer un trazo antes de agregar otro.');return;}stroke={color:p.color,width:p.width,points:[[x,y]]};p.strokes.push(stroke);changed();canvas.setPointerCapture(event.pointerId);});
      on(canvas,'pointermove',event=>{if(!stroke||paused())return;const pt=point(event),last=stroke.points.at(-1);if(stroke.points.length<160&&Math.hypot(pt[0]-last[0],pt[1]-last[1])>.003){stroke.points.push(pt);drawProject(canvas,p);}});
      const end=()=>{if(!stroke)return;if(stroke.points.length<3)p.strokes.pop();stroke=null;drawProject(canvas,p);changed();};on(canvas,'pointerup',end);on(canvas,'pointercancel',end);
      windowElement.querySelectorAll('[data-color]').forEach(button=>{button.style.setProperty('--paint-color',button.dataset.color);on(button,'click',()=>{if(paused())return;p.color=button.dataset.color;p.tool='pen';render();});});
      on(windowElement.querySelector('[data-paint-tool]'),'click',()=>{if(paused())return;p.tool='pen';render();});
      windowElement.querySelectorAll('[data-stamp]').forEach(button=>on(button,'click',()=>{if(paused())return;p.tool='stamp';p.stamp=button.dataset.stamp;render();}));
      on(windowElement.querySelector('[data-undo]'),'click',()=>{if(paused())return;const list=p.tool==='stamp'?p.stamps:p.strokes;if(!list.length)return;list.pop();changed();render();});
      on(windowElement.querySelector('[data-draw-line]'),'click',()=>{if(paused())return;if(p.strokes.length>=40)return;p.strokes.push({color:p.color,width:6,points:[[.18,.72],[.5,.55],[.78,.72]]});changed();render();feedback('Agregaste un trazo con el botón de apoyo. También puedes dibujarlo con el mouse.');});
      const title=windowElement.querySelector('[data-project-title]');on(title,'input',()=>{const at=title.selectionStart;title.value=title.value.toLocaleUpperCase('es').replace(/[^\p{L}\p{N} ]/gu,'').slice(0,24);title.setSelectionRange(Math.min(at,title.value.length),Math.min(at,title.value.length));p.title=title.value;markDirty();emit('title');});
      on(windowElement.querySelector('form'),'submit',event=>{event.preventDefault();if(paused())return;if(!p.title.trim()){feedback('Escribe un nombre para reconocer tu dibujo. Puedes usar MI SOL.','retry');title.focus();return;}if(options.requireSave&&(!p.strokes.some(item=>item.points.length>2)||p.stamps.length<2)){feedback('Primero dibuja un trazo y coloca dos figuras. Después guardaremos el trabajo.','retry');return;}p.choosingFolder=true;render();});
      windowElement.querySelectorAll('[data-save-folder]').forEach(button=>on(button,'click',()=>{if(paused())return;if(button.dataset.saveFolder!=='drawings'){feedback('Esa carpeta es para fotos. Guarda tu creación en Mis dibujos.','retry');return;}p.saved=JSON.parse(JSON.stringify({title:p.title.trim(),strokes:p.strokes,stamps:p.stamps}));p.dirty=false;p.recovered=false;p.choosingFolder=false;render();feedback('Tu dibujo quedó guardado en Mis dibujos de esta actividad.','correct');emit('save',{folder:'drawings'});}));
      on(windowElement.querySelector('[data-cancel-save]'),'click',()=>{if(paused())return;p.choosingFolder=false;render();});
      on(windowElement.querySelector('[data-export]'),'click',()=>{if(paused()||!p.saved||p.dirty)return;const copy=document.createElement('canvas');copy.width=720;copy.height=420;drawProject(copy,p.saved);const link=document.createElement('a');link.download=(p.saved.title.replace(/[^\p{L}\p{N} ]/gu,'')||'Mi dibujo')+'.png';link.href=copy.toDataURL('image/png');link.click();emit('export');});
      syncSaving();
      if(p.choosingFolder)queueMicrotask(()=>{if(!destroyed)windowElement.querySelector('[data-save-folder]')?.focus({preventScroll:true});});
    }
    function positionIcon(button,pos){button.style.left=pos.x*100+'%';button.style.top=pos.y*100+'%';}
    function iconDefault(index,desktop,button){
      const area=desktop.querySelector('.desktop-shortcuts'),aw=area.clientWidth,ah=area.clientHeight,bw=button.offsetWidth,bh=button.offsetHeight,total=Object.keys(apps).filter(id=>id!=='work').length;
      const rows=Math.max(1,Math.min(total,Math.floor((ah-8)/(bh+7)))),columns=Math.ceil(total/rows),column=Math.floor(index/rows),row=index%rows;
      return{x:(12+Math.min(column,columns-1)*(bw+12))/aw,y:(8+row*(bh+7))/ah};
    }
    function clearIconPosition(id,pos,desktop,button,origin){
      const area=desktop.querySelector('.desktop-shortcuts'),aw=area.clientWidth,ah=area.clientHeight,bw=button.offsetWidth,bh=button.offsetHeight;
      const bounded={x:Math.max(6/aw,Math.min((aw-bw-6)/aw,pos.x)),y:Math.max(5/ah,Math.min((ah-bh-5)/ah,pos.y))};
      const ids=Object.keys(apps).filter(key=>key!=='work'),others=ids.filter(key=>key!==id).map(key=>s.iconPositions[key]||iconDefault(ids.indexOf(key),desktop,button));
      const free=p=>!others.some(other=>Math.abs(other.x-p.x)*aw<bw+2&&Math.abs(other.y-p.y)*ah<bh+2);
      if(free(bounded))return bounded;
      const cells=[];for(let x=12;x+bw<=aw-5;x+=bw+12)for(let y=8;y+bh<=ah-5;y+=bh+7){const p={x:x/aw,y:y/ah};if(free(p)&&Math.hypot((p.x-origin.x)*aw,(p.y-origin.y)*ah)>8)cells.push(p);}
      cells.sort((a,b)=>Math.hypot((a.x-bounded.x)*aw,(a.y-bounded.y)*ah)-Math.hypot((b.x-bounded.x)*aw,(b.y-bounded.y)*ah));return cells[0]||origin;
    }
    function bindIconDrag(button,id,initial,desktop){let origin;
      on(button,'pointerdown',event=>{if(paused()||event.button!==0)return;origin={x:event.clientX,y:event.clientY,position:{...(s.iconPositions[id]||initial)},moved:false};button.setPointerCapture(event.pointerId);});
      on(button,'pointermove',event=>{if(!origin||paused())return;const area=desktop.querySelector('.desktop-shortcuts'),dx=event.clientX-origin.x,dy=event.clientY-origin.y;if(Math.abs(dx)+Math.abs(dy)>8)origin.moved=true;if(!origin.moved)return;s.iconPositions[id]={x:origin.position.x+dx/area.clientWidth,y:origin.position.y+dy/area.clientHeight};positionIcon(button,s.iconPositions[id]);});
      on(button,'pointerup',()=>{if(origin?.moved){s.iconPositions[id]=clearIconPosition(id,s.iconPositions[id],desktop,button,origin.position);positionIcon(button,s.iconPositions[id]);emit('move-icon',{app:id});}origin=null;});on(button,'pointercancel',()=>{if(origin){s.iconPositions[id]=origin.position;positionIcon(button,origin.position);}origin=null;});
    }
    function placeWindow(element,w){if(w.maximized)return;const parent=element.parentElement,travelX=Math.max(0,parent.clientWidth-element.offsetWidth),travelY=Math.max(0,parent.clientHeight-element.offsetHeight);element.style.left=Math.round((w.x??.7)*travelX)+'px';element.style.top=Math.round((w.y??.25)*travelY)+'px';}
    function bindWindowDrag(element,id,desktop){const bar=element.querySelector('.desk-titlebar'),w=s.windows[id];let drag;
      on(bar,'pointerdown',event=>{if(paused()||w.maximized||event.button!==0||event.target.closest('button'))return;event.preventDefault();bar.focus({preventScroll:true});drag={x:event.clientX,y:event.clientY,left:element.offsetLeft,top:element.offsetTop};bar.setPointerCapture(event.pointerId);});
      const move=(dx,dy,start)=>{const parent=element.parentElement,tx=Math.max(0,parent.clientWidth-element.offsetWidth),ty=Math.max(0,parent.clientHeight-element.offsetHeight),x=Math.max(0,Math.min(tx,start.left+dx)),y=Math.max(0,Math.min(ty,start.top+dy));w.x=tx?x/tx:0;w.y=ty?y/ty:0;element.style.left=x+'px';element.style.top=y+'px';return Math.hypot(x-start.left,y-start.top);};
      on(bar,'pointermove',event=>{if(!drag||paused())return;move(event.clientX-drag.x,event.clientY-drag.y,drag);});
      on(bar,'pointerup',event=>{if(!drag)return;const distance=move(event.clientX-drag.x,event.clientY-drag.y,drag);drag=null;if(distance>4)emit('move',{app:id,distance});});on(bar,'pointercancel',()=>drag=null);
      on(bar,'keydown',event=>{if(paused()||w.maximized)return;const d={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[event.key];if(!d)return;event.preventDefault();const distance=move(d[0],d[1],{left:element.offsetLeft,top:element.offsetTop});if(distance>4)emit('move',{app:id,distance});});
    }
    function playNotes(){if(paused())return;if(options.isSoundEnabled&&!options.isSoundEnabled()){feedback('Activa el sonido con ♪ en la barra de la clase para escuchar.');return;}try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();[523,659,784,1046].forEach((hz,i)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.2;oscillator.frequency.value=hz;gain.gain.setValueAtTime(.018,at);gain.gain.exponentialRampToValueAtTime(.001,at+.18);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.2);});emit('sound');}catch{feedback('Este equipo no pudo reproducir el sonido. Podemos seguir con las otras herramientas.');}}
    const observer=new ResizeObserver(()=>root.querySelectorAll('[data-window]').forEach(el=>placeWindow(el,s.windows[el.dataset.window])));observer.observe(root);signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
    render();return{open,action,render,store:s};
  }
  window.DesktopLab={mount,ready,art,apps,drawProject};
})();
