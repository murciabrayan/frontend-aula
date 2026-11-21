'use strict';
(() => {
  const E = window.ProgrammingFirst, G = window.ClassGames, D = E.directions;
  const on = (element, event, callback, context) => element?.addEventListener(event, callback, { signal: context.signal });
  const demoMap = { cols: 5, rows: 4, start: [0, 3], flag: [3, 1], blocks: [], puddles: [], flowers: [[4, 3]] };
  async function play(root, map, queue, state, context) {
    if (state.running) return; state.running = true; state.position = [...map.start]; renderCurrent();
    const result = await E.execute(root, map, queue, context, { active: index => { state.active = index; root.querySelectorAll('[data-program-block]').forEach(block => block.classList.toggle('is-active', +block.dataset.programBlock === index)); } });
    state.running = false; state.position = result.position; state.failed = result.failed; state.ran = true; state.active = -1; renderCurrent();
    function renderCurrent() { state.render?.(); }
  }
  function program(step, root, context) {
    const s = context.store; s.queue ??= ['right', 'up', 'right', 'up', 'right']; const map = { ...demoMap, flag: [3, 1] };
    function render() {
      s.render = render;
      root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">${step.id === 'read-order' ? 'ORDEN DE EJECUCIÓN' : 'UN PROGRAMA EN ACCIÓN'}</span>${E.board(map, s.position || map.start)}${E.blockList(s.queue, { active: s.active }, { disabled: s.running })}<div class="program-demo-actions">${step.id === 'read-order' ? '<button class="demo-button" type="button" data-swap>Intercambiar 2 y 3</button>' : ''}<button class="demo-button primary" type="button" data-run ${s.running ? 'disabled' : ''}>Ejecutar desde Inicio ▶</button></div><p class="program-demo-result">${s.ran ? (E.same(s.position, map.flag) ? 'La lista terminó en la bandera.' : `La lista terminó en columna ${s.position[0] + 1}, fila ${s.position[1] + 1}.`) : 'Observa cómo se ilumina una instrucción a la vez.'}</p></div>`;
      on(root.querySelector('[data-run]'), 'click', () => play(root, map, s.queue, s, context), context);
      on(root.querySelector('[data-swap]'), 'click', () => { [s.queue[1], s.queue[2]] = [s.queue[2], s.queue[1]]; s.position = [...map.start]; s.ran = false; render(); context.feedback('Los mismos bloques en otro orden pueden producir otro recorrido.'); }, context);
    }
    render();
  }
  function oneStep(root, context) {
    const s = context.store, map = { cols: 3, rows: 3, start: [1, 1], flag: [2, 0], blocks: [], puddles: [], flowers: [[0, 2]] }; s.position ??= [...map.start];
    function render() {
      root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">UNA FLECHA · UNA CASILLA</span>${E.board(map, s.position)}${E.palette(false)}<p class="program-demo-result">${s.message || 'Cada prueba vuelve a la casilla central.'}</p></div>`;
      root.querySelectorAll('[data-program-add]').forEach(button => on(button, 'click', async () => { if (s.running) return; s.running = true; s.position = [...map.start]; render(); const id = button.dataset.programAdd, to = E.nextPosition(map.start, id); await E.animateMove(root, map.start, to, context); s.position = to; s.message = `${D[id].icon} movió una casilla hacia ${D[id].label.toLowerCase()}.`; s.running = false; render(); }, context));
    }
    render();
  }
  function goal(root, context) {
    const s = context.store, map = { cols: 5, rows: 4, start: [0, 3], flag: [4, 0], blocks: [[2, 2]], puddles: [[3, 1]], flowers: [[0, 0]] };
    root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">LEEMOS EL TABLERO</span>${E.board(map)}<div class="program-legend"><button type="button" data-focus="start"><strong>Inicio</strong><span>Donde comienza</span></button><button type="button" data-focus="goal">${E.art('flag')}<strong>Meta</strong></button><button type="button" data-focus="obstacle">${E.art('puddle')}<strong>No pasar</strong></button></div><p class="program-demo-result">${s.message || 'Elige una pista para encontrarla en el tablero.'}</p></div>`;
    root.querySelectorAll('[data-focus]').forEach(button => on(button, 'click', () => { const kind = button.dataset.focus; root.querySelectorAll('.program-cell').forEach(cell => cell.classList.remove('is-highlighted')); const target = kind === 'start' ? root.querySelector('.program-cell.is-start') : kind === 'goal' ? root.querySelector('.program-art-flag')?.closest('.program-cell') : root.querySelector('.program-cell.is-puddle'); target?.classList.add('is-highlighted'); s.message = kind === 'start' ? 'Aquí empieza toda ejecución.' : kind === 'goal' ? 'La bandera muestra el resultado que buscamos.' : 'El charco bloquea esa casilla; el programa debe rodearlo.'; root.querySelector('.program-demo-result').textContent = s.message; }, context));
  }
  function plan(root, context) {
    const s = context.store, map = { cols: 6, rows: 4, start: [0, 3], envelope: [1, 2], mailbox: [5, 0], blocks: [[2, 2]], puddles: [[3, 1]], bridges: [[4, 2]], flowers: [] };
    root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">ANTES DE PROGRAMAR</span>${E.board(map)}<div class="program-plan-checks">${[['start','1. Encuentra Inicio'],['collect','2. Encuentra el sobre'],['obstacles','3. Mira los obstáculos'],['goal','4. Encuentra el buzón']].map(([id, label]) => `<button type="button" data-plan-check="${id}" aria-pressed="${s.checked?.includes(id)}">${s.checked?.includes(id) ? '✓' : id === 'start' ? '1' : id === 'collect' ? '2' : id === 'obstacles' ? '3' : '4'}<span>${label}</span></button>`).join('')}</div><p class="program-demo-result">${s.checked?.length === 4 ? 'Ya reconocimos la misión. Ahora podemos convertir un camino en bloques.' : 'Observamos la misión antes de pulsar flechas.'}</p></div>`;
    root.querySelectorAll('[data-plan-check]').forEach(button => on(button, 'click', () => { s.checked ??= []; if (!s.checked.includes(button.dataset.planCheck)) s.checked.push(button.dataset.planCheck); plan(root, context); }, context));
  }
  function build(step, root, context) {
    const s = context.store, map = { cols: 5, rows: 3, start: [0, 2], flag: [4, 0], blocks: [], puddles: [], flowers: [[0, 0]] }; s.queue ??= [];
    function add(id) { if (s.running || s.queue.length >= 8) return; s.queue.push(id); s.message = `Agregaste ${D[id].label.toLowerCase()}. La lechuza todavía está en Inicio.`; render(); }
    function render() {
      root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">${step.id === 'execute-program' ? 'CONSTRUIR Y EJECUTAR' : 'NUESTRO PRIMER EDITOR'}</span>${E.board(map, s.position || map.start)}${E.blockList(s.queue, { active: s.active }, { disabled: s.running })}${E.palette(s.running)}<div class="program-demo-actions"><button type="button" class="demo-button" data-delete ${!s.queue.length || s.running ? 'disabled' : ''}>Borrar último</button><button type="button" class="demo-button primary" data-run ${!s.queue.length || s.running ? 'disabled' : ''}>Ejecutar ▶</button></div><p class="program-demo-result">${s.message || 'Usa los botones o las flechas físicas para agregar bloques.'}</p></div>`;
      root.querySelectorAll('[data-program-add]').forEach(button => on(button, 'click', () => add(button.dataset.programAdd), context));
      on(root.querySelector('[data-delete]'), 'click', () => { s.queue.pop(); render(); }, context);
      on(root.querySelector('[data-run]'), 'click', async () => { s.render = render; await play(root, map, s.queue, s, context); s.message = E.same(s.position, map.flag) ? 'El programa llegó a la bandera.' : 'La lista terminó. Podemos agregar, borrar o cambiar bloques.'; render(); }, context);
    }
    E.listenArrows(context, add); render();
  }
  function collect(root, context) {
    const s = context.store, map = { cols: 5, rows: 3, start: [0, 2], envelope: [1, 2], mailbox: [4, 0], blocks: [], puddles: [], flowers: [] }, plans = { A: ['right', 'right', 'up', 'right', 'up', 'right'], B: ['up', 'right', 'right', 'right', 'right', 'up'] }; s.plan ??= 'A';
    function render() { root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">RECOGER ANTES DE ENTREGAR</span>${E.board(map, s.position || map.start, { collected: s.collected })}${E.blockList(plans[s.plan], { active: s.active }, { disabled: s.running })}<div class="program-demo-actions"><button type="button" class="demo-button" data-plan="A" aria-pressed="${s.plan === 'A'}">Plan A</button><button type="button" class="demo-button" data-plan="B" aria-pressed="${s.plan === 'B'}">Plan B</button><button type="button" class="demo-button primary" data-run>Ejecutar plan</button></div><p class="program-demo-result">${s.message || 'Los dos planes llegan al buzón, pero solo uno recoge el sobre.'}</p></div>`; root.querySelectorAll('[data-plan]').forEach(button => on(button, 'click', () => { s.plan = button.dataset.plan; s.position = [...map.start]; s.collected = false; s.message = 'Ahora predice si este plan recoge el sobre.'; render(); }, context)); on(root.querySelector('[data-run]'), 'click', async () => { if (s.running) return; s.running = true; render(); const result = await E.execute(root, map, plans[s.plan], context, { active: index => root.querySelectorAll('[data-program-block]').forEach(block => block.classList.toggle('is-active', +block.dataset.programBlock === index)) }); s.running = false; s.position = result.position; s.collected = result.collected; s.message = result.collected ? 'Este plan recogió el sobre antes de llegar al buzón.' : 'Llegó al buzón, pero dejó el sobre atrás.'; render(); }, context); }
    render();
  }
  function debug(step, root, context) {
    const s = context.store, locate = step.id === 'locate-error', repair = step.id === 'repair-and-retest', map = { cols: 5, rows: 4, start: [0, 3], flag: [3, 0], blocks: [[2, 2]], puddles: [], flowers: [[4, 3]] }; s.queue ??= ['up', 'right', 'right', 'up', 'right', 'up'];
    function render() {
      root.innerHTML = `<div class="program-demo"><span class="program-demo-tag">${repair ? 'CAMBIAR Y VOLVER A PROBAR' : locate ? 'LOCALIZAMOS EL PROBLEMA' : step.id === 'trace-program' ? 'TRAZA PASO A PASO' : 'UNA PRUEBA NOS DA PISTAS'}</span>${E.board(map, s.position || map.start)}${E.blockList(s.queue, { active: s.active, failed: s.failed, selected: s.selected }, { disabled: s.running })}${repair && Number.isInteger(s.selected) ? E.palette(s.running) : ''}<div class="program-demo-actions"><button type="button" class="demo-button primary" data-run>${step.id === 'trace-program' ? 'Siguiente paso' : 'Ejecutar desde Inicio'} ▶</button></div><p class="program-demo-result">${s.message || (locate ? 'Ejecuta y después pulsa el primer bloque que falla.' : repair ? 'Ejecuta, selecciona el error y reemplázalo.' : 'Observa dónde se detiene la ejecución.')}</p></div>`;
      root.querySelectorAll('[data-program-block]').forEach(button => on(button, 'click', () => { if (!s.running) { s.selected = +button.dataset.programBlock; s.message = s.selected === 2 ? 'Elegiste el primer bloque que intenta entrar en la roca.' : 'Ese bloque sí puede moverse. Sigue la traza hasta el primer bloqueo.'; render(); } }, context));
      root.querySelectorAll('[data-program-add]').forEach(button => on(button, 'click', () => { if (s.selected === 2) { s.queue[2] = button.dataset.programAdd; s.message = 'Cambiaste el bloque. Ahora vuelve a ejecutar desde Inicio.'; s.failed = -1; delete s.selected; render(); } }, context));
      on(root.querySelector('[data-run]'), 'click', async () => { if (s.running) return; s.running = true; s.position = [...map.start]; render(); const result = await E.execute(root, map, s.queue, context, { active: index => root.querySelectorAll('[data-program-block]').forEach(block => block.classList.toggle('is-active', +block.dataset.programBlock === index)) }); s.running = false; s.position = result.position; s.failed = result.failed; s.message = result.failed >= 0 ? `La traza se detuvo en el bloque ${result.failed + 1}.` : E.same(s.position, map.flag) ? 'La nueva lista llega a la meta.' : 'La lista terminó en otra casilla.'; render(); }, context);
    }
    render();
  }
  function finalMap(root, context) {
    const map = { cols: 6, rows: 4, start: [0, 3], envelope: [1, 2], mailbox: [5, 0], blocks: [[2, 2]], puddles: [[3, 1]], bridges: [[4, 2]], flowers: [] };
    root.innerHTML = `<div class="program-demo final-preview"><span class="program-demo-tag">CUATRO ESTACIONES DIFERENTES</span>${E.board(map)}<div class="program-station-preview"><span><strong>1</strong>Predecir</span><span><strong>2</strong>Construir</span><span><strong>3</strong>Recoger</span><span><strong>4</strong>Reparar</span></div><p class="program-demo-result">Cada estación cambia el tablero y la tarea.</p></div>`;
  }
  function reflection(root) { root.innerHTML = `<div class="program-reflection"><span>${G.picture('owl')}</span><div><strong>Meta → bloques → ejecución → revisión</strong><p>Podemos contar qué hizo cada flecha y qué cambiamos cuando la primera prueba no funcionó.</p></div></div>`; }
  window.ProgrammingFirstLessons = { render(step, root, context) { const kind = step.demo; if (kind === 'programming-program' || kind === 'programming-order') program(step, root, context); else if (kind === 'programming-one-step') oneStep(root, context); else if (kind === 'programming-goal') goal(root, context); else if (kind === 'programming-plan') plan(root, context); else if (kind === 'programming-build' || kind === 'programming-execute') build(step, root, context); else if (kind === 'programming-collect') collect(root, context); else if (['programming-test', 'programming-trace', 'programming-locate', 'programming-repair'].includes(kind)) debug(step, root, context); else if (kind === 'programming-final-map') finalMap(root, context); else reflection(root); } };
})();
