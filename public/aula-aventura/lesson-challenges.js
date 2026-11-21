'use strict';
(() => {
  const G=window.ClassGames,{frame,toolbar,finish,completed,listenKey,shuffle,escape,names}=G.shared;
  const nextButton=(ui,label,action,context)=>toolbar(ui,label,action,context.signal);
  function returnIfDone(root,context){if(context.store.complete){completed(root,context);return true;}return false;}
  function bindDrag(button,context,drop){
    let origin=null,suppressUntil=0;
    button.addEventListener('pointerdown',event=>{if(context.paused()||event.button!==0||button.disabled)return;origin={x:event.clientX,y:event.clientY,moved:false};button.setPointerCapture(event.pointerId);},{signal:context.signal});
    button.addEventListener('pointermove',event=>{if(!origin||context.paused())return;const x=event.clientX-origin.x,y=event.clientY-origin.y;if(Math.abs(x)+Math.abs(y)>7)origin.moved=true;if(origin.moved){button.classList.add('is-dragging');button.style.transform=`translate(${x}px,${y}px)`;}},{signal:context.signal});
    const end=event=>{if(!origin)return;const moved=origin.moved;origin=null;button.classList.remove('is-dragging');button.style.transform='';if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId);if(moved){suppressUntil=performance.now()+300;if(event.type!=='pointercancel')drop(event);}};
    button.addEventListener('pointerup',end,{signal:context.signal});button.addEventListener('pointercancel',end,{signal:context.signal});
    return()=>performance.now()>suppressUntil;
  }
  function fragment(element,index,columns,rows,image){element.style.backgroundImage=`url('assets/puzzle-${image}-v3.png')`;element.style.backgroundSize=`${columns*100}% ${rows*100}%`;element.style.backgroundPosition=`${index%columns/(columns-1)*100}% ${Math.floor(index/columns)/(rows-1)*100}%`;element.style.aspectRatio=String(1.5*rows/columns);}
  function jigsaw(root,context){
    if(returnIfDone(root,context))return;
    const s=context.store,ui=frame(root,context),levels=context.finalStation?[[3,3,'classroom']]:context.extended?[[2,2,'garden'],[3,2,'garden'],[4,3,'classroom']]:[[2,2,'garden'],[3,2,'garden']];
    s.level??=0;s.placed??=[];
    function render(){
      const [columns,rows,image]=levels[s.level],count=columns*rows;s.order??=shuffle(Array.from({length:count},(_,i)=>i));
      ui.progress(`Puzle ${s.level+1} · ${s.placed.length} de ${count} piezas`,s.placed.length/count);
      ui.body.innerHTML=`<div class="jigsaw-layout"><div class="jigsaw-board" role="group" aria-label="Tablero de la ilustración">${Array.from({length:count},(_,i)=>`<button type="button" class="jigsaw-cell ${s.placed.includes(i)?'is-filled':''}" data-cell="${i}" aria-label="Posición ${i+1} del puzle" ${s.placed.includes(i)?'disabled':''}>${s.placed.includes(i)?'<span class="puzzle-fragment"></span>':'<span class="slot-cross" aria-hidden="true">+</span>'}</button>`).join('')}</div><div class="jigsaw-bank"><p class="challenge-hint">Compara los bordes y continúa la imagen.</p><div class="jigsaw-pieces">${s.order.map(i=>`<button class="jigsaw-piece ${s.selected===i?'is-selected':''}" type="button" data-fragment="${i}" aria-label="Pieza ${i+1}" aria-pressed="${s.selected===i}" ${s.placed.includes(i)?'disabled':''}><span class="puzzle-fragment"></span></button>`).join('')}</div><details class="puzzle-model" ${s.model?'open':''}><summary>Consultar el modelo</summary><img src="assets/puzzle-${image}-v3.png" alt="Ilustración completa de referencia"></details></div></div>`;
      const board=ui.body.querySelector('.jigsaw-board');board.style.setProperty('--columns',columns);board.style.setProperty('--rows',rows);
      ui.body.querySelector('.jigsaw-pieces').style.setProperty('--bank-columns',count>6?3:2);
      ui.body.querySelectorAll('[data-cell] .puzzle-fragment').forEach(el=>fragment(el,Number(el.parentElement.dataset.cell),columns,rows,image));
      ui.body.querySelectorAll('[data-fragment]').forEach(el=>{fragment(el.querySelector('.puzzle-fragment'),Number(el.dataset.fragment),columns,rows,image);el.style.aspectRatio=String(1.5*rows/columns);});
      ui.body.querySelector('.puzzle-model').addEventListener('toggle',event=>s.model=event.target.open,{signal:context.signal});
      nextButton(ui,'',null,context);
      if(s.placed.length===count)nextButton(ui,s.level===levels.length-1?'Terminar puzle ✓':'Un puzle con más piezas →',()=>{if(s.level===levels.length-1){finish(root,context,'Reconstruiste la imagen observando sus partes y usando el arrastre.');return;}s.level++;s.placed=[];delete s.order;delete s.selected;s.model=false;render();context.feedback('Hay más piezas. Busca detalles que continúen de una a otra.');},context);
      const place=(index,cell)=>{if(context.paused()||s.placed.includes(index))return;if(index!==cell){context.feedback('Los detalles no continúan en ese lugar. Compara otro borde o consulta el modelo.','retry');return;}s.placed.push(index);delete s.selected;context.feedback('¡Las partes de la imagen encajan!','correct');context.celebrate();render();};
      ui.body.querySelectorAll('[data-cell]').forEach(cell=>cell.addEventListener('click',()=>{if(s.selected===undefined){context.feedback('Selecciona una pieza o arrástrala hasta el tablero.');return;}place(s.selected,Number(cell.dataset.cell));},{signal:context.signal}));
      ui.body.querySelectorAll('[data-fragment]').forEach(button=>{
        const index=Number(button.dataset.fragment),canClick=bindDrag(button,context,event=>{const cell=document.elementsFromPoint(event.clientX,event.clientY).map(el=>el.closest('[data-cell]')).find(Boolean);if(cell&&board.contains(cell))place(index,Number(cell.dataset.cell));else context.feedback('Suelta la pieza dentro del tablero. Puedes volver a intentarlo.','retry');});
        button.addEventListener('click',()=>{if(!canClick()||context.paused())return;s.selected=index;ui.body.querySelectorAll('[data-fragment]').forEach(el=>{el.classList.toggle('is-selected',Number(el.dataset.fragment)===index);el.setAttribute('aria-pressed',String(Number(el.dataset.fragment)===index));});},{signal:context.signal});
      });
    }
    render();
  }
  const outlines={
    apple:[[50,20],[70,14],[86,37],[80,69],[60,84],[44,79],[23,82],[12,55],[20,27]],
    snail:[[12,72],[20,48],[26,25],[47,16],[65,26],[69,50],[82,34],[91,43],[85,72],[51,84]],
    bird:[[12,64],[30,47],[25,21],[48,38],[62,16],[78,23],[90,37],[76,46],[72,69],[53,82],[31,74]],
  };
  function trace(root,context){
    if(returnIfDone(root,context))return;
    const s=context.store,ui=frame(root,context),ids=context.finalStation?['bird']:context.extended?['apple','snail','bird']:['apple','snail'];s.level??=0;s.count??=0;
    function render(){
      const id=ids[s.level],points=outlines[id],done=s.count===points.length;ui.progress(`Dibujo ${s.level+1} · ${s.count} de ${points.length} puntos`,s.count/points.length);
      ui.body.innerHTML=`<div class="trace-layout"><div class="trace-board"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="trace-lines" aria-hidden="true"><polyline points="${points.slice(0,s.count).map(p=>p.join(',')).join(' ')}${done?' '+points[0].join(','):''}"/></svg>${points.map(([x,y],i)=>`<button type="button" class="trace-point ${i<s.count?'is-traced':''}" data-point="${i}" aria-label="Punto ${i+1}" ${i===s.count?'aria-current="true"':''} ${i<s.count?'disabled':''}>${i+1}</button>`).join('')}${done?`<span class="trace-reward">${G.picture(id)}</span>`:''}</div><p class="challenge-hint">${done?'¡Tu recorrido completó el dibujo!':`Busca el punto ${s.count+1}. Puedes pulsar o mantener pulsado y recorrer los puntos en orden.`}</p></div>`;
      const board=ui.body.querySelector('.trace-board');ui.body.querySelectorAll('[data-point]').forEach(button=>{const p=points[Number(button.dataset.point)];button.style.left=p[0]+'%';button.style.top=p[1]+'%';});
      nextButton(ui,'',null,context);
      const hit=index=>{if(context.paused()||s.count===points.length||index<s.count)return;if(index!==s.count){context.feedback(`Seguimos el orden: ahora toca el punto ${s.count+1}.`,'retry');return;}s.count++;context.sound('tap');render();if(s.count===points.length){context.feedback('¡Dibujo completado! Usaste el puntero con precisión.','correct');context.celebrate();}};
      ui.body.querySelectorAll('[data-point]').forEach(button=>button.addEventListener('click',()=>hit(Number(button.dataset.point)),{signal:context.signal}));
      const along=event=>{if(!event.buttons||context.paused())return;const r=board.getBoundingClientRect();const [x,y]=points[s.count]||[-100,-100];if(Math.hypot(event.clientX-(r.left+r.width*x/100),event.clientY-(r.top+r.height*y/100))<28)hit(s.count);};
      board.addEventListener('pointermove',along,{signal:context.signal});
      if(done)nextButton(ui,s.level===ids.length-1?'Terminar dibujo ✓':'Dibujar otra forma →',()=>{if(s.level===ids.length-1){finish(root,context,'Completaste formas siguiendo una secuencia de puntos.');return;}s.level++;s.count=0;render();context.feedback('El nuevo dibujo tiene un recorrido diferente.');},context);
    }
    render();
  }
  function observe(root,context){
    if(returnIfDone(root,context))return;
    const s=context.store,ui=frame(root,context),rounds=context.extended?6:4;s.round??=0;s.phase??='before';s.chosen??=[];
    function model(){
      const before=['rabbit','sun','apple','bird','flower','snail'],after=[...before],type=s.round%3,at=(s.round+1)%6;
      if(type===0)after[at]=before[at]==='frog'?'moon':'frog';
      if(type===1)after[at]=null;
      if(type===2){const other=(at+3)%6;[after[at],after[other]]=[after[other],after[at]];}
      return{before,after,changed:before.map((id,i)=>id!==after[i]?i:-1).filter(i=>i>=0)};
    }
    function render(){
      const m=model(),before=s.phase==='before'||s.peek,items=before?m.before:m.after,done=m.changed.every(i=>s.chosen.includes(i));ui.progress(`Escena ${s.round+1} de ${rounds}`,s.round/rounds);
      ui.body.innerHTML=`<div class="observe-layout"><p class="observe-instruction">${before?'Observa los dibujos y sus lugares.':m.changed.length===2?'Dos dibujos cambiaron de lugar. Encuentra los dos.':'Encuentra el lugar donde cambió o desapareció un dibujo.'}</p><div class="observe-scene" aria-label="${before?'Primera escena':'Escena modificada'}">${items.map((id,i)=>`<button class="observe-cell ${s.chosen.includes(i)?'is-found':''}" type="button" data-observe="${i}" aria-label="Lugar ${i+1}${id?', '+names[id]:', vacío'}" ${before||done?'disabled':''}>${id?G.picture(id):'<span class="empty-place" aria-hidden="true">?</span>'}${s.chosen.includes(i)?'<span class="found-tick" aria-hidden="true">✓</span>':''}</button>`).join('')}</div></div>`;
      if(s.phase==='before')nextButton(ui,'Ya observé · ver el cambio →',()=>{s.phase='after';render();context.feedback('Compara con lo que acabas de observar.');},context);
      else if(done)nextButton(ui,s.round===rounds-1?'Terminar observación ✓':'Otra escena →',()=>{if(s.round===rounds-1){finish(root,context,'Comparaste escenas y encontraste cambios de imagen, ausencia y posición.');return;}s.round++;s.phase='before';s.chosen=[];s.peek=false;render();},context);
      else nextButton(ui,s.peek?'Volver a la segunda escena':'Consultar la primera escena',()=>{s.peek=!s.peek;render();},context);
      ui.body.querySelectorAll('[data-observe]').forEach(button=>button.addEventListener('click',()=>{if(context.paused()||s.phase==='before'||s.peek)return;const index=Number(button.dataset.observe);if(m.changed.includes(index)){if(!s.chosen.includes(index))s.chosen.push(index);context.feedback(m.changed.length===s.chosen.length?'¡Encontraste el cambio!':'Bien. Falta el otro dibujo que cambió de lugar.','correct');context.celebrate();render();}else context.feedback('Ese lugar sigue igual. Puedes consultar la primera escena y comparar.','retry');},{signal:context.signal}));
    }
    render();
  }
  const maps=[
    {columns:5,rows:4,start:[0,3],goal:[4,0],rocks:[[1,3],[1,2],[3,1],[3,2]],items:[],gate:null},
    {columns:6,rows:5,start:[0,4],goal:[5,4],rocks:[[1,4],[1,3],[1,2],[3,0],[3,1],[3,3],[4,3],[5,3]],items:[{id:'key',at:[2,0]}],gate:[4,4]},
    {columns:7,rows:5,start:[0,4],goal:[6,0],rocks:[[1,0],[1,1],[1,3],[2,1],[3,1],[3,2],[3,4],[5,2],[5,3],[6,3],[6,1]],items:[{id:'key',at:[2,4]},{id:'star',at:[0,0]}],gate:[5,0]},
  ];
  const finalMap={columns:6,rows:5,start:[0,4],goal:[5,0],rocks:[[1,3],[1,2],[2,0],[2,1],[3,3],[3,4],[5,1]],items:[{id:'key',at:[4,4]},{id:'star',at:[0,0]}],gate:[4,0]};
  const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
  const keyIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 12 12m-7-7 4-4m0 8 4-4"/></svg>';
  function maze(root,context){
    if(returnIfDone(root,context))return;
    const s=context.store,ui=frame(root,context),levels=context.finalStation?[finalMap]:context.extended?maps:maps.slice(0,2);s.level??=0;s.position??=[...levels[s.level].start];s.collected??=[];
    function render(){
      const map=levels[s.level];ui.progress(`Recorrido ${s.level+1} de ${levels.length}`,s.level/levels.length);
      ui.body.innerHTML=`<div class="maze-layout"><div class="maze-board" role="group" tabindex="0" aria-label="Mapa con piedras, objetivos y salida">${Array.from({length:map.columns*map.rows},(_,i)=>{const at=[i%map.columns,Math.floor(i/map.columns)],rock=map.rocks.some(p=>same(p,at)),item=map.items.find(item=>same(item.at,at)&&!s.collected.includes(item.id)),gate=same(map.gate,at),goal=same(map.goal,at);return `<span class="maze-cell ${rock?'is-rock':''} ${gate?'is-gate':''} ${gate&&s.collected.includes('key')?'is-unlocked':''} ${goal?'is-goal':''}">${item?`<span class="maze-item item-${item.id}" role="img" aria-label="${item.id==='key'?'Llave':'Estrella'}">${item.id==='key'?keyIcon:'★'}</span>`:goal?G.picture('apple'):''}${gate?'<span class="gate-bars" aria-label="Puerta">▥</span>':''}</span>`;}).join('')}<span class="maze-walker">${G.picture('owl')}</span></div><div class="maze-help"><p>Busca la manzana.<br>Rodea las piedras.</p><div class="maze-inventory">${map.items.map(item=>`<span class="${s.collected.includes(item.id)?'is-collected':''}">${item.id==='key'?'Llave':'Estrella'} ${s.collected.includes(item.id)?'✓':'pendiente'}</span>`).join('')}</div>${G.directions()}<p>${map.gate?'La llave abre la puerta.':''}</p></div></div>`;
      const board=ui.body.querySelector('.maze-board');board.style.setProperty('--columns',map.columns);board.style.setProperty('--rows',map.rows);position();
      ui.body.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.dir),{signal:context.signal}));
      nextButton(ui,'',null,context);
      if(s.won)nextButton(ui,s.level===levels.length-1?'Terminar recorrido ✓':'Un mapa con otro objetivo →',()=>{if(s.level===levels.length-1){finish(root,context,'Exploraste el mapa, recogiste los objetivos y elegiste un camino hasta la salida.');return;}s.level++;s.position=[...levels[s.level].start];s.collected=[];s.won=false;render();context.feedback('El nuevo mapa tiene otros objetivos. Míralos antes de moverte.');},context);
    }
    function position(){const walker=ui.body.querySelector('.maze-walker');walker.style.transform=`translate(${s.position[0]*100}%,${s.position[1]*100}%)`;walker.setAttribute('aria-label',`Columna ${s.position[0]+1}, fila ${s.position[1]+1}`);}
    function move(direction){
      if(context.paused()||s.won)return;const map=levels[s.level],[dx,dy]={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[direction],at=[s.position[0]+dx,s.position[1]+dy];
      if(at[0]<0||at[1]<0||at[0]>=map.columns||at[1]>=map.rows||map.rocks.some(p=>same(p,at))){context.feedback('Ese paso está bloqueado. Busca otra dirección.','retry');return;}
      if(same(at,map.gate)&&!s.collected.includes('key')){context.feedback('La puerta está cerrada. Primero encuentra la llave.','retry');return;}
      if(same(at,map.goal)&&map.items.some(item=>!s.collected.includes(item.id))){context.feedback('Antes de salir, recoge los objetivos pendientes del mapa.','retry');return;}
      s.position=at;const item=map.items.find(item=>same(item.at,at)&&!s.collected.includes(item.id));
      if(item){s.collected.push(item.id);render();context.feedback(item.id==='key'?'¡La llave! Ya puedes abrir la puerta.':'¡Encontraste la estrella! Ahora busca la salida.','correct');context.celebrate();}
      else position();
      if(same(at,map.goal)){s.won=true;render();context.feedback('¡Llegaste con todos los objetivos! Planeaste un recorrido diferente.','correct');context.celebrate();}else context.sound('tap');
    }
    listenKey(context,event=>{const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.key];if(direction){event.preventDefault();move(direction);}});render();
  }
  function studio(root,context){
    const s=context.store,ui=frame(root,context);s.placed??={};s.title??='';const stickers=['rabbit','bird','sun'];
    function render(){
      const count=Object.keys(s.placed).length,ready=count===3&&s.edited&&s.confirmed;
      ui.progress(`Mi escena · ${count} de 3 dibujos${s.edited?' · opciones ✓':''}${s.confirmed?' · título ✓':''}`,((count/3)+(s.edited?1:0)+(s.confirmed?1:0))/3);
      ui.body.innerHTML=`<div class="studio-layout"><div class="sticker-palette"><p>Dibujos</p>${stickers.map(id=>`<button type="button" class="sticker-piece ${s.selected===id?'is-selected':''}" data-sticker="${id}" aria-label="Colocar ${names[id]}" ${s.placed[id]||s.complete?'disabled':''}>${G.picture(id)}</button>`).join('')}</div><div class="studio-canvas" role="group" tabindex="0" aria-label="Tu escena: coloca los dibujos y abre opciones con clic derecho"><div class="scene-title">${escape(s.confirmed?s.title:'Mi dibujo')}</div>${Object.entries(s.placed).map(([id,p])=>`<button type="button" class="placed-sticker ${s.selected===id?'is-selected':''}" data-placed="${id}" aria-label="${names[id]}: clic izquierdo para seleccionar, clic derecho para opciones">${G.picture(id)}</button>`).join('')}<div class="sticker-options" role="group" aria-label="Opciones del dibujo" hidden><button type="button" data-edit="grow">Más grande</button><button type="button" data-edit="flip">Voltear</button><button type="button" data-edit="small">Más pequeño</button></div></div><form class="studio-title-form"><label for="studio-title">Escribe el título del modelo: <strong>MI DIBUJO</strong></label><input id="studio-title" class="typing-input" type="text" maxlength="18" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Título de la escena" value="${escape(s.title)}" ${s.complete?'disabled':''}><button class="demo-button" type="submit" ${s.complete?'disabled':''}>Confirmar · Enter</button><details class="studio-keys"><summary>Teclas de apoyo</summary>${G.compactKeyboard('MI DIBUJO')}</details></form></div>`;
      const canvas=ui.body.querySelector('.studio-canvas'),menu=ui.body.querySelector('.sticker-options');
      const layout=()=>ui.body.querySelectorAll('[data-placed]').forEach(button=>{const p=s.placed[button.dataset.placed];button.style.left=p.x+'%';button.style.top=p.y+'%';button.style.setProperty('--sticker-scale',p.scale||1);button.style.setProperty('--sticker-flip',p.flip?-1:1);});layout();
      const select=id=>{s.selected=id;ui.body.querySelectorAll('[data-sticker],[data-placed]').forEach(el=>el.classList.toggle('is-selected',(el.dataset.sticker||el.dataset.placed)===id));};
      const place=(id,x,y)=>{if(context.paused()||s.complete)return;const r=canvas.getBoundingClientRect(),size=Math.min(r.width*(matchMedia('(max-width:760px)').matches ? 0.27 : 0.24),115)*1.25;s.placed[id]={...(s.placed[id]||{}),x:Math.max(3,Math.min(97-size/r.width*100,x)),y:Math.max(12,Math.min(97-size/r.height*100,y))};s.selected=id;render();context.feedback('Colocaste un dibujo. Puedes moverlo o abrir sus opciones con clic derecho.','correct');};
      const fromPoint=(id,event)=>{const r=canvas.getBoundingClientRect();if(event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom)place(id,(event.clientX-r.left)/r.width*100-10,(event.clientY-r.top)/r.height*100-12);else context.feedback('Suelta el dibujo dentro de la escena.','retry');};
      ui.body.querySelectorAll('[data-sticker]').forEach(button=>{const canClick=bindDrag(button,context,event=>fromPoint(button.dataset.sticker,event));button.addEventListener('click',()=>{if(canClick()&&!s.complete)select(button.dataset.sticker);},{signal:context.signal});});
      canvas.addEventListener('click',event=>{if(s.complete||event.target.closest('[data-placed],.sticker-options'))return;if(s.selected&&!s.placed[s.selected])fromPoint(s.selected,event);else menu.hidden=true;},{signal:context.signal});
      ui.body.querySelectorAll('[data-placed]').forEach(button=>{
        const id=button.dataset.placed,canClick=bindDrag(button,context,event=>{if(!s.complete)fromPoint(id,event);});
        button.addEventListener('click',()=>{if(canClick()&&!s.complete)select(id);},{signal:context.signal});
        const options=event=>{event.preventDefault();if(context.paused()||s.complete)return;select(id);menu.hidden=false;const p=s.placed[id];menu.style.left=Math.min(p.x+14,65)+'%';menu.style.top=Math.min(p.y+9,48)+'%';menu.querySelector('button').focus({preventScroll:true});};
        button.addEventListener('contextmenu',options,{signal:context.signal});button.addEventListener('keydown',event=>{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10'))options(event);},{signal:context.signal});
      });
      menu.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();menu.hidden=true;canvas.focus();}},{signal:context.signal});
      menu.querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',()=>{if(!s.selected||!s.placed[s.selected]||s.complete)return;const p=s.placed[s.selected];if(button.dataset.edit==='flip')p.flip=!p.flip;else p.scale=button.dataset.edit==='grow'?1.25:.85;s.edited=true;render();context.feedback('Usaste el menú para cambiar tu dibujo.','correct');},{signal:context.signal}));
      const input=ui.body.querySelector('#studio-title'),change=()=>{const start=input.selectionStart,wasConfirmed=s.confirmed;input.value=G.normalize(input.value);input.setSelectionRange(Math.min(start,input.value.length),Math.min(start,input.value.length));s.title=input.value;s.confirmed=false;ui.body.querySelector('.scene-title').textContent=s.title||'Mi dibujo';const present=ui.toolbar.querySelector('.green-button');if(present)present.disabled=true;if(wasConfirmed)context.feedback('Cambiaste el título. Confírmalo con Enter antes de presentar la escena.');};
      G.bindKeyboard(ui.body.querySelector('.compact-keyboard'),input,context.signal,change);
      ui.body.querySelector('form').addEventListener('submit',event=>{event.preventDefault();if(context.paused()||s.complete)return;if(s.title.trim().replace(/ +/g,' ')==='MI DIBUJO'){s.confirmed=true;render();context.feedback('¡Tu título aparece en la escena!','correct');}else context.feedback('Revisa el modelo MI DIBUJO, incluido el espacio.','retry');},{signal:context.signal});
      nextButton(ui,'',null,context);
      if(s.complete)ui.toolbar.innerHTML='<p class="challenge-hint">¡Tu escena está lista! Puedes observarla antes de continuar.</p>';
      else if(ready)nextButton(ui,'Presentar mi escena ✓',()=>{if(Object.keys(s.placed).length!==3||!s.edited||!s.confirmed){context.feedback('Confirma el título y completa los pasos antes de presentar.','retry');return;}s.complete=true;context.complete();context.celebrate();render();context.feedback('Combinaste arrastre, opciones y teclado para crear tu propia escena.','correct');},context);
      else ui.toolbar.innerHTML=`<p class="challenge-hint">${count<3?'Coloca los tres dibujos.':!s.edited?'Selecciona un dibujo y usa clic derecho para cambiar su tamaño o voltearlo.':'Escribe MI DIBUJO y confirma con Enter.'}</p>`;
      const alt=document.createElement('button');alt.type='button';alt.className='quiet-button';alt.textContent='Opciones del dibujo · alternativa';alt.disabled=!s.selected||!s.placed[s.selected]||s.complete;alt.addEventListener('click',()=>{menu.hidden=false;menu.style.left='52%';menu.style.top='20%';menu.querySelector('button').focus({preventScroll:true});},{signal:context.signal});ui.toolbar.append(alt);
    }
    render();
  }
  window.ClassChallenges={jigsaw,trace,observe,maze,studio,'jigsaw-final':jigsaw,'trace-final':trace,'maze-final':maze,maps:[...maps,finalMap],outlines};
})();
