'use strict';
(() => {
  const $ = id => document.getElementById(id), root = $('adventure');
  const content = window.ComputerClass, games = window.ClassGames;
  const meta=content.meta||{title:'Partes del computador',ordinal:'Primera',slug:'partes-del-computador'};
  const finishEyebrow=document.querySelector('#finish .eyebrow.light');
  if(finishEyebrow&&meta.ordinal)finishEyebrow.textContent=`${meta.ordinal.toLocaleUpperCase('es')} CLASE · CIERRE`;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { mode:'loading',part:0,step:0,active:null,paused:false,reducedMotion:prefersReduced.matches,extended:false };
  const renderer = new window.AdventureRenderer($('world'),()=>state);
  const activityStates = new Map(), demoStates = new Map(), completed = new Set(), seen = new Set();
  const isMultiClassPage = () => root.classList.contains('first-path-class') || root.classList.contains('second-grade-class') || root.classList.contains('third-grade-class');
  let stepController, sound = false, audio;
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const current = () => content.parts[state.part].steps[state.step];
  const signal = () => stepController.signal;
  const on = (element,event,callback) => element.addEventListener(event,callback,{signal:signal()});
  const paused = () => state.paused || !!document.querySelector('dialog[open]');
  const successDialog=document.createElement('dialog');
  successDialog.className='kid-success-dialog';
  successDialog.setAttribute('aria-labelledby','kid-success-title');
  successDialog.innerHTML='<div class="kid-success-card"><div class="kid-success-owl" aria-hidden="true"><span class="picture pic-owl"></span></div><p class="kid-success-kicker">ACTIVIDAD COMPLETADA</p><h2 id="kid-success-title">¡Muy bien!</h2><div class="kid-success-message"></div><button type="button" class="kid-success-continue">Seguir con la clase →</button></div>';
  document.body.append(successDialog);
  successDialog.addEventListener('cancel',event=>event.preventDefault());
  successDialog.querySelector('button').addEventListener('click',()=>{successDialog.close();nextStep();});
  function showSuccess(activityTitle){
    successDialog.querySelector('.kid-success-message').textContent=`Completaste «${activityTitle}». Ya puedes continuar.`;
    if(!successDialog.open)successDialog.showModal();
    successDialog.querySelector('button').focus({preventScroll:true});
  }
  function animateScreen(mode){
    root.classList.remove('screen-enter','screen-enter-activity');void root.offsetWidth;
    root.classList.add('screen-enter');if(mode==='challenge')root.classList.add('screen-enter-activity');
    setTimeout(()=>root.classList.remove('screen-enter','screen-enter-activity'),520);
  }
  function chime(kind='tap') {
    if(!sound)return;
    try {
      audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();
      const notes=kind==='success'?[523.25,659.25,783.99]:[659.25];
      notes.forEach((frequency,index)=>{const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+index*.1;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.028,at+.018);gain.gain.exponentialRampToValueAtTime(.001,at+.32);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.33);});
    }catch{sound=false;updateSound();}
  }
  function feedback(text,type='') {
    const element=state.mode==='challenge'?$('activity-feedback'):$('lesson-feedback');
    element.textContent=text;
    element.classList.toggle('has-message',!!text);
    element.classList.toggle('is-correct',type==='correct');
    element.classList.toggle('is-retry',type==='retry');
    element.classList.remove('feedback-pop');void element.offsetWidth;element.classList.add('feedback-pop');
    if(type==='retry')renderer.setMood('think');
  }
  function celebrate(){renderer.setMood('success');renderer.burst();chime('success');}
  function setMode(mode) {
    if(successDialog.open)successDialog.close();
    $('share-final').hidden=true;
    $('start-class-activity').hidden=true;$('activity-choice-note').hidden=true;
    stepController?.abort();stepController=new AbortController();state.mode=mode;root.dataset.mode=mode;
    ['intro','lesson-view','activity-view','lesson-footer','finish'].forEach(id=>$(id).hidden=true);
    if(mode==='intro')$('intro').hidden=false;
    if(mode==='finish')$('finish').hidden=false;
    if(mode==='lesson'){$('lesson-view').hidden=false;$('lesson-footer').hidden=false;}
    if(mode==='challenge'){$('activity-view').hidden=false;$('lesson-footer').hidden=false;}
    renderer.transition();
  }
  function navigation() {
    $('part-navigation').innerHTML=content.parts.map((part,index)=>{
      const done=part.steps.every(step=>step.game?completed.has(step.id):seen.has(step.id));
      return `<button type="button" class="part-tab ${done?'is-reviewed':''}" data-part="${part.id}" ${state.active===part.id?'aria-current="step"':''} aria-label="Parte ${index+1}: ${part.name}${done?', revisada':''}"><span>${done?'✓':String(index+1).padStart(2,'0')}</span>${part.short}</button>`;
    }).join('');
  }
  function updateNext() {
    const part=content.parts[state.part],step=current(),last=state.step===part.steps.length-1;
    $('previous-step').disabled=false;
    $('step-counter').textContent=`${state.step+1} de ${part.steps.length}`;
    $('next-step').disabled=!!step.game&&!completed.has(step.id);
    $('next-step').textContent=step.game&&!completed.has(step.id)?'Termina el reto para continuar':state.part===content.parts.length-1&&last?'Cerrar la clase →':last?'Siguiente parte →':'Continuar →';
    $('next-step').setAttribute('aria-describedby','lesson-feedback');
    const boundary=!step.game&&!!part.steps[state.step+1]?.game,definition=window.ClassPartActivity(meta.slug,part.id),available=!!definition&&!step.game&&(boundary||last);
    $('start-class-activity').hidden=!available;$('activity-choice-note').hidden=!available;
    if(available){$('start-class-activity').href=`docente?crear=${encodeURIComponent(definition.lesson)}`;$('start-class-activity').setAttribute('aria-label',`Iniciar actividad: ${part.name}; abre el panel docente en otra pestaña`);$('activity-choice-note').textContent=boundary?'Explicación terminada. Ve los ejercicios con el grupo o inicia la actividad para compartir el enlace.':`Iniciar actividad abre el enlace y el seguimiento de ${part.name.toLocaleLowerCase('es')}.`;}
    if(boundary)$('next-step').textContent='Ver ejercicios →';
    $('restart-practice').hidden=!step.game;
  }
  function showStep(partIndex,stepIndex=0,focus=true) {
    state.part=partIndex;state.step=stepIndex;
    const part=content.parts[partIndex],step=part.steps[stepIndex];state.active=part.id;
    setMode(step.game?'challenge':'lesson');root.dataset.active=part.id;root.dataset.scene=step.id;
    if(!step.game)seen.add(step.id);
    navigation();updateNext();
    const params=new URLSearchParams({parte:part.id,paso:step.id});if(isMultiClassPage())params.set('clase',meta.slug);if(state.extended)params.set('ruta','ampliada');history.replaceState(null,'',`${location.pathname}?${params}`);
    document.title=`${part.name} · ${meta.title}`;
    $('lesson-feedback').textContent=step.game?'Completa el reto de arriba. Cuando lo logres, se activará el botón para continuar.':`Ahora: ${step.prompt}`;
    $('activity-feedback').textContent='';$('activity-feedback').className='activity-feedback';
    if(step.game){
      $('challenge-counter').textContent=`${part.id==='repaso'?'ACTIVIDAD FINAL':'ACTIVIDAD'} · ${part.name.toUpperCase()}`;
      $('activity-title').textContent=step.title;$('activity-instruction').textContent=step.instruction;
      activityStates.has(step.id)||activityStates.set(step.id,{});
      games.mount(step.game,$('activity-board'),{
        store:activityStates.get(step.id),extended:state.extended,signal:signal(),paused,feedback,celebrate,sound:chime,isSoundEnabled:()=>sound,
        restart:()=>{activityStates.delete(step.id);completed.delete(step.id);showStep(state.part,state.step,false);},
        complete:()=>{const firstCompletion=!completed.has(step.id);completed.add(step.id);updateNext();navigation();$('lesson-feedback').textContent='Actividad completada. Pulsa Seguir con la clase.';$('lesson-feedback').classList.remove('feedback-pop');void $('lesson-feedback').offsetWidth;$('lesson-feedback').classList.add('feedback-pop');if(firstCompletion)showSuccess(step.title);},
      });
      if(focus)$('activity-title').focus({preventScroll:true});
    }else{
      $('story-eyebrow').textContent=`PARTE ${partIndex+1} · EXPLICACIÓN ${part.steps.slice(0,stepIndex+1).filter(item=>!item.game).length}`;
      $('story-title').textContent=step.title;$('story-description').innerHTML=step.body.map(text=>`<p>${text}</p>`).join('');$('scene-prompt').textContent=step.prompt;
      if(focus)$('story-title').focus({preventScroll:true});
      renderDemo(step);
    }
    renderer.setMood('wave');renderer.measure();animateScreen(state.mode);
    if(focus&&matchMedia('(max-width:760px)').matches)window.scrollTo({top:0,behavior:'instant'});
  }
  function nextStep(){const part=content.parts[state.part];if(current().game&&!completed.has(current().id))return;if(state.step+1<part.steps.length)showStep(state.part,state.step+1);else if(state.part+1<content.parts.length)showStep(state.part+1,0);else finishClass();}
  function previousStep(){if(state.step>0)showStep(state.part,state.step-1);else if(state.part>0)showStep(state.part-1,content.parts[state.part-1].steps.length-1);else showIntro();}
  function showIntro(){state.active=null;root.dataset.active='';root.dataset.scene='';setMode('intro');navigation();renderer.measure();renderer.setMood('wave');const params=new URLSearchParams();if(isMultiClassPage())params.set('clase',meta.slug);if(state.extended)params.set('ruta','ampliada');history.replaceState(null,'',location.pathname+(params.size?`?${params}`:''));document.querySelector(`[name="pace"][value="${state.extended?'extended':'base'}"]`).checked=true;document.title=`${meta.title} · ${meta.ordinal} clase`;}
  function finishClass(){setMode('finish');$('finish-activity').href='docente?crear='+encodeURIComponent(meta.slug);state.active=null;root.dataset.active='';navigation();$('class-summary').textContent=`Recorrido de esta página: ${completed.size} de ${content.parts.flatMap(part=>part.steps).filter(step=>step.game).length} prácticas completadas. Podemos volver a las partes que necesitemos.`;renderer.measure();celebrate();}
  function monitorHTML(mode='image',still=false,power=true,animal='rabbit'){
    const display=mode==='word'?'<span class="screen-word">SOL</span>':mode==='animation'?games.animated(animal):games.picture('sun');
    return `<div class="monitor-shell"><span class="device-art art-monitor" aria-hidden="true"></span><div class="monitor-view ${power?'':'is-off'} ${still?'is-still':''}">${display}</div><button type="button" class="screen-power" aria-label="Encender o apagar el monitor del dibujo" aria-pressed="${power}">Encender</button></div>`;
  }
  function renderScreen(step,store){
    store.display??=step.demo==='screen-motion'?'animation':'image';store.power??=true;store.animal??='rabbit';
    const demo=$('demo');demo.innerHTML=monitorHTML(store.display,store.still,store.power,store.animal)+`<div class="demo-buttons">${[['image','Imagen'],['word','Palabra'],['animation','Animación']].map(([id,name])=>`<button type="button" class="demo-button" data-display="${id}" aria-pressed="${store.display===id}">${name}</button>`).join('')}</div>${store.display==='animation'?`<div class="demo-buttons"><select class="demo-button" data-animal aria-label="Elegir un animal animado">${[['rabbit','Conejo'],['snail','Caracol'],['frog','Rana'],['bird','Ave'],['butterfly','Mariposa']].map(([id,label])=>`<option value="${id}" ${store.animal===id?'selected':''}>${label}</option>`).join('')}</select><button class="demo-button" type="button" data-pause-animation aria-pressed="${!!store.still}">${store.still?'Reproducir':'Pausar'}</button></div>`:''}`;
    if(step.demo==='screen-anatomy')demo.querySelector('.monitor-shell').insertAdjacentHTML('beforeend','<button type="button" class="screen-callout" data-screen-area>Zona de imagen</button><span class="screen-callout power">Botón de encendido</span>');
    demo.querySelectorAll('[data-display]').forEach(button=>on(button,'click',()=>{store.display=button.dataset.display;store.power=true;renderScreen(step,store);feedback(store.display==='image'?'La pantalla muestra un dibujo quieto.':store.display==='word'?'Ahora vemos una palabra escrita con letras.':'La pantalla muestra una animación. Compara cómo cambia cada animal.');}));
    if(demo.querySelector('[data-animal]'))on(demo.querySelector('[data-animal]'),'change',event=>{store.animal=event.target.value;renderScreen(step,store);feedback('Elegiste otra animación. ¿Qué partes del animal cambian mientras se mueve?');});
    on(demo.querySelector('.screen-power'),'click',()=>{store.power=!store.power;renderScreen(step,store);feedback(store.power?'Encendimos el monitor del dibujo. Volvemos a ver la información.':'Apagamos solo el monitor del dibujo. Esto no apaga el computador del salón.');});
    if(demo.querySelector('[data-pause-animation]'))on(demo.querySelector('[data-pause-animation]'),'click',()=>{store.still=!store.still;renderScreen(step,store);feedback(store.still?'La animación está en pausa. Ahora podemos observarla quieta.':'La animación vuelve a moverse.');});
    if(demo.querySelector('[data-screen-area]'))on(demo.querySelector('[data-screen-area]'),'click',()=>feedback('La zona de imagen es el lugar donde vemos dibujos, palabras y videos.'));
  }
  function renderPointer(store){
    store.cursor??={x:.5,y:.5};
    const demo=$('demo');demo.innerHTML=`<div class="pointer-arena" id="mouse-practice" tabindex="0" role="group" aria-label="Mueve el cursor dentro de este recuadro">${games.picture('butterfly')}<svg class="pointer" viewBox="0 0 28 34" fill="#fffbe8" stroke="#4d6e46" stroke-width="1.6" aria-hidden="true"><path d="m3 2 3 27 7-9 11-3Z"/></svg><small>Mueve el cursor aquí</small></div>${games.directions()}<p class="demo-caption">El puntero sigue el movimiento de tu mano.</p>`;
    const arena=demo.querySelector('.pointer-arena'),pointer=demo.querySelector('.pointer');
    const update=()=>{pointer.style.left=`${5+store.cursor.x*87}%`;pointer.style.top=`${5+store.cursor.y*78}%`;};update();
    const position=event=>{const box=arena.getBoundingClientRect();store.cursor={x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))};update();};
    on(arena,'pointermove',event=>{if(!paused()&&(event.pointerType==='mouse'||arena.hasPointerCapture(event.pointerId)))position(event);});
    on(arena,'pointerdown',event=>{arena.setPointerCapture(event.pointerId);arena.focus({preventScroll:true});position(event);});
    const move=direction=>{if(paused())return;const [x,y]={left:[-.15,0],right:[.15,0],up:[0,-.15],down:[0,.15]}[direction];store.cursor.x=Math.max(0,Math.min(1,store.cursor.x+x));store.cursor.y=Math.max(0,Math.min(1,store.cursor.y+y));update();feedback(`El puntero se mueve hacia ${{left:'la izquierda',right:'la derecha',up:'arriba',down:'abajo'}[direction]}.`);};
    demo.querySelectorAll('[data-dir]').forEach(button=>on(button,'click',()=>move(button.dataset.dir)));
    document.addEventListener('keydown',event=>{if(paused()||event.ctrlKey||event.metaKey||event.altKey||event.target.closest?.('input, textarea'))return;const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[event.key];if(direction){event.preventDefault();move(direction);}},{signal:signal()});
  }
  function renderMouseAnatomy(store){
    const labels={left:['Botón izquierdo','Con el botón izquierdo solemos elegir y activar elementos.'],right:['Botón derecho','El botón derecho puede abrir opciones del elemento que señalamos.'],wheel:['Rueda','La rueda nos ayuda a recorrer contenido hacia arriba y hacia abajo.']};
    const demo=$('demo');demo.innerHTML=`<div class="mouse-shell"><span class="device-art art-mouse" aria-hidden="true"></span>${Object.entries(labels).map(([id,[label]])=>`<button class="mouse-hotspot ${id}" data-mouse-part="${id}" aria-pressed="${store.selected===id}" type="button">${label}</button>`).join('')}${store.selected?`<span class="mouse-pulse ${store.selected}" aria-hidden="true"></span>`:''}</div><p class="demo-caption">Observa estas partes en el mouse de tu computador.</p>`;
    demo.querySelectorAll('[data-mouse-part]').forEach(button=>on(button,'click',()=>{store.selected=button.dataset.mousePart;renderMouseAnatomy(store);feedback(labels[store.selected][1]);chime();}));
  }
  function renderTyping(step,store){
    const kind=step.demo,model=kind==='space'?'MI SOL':kind==='backspace'?'SOL':null;
    store.text??=kind==='backspace'?'SOLL':'';
    const demo=$('demo');demo.innerHTML=`<div class="typing-demo demo-${kind}"><span class="device-art art-keyboard" role="img" aria-label="Teclado del computador"></span>${model?`<span class="word-model">${model}</span>`:''}<form class="typing-form"><label for="physical-typing">${model?'Sigue el modelo':'Escribe y observa el resultado'}</label><input id="physical-typing" class="typing-input" type="text" maxlength="18" placeholder="Escribe aquí…" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${escape(store.text)}">${kind==='enter'?'<button class="demo-button" type="submit">Confirmar · Enter ↵</button>':''}</form>${games.keyboard()}${kind==='enter'?`<div class="confirmed-word" aria-live="polite">${escape(store.confirmed||'')}</div>`:''}</div>`;
    const input=$('physical-typing');
    const change=()=>{const start=input.selectionStart,end=input.selectionEnd;input.value=games.normalize(input.value);input.setSelectionRange(Math.min(start,input.value.length),Math.min(end,input.value.length));store.text=input.value;feedback(model?(store.text===model?'¡El texto coincide con el modelo!':'Observa las letras y los espacios para seguir el modelo.'):(store.text?`En pantalla aparece: ${store.text}.`:'El campo está vacío. Puedes probar otras teclas.'),store.text===model?'correct':'');chime();};
    games.bindKeyboard(demo.querySelector('.virtual-keyboard'),input,signal(),change);
    on(input,'keydown',event=>{demo.querySelectorAll('[data-key]').forEach(button=>button.classList.toggle('is-last',button.dataset.key===event.key||button.dataset.key===event.key.toLocaleUpperCase('es')));});
    on(demo.querySelector('form'),'submit',event=>{event.preventDefault();if(!store.text.trim()){feedback('Escribe una palabra antes de confirmar.');return;}if(kind==='enter'){store.confirmed=store.text;demo.querySelector('.confirmed-word').textContent=`✓ ${store.text}`;feedback('Confirmaste el texto con Enter o con el botón de la práctica.','correct');renderer.setMood('success');}else feedback('En esta escena seguimos practicando con las letras del modelo.');});
    if(matchMedia('(pointer:fine)').matches){input.focus({preventScroll:true});input.setSelectionRange(input.value.length,input.value.length);}
  }
  function demoContext(step,store,kind){
    games.mount(kind,$('demo'),{store,signal:signal(),extended:false,demo:true,paused,feedback,celebrate,sound:chime,complete:()=>{},restart:()=>{demoStates.delete(step.id);showStep(state.part,state.step,false);}});
  }
  function renderDemo(step){
    demoStates.has(step.id)||demoStates.set(step.id,{});const store=demoStates.get(step.id),demo=$('demo');demo.innerHTML='';
      if(step.demo?.startsWith('explorer-')){window.ExplorerLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
      if(step.demo?.startsWith('second-grade-')){window.SecondGradeLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
    if(step.demo?.startsWith('first-path-')){window.FirstPathLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
    if(step.demo?.startsWith('project-')){window.ProjectLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
    if(step.demo?.startsWith('programming-')){window.ProgrammingFirstLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
    if(step.demo?.startsWith('technology-')){window.TechnologyLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
    if(step.demo?.startsWith('sequence-')){window.SequenceLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime});return;}
    if(step.demo?.startsWith('desktop-')){window.DesktopLessons.render(step,demo,{store,signal:signal(),paused,feedback,celebrate,sound:chime,isSoundEnabled:()=>sound});return;}
    if(['screen','screen-anatomy','screen-motion'].includes(step.demo)){renderScreen(step,store);return;}
    if(step.demo==='pointer'){renderPointer(store);return;}
    if(step.demo==='mouse-anatomy'){renderMouseAnatomy(store);return;}
    if(['typing','space','backspace','enter'].includes(step.demo)){renderTyping(step,store);return;}
    if(step.demo==='context'){demoContext(step,store,'context');return;}
    if(step.demo==='arrows'){demoContext(step,store,'path');return;}
    if(step.demo==='equipment'){
      demo.innerHTML='<div class="equipment-comparison"><figure><div class="desktop-pair"><span class="equipment-art" role="img" aria-label="Torre del computador"></span><span class="device-art art-monitor" aria-hidden="true"></span></div><figcaption>Equipo de escritorio</figcaption></figure><figure><span class="equipment-art art-laptop" role="img" aria-label="Computador portátil"></span><figcaption>Computador portátil</figcaption></figure></div><p class="equipment-note">En el portátil, pantalla y teclado están unidos. El panel táctil permite mover el puntero.</p>';return;
    }
    if(step.demo==='left-click'){
      demo.innerHTML=`<div class="scene-choices">${['sun','flower','apple'].map(id=>`<button class="scene-choice ${store.selected===id?'is-chosen':''}" type="button" data-choose="${id}">${games.picture(id)}${content.pictures.find(item=>item.id===id).name}</button>`).join('')}</div><p class="demo-caption">Apunta, pulsa el botón izquierdo una vez y suéltalo.</p>`;
      demo.querySelectorAll('[data-choose]').forEach(button=>{on(button,'click',()=>{store.selected=button.dataset.choose;renderDemo(step);feedback('Elegiste una imagen con clic izquierdo. Puedes seleccionar otra.','correct');chime();});on(button,'contextmenu',event=>{event.preventDefault();feedback('Ese fue el botón derecho. Para elegir aquí, usa el clic izquierdo.');});});return;
    }
    if(step.demo==='wheel'){
      demo.innerHTML=`<div class="scroll-practice" tabindex="0" role="group" aria-label="Imágenes para recorrer con la rueda">${['sun','moon','butterfly','flower'].map(id=>`<figure>${games.picture(id)}<figcaption>${content.pictures.find(item=>item.id===id).name}</figcaption></figure>`).join('')}<button type="button" class="scene-choice" data-found-apple>${games.picture('apple')}Encontré la manzana</button></div><p class="demo-caption">Gira la rueda con el puntero dentro del recuadro.</p>`;
      on(demo.querySelector('[data-found-apple]'),'click',()=>{feedback('¡La encontraste! La rueda nos permitió ver el contenido que estaba más abajo.','correct');renderer.setMood('success');});return;
    }
    if(step.demo==='drag-demo'){
      demo.innerHTML=`<div class="drag-explainer ${store.still?'is-still':''}"><span class="drag-start">Inicio</span><span class="drag-end">Destino</span><span class="picture pic-apple demo-drag-fruit" aria-hidden="true"></span></div><div class="drag-steps"><span>1. Pulsar y sostener</span><span>2. Mover</span><span>3. Soltar</span></div><button type="button" class="demo-button" data-pause-drag aria-pressed="${!!store.still}">${store.still?'Reproducir demostración':'Pausar demostración'}</button>`;
      on(demo.querySelector('[data-pause-drag]'),'click',()=>{store.still=!store.still;renderDemo(step);});return;
    }
    const verbs={monitor:'Ver información',mouse:'Señalar y elegir',keyboard:'Escribir y dar instrucciones'};
    demo.innerHTML=`<div class="review-overview">${['monitor','mouse','keyboard'].map(id=>`<div class="overview-device">${games.picture(id)}<span>${{monitor:'Pantalla',mouse:'Mouse',keyboard:'Teclado'}[id]}</span><small>${verbs[id]}</small></div>`).join('')}</div><p class="equipment-note">${step.demo==='final-intro'?'Cuatro desafíos nuevos para aplicar lo aprendido.':'¿Cómo usamos cada parte en los juegos de hoy?'}</p>`;
  }
  function openModal(id){if(state.mode==='loading')return;state.paused=true;root.classList.add('is-paused');$(id).showModal();}
  function setMotion(value){state.reducedMotion=value;root.classList.toggle('motion-reduced',value);$('motion-toggle').checked=value;}
  function updateSound(){$('sound-button').setAttribute('aria-pressed',String(sound));$('sound-button').setAttribute('aria-label',sound?'Desactivar sonido':'Activar sonido');}
  $('part-navigation').addEventListener('click',event=>{const button=event.target.closest('[data-part]');if(button&&state.mode!=='loading')showStep(content.parts.findIndex(part=>part.id===button.dataset.part));});
  $('start-button').addEventListener('click',()=>{const extended=document.querySelector('[name="pace"]:checked').value==='extended';if(extended!==state.extended){activityStates.clear();completed.clear();}state.extended=extended;showStep(0,0);chime();});
  $('next-step').addEventListener('click',nextStep);$('previous-step').addEventListener('click',previousStep);
  $('play-again').addEventListener('click',()=>showStep(0,0));
  $('menu-button').addEventListener('click',()=>openModal('game-menu'));
  $('guide-button').addEventListener('click',()=>openModal('class-guide'));
  ['game-menu','class-guide'].forEach(id=>$(id).addEventListener('close',()=>{state.paused=false;root.classList.remove('is-paused');renderer.measure();}));
  $('restart-practice').addEventListener('click',()=>{const step=current();if(!step.game)return;activityStates.delete(step.id);completed.delete(step.id);$('game-menu').close();showStep(state.part,state.step);});
  $('motion-toggle').addEventListener('change',event=>setMotion(event.target.checked));prefersReduced.addEventListener('change',event=>setMotion(event.matches));setMotion(state.reducedMotion);
  $('sound-button').addEventListener('click',()=>{sound=!sound;updateSound();if(sound)chime();});
  $('fullscreen-button').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await root.requestFullscreen();}catch{$('effects-announcement').textContent='Puedes ampliar la ventana del navegador para ver mejor la clase.';}});
  document.addEventListener('fullscreenchange',()=>renderer.resize());
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')&&!document.fullscreenElement&&state.mode!=='loading')openModal('game-menu');});
  async function load(){
    $('retry-load').hidden=true;let core=0,extra=0;
    const extraAssets=content.assets||['assets/learning-pictures-v1.png','assets/equipment-v1.png','assets/animals-v3.png','assets/puzzle-garden-v3.png','assets/puzzle-classroom-v3.png'];
    const progress=()=>$('load-fill').style.width=`${Math.round((core*4+extra)/(4+extraAssets.length)*100)}%`;
    try{
      await Promise.all([renderer.load(fraction=>{core=fraction;progress();}),...extraAssets.map(src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{extra++;progress();resolve();};image.onerror=()=>reject(Error('No se pudo cargar una ilustración.'));image.src=src;}))]);
      await document.fonts.ready;$('loading').hidden=true;
      const params=new URLSearchParams(location.search),index=content.parts.findIndex(part=>part.id===params.get('parte'));state.extended=params.get('ruta')==='ampliada';
      if(index>=0){const stepIndex=content.parts[index].steps.findIndex(step=>step.id===params.get('paso'));showStep(index,Math.max(0,stepIndex),false);}else showIntro();
    }catch{$('load-status').textContent='No pudimos cargar las ilustraciones. Comprueba la conexión local y vuelve a intentar.';$('retry-load').hidden=false;}
  }
  $('retry-load').addEventListener('click',load);
  window.addEventListener('pagehide',()=>{stepController?.abort();renderer.destroy();audio?.close();});
  load();
})();
