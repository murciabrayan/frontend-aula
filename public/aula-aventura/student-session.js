'use strict';
(() => {
  const {request,activities,escape} = window.AulaAPI,{icon,busy:buttonBusy}=window.AulaUI,$=id=>document.getElementById(id);
  const successDialog = window.ClassGames.shared.createSuccessDialog($('student-app'));
  let definition,stations=[];
  const token=location.hash.slice(1),storageKey=`aula-participacion-v1:${token}`;
  let record=null,session=null,server=null,controller,timer,saveTimer,busy=false,needsSync=false,blocked=false,playing=false,lastSaved='',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statePath=()=>`/api/aula/participations/${session.id}/`;
  const call=(body)=>request(statePath(),{method:body?'POST':'GET',body,credential:record.credential});
  function save(){
    if(!record)return true;
    try{const value=JSON.stringify(record);if(value!==lastSaved){localStorage.setItem(storageKey,value);lastSaved=value;}return true;}
    catch{syncMessage('Deja esta página abierta y pide ayuda a tu profesor.','error',true);return false;}
  }
  function syncMessage(text,state='saved',retry=false){$('sync-message').textContent=text;$('sync-icon').innerHTML=icon(state==='error'?'alert':state==='pending'?'cloud':state==='closed'?'lock':'check');$('participant-sync').dataset.state=state;$('retry-sync').hidden=!retry;}
  function entryMessage(text=''){$('entry-error').hidden=!text;$('entry-error').innerHTML=text?`${icon('info')}<span>${escape(text)}</span>`:'';}
  function feedback(text,type=''){$('student-feedback').innerHTML=text?`${icon(type==='retry'?'info':type==='correct'?'check':'sparkle')}<span>${escape(text)}</span>`:'';$('student-feedback').className=`participant-feedback ${type==='retry'?'is-retry':type==='correct'?'is-correct':''} feedback-pop`;}
  function celebrate(){if(reduced)return;const owl=$('student-app').querySelector('.pic-owl');owl?.animate([{transform:'translateY(0)'},{transform:'translateY(-8px)'},{transform:'translateY(0)'}],{duration:450});}
  function updateProgress(){
    $('participant-progress').textContent=`${server?.percentage||0} %`;
    const count=server?.completed_stations.length||0;
    [...$('participant-stage-track').children].forEach((element,index)=>element.classList.toggle('is-done',index<count));$('participant-stage-track').setAttribute('aria-label',`${count} de ${stations.length} desafíos recibidos por el profesor`);
    if(server?.state==='completed'&&($('student-board').hidden||record?.store?.complete)){
      $('participant-complete').hidden=false;$('completion-message').textContent='Terminaste la actividad. Tu profesor ya recibió tus desafíos. ¡Buen trabajo!';
    }
  }
  function completionEvidence(index,s){
    return definition.evidence(index,s);
  }
  function lockSession(){
    blocked=true;controller?.abort();$('student-board').inert=true;
    if(server?.percentage===100)syncMessage('Tu profesor ya recibió toda tu actividad.');
    else syncMessage('La actividad terminó. Tu profesor conserva el avance que recibió.','closed');
  }
  async function flush(){
    if(busy){needsSync=true;return;}
    if(blocked||!record||!session||!playing)return;
    busy=true;
    try{
      server=await call({action:server?.state==='not_started'?'start':'heartbeat'});
      const done=record.store?.done||[];
      for(let index=0;index<stations.length;index++){
        if(done.includes(index)&&!server.completed_stations.includes(stations[index])){
          server=await call({action:'complete_station',station:stations[index],evidence:completionEvidence(index,record.store.children[index])});
        }
      }
      record.confirmed=server.completed_stations;save();updateProgress();
      syncMessage(server.percentage===100?'¡Todo listo! Tu profesor recibió el 100 %.':`Tu profesor recibió tu avance · ${server.percentage} %`);
    }catch(error){
      if(error.status===410){lockSession();try{const value=await call();server=value.participant;updateProgress();}catch{} }
      else if([401,403,404].includes(error.status)){blocked=true;controller?.abort();$('student-board').inert=true;syncMessage('Pide a tu profesor que revise el enlace de la actividad.','error');}
      else syncMessage('Sin conexión por ahora. Tu avance espera en este equipo.','pending',true);
    }finally{busy=false;if(needsSync){needsSync=false;queueMicrotask(flush);}}
  }
  function mount(){
    controller?.abort();controller=new AbortController();
    const context={
      store:record.store,extended:false,allowRestart:false,signal:controller.signal,paused:()=>blocked||document.hidden||!!document.querySelector('.kid-success-dialog[open]'),
      feedback,celebrate,sound:()=>{},
      restart:()=>{feedback('El profesor conservará los desafíos que ya completaste.');},
      onStationComplete:()=>{save();syncMessage('Guardando tu desafío…','pending');flush();},
      onStationSuccess: (message, next) => successDialog.show({ message, action: 'Siguiente reto', next }),
      complete: () => {
        save();
        $('student-board').hidden = true;
        $('student-feedback').hidden = true;
        $('participant-complete').hidden = false;
        const sent = server?.percentage === 100;
        $('completion-message').textContent = sent ? 'Tu profesor ya recibió todos tus desafíos.' : 'Estamos enviando tus desafíos al profesor.';
        successDialog.show({
          title: '¡Felicidades!',
          message: 'Completaste toda la actividad.',
          action: 'Ver mi resultado',
          next: () => {
            const result = $('participant-complete').querySelector('h2');
            result.tabIndex = -1;
            result.focus();
          },
        });
        flush();
      },
    };
    if(definition.games)window.ClassGames.runFinal($('student-board'),{...context,practiceStations:true,finalMessage:'Completaste los ejercicios de esta parte. Comparte lo que aprendiste con tu profesor.'},definition.games.map((game,index)=>[definition.preview.challenges[index],game]));
    else window.ClassGames.mount(definition.game,$('student-board'),context);
    $('student-board').querySelectorAll('[data-reset],[data-repeat]').forEach(button=>button.hidden=true);
  }
  async function enter(participant){
    server=participant;record.sessionId=session.id;record.name=participant.name;record.confirmed=participant.completed_stations;
    record.store??={};record.store.done??=[];record.store.children??={};
    for(const id of participant.completed_stations){const index=stations.indexOf(id);if(index>=0&&!record.store.done.includes(index))record.store.done.push(index);}
    record.store.stage=stations.findIndex((_,i)=>!record.store.done.includes(i));if(record.store.stage<0)record.store.stage=stations.length-1;
    save();playing=true;$('participant-entry').hidden=true;$('participant-player').hidden=false;
    document.body.dataset.view='activity';$('participant-title').textContent=session.activity.title;$('participant-identity').textContent=`${participant.name} · ${session.group_name}`;
    if(participant.percentage===100){$('student-board').hidden=true;updateProgress();syncMessage('¡Todo listo! Tu profesor recibió el 100 %.');}
    else{mount();updateProgress();}
    if(session.state!=='open'){lockSession();return;}
    if(participant.percentage!==100)await flush();
    clearInterval(timer);clearInterval(saveTimer);timer=setInterval(()=>{if(!document.hidden)flush();},20000);saveTimer=setInterval(save,800);
  }
  async function load(){
    $('retry-entry').hidden=true;$('join-activity').hidden=true;entryMessage();
    if(!/^[A-Za-z0-9_-]{40,64}$/.test(token)){$('entry-title').textContent='Tu actividad te espera';$('entry-description').textContent='Pide a tu profesor el enlace para comenzar.';return;}
    try{
      await window.SecondGradeActivityReady;
      session=await request(`/api/aula/public/${token}/`);
      $('entry-title').textContent=session.activity.activity_title;
      $('entry-group').textContent=session.group_name;
      definition=activities?.[session.activity.version];
      if(!definition||definition.lesson!==session.activity.lesson||definition.stations.join(',')!==session.activity.stations.map(item=>item.id).join(','))throw new Error('Esta actividad utiliza otra versión. Pide al profesor un enlace actualizado.');
      stations=definition.stations;if(definition.game==='desktop-final'||definition.requiresDesktop)await window.DesktopLab.ready();if(definition.requiresSequence)await window.SequenceGames.ready();if(definition.requiresTechnology)await window.TechnologyEngine.ready();if(definition.requiresProject)await window.ProjectEngine.ready();if(definition.requiresProgramming)await window.ProgrammingFirst.ready();if(definition.requiresFirstPath)await window.FirstPath.ready();if(definition.requiresSecondGrade)await window.SecondGrade.ready();
      $('entry-description').textContent=`${stations.length} desafíos para practicar ${session.activity.scope==='part'?session.activity.part_title.toLocaleLowerCase('es'):'lo que aprendimos en clase'}. Escribe tu nombre para comenzar.`;
      $('participant-stage-track').innerHTML=stations.map(()=>'<span></span>').join('');$('participant-stage-track').style.gridTemplateColumns=`repeat(${stations.length},minmax(0,1fr))`;
      $('participant-kind').textContent=session.activity.scope==='part'?`ACTIVIDAD · ${session.activity.part_title.toLocaleUpperCase('es')}`:'ACTIVIDAD FINAL';
      $('participant-player').setAttribute('aria-label',session.activity.activity_title);
      $('completion-badge').textContent=`${stations.length} DESAFÍOS COMPLETADOS`;
      try{const value=JSON.parse(localStorage.getItem(storageKey));if(value&&/^[a-f0-9]{64}$/.test(value.credential))record=value;}catch{}
      if(record?.sessionId){
        try{const value=await call();session=value.session;await enter(value.participant);return;}
        catch(error){if(![401,403,404].includes(error.status))throw error;record=null;localStorage.removeItem(storageKey);}
      }
      if(session.state!=='open'){$('entry-title').textContent='Esta actividad ya terminó';$('entry-description').textContent='Pide a tu profesor un nuevo enlace cuando sea momento de practicar otra vez.';document.querySelector('.welcome-footnote').textContent='Nos vemos en la próxima actividad.';return;}
      if(record?.credential&&record?.name){
        const participant=await request(`/api/aula/public/${token}/join/`,{method:'POST',body:{name:record.name,credential:record.credential}});await enter(participant);return;
      }
      $('join-activity').hidden=false;$('participant-name').focus();
    }catch(error){entryMessage(error.status===404?'No encontramos esta actividad. Pide el enlace a tu profesor.':error.message);$('retry-entry').hidden=false;}
  }
  $('join-activity').addEventListener('submit',async event=>{
    event.preventDefault();const name=$('participant-name').value.trim().replace(/\s+/g,' ');if(!name){entryMessage('Escribe tu nombre para comenzar.');$('participant-name').setAttribute('aria-invalid','true');$('participant-name').focus();return;}
    buttonBusy($('join-button'),true,'Preparando tu actividad…');entryMessage();
    try{
      if(!record?.credential)record={credential:Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join(''),store:{}};
      record.name=name;
      if(!save())throw new Error('No pudimos guardar tu nombre. Pide ayuda a tu profesor.');
      const participant=await request(`/api/aula/public/${token}/join/`,{method:'POST',body:{name,credential:record.credential}});await enter(participant);
    }catch(error){entryMessage(error.message);}
    finally{buttonBusy($('join-button'),false);}
  });
  $('participant-name').addEventListener('input',()=>{$('participant-name').removeAttribute('aria-invalid');entryMessage();});
  function setMotion(value){reduced=value;$('student-app').classList.toggle('reduce-motion',value);$('participant-motion').setAttribute('aria-pressed',String(value));$('participant-motion').setAttribute('aria-label',value?'Permitir movimiento':'Reducir movimiento');$('motion-label').textContent=value?'Sin animación':'Animación';}
  $('participant-motion').addEventListener('click',()=>setMotion(!reduced));setMotion(reduced);
  $('retry-entry').addEventListener('click',load);$('retry-sync').addEventListener('click',flush);
  window.addEventListener('online',flush);window.addEventListener('hashchange',()=>location.reload());
  window.addEventListener('pagehide',()=>{save();clearInterval(timer);clearInterval(saveTimer);controller?.abort();});
  document.addEventListener('visibilitychange',()=>{save();if(!document.hidden)flush();});
  load();
})();
