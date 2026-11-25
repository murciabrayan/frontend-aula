'use strict';
(() => {
  if (!window.AulaAPI || !window.AulaUI) return;
  const {request,ApiError,escape,hasTeacherSession,clearTeacherSession}=window.AulaAPI,{icon,busy}=window.AulaUI,$=id=>document.getElementById(id);
  const activitiesReady = Promise.resolve(window.SecondGradeActivityReady).then(() => null, error => error);
  let user=null,sessions=[],selected=/^[a-f0-9-]{36}$/.test(location.hash.slice(1))?location.hash.slice(1):null,current=null,timer,noticeTimer,loadingId=null,detailSeq=0,detailKey='',authEpoch=0;
  const teacher=(path,options={})=>request(`/api/aula/${path}`,{...options,teacher:true});
  function returnToRequestedPage(){
    const params=new URLSearchParams(location.search),raw=params.get('volver');
    const base=location.pathname.slice(0,location.pathname.lastIndexOf('/')+1);
    const allowed=new Set(['grados','exploradores','leccion','escritorio','instrucciones','tecnologia','programacion-flechas','continuacion-primero','continuacion-segundo','continuacion-tercero','proyecto']);
    if(raw){
      const target=new URL(raw,location.href),relative=target.pathname.startsWith(base)?target.pathname.slice(base.length).replace(/\.html$/,''):'';
      const catalog=/^grado\/[1-5](?:\/clase\/[a-z0-9-]+)?\/?$/.test(relative);
      if(target.origin===location.origin&&target.pathname.startsWith(base)&&(allowed.has(relative)||catalog)){location.replace(target.href.replace(/\.html(?=[?#]|$)/,''));return true;}
    }
    const explicitSessions=params.get('panel')==='sesiones'||params.has('crear')||/^[a-f0-9-]{36}$/.test(location.hash.slice(1));
    if(explicitSessions)return false;
    location.replace('grados');return true;
  }
  const stamp=value=>new Date(value).toLocaleString('es-CO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const stateLabel=state=>({open:'Abierta',closed:'Cerrada',expired:'Vencida'}[state]||'');
  function populateActivityOptions() {
    const select = $('session-lesson');
    if (select.options.length) return;
    const published = window.PublishedClassActivities();
    const {grades, releasedGrades} = window.ClassroomCatalog;
    const finalOptions = document.createElement('optgroup');
    finalOptions.label = 'Actividades finales';
    select.append(finalOptions);
    function addActivities(item, grade) {
      if (published.some(activity => activity.lesson === item.id)) {
        finalOptions.append(new Option(`${grade} · ${item.title}`, item.id));
      }
      const activities = published.filter(activity => activity.parentLesson === item.id &&
        (grade !== 'Segundo' || item.parts.some(part => part.id === activity.part)));
      if (!activities.length) return;
      const group = document.createElement('optgroup');
      group.label = `Por parte · ${item.title}`;
      for (const activity of activities) group.append(new Option(activity.preview.title, activity.lesson));
      select.append(group);
    }
    for (const grade of grades.filter(grade => releasedGrades.includes(grade.id))) {
      grade.classes.filter(item => item.available).forEach(item => addActivities(item, grade.name));
    }
    addActivities({ id: 'escritorio', title: 'El escritorio y sus iconos' }, 'Primero');
  }
  function notice(text='',error=false){
    clearTimeout(noticeTimer);const element=$('teacher-status');element.hidden=!text;if(!text)return;
    element.classList.toggle('is-error',error);element.innerHTML=`<span class="notice-symbol">${icon(error?'alert':'check')}</span><p>${escape(text)}</p><button class="toast-dismiss" type="button" aria-label="Cerrar mensaje">${icon('close')}</button>`;
    if(!error)noticeTimer=setTimeout(()=>element.hidden=true,5500);
  }
  $('teacher-status').addEventListener('click',event=>{if(event.target.closest('.toast-dismiss'))$('teacher-status').hidden=true;});
  function emptyWorkspace(){
    return `<div class="workspace-empty"><span class="empty-owl" aria-hidden="true"></span><span class="section-kicker">APRENDAMOS JUNTOS</span><h2>Todo listo para tu próxima clase</h2><p>Crea una sesión y comparte los ejercicios.<br>Los avances de tu grupo aparecerán aquí.</p><button class="session-primary" type="button" data-open-create>${icon('plus')} Crear mi primera sesión</button></div>`;
  }
  function loginRequired(text=''){
    clearTimeout(timer);authEpoch++;detailSeq++;loadingId=null;user=null;sessions=[];selected=null;current=null;detailKey='';
    $('session-list').replaceChildren();$('session-list-count').textContent='0';$('session-detail').innerHTML=emptyWorkspace();
    $('teacher-name').textContent='';$('teacher-login').hidden=false;$('teacher-workspace').hidden=true;document.body.classList.remove('is-authenticated');
    if($('create-session').open)$('create-session').close();notice(text);
  }
  function handle(error){
    if(error.status===401){clearTeacherSession();loginRequired();notice('Tu sesión terminó. Ingresa de nuevo para continuar.',true);return;}
    if(error.status===403){clearTeacherSession();loginRequired();notice('Esta sección requiere una cuenta activa de profesor o administrador.',true);return;}
    if($('create-session').open){$('create-session-error').innerHTML=`${icon('alert')}<span>${escape(error.message)}</span>`;$('create-session-error').hidden=false;return;}
    notice(error.message,true);
  }
  function updateActivityPreview(){
    const definition=window.PublishedClassActivities().find(value=>value.lesson===$('session-lesson').value);
    $('activity-preview-title').textContent=definition?.preview.title||'Actividad final de la clase';
    $('activity-preview-challenges').innerHTML=(definition?.preview.challenges||[]).map((title,index)=>`<li><span>${index+1}</span>${escape(title)}</li>`).join('');
    $('activity-preview-note').textContent=definition?.part?`Ejercicios de esta parte: ingresan con su nombre, sin cuenta. El avance depende de los ${definition.stations.length} desafíos completados.`:'Solo el taller final: ingresan con su nombre, sin cuenta. Cada desafío completado suma un 25 % al seguimiento.';
  }
  function openCreate(){$('create-session-error').hidden=true;updateActivityPreview();if(!$('create-session').open)$('create-session').showModal();requestAnimationFrame(()=>$('session-group').focus());}
  function confirmAction(kind){
    const deleting=kind==='delete',dialog=$('session-confirm');dialog.returnValue='cancel';dialog.classList.toggle('is-danger',deleting);
    $('confirm-symbol').innerHTML=icon(deleting?'trash':'lock');$('confirm-title').textContent=deleting?'¿Eliminar esta sesión?':'¿Terminamos la actividad?';
    $('confirm-description').textContent=deleting?'Se eliminarán los nombres y avances de este grupo en esta sesión. Esta acción no se puede deshacer.':'El enlace dejará de recibir estudiantes y nuevos avances. Podrás seguir consultando todos los resultados guardados.';
    $('confirm-session-action').textContent=deleting?'Sí, eliminar sesión':'Sí, cerrar el enlace';$('confirm-session-action').className=deleting?'session-danger is-filled':'session-primary';
    return new Promise(resolve=>{dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});
  }
  function renderList(){
    $('session-list-count').textContent=sessions.length;
    $('session-list').innerHTML=sessions.length?sessions.map(item=>`<button type="button" class="session-list-button" data-session="${item.id}" aria-current="${item.id===selected}"><span class="list-session-icon">${icon('book')}</span><span class="session-list-copy"><strong>${escape(item.group_name)}</strong><small>${escape(item.activity.title)}</small><span class="session-list-meta"><span class="session-state-dot ${item.state==='open'?'':'is-closed'}"></span>${stateLabel(item.state)} · ${stamp(item.created_at)}</span></span></button>`).join(''):'<p class="list-empty">Aquí encontrarás las sesiones que compartas con tus grupos.</p>';
  }
  async function refreshList(){const epoch=authEpoch,result=await teacher('sessions/');if(epoch!==authEpoch||!user)return;sessions=result;renderList();}
  function shareLink(item){const url=new URL('alumno',location.href);url.hash=item.join_token;return url.href;}
  function renderDetail(item){
    const key=`${item.id}:${item.state}`;
    if(detailKey!==key){
      detailKey=key;
      const linkNote = window.AULA_CONFIG?.localPreview
        ? '<p class="copy-link-note">Enlace de prueba para este computador.</p>'
        : '';
      $('session-detail').innerHTML=`<div class="detail-heading"><div><span class="section-kicker">${escape(item.activity.grade).toUpperCase()} · ${item.activity.scope==='part'?'ACTIVIDAD POR PARTE':'ACTIVIDAD FINAL'}</span><h2>${escape(item.group_name)}</h2><p>${escape(item.activity.title)}</p></div><span class="session-badge ${item.state==='open'?'':'is-closed'}">${stateLabel(item.state)}</span></div>
        <div class="share-box"><div class="share-top"><span class="share-symbol">${icon('link')}</span><div><strong>${item.state==='open'?'Invita a tu grupo':'El enlace está cerrado'}</strong><small>${item.state==='open'?`Disponible hasta ${stamp(item.expires_at)}`:'Puedes seguir consultando los resultados.'}</small></div></div><div class="share-row"><input id="student-link" readonly value="${escape(shareLink(item))}" aria-label="Enlace para los estudiantes"><button id="copy-student-link" class="session-primary" type="button" ${item.state==='open'?'':'disabled'}>${icon('copy')}<span>Copiar enlace</span></button></div>${linkNote}<p id="copy-link-note" class="copy-link-note"></p></div>
        <div class="session-stats"><div class="session-stat"><span class="stat-icon">${icon('people')}</span><strong id="joined-count">0</strong><span>Ingresaron</span></div><div class="session-stat"><span class="stat-icon">${icon('check')}</span><strong id="completed-count">0</strong><span>Completaron</span></div><div class="session-stat"><span class="stat-icon">${icon('clock')}</span><strong id="pending-count">0</strong><span>Pendientes</span></div></div>
        <div class="progress-heading"><h3>Así va el grupo</h3><button id="refresh-participants" class="session-secondary" type="button">${icon('refresh')} Actualizar</button></div><p id="refresh-note" class="refresh-note" role="status"></p><div id="participants-view"></div>
        <details class="tracking-help"><summary>${icon('info')} ¿Qué significa este avance?</summary><p>El avance corresponde a los ${item.activity.stations.length} desafíos de esta actividad; cada uno aporta una parte del total. Los nombres iguales se distinguen por su número de participación. Si un estudiante deja de comunicarse, su avance se conserva.</p></details><div class="session-actions"><button id="close-session" class="session-secondary" type="button" ${item.state==='open'?'':'disabled'}>${icon('lock')} Cerrar el enlace</button><button id="delete-session" class="session-danger" type="button">${icon('trash')} Eliminar sesión</button></div>`;
    }
    const total=item.summary.joined,done=item.summary.completed;
    $('joined-count').textContent=total;$('completed-count').textContent=done;$('pending-count').textContent=total-done;
    const now=new Date(item.server_time).getTime();
    $('refresh-note').innerHTML=`<span class="live-dot ${item.state==='open'?'':'is-closed'}"></span><span>${item.state==='open'?'Se actualiza automáticamente':'Sesión finalizada'} · ${new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>`;
    $('participants-view').innerHTML=total?`<div class="participant-table-wrap"><table class="participant-table"><thead><tr><th scope="col">Estudiante</th><th scope="col">Avance</th><th scope="col">Actividad</th><th scope="col">Conexión</th></tr></thead><tbody>${item.participants.map(p=>{
      const elapsed=Math.max(0,Math.round((now-new Date(p.last_seen_at).getTime())/1000)),recent=elapsed<75;
      return `<tr data-participant="${p.id}"><td><div class="table-name-group"><span class="participant-avatar tone-${p.number%4}" aria-hidden="true">${escape(p.name.slice(0,1).toLocaleUpperCase('es'))}</span><span><span class="participant-name">${escape(p.name)}</span><span class="participant-id">Participación ${String(p.number).padStart(2,'0')}</span></span></div></td><td class="participant-progress"><div class="progress-number"><strong>${p.percentage} %</strong><span class="progress-fraction">${p.completed_stations.length} de ${p.total_stations}</span></div><progress max="100" value="${p.percentage}" aria-label="Avance de ${escape(p.name)}: ${p.percentage} por ciento"></progress></td><td><span class="participant-state ${p.state==='completed'?'is-done':p.state==='not_started'?'is-idle':''}">${p.state==='completed'?icon('check'):''}${{completed:'Completado',in_progress:'En curso',not_started:'Sin iniciar'}[p.state]}</span><span class="participant-current">${escape(p.current_station?.title||'Terminó la actividad')}</span></td><td class="communication-cell">${recent?'Hace unos segundos':`Hace ${Math.max(1,Math.round(elapsed/60))} min`}${!recent&&item.state==='open'?'<small>Sin conexión reciente</small>':''}</td></tr>`;
    }).join('')}</tbody></table></div>`:'<div class="empty-session"><span class="empty-owl" aria-hidden="true"></span><h3>Esperando a tu grupo</h3><p>Comparte el enlace. Los nombres y avances<br>aparecerán aquí cuando ingresen.</p></div>';
  }
  async function refreshDetail(){
    if(!selected||loadingId===selected)return;
    const id=selected,epoch=authEpoch,seq=++detailSeq;loadingId=id;
    try{const item=await teacher(`sessions/${id}/`);if(id!==selected||epoch!==authEpoch||seq!==detailSeq||!user)return;current=item;renderDetail(item);const listItem=sessions.find(value=>value.id===id);if(listItem&&listItem.state!==item.state){listItem.state=item.state;renderList();}}
    catch(error){if(epoch!==authEpoch||seq!==detailSeq)return;if(error.status===404){current=null;detailKey='';$('session-detail').innerHTML=emptyWorkspace();await refreshList();}else handle(error);}
    finally{if(seq===detailSeq)loadingId=null;}
  }
  function schedule(){clearTimeout(timer);if(!user)return;timer=setTimeout(async()=>{if(!document.hidden)await refreshDetail();schedule();},8000);}
  async function select(id){selected=id;current=null;detailKey='';$('session-detail').innerHTML='<div class="session-loading" role="status"><span class="ui-spinner" aria-hidden="true"></span><p>Cargando los avances del grupo…</p></div>';history.replaceState(null,'',`${location.pathname}${location.search}#${id}`);renderList();await refreshDetail();schedule();}
  async function loadWorkspace(){
    const epoch=authEpoch,identity=await teacher('me/', { signal: AbortSignal.timeout(8000) });if(epoch!==authEpoch)return;
    if (!['ADMIN','TEACHER'].includes(identity?.role)) throw new ApiError('Acceso docente requerido.', 403);
    if(returnToRequestedPage())return;
    const activityError = await activitiesReady;
    if(epoch!==authEpoch)return;
    populateActivityOptions();
    user=identity;$('teacher-login').hidden=true;$('teacher-workspace').hidden=false;document.body.classList.add('is-authenticated');$('teacher-name').textContent=user.name;$('teacher-avatar').textContent=user.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toLocaleUpperCase('es');notice();
    await refreshList();if(epoch!==authEpoch||!user)return;
    const requestedSession = location.hash.slice(1);
    if (/^[a-f0-9-]{36}$/.test(requestedSession)) selected = requestedSession;
    if(!sessions.some(item=>item.id===selected))selected=sessions[0]?.id||null;
    if(selected)await select(selected);else $('session-detail').innerHTML=emptyWorkspace();
    const requested=new URLSearchParams(location.search).get('crear');
    if (requested) {
      if ([...$('session-lesson').options].some(option => option.value === requested)) {
        $('session-lesson').value = requested;
        openCreate();
      } else notice('La actividad solicitada todavía no está disponible para compartir.', true);
    } else if (activityError) notice(activityError.message, true);
    schedule();
  }
  async function enterWith(tokens) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    window.dispatchEvent(new Event('auth-change'));
    await loadWorkspace();
  }
  if (window.AULA_CONFIG?.localPreview) {
    $('teacher-login-form').hidden = true;
    $('institutional-login-note').hidden = true;
    $('local-preview-login').hidden = false;
    const localLogin = $('preview-teacher-login');
    localLogin.addEventListener('click', async () => {
      authEpoch++;
      busy(localLogin, true, 'Abriendo el aula…');
      notice();
      try {
        await enterWith(await request('/api/aula-preview/sign-in/', { method: 'POST', body: {} }));
      } catch (error) {
        handle(error);
      } finally {
        busy(localLogin, false);
      }
    });
  }
  $('teacher-login-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.submitter;
    const email=$('teacher-email'),password=$('teacher-password');
    if(!email.value.trim()||email.validity.typeMismatch){email.setAttribute('aria-invalid','true');notice('Escribe tu correo institucional para continuar.',true);email.focus();return;}
    if(!password.value){password.setAttribute('aria-invalid','true');notice('Escribe tu contraseña para ingresar.',true);password.focus();return;}
    authEpoch++;
    busy(button,true,'Ingresando…');notice();
    try{
      const data=await request('/api/token/',{method:'POST',body:{email:$('teacher-email').value.trim(),password:$('teacher-password').value}});
      if(data.user&&!['ADMIN','TEACHER'].includes(data.user.role))throw new Error('Esta sección es para profesores y administradores.');
      if(data.user?.must_change_password)throw new Error('Primero debes cambiar la contraseña temporal desde la plataforma principal. Después podrás ingresar al aula.');
      $('teacher-password').value='';$('teacher-password').type='password';$('show-password').setAttribute('aria-pressed','false');$('show-password').setAttribute('aria-label','Mostrar contraseña');$('show-password').innerHTML=icon('eye');await enterWith(data);
    }catch(error){notice(error.status===401?'Revisa tu correo y contraseña e inténtalo otra vez.':error.message,true);}finally{busy(button,false);}
  });
  $('teacher-login-form').querySelector('button[type="submit"]').disabled = false;
  $('teacher-login-fallback').hidden = true;
  $('show-password').addEventListener('click',()=>{const visible=$('teacher-password').type==='password';$('teacher-password').type=visible?'text':'password';$('show-password').innerHTML=icon(visible?'eyeOff':'eye');$('show-password').setAttribute('aria-pressed',String(visible));$('show-password').setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');});
  $('teacher-logout').addEventListener('click',()=>{clearTeacherSession();loginRequired('Sesión cerrada. Tu trabajo quedó guardado.');});
  window.addEventListener('storage', event => {
    if ([null, 'access_token', 'refresh_token'].includes(event.key) && !hasTeacherSession()) loginRequired('Sesión cerrada.');
  });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  $('new-session').addEventListener('click',openCreate);
  $('session-lesson').addEventListener('change',updateActivityPreview);
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.closeDialog).close()));
  $('create-session-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.submitter;
    if(!$('session-group').value.trim()){$('create-session-error').innerHTML=`${icon('info')}<span>Escribe el nombre de tu grupo para crear la sesión.</span>`;$('create-session-error').hidden=false;$('session-group').setAttribute('aria-invalid','true');$('session-group').focus();return;}
    busy(button,true,'Creando enlace…');$('create-session-error').hidden=true;
    try{const item=await teacher('sessions/',{method:'POST',body:{lesson:$('session-lesson').value,group_name:$('session-group').value.trim(),duration_hours:Number($('session-duration').value)}});await refreshList();await select(item.id);$('create-session').close();notice('¡Sesión lista! Copia el enlace e invita a tu grupo.');$('copy-student-link').focus();}
    catch(error){handle(error);}finally{busy(button,false);}
  });
  ['teacher-email','teacher-password','session-group'].forEach(id=>$(id).addEventListener('input',()=>{$(id).removeAttribute('aria-invalid');if(id==='session-group')$('create-session-error').hidden=true;else notice();}));
  $('session-list').addEventListener('click',async event=>{const button=event.target.closest('[data-session]');if(button)await select(button.dataset.session);});
  $('session-detail').addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-open-create')){openCreate();return;}if(!current)return;
    if(button.id==='copy-student-link'){
      const input=$('student-link');try{await navigator.clipboard.writeText(input.value);button.innerHTML=`${icon('check')}<span>Copiado</span>`;$('copy-link-note').textContent='Ya puedes compartirlo con el grupo.';setTimeout(()=>{if(button.isConnected)button.innerHTML=`${icon('copy')}<span>Copiar enlace</span>`;},2500);}catch{input.focus();input.select();$('copy-link-note').textContent='Pulsa Ctrl+C para copiar el enlace seleccionado.';}return;
    }
    if(button.id==='refresh-participants'){busy(button,true,'Actualizando');await refreshDetail();busy(button,false);return;}
    if(button.id==='close-session'){
      if(!await confirmAction('close'))return;
      busy(button,true,'Cerrando…');try{await teacher(`sessions/${current.id}/close/`,{method:'POST',body:{}});await refreshList();await refreshDetail();notice('Enlace cerrado. Los resultados siguen disponibles.');}catch(error){busy(button,false);handle(error);}return;
    }
    if(button.id==='delete-session'){
      if(!await confirmAction('delete'))return;
      busy(button,true,'Eliminando…');try{await teacher(`sessions/${current.id}/`,{method:'DELETE'});selected=null;current=null;detailKey='';history.replaceState(null,'',location.pathname);await refreshList();if(sessions.length)await select(sessions[0].id);else $('session-detail').innerHTML=emptyWorkspace();notice('La sesión y sus resultados fueron eliminados.');}catch(error){busy(button,false);handle(error);}
    }
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user)refreshDetail();});
  window.addEventListener('pagehide',()=>{clearTimeout(timer);clearTimeout(noticeTimer);});
  const accessParams = new URLSearchParams(location.search);
  loginRequired();
  const accessReason = accessParams.get('motivo');
  if (accessReason === 'sesion') notice('Tu sesión terminó. Ingresa de nuevo para continuar.', true);
  else if (accessReason === 'permiso') notice('Ingresa con una cuenta activa de profesor o administrador.', true);
  else if (accessParams.has('salida')) notice('Sesión cerrada.');

  if (!accessParams.has('reingresar') && hasTeacherSession()) {
    const epoch = authEpoch;
    loadWorkspace().catch(error => {
      if (epoch !== authEpoch) return;
      loginRequired();
      handle(error);
    });
  }
})();
