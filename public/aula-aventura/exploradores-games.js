'use strict';
(() => {
  const G=window.ClassGames,{frame,toolbar,finish,completed,escape}=G.shared;
  const C=window.ClassChallenges ||= {};
  const bind=(node,event,handler,context)=>node?.addEventListener(event,handler,{signal:context.signal});
  function setup(root,context){if(context.store.complete){completed(root,context);return null;}return frame(root,context);}
  const practiceUser = 'LECHUZA';
  const practicePassword = 'SOL7';
  const loginMessage = 'Ingresaste a la academia de práctica con el usuario y la contraseña correctos.';
  const cleanLogin = value => value.toLocaleUpperCase('es').replace(/[^A-ZÑ0-9]/g, '').slice(0, 12);

  function loginFields(prefix, store) {
    return `
      <div class="practice-field">
        <label for="${prefix}-user"><span class="field-title"><span class="kid-ui-icon icon-user" aria-hidden="true"></span>Usuario</span></label>
        <input id="${prefix}-user" name="user" maxlength="12" autocomplete="off" spellcheck="false" value="${escape(store.user || '')}" aria-describedby="${prefix}-error">
      </div>
      <div class="practice-field">
        <label for="${prefix}-password"><span class="field-title"><span class="kid-ui-icon icon-lock" aria-hidden="true"></span>Contraseña</span></label>
        <div class="explorer-password-field">
          <input id="${prefix}-password" name="password" type="password" maxlength="12" autocomplete="off" spellcheck="false" value="${escape(store.password || '')}" aria-describedby="${prefix}-error">
          <button type="button" data-show aria-label="Mostrar contraseña" aria-pressed="false" aria-controls="${prefix}-password">
            <span class="kid-ui-icon icon-eye" aria-hidden="true"></span><span data-password-label>Mostrar</span>
          </button>
        </div>
      </div>
      <p id="${prefix}-error" class="practice-login-error" role="status" hidden></p>
      <button type="submit" class="green-button explorer-confirm"><span class="kid-ui-icon icon-login" aria-hidden="true"></span>Ingresar</button>`;
  }

  function connectLoginForm(form, context, onSuccess) {
    const { store } = context;
    const { user, password } = form.elements;
    const toggle = form.querySelector('[data-show]');
    const error = form.querySelector('.practice-login-error');
    function clearError() {
      form.querySelector('[aria-invalid]')?.removeAttribute('aria-invalid');
      error.hidden = true;
      error.textContent = '';
    }
    function showError(field, message) {
      clearError();
      field.setAttribute('aria-invalid', 'true');
      error.hidden = false;
      error.textContent = message;
      field.focus();
    }
    bind(user, 'input', () => { store.user = cleanLogin(user.value); clearError(); }, context);
    bind(password, 'input', () => { store.password = cleanLogin(password.value); clearError(); }, context);
    bind(toggle, 'click', () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(show));
      toggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      toggle.querySelector('[data-password-label]').textContent = show ? 'Ocultar' : 'Mostrar';
    }, context);
    bind(form, 'submit', event => {
      event.preventDefault();
      store.user = cleanLogin(user.value);
      store.password = cleanLogin(password.value);
      if (store.user !== practiceUser) {
        showError(user, `Escribe ${practiceUser} en Usuario.`);
        return;
      }
      if (store.password !== practicePassword) {
        showError(password, `El usuario está bien. Escribe ${practicePassword} en Contraseña.`);
        return;
      }
      clearError();
      onSuccess();
    }, context);
  }
  function passwordGame(root,context){
    const ui=setup(root,context);if(!ui)return;const s=context.store,models=context.extended?['SOL7','LUNA4','FLOR8']:['SOL7','LUNA4'];s.round??=0;s.text??='';s.visible??=false;s.looked??=false;
    function render(){
      const model=models[s.round];ui.progress(`Clave ficticia ${s.round+1} de ${models.length}`,s.round/models.length);
      ui.body.innerHTML=`<div class="explorer-password-game"><div class="practice-credential"><span class="kid-ui-icon icon-key credential-art" aria-hidden="true"></span><small>MODELO DE PRÁCTICA</small><strong>${model}</strong><span>No es una contraseña real</span></div><form class="explorer-form"><label for="explorer-password-input"><span class="field-title"><span class="kid-ui-icon icon-lock" aria-hidden="true"></span>Copia la contraseña ficticia</span></label><div class="explorer-password-field"><input id="explorer-password-input" type="${s.visible?'text':'password'}" maxlength="12" autocomplete="off" spellcheck="false" value="${escape(s.text)}" aria-describedby="explorer-password-help"><button type="button" data-show aria-label="${s.visible?'Ocultar':'Mostrar'} contraseña" aria-pressed="${s.visible}"><span class="kid-ui-icon icon-eye" aria-hidden="true"></span>${s.visible?'Ocultar':'Mostrar'}</button></div><p id="explorer-password-help">Mírala solo para comprobar y vuelve a ocultarla.</p>${G.compactKeyboard(model)}<button type="submit" class="green-button explorer-confirm"><span class="kid-ui-icon icon-confirm" aria-hidden="true"></span>Comprobar</button></form></div>`;
      const input=ui.body.querySelector('input'),change=()=>{input.value=input.value.toLocaleUpperCase('es').replace(/[^A-ZÑ0-9]/g,'').slice(0,12);s.text=input.value;};
      G.bindKeyboard(ui.body.querySelector('.virtual-keyboard'),input,context.signal,change);bind(ui.body.querySelector('[data-show]'),'click',()=>{s.visible=!s.visible;if(s.visible)s.looked=true;render();queueMicrotask(()=>ui.body.querySelector('input')?.focus({preventScroll:true}));},context);
      bind(ui.body.querySelector('form'),'submit',event=>{event.preventDefault();change();if(s.text!==model){context.feedback('Todavía no coincide. Compara una letra o número a la vez y corrige aquí mismo.','retry');input.focus();return;}if(!s.looked){context.feedback('La escritura coincide. Ahora usa el ojo para verla y comprobarla.','retry');return;}s.roundDone=true;context.feedback('La contraseña ficticia coincide y comprobaste cómo mostrarla.','correct');context.celebrate();toolbar(ui,s.round===models.length-1?'Terminar práctica':'Siguiente contraseña',()=>{if(s.round===models.length-1){finish(root,context,'Escribiste, mostraste y comprobaste contraseñas ficticias.');return;}s.round++;s.text='';s.visible=false;s.looked=false;s.roundDone=false;render();},context.signal);},context);
      if(s.roundDone)toolbar(ui,s.round===models.length-1?'Terminar práctica':'Siguiente contraseña',()=>{if(s.round===models.length-1)finish(root,context,'Escribiste, mostraste y comprobaste contraseñas ficticias.');else{s.round++;s.text='';s.visible=false;s.looked=false;s.roundDone=false;render();}},context.signal);
    }
    render();
  }
  function loginGame(root,context){
    const ui = setup(root, context);
    if (!ui) return;
    ui.progress('Ingreso de práctica', 0);
    ui.body.innerHTML = `<div class="explorer-login-game">
      <aside class="practice-card">
        <span class="kid-ui-icon icon-login practice-card-art" aria-hidden="true"></span>
        <span>DATOS DE PRÁCTICA</span>
        <strong><span class="kid-ui-icon icon-user" aria-hidden="true"></span>Usuario: ${practiceUser}</strong>
        <strong><span class="kid-ui-icon icon-key" aria-hidden="true"></span>Contraseña: ${practicePassword}</strong>
      </aside>
      <form class="practice-login">
        <div class="practice-login-brand"><span class="kid-ui-icon icon-login" aria-hidden="true"></span><strong>Academia de práctica</strong></div>
        ${loginFields('practice-login', context.store)}
      </form>
    </div>`;
    connectLoginForm(ui.body.querySelector('form'), context, () => finish(root, context, loginMessage));
  }
  const toolRounds=[['Dibujar una línea','Lápiz','Pincel','Zoom'],['Quitar la última acción','Deshacer','Forma','Color'],['Mirar una zona más grande','Zoom','Borrador','Pincel'],['Agregar un círculo perfecto','Formas','Deshacer','Lápiz'],['Corregir solo una parte','Borrador','Zoom','Color']];
  function toolsGame(root,context){
    const ui=setup(root,context);if(!ui)return;const s=context.store,rounds=toolRounds.slice(0,context.extended?5:4);s.round??=0;
    function render(){const [task,answer,...others]=rounds[s.round],choices=[answer,...others].sort((a,b)=>a.localeCompare(b));ui.progress(`Herramienta ${s.round+1} de ${rounds.length}`,s.round/rounds.length);ui.body.innerHTML=`<div class="explorer-tool-game"><span class="explorer-tool-picture" aria-hidden="true">🎨</span><p>¿Qué herramienta usarías para <strong>${task.toLocaleLowerCase('es')}</strong>?</p><div>${choices.map(choice=>`<button type="button" data-tool="${escape(choice)}">${escape(choice)}</button>`).join('')}</div></div>`;ui.body.querySelectorAll('[data-tool]').forEach(button=>bind(button,'click',()=>{if(button.dataset.tool!==answer){button.classList.add('is-retry');context.feedback('Esa herramienta hace otra cosa. Vuelve a leer la acción y prueba otra opción.','retry');return;}s.roundDone=true;context.feedback('¡Esa herramienta cumple la acción!', 'correct');context.celebrate();toolbar(ui,s.round===rounds.length-1?'Terminar práctica':'Siguiente herramienta',()=>{if(s.round===rounds.length-1)finish(root,context,'Elegiste herramientas de dibujo según su función.');else{s.round++;s.roundDone=false;render();}},context.signal);},context));if(s.roundDone)toolbar(ui,s.round===rounds.length-1?'Terminar práctica':'Siguiente herramienta',()=>{if(s.round===rounds.length-1)finish(root,context,'Elegiste herramientas de dibujo según su función.');else{s.round++;s.roundDone=false;render();}},context.signal);}
    render();
  }
  function saveOrder(root,context){
    const ui=setup(root,context);if(!ui)return;const s=context.store,steps=['Crear o abrir la carpeta','Hacer el dibujo','Pulsar Guardar','Elegir la carpeta','Escribir un nombre claro','Volver a abrir el archivo'];s.position??=0;s.order??=[];
    function render(){ui.progress(`${s.position} de ${steps.length} pasos`,s.position/steps.length);ui.body.innerHTML=`<div class="explorer-order-game"><p>Construye la ruta para guardar el tesoro digital.</p><ol>${s.order.map(index=>`<li><span>${s.order.indexOf(index)+1}</span>${escape(steps[index])}</li>`).join('')||'<li class="is-empty">El primer paso aparecerá aquí.</li>'}</ol><div>${steps.map((step,index)=>`<button type="button" data-step="${index}" ${s.order.includes(index)?'disabled':''}>${escape(step)}</button>`).join('')}</div></div>`;ui.body.querySelectorAll('[data-step]').forEach(button=>bind(button,'click',()=>{const index=+button.dataset.step;if(index!==s.position){button.classList.add('is-retry');context.feedback('Ese paso ocurre después. Busca qué debemos hacer primero.','retry');return;}s.order.push(index);s.position++;if(s.position===steps.length){context.feedback('La ruta permite guardar y comprobar el archivo.','correct');context.celebrate();toolbar(ui,'Terminar práctica',()=>finish(root,context,'Ordenaste el proceso completo para guardar y recuperar un trabajo.'),context.signal);}render();},context));if(s.position===steps.length)toolbar(ui,'Terminar práctica',()=>finish(root,context,'Ordenaste el proceso completo para guardar y recuperar un trabajo.'),context.signal);}
    render();
  }
  const finalStations=[['Contraseña ficticia','explorer-password-game'],['Inicio de sesión','explorer-login-game'],['Encontrar un programa','desktop-search'],['Crear y guardar','desktop-project']];
  Object.assign(C,{
    'explorer-password-game':passwordGame,
    'explorer-login-game':loginGame,
    'explorer-tools-game':toolsGame,
    'explorer-save-order':saveOrder,
    'exploradores-final':(root,context)=>G.runFinal(root,{...context,finalMessage:'Ingresaste con datos ficticios, encontraste herramientas y guardaste un trabajo digital.'},finalStations),
  });
  function concepts(root,context){
    const cards=[['user','Usuario','Dice qué cuenta intenta entrar.'],['key','Contraseña','Es una llave privada.'],['login','Ingresar','Comprueba los dos datos.']];root.innerHTML=`<div class="explorer-concept-cards">${cards.map(([icon,title,text],index)=>`<button type="button" data-card="${index}"><span class="kid-ui-icon icon-${icon}" aria-hidden="true"></span><strong>${title}</strong><small>${text}</small></button>`).join('')}</div>`;root.querySelectorAll('[data-card]').forEach(button=>bind(button,'click',()=>{root.querySelectorAll('[data-card]').forEach(card=>card.classList.toggle('is-active',card===button));context.feedback(cards[+button.dataset.card][2]);},context));
  }
  function passwordDemo(root,context){
    context.store.text??='';context.store.visible??=false;const s=context.store;
    const render=()=>{root.innerHTML=`<div class="explorer-demo-card"><span class="kid-ui-icon icon-key demo-key-art" aria-hidden="true"></span><span class="practice-badge">EJEMPLO FICTICIO</span><label><span class="field-title"><span class="kid-ui-icon icon-lock" aria-hidden="true"></span>Contraseña</span><div class="explorer-password-field"><input type="${s.visible?'text':'password'}" maxlength="8" value="${escape(s.text)}" autocomplete="off"><button type="button" data-show><span class="kid-ui-icon icon-eye" aria-hidden="true"></span>${s.visible?'Ocultar':'Mostrar'}</button></div></label><p>Modelo: <strong>SOL7</strong></p></div>`;const input=root.querySelector('input');bind(input,'input',()=>{s.text=input.value.toLocaleUpperCase('es').replace(/[^A-Z0-9]/g,'').slice(0,8);context.feedback(s.text==='SOL7'?'Coincide con el modelo. Ahora prueba el botón del ojo.':'Compara cada letra y número con SOL7.',s.text==='SOL7'?'correct':'');},context);bind(root.querySelector('[data-show]'),'click',()=>{s.text=input.value;s.visible=!s.visible;render();context.feedback(s.visible?'Ahora puedes comprobarla. Recuerda ocultarla después.':'La contraseña volvió a quedar oculta.');},context);};render();
  }
  function loginDemo(root,context){
    root.innerHTML = `<div class="explorer-mini-login">
      <div class="mini-login-heading">
        <span class="kid-ui-icon icon-login" aria-hidden="true"></span>
        <span><strong>Academia de práctica</strong><small>Usamos datos inventados para aprender</small></span>
      </div>
      <div class="mini-login-credentials">
        <span><span class="kid-ui-icon icon-user" aria-hidden="true"></span><small>USUARIO</small><strong>${practiceUser}</strong></span>
        <span><span class="kid-ui-icon icon-key" aria-hidden="true"></span><small>CONTRASEÑA</small><strong>${practicePassword}</strong></span>
      </div>
      <form>${loginFields('demo-login', context.store)}</form>
    </div>`;
    connectLoginForm(root.querySelector('form'), context, () => {
      context.celebrate();
      context.confirm({ title: '¡Ingresaste!', message: loginMessage });
    });
  }
  function logoutDemo(root, context) {
    const { store } = context;
    function render() {
      const closed = store.signedOut === true;
      root.innerHTML = `<div class="explorer-mini-login explorer-logout-demo">
        <div class="mini-login-heading">
          <span class="kid-ui-icon icon-${closed ? 'lock' : 'user'}" aria-hidden="true"></span>
          <span><strong>${closed ? 'Sesión de práctica cerrada' : 'Sesión de práctica abierta'}</strong>
          <small>${closed ? 'La academia vuelve a pedir usuario y contraseña.' : `Usuario: ${practiceUser}`}</small></span>
        </div>
        <button type="button" class="${closed ? 'demo-button' : 'green-button'} explorer-confirm">
          ${closed ? 'Volver a practicar' : 'Cerrar sesión'}
        </button>
      </div>`;
      bind(root.querySelector('button'), 'click', () => {
        store.signedOut = !closed;
        render();
        if (!closed) {
          context.celebrate();
          context.confirm({ title: '¡Sesión cerrada!', message: 'La academia volvió a la pantalla de ingreso. El siguiente estudiante ya puede usar el computador.' });
        }
      }, context);
    }
    render();
  }
  function flow(root,context,steps){root.innerHTML=`<div class="explorer-flow">${steps.map((step,index)=>`<button type="button" data-flow="${index}"><span>${index+1}</span>${escape(step)}</button>`).join('')}</div>`;root.querySelectorAll('[data-flow]').forEach(button=>bind(button,'click',()=>{root.querySelectorAll('[data-flow]').forEach((item,index)=>item.classList.toggle('is-active',index<=+button.dataset.flow));context.feedback(`Paso ${+button.dataset.flow+1}: ${steps[+button.dataset.flow]}.`);},context));}
  function toolsDemo(root,context){const tools=[['✏️','Lápiz','Crea un trazo.'],['↶','Deshacer','Quita la última acción.'],['⬭','Formas','Agrega figuras.'],['🔍','Zoom','Acerca la vista.'],['▱','Borrador','Corrige una zona.']];root.innerHTML=`<div class="explorer-tools-demo">${tools.map(([icon,title,text],index)=>`<button type="button" data-tool-demo="${index}"><span>${icon}</span><strong>${title}</strong></button>`).join('')}</div>`;root.querySelectorAll('[data-tool-demo]').forEach(button=>bind(button,'click',()=>context.feedback(tools[+button.dataset.toolDemo][2]),context));}
  window.ExplorerLessons={render(step,root,context){
    if(step.demo==='explorer-concepts')concepts(root,context);
    else if(step.demo==='explorer-password')passwordDemo(root,context);
    else if(step.demo==='explorer-login')loginDemo(root,context);
    else if(step.demo==='explorer-tools')toolsDemo(root,context);
    else if(step.demo==='explorer-session')logoutDemo(root,context);
    else if(step.demo==='explorer-flow')flow(root,context,step.demoProps?.steps||[]);
  }};
})();
