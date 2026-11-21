'use strict';
(() => {
  const G = window.ClassGames, E = window.ProgrammingFirst;
  const { frame, toolbar, finish, completed } = G.shared;
  const D = E.directions;
  const choiceLevels = [
    { start: [1, 2], goal: [2, 2], direction: 'right' }, { start: [2, 2], goal: [2, 1], direction: 'up' },
    { start: [2, 1], goal: [1, 1], direction: 'left' }, { start: [1, 1], goal: [1, 2], direction: 'down' },
    { start: [0, 2], goal: [1, 2], direction: 'right' }, { start: [3, 1], goal: [3, 2], direction: 'down' },
  ];
  const predictLevels = [
    { cols: 5, rows: 4, start: [0, 3], flag: [3, 2], queue: ['right', 'right', 'up', 'right'], options: [[3, 2], [2, 1], [4, 3]], blocks: [], puddles: [], flowers: [[1, 1]] },
    { cols: 5, rows: 4, start: [4, 0], flag: [1, 2], queue: ['left', 'down', 'left', 'down', 'left'], options: [[1, 2], [2, 3], [0, 1]], blocks: [[3, 3]], puddles: [], flowers: [[4, 3]] },
    { cols: 6, rows: 4, start: [1, 3], flag: [5, 1], queue: ['up', 'right', 'right', 'up', 'right', 'right'], options: [[5, 1], [4, 0], [3, 2]], blocks: [], puddles: [], flowers: [[0, 0]] },
  ];
  const courierLevels = [
    { cols: 5, rows: 4, start: [0, 3], envelope: [1, 2], mailbox: [4, 0], blocks: [[2, 2], [2, 1]], puddles: [[3, 3]], bridges: [], flowers: [[0, 0]], max: 10 },
    { cols: 6, rows: 4, start: [5, 3], envelope: [3, 2], mailbox: [0, 0], blocks: [[4, 1], [2, 1], [2, 0]], puddles: [[1, 2]], bridges: [], flowers: [[5, 0]], max: 12 },
    { cols: 6, rows: 5, start: [0, 4], envelope: [2, 3], mailbox: [5, 0], blocks: [[1, 2], [3, 3], [4, 1]], puddles: [[3, 1]], bridges: [[4, 2]], flowers: [[0, 0]], max: 14 },
  ];
  const berryLevels = [
    { cols: 6, rows: 4, start: [0, 3], berries: [1, 2], flag: [5, 1], blocks: [[2, 3], [4, 0]], puddles: [[3, 2], [4, 2]], bridges: [[3, 1]], flowers: [[5, 3]], max: 10, requireBridge: [3, 1] },
    { cols: 6, rows: 5, start: [5, 4], berries: [4, 2], flag: [0, 0], blocks: [[3, 3], [2, 1]], puddles: [[1, 2], [2, 2], [3, 2]], bridges: [[2, 3]], flowers: [[5, 0]], max: 18, requireBridge: [2, 3] },
    { cols: 7, rows: 5, start: [0, 4], berries: [2, 4], flag: [6, 0], blocks: [[3, 3], [5, 1]], puddles: [[3, 2], [4, 2], [5, 2]], bridges: [[4, 1]], flowers: [[0, 0]], max: 14, requireBridge: [4, 1] },
  ];
  const traceLevels = [
    { cols: 5, rows: 4, start: [0, 3], flag: [4, 0], blocks: [[2, 2]], puddles: [], flowers: [], queue: ['up', 'right', 'right', 'up', 'right'], fault: 2 },
    { cols: 6, rows: 4, start: [5, 0], flag: [0, 3], blocks: [[3, 1]], puddles: [[1, 1]], flowers: [], queue: ['left', 'down', 'left', 'left', 'down'], fault: 2 },
    { cols: 6, rows: 5, start: [0, 4], flag: [5, 0], blocks: [[2, 3]], puddles: [[4, 3]], flowers: [], queue: ['right', 'right', 'up', 'right', 'right', 'up'], fault: 2 },
  ];
  const repairLevels = [
    { cols: 5, rows: 4, start: [0, 3], flag: [3, 0], blocks: [[2, 2]], puddles: [], flowers: [[4, 3]], queue: ['up', 'right', 'right', 'up', 'right', 'right'], fault: 2, correct: 'up' },
    { cols: 6, rows: 4, start: [5, 3], flag: [1, 0], blocks: [[3, 2]], puddles: [[0, 2]], flowers: [], queue: ['up', 'left', 'left', 'left', 'up', 'left', 'left'], fault: 2, correct: 'up' },
    { cols: 6, rows: 5, start: [0, 0], flag: [3, 4], blocks: [[2, 1], [4, 3]], puddles: [], flowers: [[5, 0]], queue: ['down', 'right', 'right', 'down', 'right', 'right', 'down'], fault: 2, correct: 'down' },
  ];
  const finalPredict = { cols: 6, rows: 4, start: [0, 0], flag: [5, 3], queue: ['down', 'right', 'right', 'down', 'right', 'down', 'right', 'right'], options: [[5, 3], [4, 2], [3, 3]], blocks: [], puddles: [], flowers: [[5, 0]] };
  const finalCourier = { cols: 6, rows: 5, start: [0, 4], envelope: [1, 3], mailbox: [5, 0], blocks: [[2, 2], [4, 1]], puddles: [[3, 3]], bridges: [[3, 2]], flowers: [], max: 12, requireBridge: [3, 2] };
  const finalBerries = { cols: 7, rows: 5, start: [6, 4], berries: [5, 3], flag: [0, 0], blocks: [[4, 2], [2, 1]], puddles: [[1, 3], [2, 3], [3, 3]], bridges: [[2, 2]], flowers: [[6, 0]], max: 18, requireBridge: [2, 2] };
  const finalRepair = { cols: 6, rows: 5, start: [0, 4], flag: [5, 2], blocks: [[3, 4]], puddles: [[1, 1]], flowers: [], queue: ['right', 'right', 'right', 'right', 'right', 'up', 'right'], fault: 2, correct: 'up' };
  const bind = (root, selector, event, callback, context) => root.querySelectorAll(selector).forEach(element => element.addEventListener(event, callback, { signal: context.signal }));
  function setup(root, context) { if (context.store.complete) { completed(root, context); return null; } return frame(root, context); }
  function advance(root, context, ui, state, count, reset, message) {
    toolbar(ui, state.round === count - 1 ? 'Terminar práctica ✓' : 'Siguiente tablero →', () => {
      state.solved = state.round + 1;
      if (state.round === count - 1) { finish(root, context, message); return; }
      state.round++; reset();
    }, context.signal);
  }
  function blockChoice(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = choiceLevels.slice(0, context.extended ? 6 : 4); s.round ??= 0; let running = false;
    function render() {
      const level = levels[s.round], map = { cols: 4, rows: 4, start: level.start, flag: level.goal, blocks: [], puddles: [], flowers: [[0, 0]] };
      ui.progress(`Flecha ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="program-choice-layout"><div><p class="program-task">¿Qué bloque lleva a la lechuza hasta la bandera?</p>${E.board(map, level.start)}</div>${E.palette(running || s.ready)}</div>`;
      bind(ui.body, '[data-program-add]', 'click', event => choose(event.currentTarget.dataset.programAdd), context); ui.toolbar.innerHTML = ''; if (s.ready) advance(root, context, ui, s, levels.length, () => { s.ready = false; render(); }, 'Relacionaste cada flecha con su movimiento en la pantalla.');
    }
    async function choose(id) {
      if (context.paused() || running || s.ready) return; const level = levels[s.round]; running = true; render();
      const map = { cols: 4, rows: 4, start: level.start, flag: level.goal, blocks: [], puddles: [] }, to = E.nextPosition(level.start, id);
      await E.animateMove(ui.body, level.start, to, context); running = false;
      if (id !== level.direction) { context.feedback(`La flecha ${D[id].icon} movió una casilla hacia ${D[id].label.toLowerCase()}. Compara esa casilla con la bandera.`, 'retry'); render(); return; }
      s.ready = true; context.feedback('Una flecha produjo un movimiento de una casilla y llegó a la meta.', 'correct'); context.celebrate(); render();
    }
    render();
  }
  function predict(root, context, final = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = final ? [finalPredict] : predictLevels.slice(0, context.extended ? 3 : 2); s.round ??= 0; let running = false;
    function render() {
      const map = levels[s.round]; ui.progress(`Predicción ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="program-predict"><p class="program-task">1. Lee los bloques. 2. Marca dónde terminará. 3. Ejecuta para comprobar.</p><div class="program-predict-grid">${E.board(map, map.start, {}, { selectable: map.options })}<div class="program-side">${E.blockList(map.queue, { active: s.active }, { disabled: true })}<p class="program-status">${s.selected ? `Elegiste columna ${s.selected[0] + 1}, fila ${s.selected[1] + 1}.` : 'Elige una de las tres casillas con borde dorado.'}</p></div></div></div>`;
      bind(ui.body, '.program-cell.is-selectable', 'click', event => { if (running || s.ready) return; s.selected = [+event.currentTarget.dataset.x, +event.currentTarget.dataset.y]; render(); }, context);
      if (s.ready) advance(root, context, ui, s, levels.length, () => { s.ready = false; delete s.selected; delete s.active; render(); }, 'Predijiste el resultado antes de ejecutar los programas.'); else toolbar(ui, 'Ejecutar y comprobar ▶', run, context.signal);
      ui.toolbar.querySelector('button').disabled = !s.selected || running;
    }
    async function run() {
      if (!s.selected || running || context.paused()) return; running = true; render(); const map = levels[s.round];
      const result = await E.execute(ui.body, map, map.queue, context, { active: index => { s.active = index; ui.body.querySelectorAll('[data-program-block]').forEach(block => block.classList.toggle('is-active', +block.dataset.programBlock === index)); } });
      running = false; delete s.active; if (result.aborted) return;
      if (!E.same(s.selected, result.position)) { context.feedback(`El programa terminó en columna ${result.position[0] + 1}, fila ${result.position[1] + 1}. Sigue los bloques desde Inicio y prueba otra casilla.`, 'retry'); delete s.selected; render(); return; }
      s.ready = true; s.executed = true; context.feedback('Tu predicción coincidió con la ejecución del programa.', 'correct'); context.celebrate(); render();
    }
    render();
  }
  function builder(root, context, kind = 'courier', final = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store;
    const all = kind === 'courier' ? courierLevels : berryLevels, levels = final ? [kind === 'courier' ? finalCourier : finalBerries] : all.slice(0, context.extended ? 3 : 2); s.round ??= 0; s.queue ??= []; let running = false;
    const target = map => kind === 'courier' ? map.mailbox : map.flag;
    function render() {
      const map = levels[s.round]; ui.progress(`${kind === 'courier' ? 'Entrega' : 'Ruta'} ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="program-builder"><div class="program-map-panel"><p class="program-mission">${kind === 'courier' ? 'Recoge el sobre y termina en el buzón.' : 'Recoge las bayas, cruza el puente y termina en la bandera.'}</p>${E.board(map, map.start, { collected: false })}<p class="program-map-key">${E.art(kind === 'courier' ? 'envelope' : 'berries')} Recoger primero ${kind === 'berries' ? E.art('bridge') + ' Cruzar el puente' : ''} ${E.art(kind === 'courier' ? 'mailbox' : 'flag')} Terminar aquí</p></div><div class="program-workbench"><span class="program-label">TU PROGRAMA · ${s.queue.length}/${map.max} BLOQUES</span>${E.blockList(s.queue, { selected: s.selected, failed: s.failed }, { disabled: running || s.ready })}${E.palette(running || s.ready)}<div class="program-edit"><button type="button" data-delete ${!s.queue.length || running || s.ready ? 'disabled' : ''}>Borrar ${Number.isInteger(s.selected) ? 'seleccionado' : 'último'}</button><button type="button" data-clear ${!s.queue.length || running || s.ready ? 'disabled' : ''}>Vaciar</button></div><p class="program-status">${s.message || 'Planea con los botones o con las flechas de tu teclado. Después ejecuta una vez.'}</p></div></div>`;
      bind(ui.body, '[data-program-add]', 'click', event => add(event.currentTarget.dataset.programAdd), context);
      bind(ui.body, '[data-program-block]', 'click', event => { if (!running && !s.ready) { s.selected = +event.currentTarget.dataset.programBlock; render(); } }, context);
      ui.body.querySelector('[data-delete]')?.addEventListener('click', () => { const index = Number.isInteger(s.selected) ? s.selected : s.queue.length - 1; s.queue.splice(index, 1); delete s.selected; delete s.failed; render(); }, { signal: context.signal });
      ui.body.querySelector('[data-clear]')?.addEventListener('click', () => { s.queue = []; delete s.selected; delete s.failed; render(); }, { signal: context.signal });
      if (s.ready) advance(root, context, ui, s, levels.length, () => { s.ready = false; s.queue = []; delete s.selected; delete s.failed; delete s.message; render(); }, kind === 'courier' ? 'Construiste programas que recogen y entregan un objeto.' : 'Programaste rutas con objetos, puentes y obstáculos.'); else toolbar(ui, 'Ejecutar programa ▶', run, context.signal);
      if (!s.ready) ui.toolbar.querySelector('button').disabled = running || !s.queue.length;
    }
    function add(id) { const map = levels[s.round]; if (running || s.ready || context.paused()) return; if (Number.isInteger(s.selected)) { s.queue[s.selected] = id; delete s.selected; } else if (s.queue.length < map.max) s.queue.push(id); else { context.feedback(`Este tablero admite hasta ${map.max} bloques. Revisa si puedes cambiar o borrar alguno.`, 'retry'); return; } delete s.failed; s.message = 'Programa preparado. Pulsa Ejecutar para verlo completo.'; render(); }
    async function run() {
      if (!s.queue.length || running || context.paused()) return; running = true; s.tested = true; delete s.failed; s.message = 'Ejecutando desde Inicio…'; render(); const map = levels[s.round];
      const result = await E.execute(ui.body, map, s.queue, context, { active: index => ui.body.querySelectorAll('[data-program-block]').forEach(block => block.classList.toggle('is-active', +block.dataset.programBlock === index)), collect: () => { s.message = kind === 'courier' ? '¡Sobre recogido! Falta llegar al buzón.' : '¡Canasta recogida! Falta cruzar y llegar a la bandera.'; } });
      running = false; if (result.aborted) return; s.failed = result.failed >= 0 ? result.failed : undefined;
      const arrived = E.same(result.position, target(map)), crossed = !map.requireBridge || result.visited.some(point => E.same(point, map.requireBridge));
      if (result.failed >= 0) s.message = `El bloque ${result.failed + 1} intenta entrar en un obstáculo o salir del tablero. Selecciónalo y cámbialo.`;
      else if (!result.collected) s.message = kind === 'courier' ? 'Llegaste sin recoger el sobre. El programa debe pasar primero por él.' : 'La ruta terminó sin recoger la canasta.';
      else if (!arrived) s.message = 'La lista terminó antes de llegar al destino. Agrega o cambia los últimos bloques.';
      else if (!crossed) s.message = 'Llegaste, pero la misión pide cruzar por el puente. Busca una ruta que pase sobre él.';
      else { s.ready = true; s.delivered = kind === 'courier'; s.collected = true; s.crossed = crossed; s.message = '¡Programa completo! La misión se cumplió en el orden correcto.'; context.feedback(s.message, 'correct'); context.celebrate(); render(); return; }
      context.feedback(s.message, 'retry'); render();
    }
    E.listenArrows(context, add); render();
  }
  function inspect(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = traceLevels.slice(0, context.extended ? 3 : 2); s.round ??= 0; let running = false;
    function render() {
      const map = levels[s.round]; ui.progress(`Inspección ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="program-inspector"><div>${E.board(map, map.start)}<p class="program-status">${s.message || 'Primero ejecuta. Después señala el bloque que detuvo el recorrido.'}</p></div><div><span class="program-label">PROGRAMA RECIBIDO</span>${E.blockList(map.queue, { active: s.active, failed: s.failed, selected: s.selected }, { disabled: running || !s.tested || s.ready })}<div class="program-trace-log">${(s.log || ['La traza aparecerá aquí.']).map((line, index) => `<span><strong>${index + 1}</strong>${line}</span>`).join('')}</div></div></div>`;
      bind(ui.body, '[data-program-block]', 'click', event => choose(+event.currentTarget.dataset.programBlock), context);
      if (s.ready) advance(root, context, ui, s, levels.length, () => { s.ready = false; s.tested = false; s.log = []; delete s.message; delete s.failed; delete s.selected; render(); }, 'Usaste la traza para localizar los primeros bloques incorrectos.'); else toolbar(ui, s.tested ? 'Ejecutar otra vez ▶' : 'Ejecutar y observar ▶', run, context.signal);
      ui.toolbar.querySelector('button').disabled = running;
    }
    async function run() {
      if (running || context.paused()) return; running = true; s.tested = true; s.log = []; delete s.failed; render(); const map = levels[s.round];
      const result = await E.execute(ui.body, map, map.queue, context, { active: (index, position) => { s.active = index; if (index >= 0) { s.log[index] = `Bloque ${index + 1}: ${D[map.queue[index]].icon} desde (${position[0] + 1}, ${position[1] + 1})`; const log = ui.body.querySelector('.program-trace-log'); if (log) log.innerHTML = s.log.map((line, i) => `<span class="${i === index ? 'is-current' : ''}"><strong>${i + 1}</strong>${line}</span>`).join(''); } } });
      running = false; if (result.aborted) return; s.failed = result.failed; s.message = `La ejecución se detuvo al intentar el bloque ${result.failed + 1}. Ahora señala ese bloque en la lista.`; context.feedback(s.message); render();
    }
    function choose(index) { if (!s.tested || running || s.ready) return; s.selected = index; if (index !== s.failed) { context.feedback('Ese bloque sí pudo ejecutarse. Busca en la traza el primer bloque que no produjo movimiento.', 'retry'); render(); return; } s.ready = true; s.inspected = true; s.message = `Encontraste el bloque ${index + 1}: es el primero que no puede ejecutarse.`; context.feedback('Encontraste el primer bloque que impide continuar.', 'correct'); context.celebrate(); render(); }
    render();
  }
  function repair(root, context, final = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = final ? [finalRepair] : repairLevels.slice(0, context.extended ? 3 : 2); s.round ??= 0; s.queue ??= [...levels[s.round].queue]; let running = false;
    function render() {
      const map = levels[s.round]; ui.progress(`Reparación ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="program-repair"><div>${E.board(map, map.start)}<p class="program-status">${s.message || 'Ejecuta el programa para encontrar el problema.'}</p></div><div><span class="program-label">REPARA UN SOLO BLOQUE</span>${E.blockList(s.queue, { active: s.active, failed: s.failed, selected: s.selected }, { disabled: running || s.ready })}${Number.isInteger(s.selected) ? E.palette(running || s.ready) : '<p class="program-help">Después de ejecutar, selecciona el bloque que quieras reemplazar.</p>'}</div></div>`;
      bind(ui.body, '[data-program-block]', 'click', event => { if (!running && !s.ready) { s.selected = +event.currentTarget.dataset.programBlock; render(); } }, context);
      bind(ui.body, '[data-program-add]', 'click', event => { if (!Number.isInteger(s.selected) || running) return; s.queue[s.selected] = event.currentTarget.dataset.programAdd; s.changed = true; delete s.selected; delete s.failed; s.message = 'Bloque reemplazado. Ejecuta desde Inicio para comprobar.'; render(); }, context);
      if (s.ready) advance(root, context, ui, s, levels.length, () => { s.ready = false; s.tested = false; s.changed = false; s.queue = [...levels[s.round].queue]; delete s.message; delete s.failed; delete s.selected; render(); }, 'Reemplazaste un bloque y comprobaste cada programa desde el inicio.'); else toolbar(ui, s.tested ? 'Volver a ejecutar ▶' : 'Ejecutar y encontrar el error ▶', run, context.signal);
      ui.toolbar.querySelector('button').disabled = running;
    }
    async function run() {
      if (running || context.paused()) return; running = true; s.tested = true; delete s.failed; render(); const map = levels[s.round];
      const result = await E.execute(ui.body, map, s.queue, context, { active: index => ui.body.querySelectorAll('[data-program-block]').forEach(block => block.classList.toggle('is-active', +block.dataset.programBlock === index)) });
      running = false; if (result.aborted) return; const reached = result.failed < 0 && E.same(result.position, map.flag);
      if (reached && s.changed) { s.ready = true; s.repaired = true; s.message = '¡La corrección funciona! El programa llegó a la bandera.'; context.feedback(s.message, 'correct'); context.celebrate(); render(); return; }
      s.failed = result.failed >= 0 ? result.failed : map.fault; s.message = result.failed >= 0 ? `La ejecución se detuvo en el bloque ${result.failed + 1}. Selecciónalo y prueba otra dirección.` : 'El programa terminó lejos de la bandera. Revisa el bloque que cambia el rumbo.'; context.feedback(s.message, 'retry'); render();
    }
    render();
  }
  const finalStations = [['Predice la llegada', 'programming-predict-final'], ['Programa el puente', 'programming-courier-final'], ['Recoge y entrega', 'programming-berries-final'], ['Repara la ruta', 'programming-repair-final']];
  window.ClassChallenges ??= {};
  Object.assign(window.ClassChallenges, {
    'programming-block-choice': blockChoice, 'programming-predict': predict,
    'programming-courier': (r, c) => builder(r, c, 'courier'), 'programming-berries': (r, c) => builder(r, c, 'berries'),
    'programming-trace': inspect, 'programming-repair': repair,
    'programming-predict-final': (r, c) => predict(r, c, true), 'programming-courier-final': (r, c) => builder(r, c, 'courier', true),
    'programming-berries-final': (r, c) => builder(r, c, 'berries', true), 'programming-repair-final': (r, c) => repair(r, c, true),
    'programming-final': (r, c) => G.runFinal(r, { ...c, finalMessage: 'Predijiste, construiste, recogiste y reparaste programas con flechas.' }, finalStations),
  });
})();
