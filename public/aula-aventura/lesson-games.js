'use strict';
(() => {
  const pictures = window.ComputerClass.pictures;
  const names = Object.fromEntries(pictures.map(item => [item.id, item.name]));
  Object.assign(names, { monitor: 'Pantalla', keyboard: 'Teclado', mouse: 'Mouse' });
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const picture = id => `<span class="picture pic-${id}" role="img" aria-label="${names[id] || 'Ilustración'}"></span>`;
  const animated = id => `<span class="animal-track track-${id}">${picture(id)}</span><span class="motion-tag">Animación en pausa</span>`;
  const shuffle = items => { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; };
  const keyboard = () => `<div class="virtual-keyboard" role="group" aria-label="Teclado en pantalla">${'1234567890QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('').map(key => `<button type="button" class="virtual-key" data-key="${key}" aria-label="Tecla ${key}">${key}</button>`).join('')}<button type="button" class="virtual-key wide" data-key="Backspace" aria-label="Retroceso, borrar">⌫ Borrar</button><button type="button" class="virtual-key space" data-key=" " aria-label="Espacio">Espacio</button><button type="button" class="virtual-key wide" data-key="Enter">Enter ↵</button></div>`;
  const normalize = text => text.toLocaleUpperCase('es').replace(/[^\p{L}\p{N} ]/gu, '').slice(0, 18);
  const compactKeyboard = model => `<div class="virtual-keyboard compact-keyboard" role="group" aria-label="Teclas de apoyo para el modelo">${[...new Set(model.replace(/ /g,'').split(''))].map(key=>`<button type="button" class="virtual-key" data-key="${key}" aria-label="Tecla ${key}">${key}</button>`).join('')}<button type="button" class="virtual-key wide" data-key="Backspace" aria-label="Retroceso">⌫ Borrar</button><button type="button" class="virtual-key space" data-key=" " aria-label="Espacio">Espacio</button><button type="button" class="virtual-key wide" data-key="Enter">Enter ↵</button></div>`;
  function bindKeyboard(root, input, signal, onChange) {
    root.addEventListener('click', event => {
      const button = event.target.closest('[data-key]');
      if (!button || input.disabled) return;
      const key = button.dataset.key;
      if (key === 'Enter') { input.form?.requestSubmit(); return; }
      input.focus({ preventScroll: true });
      const start = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? start;
      if (key === 'Backspace') input.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end');
      else if (input.value.length - (end - start) < input.maxLength) input.setRangeText(key, start, end, 'end');
      onChange();
    }, { signal });
    input.addEventListener('input', event => { if (!event.isComposing) onChange(); }, { signal });
    input.addEventListener('compositionend', onChange, { signal });
  }
  function directions() { return `<div class="direction-buttons" role="group" aria-label="Direcciones"><button type="button" data-dir="left" aria-label="Izquierda">←</button><button type="button" data-dir="up" aria-label="Arriba">↑</button><button type="button" data-dir="down" aria-label="Abajo">↓</button><button type="button" data-dir="right" aria-label="Derecha">→</button></div>`; }
  function frame(root, context) {
    root.innerHTML = '<div class="game-frame"><div class="game-meta"><span class="game-progress"></span><div class="game-meter"><span></span></div><button class="quiet-button" type="button" data-reset>Reiniciar</button></div><div class="game-body"></div><div class="game-toolbar"></div></div>';
    root.querySelector('[data-reset]').addEventListener('click', context.restart, { signal: context.signal });
    root.querySelector('[data-reset]').hidden = context.allowRestart === false;
    return { body: root.querySelector('.game-body'), toolbar: root.querySelector('.game-toolbar'), progress(text, ratio) { root.querySelector('.game-progress').textContent = text; root.querySelector('.game-meter > span').style.width = `${Math.round(ratio * 100)}%`; } };
  }
  function toolbar(ui, label, callback, signal) {
    ui.toolbar.innerHTML = '';
    if (!label) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'green-button'; button.textContent = label;
    button.addEventListener('click', callback, { signal }); ui.toolbar.append(button);
  }
  function completed(root, context, message = 'Puedes continuar con la clase o repetir esta práctica.') {
    root.innerHTML = `<div class="game-complete">${picture('owl')}<h2>¡Práctica completada!</h2><p>${escape(message)}</p><button class="demo-button" type="button" data-repeat>Volver a practicar</button></div>`;
    root.querySelector('[data-repeat]').addEventListener('click', context.restart, { signal: context.signal });
    root.querySelector('[data-repeat]').hidden = context.allowRestart === false;
  }
  function finish(root, context, message) { context.store.complete = true; context.complete(message); context.celebrate(); completed(root, context, message); }
  function createSuccessDialog(host) {
    const dialog = document.createElement('dialog');
    dialog.className = 'kid-success-dialog';
    dialog.setAttribute('aria-labelledby', 'kid-success-title');
    dialog.setAttribute('aria-describedby', 'kid-success-message');
    dialog.innerHTML = `<div class="kid-success-card">
      <div class="kid-success-owl" aria-hidden="true"><span class="picture pic-owl"></span></div>
      <h2 id="kid-success-title"></h2>
      <p id="kid-success-message" class="kid-success-message"></p>
      <button type="button" class="kid-success-continue"></button>
    </div>`;
    host.append(dialog);
    const button = dialog.querySelector('button');
    let onContinue;
    button.addEventListener('click', () => {
      dialog.close();
      onContinue?.();
    });
    return {
      close() { if (dialog.open) dialog.close(); },
      show({ title = '¡Muy bien!', message, action, next, scene }) {
        const art = dialog.querySelector('.kid-success-owl');
        art.className = scene ? `kid-success-owl vignette-${scene}` : 'kid-success-owl';
        art.firstElementChild.className = scene ? 'vignette-art' : 'picture pic-owl';
        dialog.querySelector('h2').textContent = title;
        dialog.querySelector('p').textContent = message;
        button.textContent = action;
        onContinue = next;
        if (!dialog.open) dialog.showModal();
        button.focus({ preventScroll: true });
      },
    };
  }
  function listenKey(context, callback) {
    document.addEventListener('keydown', event => {
      if (context.paused() || event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      callback(event);
    }, { signal: context.signal });
  }
  function roundGame(kind, root, context) {
    const state = context.store, ui = frame(root, context);
    state.round ??= 0;
    const categories = [
      { display: 'image', id: 'sun', answer: 'image' }, { display: 'word', word: 'LUNA', answer: 'word' },
      { display: 'animation', id: 'rabbit', answer: 'animation' }, { display: 'image', id: 'apple', answer: 'image' },
      { display: 'word', word: 'SOL', answer: 'word' }, { display: 'animation', id: 'bird', answer: 'animation' },
      { display: 'image', id: 'flower', answer: 'image' }, { display: 'word', word: 'MI SOL', answer: 'word' },
      { display: 'animation', id: 'snail', answer: 'animation' }, { display: 'word', word: 'MESA', answer: 'word' },
      { display: 'image', id: 'moon', answer: 'image' }, { display: 'animation', id: 'frog', answer: 'animation' },
    ];
    const questions = [
      ['Queremos ver una fotografía. ¿Qué parte la muestra?', 'monitor'], ['Queremos escribir nuestro nombre. ¿Qué usamos?', 'keyboard'],
      ['Queremos señalar un dibujo. ¿Qué usamos?', 'mouse'], ['Queremos ver una animación. ¿Dónde la vemos?', 'monitor'],
      ['Necesitamos borrar una letra. ¿En qué parte está Retroceso?', 'keyboard'], ['Queremos arrastrar una pieza. ¿Qué usamos?', 'mouse'],
    ];
    const count = kind === 'quiz' ? 6 : context.finalStation ? 4 : context.extended ? 12 : 6;
    function render() {
      const correct = kind === 'screen-sort' ? categories[state.round].answer : kind === 'quiz' ? questions[state.round][1] : pictures[state.round % pictures.length].id;
      ui.progress(`Ronda ${state.round + 1} de ${count}`, state.round / count);
      if (kind === 'screen-sort') {
        const item = categories[state.round];
        const sample = item.display === 'word' ? `<span class="screen-word">${item.word}</span>` : item.display === 'animation' ? animated(item.id) : picture(item.id);
        ui.body.innerHTML = `<div class="sample-screen" role="img" aria-label="${item.display === 'word' ? `Palabra ${item.word}` : item.display === 'animation' ? `${names[item.id]} en movimiento` : `Imagen de ${names[item.id]}`}">${sample}</div><div class="choices-board screen-type-choices">${[['image','▧','Imagen'],['word','Aa','Palabra'],['animation','▷','Animación']].map(([id,mark,label]) => `<button class="picture-choice" type="button" data-answer="${id}"><span class="type-mark" aria-hidden="true">${mark}</span>${label}</button>`).join('')}</div>`;
      } else if (kind === 'quiz') {
        ui.body.innerHTML = `<div class="game-target"><strong class="quiz-question">${questions[state.round][0]}</strong></div><div class="choices-board">${['monitor','mouse','keyboard'].map(id=>`<button class="picture-choice" type="button" data-answer="${id}" aria-label="${names[id]}">${picture(id)}<span>${names[id]}</span></button>`).join('')}</div>`;
      } else {
        if (!state.options) { const others = shuffle(pictures.filter(item => item.id !== correct).map(item => item.id)); state.options = shuffle([correct, ...others.slice(0, context.extended ? 5 : 2)]); }
        ui.body.innerHTML = `<div class="game-target"><small>BUSCA ESTE DIBUJO</small>${picture(correct)}</div><div class="choices-board">${state.options.map(id => `<button class="picture-choice" type="button" data-answer="${id}" aria-label="Elegir ${names[id]}">${picture(id)}</button>`).join('')}</div>`;
      }
      toolbar(ui, '', null, context.signal);
      const showNext = () => toolbar(ui, state.round === count - 1 ? 'Terminar práctica ✓' : 'Siguiente ronda →', () => {
        if (state.round === count - 1) { finish(root, context); return; }
        state.round++; state.roundDone = false; delete state.options; render(); context.feedback('Observa el nuevo ejemplo y prueba otra vez.');
      }, context.signal);
      ui.body.querySelectorAll('[data-answer]').forEach(button => {
        if (state.roundDone) { button.disabled = true; if (button.dataset.answer === correct) button.classList.add('is-correct'); }
        button.addEventListener('click', () => {
          if (context.paused() || state.roundDone) return;
          if (button.dataset.answer === correct) {
            state.roundDone = true; button.classList.add('is-correct'); ui.body.querySelectorAll('[data-answer]').forEach(item => item.disabled = true);
            const message = kind === 'screen-sort' ? `¡Bien! La pantalla está mostrando ${correct === 'image' ? 'una imagen quieta' : correct === 'word' ? 'una palabra' : 'una animación que cambia y se mueve'}.` : kind === 'quiz' ? `¡Correcto! Usamos ${names[correct].toLowerCase()} para esa acción.` : '¡Encontraste el dibujo igual! Apuntaste y elegiste con un clic.';
            context.feedback(message, 'correct'); context.celebrate(); showNext();
          } else { button.classList.remove('is-retry'); void button.offsetWidth; button.classList.add('is-retry'); context.feedback(kind === 'screen-sort' ? 'Mira con calma: ¿ves un dibujo quieto, letras o algo que se mueve?' : kind === 'quiz' ? 'Recuerda la función de cada parte. Puedes volver a intentarlo.' : 'Ese dibujo es diferente al modelo. Compara su forma y vuelve a probar.', 'retry'); }
        }, { signal: context.signal });
      });
      if (state.roundDone) showNext();
    }
    render();
  }
  function memory(root, context) {
    const state = context.store, ui = frame(root, context), levels = context.extended ? [4,6,8] : [4,6];
    state.level ??= 0;
    function render() {
      const pairs = levels[state.level];
      state.deck ??= shuffle(['rabbit','sun','bird','apple','flower','frog','snail','moon'].slice(0,pairs).flatMap(id => [id,id])); state.matched ??= []; state.open ??= [];
      ui.progress(`Nivel ${state.level + 1} · ${state.matched.length / 2} de ${pairs} parejas`, state.matched.length / (pairs * 2));
      ui.body.innerHTML = `<div class="memory-grid">${state.deck.map((id,index)=>`<button type="button" class="memory-card ${state.open.includes(index)?'is-open':''} ${state.matched.includes(index)?'is-matched':''}" data-card="${index}" aria-label="${state.matched.includes(index)?`Pareja encontrada: ${names[id]}`:state.open.includes(index)?names[id]:`Tarjeta ${index+1}, descubrir`}" ${state.matched.includes(index)?'disabled':''}>${picture(id)}</button>`).join('')}</div>`;
      ui.body.querySelector('.memory-grid').style.setProperty('--columns',pairs);
      toolbar(ui, '', null, context.signal);
      if (state.wait) toolbar(ui, 'Ocultar estas dos y probar', () => { state.open=[];state.wait=false;render();context.feedback('Ahora puedes buscar otra pareja.'); }, context.signal);
      if (state.matched.length === pairs * 2) {
        toolbar(ui, state.level === levels.length - 1 ? 'Terminar práctica ✓' : 'Más parejas →', () => {
          if (state.level === levels.length - 1) { finish(root,context,'Observaste, recordaste y encontraste todas las parejas.'); return; }
          state.level++;delete state.deck;state.matched=[];state.open=[];render();context.feedback('Hay más parejas en este tablero. Observa sus lugares.');
        },context.signal);
      }
      ui.body.querySelectorAll('[data-card]').forEach(button => button.addEventListener('click',()=>{
        const index=Number(button.dataset.card);
        if(context.paused()||state.wait||state.matched.includes(index)||state.open.includes(index))return;
        state.open.push(index);
        if(state.open.length===2){
          if(state.deck[state.open[0]]===state.deck[state.open[1]]){state.matched.push(...state.open);state.open=[];context.feedback('¡Una pareja! Recuerda dónde viste los otros dibujos.','correct');context.celebrate();}
          else{state.wait=true;context.feedback('Son diferentes. Míralas bien antes de volver a ocultarlas.','retry');}
        }
        render();
      },{signal:context.signal}));
    }
    render();
  }
  function reveal(root, context) {
    const state=context.store,ui=frame(root,context),levels=context.extended?[[4,3,'owl'],[5,4,'butterfly'],[6,4,'flower']]:[[4,3,'owl']];
    state.level??=0;state.cleared??=[];
    function render(){
      const [columns,rows,id]=levels[state.level],total=columns*rows;
      ui.progress(`Dibujo ${state.level+1} · ${state.cleared.length} de ${total} zonas`,state.cleared.length/total);
      ui.body.innerHTML=`<div class="reveal-board"><span class="picture pic-${id} reveal-image" role="img" aria-label="${names[id]}"></span><div class="reveal-tiles">${Array.from({length:total},(_,i)=>`<button class="reveal-tile ${state.cleared.includes(i)?'is-cleared':''}" type="button" data-tile="${i}" aria-label="Descubrir zona ${i+1}" ${state.cleared.includes(i)?'disabled':''}>·</button>`).join('')}</div></div>`;
      const board=ui.body.querySelector('.reveal-board'),tiles=ui.body.querySelector('.reveal-tiles');tiles.style.setProperty('--columns',columns);tiles.style.setProperty('--rows',rows);
      const done=()=>toolbar(ui,state.level===levels.length-1?'Terminar práctica ✓':'Descubrir otro dibujo →',()=>{if(state.level===levels.length-1){finish(root,context,'Moviste el puntero y descubriste la ilustración completa.');return;}state.level++;state.cleared=[];render();context.feedback('Recorre las nuevas zonas para descubrir otra ilustración.');},context.signal);
      toolbar(ui,'',null,context.signal);if(state.cleared.length===total)done();
      const clear=index=>{
        if(context.paused()||state.cleared.includes(index)||index<0||index>=total)return;
        state.cleared.push(index);const tile=tiles.querySelector(`[data-tile="${index}"]`);tile.classList.add('is-cleared');tile.disabled=true;ui.progress(`Dibujo ${state.level+1} · ${state.cleared.length} de ${total} zonas`,state.cleared.length/total);
        if(state.cleared.length===total){context.feedback('¡Se ve la ilustración completa! El movimiento del mouse nos permitió descubrirla.','correct');context.celebrate();done();}
      };
      tiles.querySelectorAll('[data-tile]').forEach(button=>{button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')clear(Number(button.dataset.tile));},{signal:context.signal});button.addEventListener('click',()=>clear(Number(button.dataset.tile)),{signal:context.signal});});
      const atPoint=event=>{const r=board.getBoundingClientRect();const x=Math.floor((event.clientX-r.left)/r.width*columns),y=Math.floor((event.clientY-r.top)/r.height*rows);if(x>=0&&x<columns&&y>=0&&y<rows)clear(y*columns+x);};
      board.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'){board.setPointerCapture(event.pointerId);atPoint(event);}},{signal:context.signal});
      board.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'&&board.hasPointerCapture(event.pointerId))atPoint(event);},{signal:context.signal});
    }
    render();
  }
  function sort(root,context,devices=false){
    const state=context.store,ui=frame(root,context),levels=devices?[['monitor','keyboard','mouse']]:context.extended?[['sun','moon','apple'],['flower','butterfly','apple','moon'],['sun','moon','butterfly','flower','apple']]:[['sun','moon','apple']];
    state.level??=0;state.placed??=[];
    function render(){
      const ids=levels[state.level];state.order??=shuffle(ids);
      ui.progress(`Tablero ${state.level+1} · ${state.placed.length} de ${ids.length} piezas`,state.placed.length/ids.length);
      ui.body.innerHTML=`<div class="sort-layout ${ids.length>4?'many-pieces':''}"><div class="sort-targets">${ids.map(id=>`<button class="sort-target ${state.placed.includes(id)?'is-filled':''}" data-drop="${id}" type="button" aria-label="Lugar de ${names[id]}" ${state.placed.includes(id)?'disabled':''}>${picture(id)}<small>${names[id]}</small></button>`).join('')}</div><div class="sort-pieces">${state.order.map(id=>`<button class="drag-piece ${state.selected===id?'is-selected':''}" data-piece="${id}" type="button" aria-label="Mover ${names[id]}" aria-pressed="${state.selected===id}" ${state.placed.includes(id)?'disabled':''}>${picture(id)}</button>`).join('')}</div><p class="game-note">Arrastra, o selecciona primero el dibujo y después su lugar.</p></div>`;
      toolbar(ui,'',null,context.signal);
      const next=()=>toolbar(ui,state.level===levels.length-1?'Terminar práctica ✓':'Otro tablero →',()=>{if(state.level===levels.length-1){finish(root,context,devices?'Ubicaste la pantalla, el teclado y el mouse en sus lugares.':'Pulsaste, moviste y soltaste cada dibujo en su lugar.');return;}state.level++;state.placed=[];delete state.order;delete state.selected;render();context.feedback('Ahora hay más piezas. Revisa las siluetas antes de moverlas.');},context.signal);
      if(state.placed.length===ids.length)next();
      const choose=id=>{state.selected=id;ui.body.querySelectorAll('[data-piece]').forEach(b=>{b.classList.toggle('is-selected',b.dataset.piece===id);b.setAttribute('aria-pressed',String(b.dataset.piece===id));});};
      const place=(id,target)=>{
        if(context.paused()||!id||state.placed.includes(id))return;
        if(id!==target){context.feedback('Ese lugar tiene otra silueta. Compara las formas y vuelve a probar.','retry');return;}
        state.placed.push(id);delete state.selected;context.feedback(`¡${names[id]} está en su lugar!`,'correct');context.celebrate();render();
      };
      ui.body.querySelectorAll('[data-drop]').forEach(button=>button.addEventListener('click',()=>{if(!state.selected){context.feedback('Primero selecciona un dibujo y después el lugar donde lo quieres poner.');return;}place(state.selected,button.dataset.drop);},{signal:context.signal}));
      ui.body.querySelectorAll('[data-piece]').forEach(button=>{
        let drag=null,suppressClickUntil=0;
        button.addEventListener('click',()=>{if(!context.paused()&&performance.now()>suppressClickUntil)choose(button.dataset.piece);},{signal:context.signal});
        button.addEventListener('pointerdown',event=>{
          if(context.paused()||event.button!==0||button.disabled)return;
          drag={x:event.clientX,y:event.clientY,moved:false};button.setPointerCapture(event.pointerId);
        },{signal:context.signal});
        button.addEventListener('pointermove',event=>{
          if(!drag||context.paused())return;
          const x=event.clientX-drag.x,y=event.clientY-drag.y;if(Math.abs(x)+Math.abs(y)>6)drag.moved=true;
          if(drag.moved){button.classList.add('is-dragging');button.style.transform=`translate(${x}px,${y}px)`;}
        },{signal:context.signal});
        const end=event=>{
          if(!drag)return;
          const moved=drag.moved;drag=null;button.classList.remove('is-dragging');button.style.transform='';
          if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId);
          if(!moved)return;suppressClickUntil=performance.now()+300;
          if(event.type==='pointercancel')return;
          const target=document.elementsFromPoint(event.clientX,event.clientY).map(el=>el.closest('[data-drop]')).find(Boolean);
          if(target&&ui.body.contains(target))place(button.dataset.piece,target.dataset.drop);
          else context.feedback('Suelta el dibujo sobre una silueta. Puedes intentarlo otra vez.','retry');
        };
        button.addEventListener('pointerup',end,{signal:context.signal});button.addEventListener('pointercancel',end,{signal:context.signal});
      });
    }
    render();
  }
  function contextGarden(root,context){
    const state=context.store,ui=frame(root,context);
    const tasks=context.demo?[['water','Regar la flor']]:[['water','Regar la flor'],['sun','Darle luz a la flor'],['butterfly','Invitar una mariposa']];
    const labels={water:'Regar',sun:'Dar luz',butterfly:'Invitar mariposa'};
    state.round??=0;state.effects??=[];
    function render(){
      ui.progress(`Cuidado ${state.round+1} de ${tasks.length}`,state.round/tasks.length);
      ui.body.innerHTML=`<div class="context-garden"><span class="context-request">${tasks[state.round][1]}</span><button class="flower-target ${state.effects.includes('water')?'is-watered':''} ${state.effects.includes('sun')?'is-sunny':''} ${state.effects.includes('butterfly')?'is-butterfly':''}" type="button" aria-label="Flor del jardín. Abre sus opciones con clic derecho o Mayúsculas F10">${picture('flower')}</button><p class="context-instruction">Clic derecho sobre la flor.<br>Después elige con clic izquierdo.</p><div class="context-menu" role="group" aria-label="Opciones de la flor" hidden>${Object.entries(labels).map(([id,label])=>`<button type="button" data-care="${id}">${label}</button>`).join('')}</div><button class="demo-button context-alt" type="button" data-open-options>Ver opciones · alternativa en pantalla</button></div>`;
      const menu=ui.body.querySelector('.context-menu'),flower=ui.body.querySelector('.flower-target');
      if(state.effects.includes('sun')){const sun=document.createElement('span');sun.className='picture pic-sun garden-sun';sun.setAttribute('aria-hidden','true');ui.body.querySelector('.context-garden').append(sun);}
      toolbar(ui,'',null,context.signal);
      const showNext=()=>toolbar(ui,state.round===tasks.length-1?'Terminar práctica ✓':'Siguiente cuidado →',()=>{if(state.round===tasks.length-1){finish(root,context,'Abriste un menú y elegiste una opción para cuidar el jardín.');return;}state.round++;state.roundDone=false;render();context.feedback('Mira la nueva consigna y abre otra vez las opciones de la flor.');},context.signal);
      if(state.roundDone)showNext();
      const open=event=>{event?.preventDefault();if(context.paused()||state.roundDone)return;menu.hidden=false;menu.querySelector('button').focus({preventScroll:true});context.feedback('El menú está abierto. Elige la acción indicada con clic izquierdo.');};
      flower.addEventListener('contextmenu',open,{signal:context.signal});
      flower.addEventListener('keydown',event=>{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10'))open(event);},{signal:context.signal});
      flower.addEventListener('click',()=>{if(!state.roundDone)context.feedback('Para ver las opciones, usa clic derecho sobre la flor o el botón de alternativa.');},{signal:context.signal});
      ui.body.querySelector('[data-open-options]').addEventListener('click',open,{signal:context.signal});
      ui.body.querySelectorAll('[data-care]').forEach(button=>button.addEventListener('click',()=>{
        if(context.paused()||state.roundDone)return;
        if(button.dataset.care!==tasks[state.round][0]){context.feedback('Esa opción hace otra cosa. Lee la consigna y prueba de nuevo.','retry');return;}
        state.effects.push(button.dataset.care);state.roundDone=true;render();context.feedback(`¡Bien! Elegiste «${labels[button.dataset.care]}» desde el menú.`,'correct');context.celebrate();
      },{signal:context.signal}));
      flower.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.hidden=true;flower.focus();}},{signal:context.signal});
      menu.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();menu.hidden=true;flower.focus();}},{signal:context.signal});
    }
    render();
  }
  function findKey(root,context){
    const state=context.store,ui=frame(root,context),targets=context.extended?['A','M','S','2','L','O','5','9','SOL','LUNA','12']:['A','M','S','2','L','7'];
    state.round??=0;state.position??=0;
    function render(){
      const target=targets[state.round];ui.progress(`Modelo ${state.round+1} de ${targets.length}`,state.round/targets.length);
      ui.body.innerHTML=`<div class="key-game"><div class="key-model" aria-label="Modelo ${target}">${target.split('').map((key,index)=>`<span class="${index<state.position?'is-found':''}">${key}</span>`).join('')}</div><p class="game-note">Pulsa la tecla en tu teclado. También puedes usar las teclas en pantalla.</p>${keyboard()}</div>`;
      toolbar(ui,'',null,context.signal);
      if(state.position===target.length)toolbar(ui,state.round===targets.length-1?'Terminar práctica ✓':'Otro modelo →',()=>{if(state.round===targets.length-1){finish(root,context,'Encontraste las letras y los números siguiendo el modelo.');return;}state.round++;state.position=0;render();context.feedback('Observa el nuevo modelo y busca sus teclas.');},context.signal);
      ui.body.querySelector('.virtual-keyboard').addEventListener('click',event=>{const button=event.target.closest('[data-key]');if(button)press(button.dataset.key);},{signal:context.signal});
    }
    const press=key=>{
      if(context.paused())return;const target=targets[state.round];if(state.position>=target.length)return;
      if(key.toLocaleUpperCase('es')===target[state.position]){state.position++;render();context.feedback(state.position===target.length?'¡Encontraste las teclas del modelo!':'Bien. Ahora busca la siguiente tecla.','correct');context.sound('tap');if(state.position===target.length)context.celebrate();}
      else context.feedback(`Mira el modelo. Ahora necesitamos la tecla ${target[state.position]}.`,'retry');
    };
    listenKey(context,event=>{if(event.key.length===1&&/[\p{L}\p{N}]/u.test(event.key)){event.preventDefault();press(event.key);}});render();
  }
  function copy(root,context){
    const state=context.store,ui=frame(root,context);
    const models=context.finalStation?[['SOL','SOLL'],['MI SOL',''],['LUNA','']]:context.extended?[['SOL','SOLL'],['LUNA',''],['MI SOL','MISOL'],['MESA',''],['OSO 2',''],['LA LUNA','']]:[['SOL','SOLL'],['LUNA',''],['MI SOL','']];
    state.round??=0;
    function render(){
      const [model,initial]=models[state.round];state.text??=initial;ui.progress(`Modelo ${state.round+1} de ${models.length}`,state.round/models.length);
      ui.body.innerHTML=`<div class="copy-game ${context.finalStation?'is-final-copy':''} ${state.roundDone?'is-checked':''}"><span class="word-model" aria-label="Modelo: ${model}">${model}</span><p class="copy-caption">${initial?'Revisa el texto: hay algo para corregir.':'Copia el modelo con letras y espacios.'}</p><form class="typing-form"><label for="copy-input">Tu respuesta</label><input id="copy-input" class="typing-input" type="text" maxlength="18" autocomplete="off" spellcheck="false" autocapitalize="characters" aria-label="Copia el modelo ${model}" value="${escape(state.text)}" ${state.roundDone?'disabled':''}><button type="submit" class="demo-button" ${state.roundDone?'disabled':''}>Comprobar · Enter ↵</button></form>${context.finalStation?compactKeyboard(model):keyboard()}</div>`;
      const input=ui.body.querySelector('.typing-input');
      if(state.roundDone)ui.body.querySelectorAll('[data-key]').forEach(button=>button.disabled=true);
      const change=()=>{const start=input.selectionStart,end=input.selectionEnd;input.value=normalize(input.value);input.setSelectionRange(Math.min(start,input.value.length),Math.min(end,input.value.length));state.text=input.value;};
      bindKeyboard(ui.body.querySelector('.virtual-keyboard'),input,context.signal,change);
      ui.body.querySelector('form').addEventListener('submit',event=>{
        event.preventDefault();if(context.paused()||state.roundDone)return;change();
        if(state.text.trim().replace(/ +/g,' ')===model){state.roundDone=true;render();context.feedback('¡Coincide con el modelo! Usaste el teclado para escribir y corregir.','correct');context.celebrate();}
        else context.feedback('Compara letra por letra y revisa los espacios. Usa Retroceso si necesitas corregir.','retry');
      },{signal:context.signal});
      toolbar(ui,'',null,context.signal);
      if(state.roundDone)toolbar(ui,state.round===models.length-1?'Terminar práctica ✓':'Siguiente modelo →',()=>{if(state.round===models.length-1){finish(root,context,'Copiaste los modelos y corregiste el texto.');return;}state.round++;state.roundDone=false;delete state.text;render();context.feedback('Ahora hay un modelo diferente. Observa sus letras y espacios.');},context.signal);
    }
    render();
  }
  const paths=[
    {columns:4,rows:3,start:[0,0],goal:[3,2],rocks:[[1,1],[2,1]]},
    {columns:5,rows:4,start:[0,0],goal:[4,3],rocks:[[1,0],[1,1],[3,2],[3,1]]},
    {columns:6,rows:4,start:[0,0],goal:[5,3],rocks:[[1,0],[1,1],[3,1],[3,2],[4,2]]},
  ];
  function pathGame(root,context){
    const state=context.store,ui=frame(root,context),total=context.demo?1:context.extended?3:2;
    state.level??=0;state.position??=[...paths[state.level].start];
    function render(){
      const level=paths[state.level],goal=state.position[0]===level.goal[0]&&state.position[1]===level.goal[1];
      ui.progress(`Camino ${state.level+1} de ${total}`,state.level/total);
      ui.body.innerHTML=`<div class="path-layout"><div class="path-board" tabindex="0" role="group" aria-label="Camino de la lechuza: usa las flechas">${Array.from({length:level.columns*level.rows},(_,i)=>{const x=i%level.columns,y=Math.floor(i/level.columns),rock=level.rocks.some(p=>p[0]===x&&p[1]===y);return `<span class="path-cell ${rock?'is-rock':''}">${x===level.goal[0]&&y===level.goal[1]?picture('apple'):''}</span>`;}).join('')}<span class="walker">${picture('owl')}</span></div><div class="path-sidebar"><p>Llega a la manzana rodeando las piedras.</p>${directions()}<p>Usa las flechas de tu teclado o estos botones.</p></div></div>`;
      const board=ui.body.querySelector('.path-board');board.style.setProperty('--columns',level.columns);board.style.setProperty('--rows',level.rows);moveAvatar();
      ui.body.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.dir),{signal:context.signal}));
      toolbar(ui,'',null,context.signal);
      if(goal)toolbar(ui,state.level===total-1?'Terminar práctica ✓':'Otro camino →',()=>{if(state.level===total-1){finish(root,context,'Usaste las flechas para dar instrucciones y llegar a la meta.');return;}state.level++;state.position=[...paths[state.level].start];render();context.feedback('El camino cambió. Observa las piedras antes de moverte.');},context.signal);
    }
    function moveAvatar(){const avatar=ui.body.querySelector('.walker');avatar.style.transform=`translate(${state.position[0]*100}%,${state.position[1]*100}%)`;avatar.setAttribute('aria-label',`Lechuza en columna ${state.position[0]+1}, fila ${state.position[1]+1}`);}
    function move(direction){
      if(context.paused())return;const level=paths[state.level];if(state.position[0]===level.goal[0]&&state.position[1]===level.goal[1])return;
      const [dx,dy]={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[direction],x=state.position[0]+dx,y=state.position[1]+dy;
      if(x<0||y<0||x>=level.columns||y>=level.rows||level.rocks.some(p=>p[0]===x&&p[1]===y)){context.feedback('Por ese lado no podemos pasar. Observa otra dirección.','retry');return;}
      state.position=[x,y];moveAvatar();context.sound('tap');
      if(x===level.goal[0]&&y===level.goal[1]){context.feedback('¡Llegaste a la manzana siguiendo tus instrucciones!','correct');context.celebrate();render();}
      else context.feedback('La lechuza siguió la dirección de tu tecla.');
    }
    listenKey(context,event=>{const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.key];if(direction){event.preventDefault();move(direction);}});render();
  }
  function finalGame(root,context,stations=[['El rincón del computador','jigsaw-final'],['Dibuja un ave','trace-final'],['Encuentra la llave y la salida','maze-final'],['Crea y presenta tu escena','studio']]){
    const state=context.store;state.stage??=0;state.children??={};state.done??=[];
    let childController;
    context.signal.addEventListener('abort',()=>childController?.abort(),{once:true});
    function render(){
      childController?.abort();
      if(state.done.length===stations.length){finish(root,context,context.finalMessage||'Completaste los cuatro desafíos del taller y creaste una escena. Ahora conversemos sobre lo que aprendimos.');return;}
      root.innerHTML=`<div class="final-wrapper"><div class="final-stations" aria-label="Estaciones del juego final">${stations.map((item,i)=>`<span class="station-dot ${i===state.stage?'is-current':''} ${state.done.includes(i)?'is-done':''}" aria-label="Estación ${i+1}: ${item[0]}${state.done.includes(i)?', completada':''}">${state.done.includes(i)?'✓':i+1}</span>`).join('')}</div><p class="final-label">Estación ${state.stage+1} de ${stations.length} · ${stations[state.stage][0]}</p><div class="final-host"></div><div class="game-toolbar final-advance"></div></div>`;
      const host=root.querySelector('.final-host'),advance=root.querySelector('.final-advance');
      const stage = state.stage;
      const last = stage === stations.length - 1;
      function advanceStation() {
        if (context.signal.aborted || state.stage !== stage) return;
        if (!last) state.stage++;
        context.feedback('');
        render();
        if (!last) {
          const label = root.querySelector('.final-label');
          label.tabIndex = -1;
          label.focus({ preventScroll: true });
        }
      }
      function showAdvance() {
        advance.innerHTML = `<button type="button" class="green-button">${last ? 'Terminar el taller' : 'Siguiente reto'}</button>`;
        advance.querySelector('button').addEventListener('click', advanceStation, { signal: childController.signal });
      }
      childController=new AbortController();state.children[state.stage]??={};
      mount(stations[stage][1],host,{
        ...context, signal:childController.signal, store:state.children[stage], extended:false, finalStation:!context.practiceStations,
        restart:()=>{state.children[stage]={};state.done=state.done.filter(i=>i!==stage);render();},
        complete: message => {
          if (state.done.includes(stage)) return;
          state.done.push(stage);
          context.onStationComplete?.(stage, state.children[stage]);
          showAdvance();
          if (context.onStationSuccess) {
            if (last) queueMicrotask(advanceStation);
            else context.onStationSuccess(message || `Completaste «${stations[stage][0]}».`, advanceStation);
          }
        },
      });
      if (state.done.includes(stage) && !advance.firstElementChild) showAdvance();
    }
    render();
  }
  function mount(kind,root,context){
    if(window.ClassChallenges?.[kind]){window.ClassChallenges[kind](root,context);return;}
    if(context.store.complete){completed(root,context);return;}
    switch(kind){
      case 'screen-sort':case 'choose':case 'quiz':roundGame(kind,root,context);break;
      case 'memory':memory(root,context);break;
      case 'reveal':reveal(root,context);break;
      case 'sort':sort(root,context);break;
      case 'devices':sort(root,context,true);break;
      case 'context':contextGarden(root,context);break;
      case 'find-key':findKey(root,context);break;
      case 'copy':copy(root,context);break;
      case 'path':pathGame(root,context);break;
      case 'final':finalGame(root,context);break;
      default:throw Error(`Actividad desconocida: ${kind}`);
    }
  }
  window.ClassGames={mount,runFinal:finalGame,picture,animated,keyboard,compactKeyboard,bindKeyboard,normalize,directions,paths,shared:{frame,toolbar,finish,completed,listenKey,shuffle,escape,names,createSuccessDialog}};
})();
