'use strict';
(() => {
  const G = window.ClassGames, E = window.FirstPath, P = window.ProgrammingFirst;
  const C = window.ClassChallenges ||= {};
  const { frame, toolbar, finish, completed, shuffle } = G.shared;
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const bind = (root, selector, callback, context) => root.querySelectorAll(selector).forEach(element => element.addEventListener('click', callback, { signal: context.signal }));
  function setup(root, context) { if (context.store.complete) { completed(root, context); return null; } return frame(root, context); }
  function levelsFor(all, context, base = all.length) { return context.finalStation ? [all.at(-1)] : all.slice(0, context.extended ? all.length : base); }
  function nextButton(root, context, ui, state, total, reset, message, flags = {}) {
    state.solved = state.round + 1; Object.assign(state, flags);
    toolbar(ui, state.round === total - 1 ? 'Terminar práctica ✓' : 'Siguiente reto', () => {
      if (state.round === total - 1) { finish(root, context, message); return; }
      state.round++; state.ready = false; reset();
    }, context.signal);
  }

  const completePatterns = [
    { seq: ['coral', 'gold', 'coral', 'gold', '?'], answer: 'coral', options: ['gold', 'coral', 'blue'] },
    { seq: ['leaf', 'leaf', 'flower', 'leaf', 'leaf', '?'], answer: 'flower', options: ['leaf', 'flower', 'gold'] },
    { seq: ['circle', 'triangle', 'star', 'circle', 'triangle', '?'], answer: 'star', options: ['square', 'circle', 'star'] },
    { seq: ['blue', 'gold', 'gold', 'blue', 'gold', 'gold', '?'], answer: 'blue', options: ['gold', 'coral', 'blue'] },
    { seq: ['flower', 'leaf', 'leaf', 'flower', 'leaf', 'leaf', '?'], answer: 'flower', options: ['flower', 'leaf', 'blue'] },
    { seq: ['triangle', 'triangle', 'circle', 'triangle', 'triangle', '?'], answer: 'circle', options: ['star', 'circle', 'triangle'] },
  ];
  function patternComplete(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(completePatterns, context, 4); s.round ??= 0;
    function render() {
      const level = levels[s.round]; ui.progress(`Secuencia ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="pattern-game"><p class="path-task">¿Qué ficha continúa la regla?</p>${E.patternRow(level.seq)}<div class="pattern-options">${level.options.map(id => E.token(id, { button: true, correct: s.ready && id === level.answer })).join('')}</div></div>`;
      bind(ui.body, '.pattern-token', event => choose(event.currentTarget), context);
      ui.body.querySelectorAll('.pattern-token').forEach((button, index) => button.dataset.option = level.options[index]);
      ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, render, 'Continuaste secuencias usando la unidad que se repite.', { patterned: true });
    }
    function choose(button) { const level = levels[s.round], id = button.dataset.option; if (s.ready || context.paused()) return; if (id !== level.answer) { context.feedback('Esa ficha cambia la regla. Vuelve al comienzo y di la unidad en voz alta.', 'retry'); button.classList.add('is-error'); return; } s.ready = true; context.feedback('La ficha permite que la misma unidad vuelva a comenzar.', 'correct'); context.celebrate(); render(); }
    render();
  }

  const groupLevels = [
    { seq: ['coral', 'gold', 'coral', 'gold', 'coral', 'gold'], answer: ['coral', 'gold'], options: [['coral'], ['coral', 'gold'], ['coral', 'gold', 'coral', 'gold']] },
    { seq: ['leaf', 'leaf', 'flower', 'leaf', 'leaf', 'flower'], answer: ['leaf', 'leaf', 'flower'], options: [['leaf', 'flower'], ['leaf', 'leaf', 'flower'], ['leaf', 'leaf']] },
    { seq: ['circle', 'triangle', 'star', 'circle', 'triangle', 'star'], answer: ['circle', 'triangle', 'star'], options: [['circle', 'triangle'], ['circle', 'triangle', 'star'], ['triangle', 'star']] },
    { seq: ['blue', 'gold', 'gold', 'blue', 'gold', 'gold'], answer: ['blue', 'gold', 'gold'], options: [['blue', 'gold'], ['gold', 'gold'], ['blue', 'gold', 'gold']] },
  ];
  function patternGroup(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(groupLevels, context, 3); s.round ??= 0;
    function render() {
      const level = levels[s.round]; ui.progress(`Regla ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="pattern-game"><p class="path-task">Marca el grupo más pequeño que construye toda la fila.</p>${E.patternRow(level.seq)}<div class="pattern-unit-options">${level.options.map((option, index) => `<button type="button" data-unit="${index}"><small>OPCIÓN ${index + 1}</small>${E.patternRow(option)}</button>`).join('')}</div></div>`;
      bind(ui.body, '[data-unit]', event => { if (s.ready) return; const option = level.options[+event.currentTarget.dataset.unit]; if (!equal(option, level.answer)) { context.feedback('Ese grupo no puede repetirse para formar toda la fila, o contiene más de una vuelta.', 'retry'); return; } s.ready = true; context.feedback('Encontraste la unidad mínima del patrón.', 'correct'); context.celebrate(); render(); }, context);
      ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, render, 'Identificaste las unidades mínimas de varios patrones.', { patterned: true });
    }
    render();
  }

  const ruleLevels = [
    { start: ['coral', 'blue', 'gold', 'coral', 'blue', 'gold'], answers: ['coral', 'blue'], options: ['coral', 'blue', 'gold'] },
    { start: ['leaf', 'flower', 'flower', 'leaf', 'flower', 'flower'], answers: ['leaf', 'flower', 'flower'], options: ['leaf', 'flower', 'gold'] },
    { start: ['circle', 'triangle', 'circle', 'triangle'], answers: ['circle', 'triangle', 'circle'], options: ['circle', 'triangle', 'star'] },
    { start: ['gold', 'gold', 'blue', 'gold', 'gold', 'blue'], answers: ['gold', 'gold', 'blue'], options: ['blue', 'gold', 'coral'] },
  ];
  function patternRule(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(ruleLevels, context, 3); s.round ??= 0; s.fill ??= [];
    function render() {
      const level = levels[s.round], sequence = [...level.start, ...s.fill, ...Array(level.answers.length - s.fill.length).fill('?')];
      ui.progress(`Tablero ${s.round + 1} · ${s.fill.length} de ${level.answers.length} fichas`, s.round / levels.length + s.fill.length / level.answers.length / levels.length);
      ui.body.innerHTML = `<div class="pattern-game"><p class="path-task">Completa los espacios de izquierda a derecha.</p>${E.patternRow(sequence, { blankIndex: level.start.length + s.fill.length })}<div class="pattern-options">${level.options.map(id => E.token(id, { button: true })).join('')}</div>${s.fill.length ? '<button type="button" class="demo-button" data-undo>Quitar última ficha</button>' : ''}</div>`;
      ui.body.querySelectorAll('.pattern-options .pattern-token').forEach((button, index) => { button.dataset.option = level.options[index]; button.addEventListener('click', () => add(button.dataset.option), { signal: context.signal }); });
      ui.body.querySelector('[data-undo]')?.addEventListener('click', () => { s.fill.pop(); render(); }, { signal: context.signal });
      ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.fill = []; render(); }, 'Continuaste reglas durante varios pasos.', { patterned: true });
    }
    function add(id) { if (s.ready || context.paused()) return; const level = levels[s.round], expected = level.answers[s.fill.length]; if (id !== expected) { context.feedback('Esa ficha no corresponde al siguiente lugar. Repite la unidad desde el comienzo.', 'retry'); return; } s.fill.push(id); if (s.fill.length === level.answers.length) { s.ready = true; context.feedback('Completaste todos los espacios sin cambiar la regla.', 'correct'); context.celebrate(); } else context.feedback('Esa ficha continúa la regla. Ahora revisa el siguiente espacio.', 'correct'); render(); }
    render();
  }

  const repairPatterns = [
    { seq: ['coral', 'gold', 'coral', 'gold', 'blue', 'gold'], fault: 4, answer: 'coral', options: ['coral', 'gold', 'blue'] },
    { seq: ['leaf', 'leaf', 'flower', 'leaf', 'flower', 'flower'], fault: 4, answer: 'leaf', options: ['leaf', 'flower', 'gold'] },
    { seq: ['circle', 'triangle', 'star', 'circle', 'circle', 'star'], fault: 4, answer: 'triangle', options: ['triangle', 'circle', 'star'] },
    { seq: ['blue', 'gold', 'gold', 'blue', 'coral', 'gold'], fault: 4, answer: 'gold', options: ['coral', 'gold', 'blue'] },
  ];
  function patternRepair(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(repairPatterns, context, 3); s.round ??= 0;
    function render() {
      const level = levels[s.round], seq = [...level.seq]; if (s.replacement) seq[level.fault] = s.replacement;
      ui.progress(`Reparación ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="pattern-game"><p class="path-task">Primero señala la ficha que rompe la regla.</p>${E.patternRow(seq, { buttons: true, selected: s.selected, correct: s.ready ? level.fault : undefined })}${s.selected === level.fault && !s.ready ? `<p class="path-subtask">Ahora elige la ficha correcta.</p><div class="pattern-options">${level.options.map(id => E.token(id, { button: true })).join('')}</div>` : ''}</div>`;
      ui.body.querySelectorAll('.pattern-row [data-token-index]').forEach(button => button.addEventListener('click', () => select(+button.dataset.tokenIndex), { signal: context.signal }));
      ui.body.querySelectorAll('.pattern-options .pattern-token').forEach((button, index) => { button.dataset.option = level.options[index]; button.addEventListener('click', () => replace(button.dataset.option), { signal: context.signal }); });
      ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, () => { delete s.selected; delete s.replacement; render(); }, 'Localizaste y reparaste la primera ficha incorrecta.', { repaired: true });
    }
    function select(index) { if (s.ready) return; s.selected = index; if (index !== levels[s.round].fault) context.feedback('Esa ficha todavía cumple la regla. Busca el primer lugar donde la unidad cambia.', 'retry'); else context.feedback('Encontraste la primera ficha incorrecta. Elige ahora su reemplazo.'); render(); }
    function replace(id) { const level = levels[s.round]; if (id !== level.answer) { context.feedback('Con esa ficha la fila todavía cambia. Vuelve a decir la unidad.', 'retry'); return; } s.replacement = id; s.ready = true; context.feedback('La unidad vuelve a repetirse durante toda la fila.', 'correct'); context.celebrate(); render(); }
    render();
  }

  const cipherWords = ['SOL', 'LUNA', 'MESA', 'OSO'];
  const symbol = letter => `<span class="cipher-symbol" aria-label="símbolo de ${letter}">${E.cipher[letter]}</span>`;
  function cipherGame(root, context, encode = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, all = cipherWords.map(word => ({ word })), levels = levelsFor(all, context, 3); s.round ??= 0; s.position ??= 0;
    function render() {
      const word = levels[s.round].word, current = word[s.position]; ui.progress(`Mensaje ${s.round + 1} · ${s.position} de ${word.length}`, s.round / levels.length + s.position / word.length / levels.length);
      const model = encode ? `<span class="cipher-word-model">${word}</span>` : `<div class="cipher-message">${[...word].map(symbol).join('')}</div>`;
      const choices = encode ? Object.entries(E.cipher).map(([letter, mark]) => [letter, mark]) : Object.keys(E.cipher).map(letter => [letter, letter]);
      ui.body.innerHTML = `<div class="cipher-game"><div class="cipher-key">${Object.entries(E.cipher).map(([letter, mark]) => `<span><strong>${letter}</strong>${mark}</span>`).join('')}</div>${model}<div class="cipher-answer">${[...word].map((letter, index) => `<span class="${index < s.position ? 'is-done' : index === s.position ? 'is-current' : ''}">${index < s.position ? (encode ? E.cipher[letter] : letter) : '·'}</span>`).join('')}</div><p class="path-subtask">${encode ? `Busca el símbolo de la letra ${current}.` : `Busca la letra del símbolo ${E.cipher[current]}.`}</p><div class="cipher-options">${shuffle(choices).map(([letter, value]) => `<button type="button" data-letter="${letter}">${value}</button>`).join('')}</div></div>`;
      bind(ui.body, '[data-letter]', event => choose(event.currentTarget.dataset.letter), context); ui.toolbar.innerHTML = '';
      if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.position = 0; render(); }, encode ? 'Construiste mensajes con una clave visible.' : 'Descifraste palabras usando correspondencias visibles.', encode ? { encoded: true } : { decoded: true });
    }
    function choose(letter) { if (s.ready || context.paused()) return; const word = levels[s.round].word; if (letter !== word[s.position]) { context.feedback('Esa correspondencia pertenece a otra letra. Busca de nuevo en la tabla.', 'retry'); return; } s.position++; if (s.position === word.length) { s.ready = true; context.feedback(encode ? 'Representaste toda la palabra sin cambiar el orden.' : `Los símbolos forman la palabra ${word}.`, 'correct'); context.celebrate(); } else context.feedback('Correspondencia correcta. Continúa con el siguiente lugar.', 'correct'); render(); }
    render();
  }

  const compressLevels = [
    { action: 'right', count: 4, options: [['right', 3], ['right', 4], ['up', 4]] },
    { action: 'up', count: 3, options: [['up', 3], ['left', 3], ['up', 4]] },
    { action: 'down', count: 5, options: [['down', 4], ['right', 5], ['down', 5]] },
    { action: 'left', count: 4, options: [['left', 4], ['left', 5], ['down', 4]] },
  ];
  function loopChoice(root, context, mode = 'compress') {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(compressLevels, context, 3); s.round ??= 0; s.count ??= 1;
    function render() {
      const level = levels[s.round]; ui.progress(`Bucle ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      if (mode === 'compress') ui.body.innerHTML = `<div class="loop-game"><p class="path-task">Elige el bloque que representa esta lista.</p>${E.expandedLoop(level.action, level.count)}<div class="loop-choice-grid">${level.options.map(([action, count], index) => `<button type="button" data-loop-option="${index}">${E.loopBlock(action, count)}</button>`).join('')}</div></div>`;
      else ui.body.innerHTML = `<div class="loop-game"><p class="path-task">Cuenta las acciones y ajusta la cantidad.</p>${E.expandedLoop(level.action, level.count)}${E.loopEditor(level.action, s.count, { max: 7 })}</div>`;
      if (mode === 'compress') bind(ui.body, '[data-loop-option]', event => { const [action, count] = level.options[+event.currentTarget.dataset.loopOption]; check(action, count); }, context);
      else { E.bindEditor(ui.body, s, render, context, { max: 7 }); toolbar(ui, 'Comprobar cantidad', () => check(s.action || level.action, s.count), context.signal); }
      if (mode === 'compress') ui.toolbar.innerHTML = '';
      if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.count = 1; delete s.action; render(); }, 'Relacionaste listas largas con bloques Repetir equivalentes.', { looped: true });
    }
    function check(action, count) { const level = levels[s.round]; if (s.ready || context.paused()) return; if (action !== level.action || count !== level.count) { context.feedback(action !== level.action ? 'La cantidad puede coincidir, pero la dirección es diferente.' : 'Cuenta de nuevo una tarjeta por cada acción.', 'retry'); return; } s.ready = true; context.feedback('El bloque conserva exactamente la acción y la cantidad.', 'correct'); context.celebrate(); render(); }
    render();
  }

  const buildLevels = [
    { action: 'left', count: 3 }, { action: 'down', count: 4 }, { action: 'right', count: 5 }, { action: 'up', count: 2 },
  ];
  function loopBuild(root, context, expand = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(buildLevels, context, 3); s.round ??= 0; s.action ??= 'right'; s.count ??= 2;
    function render() {
      const level = levels[s.round]; ui.progress(`Modelo ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="loop-game"><p class="path-task">${expand ? '¿Qué lista representa este bloque?' : 'Construye el bloque que representa el modelo.'}</p>${expand ? E.loopBlock(level.action, level.count) : E.expandedLoop(level.action, level.count)}${expand ? `<div class="loop-choice-grid">${[[level.action, level.count], [level.action, Math.max(1, level.count - 1)], [level.action === 'right' ? 'up' : 'right', level.count]].map(([action, count], index) => `<button type="button" data-expand-option="${index}" data-action="${action}" data-count="${count}">${E.expandedLoop(action, count)}</button>`).join('')}</div>` : E.loopEditor(s.action, s.count, { max: 7 })}</div>`;
      if (expand) bind(ui.body, '[data-expand-option]', event => check(event.currentTarget.dataset.action, +event.currentTarget.dataset.count), context); else { E.bindEditor(ui.body, s, render, context, { max: 7 }); toolbar(ui, 'Probar mi bloque', () => check(s.action, s.count), context.signal); }
      if (expand) ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.action = 'right'; s.count = 2; render(); }, expand ? 'Desplegaste bucles en listas equivalentes.' : 'Construiste bloques con acción y cantidad.', { looped: true });
    }
    function check(action, count) { const level = levels[s.round]; if (action !== level.action || count !== level.count) { context.feedback(action !== level.action ? 'Revisa la dirección del bloque.' : 'Revisa cuántas veces debe aparecer la acción.', 'retry'); return; } s.ready = true; context.feedback('La representación conserva la misma secuencia.', 'correct'); context.celebrate(); render(); }
    render();
  }

  const routeLevels = [
    { cols: 6, rows: 4, start: [0, 3], flag: [4, 2], blocks: [], puddles: [], flowers: [], action: 'right', count: 4, after: 'up' },
    { cols: 6, rows: 5, start: [5, 4], flag: [2, 0], blocks: [[4, 2]], puddles: [], flowers: [], action: 'up', count: 4, after: 'left', afterCount: 3, loopSecond: true },
    { cols: 7, rows: 5, start: [0, 4], flag: [6, 1], blocks: [[3, 3]], puddles: [], flowers: [], action: 'right', count: 2, after: 'up', tail: ['up', 'up', 'right', 'right', 'right', 'right'] },
    { cols: 6, rows: 4, start: [0, 0], flag: [5, 2], blocks: [], puddles: [[3, 1]], flowers: [], action: 'right', count: 5, after: 'down', afterCount: 2, loopSecond: true },
  ];
  function segmentsFor(level, s) { const segments = [{ type: 'loop', action: s.action, count: s.count }, ...(level.loopSecond ? [{ type: 'loop', action: s.after, count: s.afterCount }] : [{ type: 'single', action: s.after }])]; if (level.tail) segments.push(...level.tail.map(action => ({ type: 'single', action }))); return segments; }
  function loopRoute(root, context, variant = 'route') {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(routeLevels, context, variant === 'route' ? 2 : 3); s.round ??= 0; let running = false;
    function defaults() { const level = levels[s.round]; s.action ??= variant === 'fix' ? level.action : 'right'; s.count ??= variant === 'fix' ? Math.max(1, level.count - 1) : 2; s.after ??= level.after; s.afterCount ??= level.afterCount || 1; }
    function render() {
      defaults(); const level = levels[s.round]; ui.progress(`Recorrido ${s.round + 1} de ${levels.length}`, s.round / levels.length);
      ui.body.innerHTML = `<div class="loop-route-layout"><div>${E.board(level, level.start)}<p class="program-status">${s.message || (variant === 'fix' ? 'La dirección es correcta. Ajusta la cantidad y prueba.' : 'Construye el primer tramo y el giro.')}</p></div><div class="loop-workbench">${E.loopEditor(s.action, s.count, { max: 8, disabled: running })}<label class="loop-after-label">${level.loopSecond ? 'SEGUNDO TRAMO REPETIDO' : 'DESPUÉS DEL BUCLE'}</label><div class="loop-direction-picker compact">${Object.entries(E.actions).map(([id, item]) => `<button type="button" data-after="${id}" aria-pressed="${s.after === id}" ${running ? 'disabled' : ''}><strong>${item.icon}</strong><span>${item.label}</span></button>`).join('')}</div>${level.loopSecond ? `<div class="loop-counter"><button type="button" data-after-minus ${s.afterCount <= 1 || running ? 'disabled' : ''}>−</button><span><strong>${s.afterCount}</strong><small>veces</small></span><button type="button" data-after-plus ${s.afterCount >= 8 || running ? 'disabled' : ''}>+</button></div>` : ''}</div></div>`;
      E.bindEditor(ui.body, s, render, context, { max: 8 });
      bind(ui.body, '[data-after]', event => { s.after = event.currentTarget.dataset.after; render(); }, context);
      ui.body.querySelector('[data-after-minus]')?.addEventListener('click', () => { s.afterCount = Math.max(1, s.afterCount - 1); render(); }, { signal: context.signal });
      ui.body.querySelector('[data-after-plus]')?.addEventListener('click', () => { s.afterCount = Math.min(8, s.afterCount + 1); render(); }, { signal: context.signal });
      toolbar(ui, 'Ejecutar programa', run, context.signal); ui.toolbar.querySelector('button').disabled = running;
      if (s.ready) nextButton(root, context, ui, s, levels.length, () => { for (const key of ['action', 'count', 'after', 'afterCount', 'message']) delete s[key]; render(); }, variant === 'fix' ? 'Ajustaste cantidades y comprobaste los programas.' : 'Combinaste bucles y giros en recorridos completos.', { looped: true, executed: true });
    }
    async function run() { if (running || context.paused()) return; running = true; render(); const level = levels[s.round], segments = segmentsFor(level, s); const result = await E.executeProgram(ui.body, level, segments, context); running = false; s.executed = true; if (result.aborted) return; const exact = s.action === level.action && s.count === level.count && s.after === level.after && (!level.loopSecond || s.afterCount === level.afterCount); if (result.failed >= 0) s.message = 'El programa intentó salir del tablero o entrar en un obstáculo. Revisa la cantidad.'; else if (!E.same(result.position, level.flag)) s.message = 'La lista terminó en otra casilla. Compara la distancia y el giro.'; else if (!exact) s.message = 'Llegaste, pero la misión pide expresar los tramos repetidos con los bucles indicados.'; else { s.ready = true; s.message = 'El programa llegó a la meta y representa claramente la repetición.'; context.feedback(s.message, 'correct'); context.celebrate(); render(); return; } context.feedback(s.message, 'retry'); render(); }
    render();
  }

  const predictLoops = [
    { cols: 6, rows: 4, start: [0, 3], flag: [4, 3], blocks: [], puddles: [], flowers: [], segments: [{ type: 'loop', action: 'right', count: 4 }], choices: [[4, 3], [3, 3], [5, 2]] },
    { cols: 5, rows: 5, start: [4, 4], flag: [4, 1], blocks: [], puddles: [], flowers: [], segments: [{ type: 'loop', action: 'up', count: 3 }], choices: [[4, 1], [3, 1], [4, 0]] },
    { cols: 6, rows: 5, start: [1, 0], flag: [5, 2], blocks: [], puddles: [], flowers: [], segments: [{ type: 'loop', action: 'right', count: 4 }, { type: 'loop', action: 'down', count: 2 }], choices: [[5, 2], [4, 2], [5, 3]] },
    { cols: 7, rows: 4, start: [6, 0], flag: [1, 3], blocks: [], puddles: [], flowers: [], segments: [{ type: 'loop', action: 'left', count: 5 }, { type: 'loop', action: 'down', count: 3 }], choices: [[1, 3], [2, 3], [1, 2]] },
  ];
  function loopPredict(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(predictLoops, context, 3); s.round ??= 0; let running = false;
    function render() { const level = levels[s.round]; ui.progress(`Predicción ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="loop-predict-layout"><div>${E.selectableBoard(level, level.start, level.choices)}</div><div><p class="path-task">Marca la casilla final antes de ejecutar.</p>${level.segments.map(segment => E.loopBlock(segment.action, segment.count)).join('')}<p class="program-status">${s.message || 'Cuenta una casilla por cada vuelta.'}</p></div></div>`; bind(ui.body, '.program-cell.is-selectable', event => { if (!running && !s.ready) { s.selected = [+event.currentTarget.dataset.x, +event.currentTarget.dataset.y]; s.message = `Elegiste columna ${s.selected[0] + 1}, fila ${s.selected[1] + 1}.`; render(); } }, context); toolbar(ui, 'Ejecutar y comprobar', run, context.signal); ui.toolbar.querySelector('button').disabled = !s.selected || running; if (s.ready) nextButton(root, context, ui, s, levels.length, () => { delete s.selected; delete s.message; render(); }, 'Predijiste resultados antes de ejecutar bucles.', { looped: true, executed: true }); }
    async function run() { if (!s.selected || running) return; running = true; render(); const level = levels[s.round], result = await E.executeProgram(ui.body, level, level.segments, context); running = false; s.executed = true; if (!E.same(s.selected, result.position)) { s.message = `La ejecución terminó en columna ${result.position[0] + 1}, fila ${result.position[1] + 1}. Cuenta otra vez desde Inicio.`; delete s.selected; context.feedback(s.message, 'retry'); render(); return; } s.ready = true; s.message = 'La predicción y la ejecución coinciden.'; context.feedback(s.message, 'correct'); context.celebrate(); render(); }
    render();
  }

  const safeCounts = [
    { cols: 7, rows: 3, start: [0, 1], flag: [4, 1], blocks: [[5, 1]], puddles: [], flowers: [], action: 'right', answer: 4 },
    { cols: 5, rows: 6, start: [2, 5], flag: [2, 1], blocks: [[2, 0]], puddles: [], flowers: [], action: 'up', answer: 4 },
    { cols: 7, rows: 4, start: [6, 2], flag: [2, 2], blocks: [[1, 2]], puddles: [], flowers: [], action: 'left', answer: 4 },
    { cols: 6, rows: 5, start: [3, 0], flag: [3, 3], blocks: [[3, 4]], puddles: [], flowers: [], action: 'down', answer: 3 },
  ];
  function loopSafeCount(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(safeCounts, context, 3); s.round ??= 0; s.count ??= 1;
    function render() { const level = levels[s.round]; s.action = level.action; ui.progress(`Cálculo ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="loop-route-layout"><div>${E.board(level, level.start)}<p class="program-status">Elige la mayor cantidad que llega a la bandera sin tocar la roca.</p></div>${E.loopEditor(level.action, s.count, { max: 8 })}</div>`; E.bindEditor(ui.body, s, render, context, { max: 8 }); toolbar(ui, 'Comprobar cantidad', () => { if (s.count !== level.answer) { context.feedback(s.count < level.answer ? 'Todavía queda una casilla libre antes de la meta.' : 'Con esa cantidad el personaje se pasa o choca con la roca.', 'retry'); return; } s.ready = true; context.feedback('La cantidad cabe exactamente en el tramo disponible.', 'correct'); context.celebrate(); render(); }, context.signal); if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.count = 1; render(); }, 'Calculaste repeticiones que caben en el tablero.', { looped: true }); }
    render();
  }

  const contextLevels = {
    recycle: [{ target: 4 }, { target: 6 }, { target: 3 }, { target: 5 }],
    contexts: [{ scene: 'space', count: 4, group: 'avanzar y girar' }, { scene: 'soccer', count: 3, group: 'avanzar, tocar y regresar' }, { scene: 'space', count: 3, group: 'avanzar y girar' }],
  };
  function contextLoops(root, context, kind) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(contextLevels[kind], context, kind === 'recycle' ? 3 : 2); s.round ??= 0; s.count ??= 1;
    function render() { const level = levels[s.round], isRecycle = kind === 'recycle'; ui.progress(`${isRecycle ? 'Entrega' : 'Rutina'} ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="context-loop-game"><div class="context-loop-scene scene-${level.scene || 'recycle'}">${E.art(isRecycle ? 'recycle' : level.scene === 'space' ? 'earth' : 'goal')}<span class="context-moving">${E.art(isRecycle ? 'message' : level.scene === 'space' ? 'rocket' : 'backpack')}</span>${isRecycle ? `<div class="conveyor-dots">${Array.from({ length: 7 }, (_, i) => `<span class="${i < s.count ? 'is-active' : ''}"></span>`).join('')}</div>` : `<strong>${level.group}</strong>`}</div><p class="path-task">${isRecycle ? `El objeto necesita ${level.target} avances.` : `La rutina debe repetirse ${level.count} veces.`}</p><div class="loop-counter"><button type="button" data-count-minus ${s.count <= 1 ? 'disabled' : ''}>−</button><span><strong>${s.count}</strong><small>veces</small></span><button type="button" data-count-plus ${s.count >= 7 ? 'disabled' : ''}>+</button></div></div>`; ui.body.querySelector('[data-count-minus]')?.addEventListener('click', () => { s.count--; render(); }, { signal: context.signal }); ui.body.querySelector('[data-count-plus]')?.addEventListener('click', () => { s.count++; render(); }, { signal: context.signal }); toolbar(ui, 'Probar repetición', () => check(level, isRecycle), context.signal); if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.count = 1; render(); }, isRecycle ? 'Usaste repeticiones para completar rutas de reciclaje.' : 'Aplicaste bucles a rutinas con grupos de acciones.', { looped: true, executed: true }); }
    function check(level, recycle) { const answer = recycle ? level.target : level.count; s.executed = true; if (s.count !== answer) { context.feedback(s.count < answer ? 'La repetición se detuvo antes de completar la misión.' : 'La repetición continuó después del lugar indicado.', 'retry'); return; } s.ready = true; context.feedback('La cantidad coincide exactamente con la misión.', 'correct'); context.celebrate(); render(); }
    render();
  }

  const missionRoutes = [
    { cols: 7, rows: 5, start: [0, 4], flag: [5, 3], blocks: [[3, 2]], puddles: [], flowers: [], action: 'right', count: 5, after: 'up' },
    { cols: 6, rows: 5, start: [5, 4], flag: [2, 3], blocks: [[4, 1]], puddles: [], flowers: [], action: 'left', count: 3, after: 'up' },
    { cols: 6, rows: 4, start: [0, 0], flag: [4, 1], blocks: [[2, 2]], puddles: [], flowers: [], action: 'right', count: 4, after: 'down' },
    { cols: 7, rows: 5, start: [6, 4], flag: [2, 3], blocks: [[4, 1]], puddles: [], flowers: [], action: 'left', count: 4, after: 'up' },
  ];
  function loopMission(root, context, adapt = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store;
    const all = adapt ? missionRoutes : missionRoutes.slice(0, 3);
    const levels = levelsFor(all, context, adapt ? 3 : 2); s.round ??= 0; let running = false;
    function init() { const level = levels[s.round]; s.count ??= Math.max(1, level.count - 1); s.action ??= level.action; s.after ??= level.after; }
    function render() { init(); const level = levels[s.round]; ui.progress(`${adapt ? 'Adaptación' : 'Sendero'} ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="loop-route-layout bear-mission"><div>${E.board(level, level.start)}${E.art(adapt ? 'bridge' : 'bear')}<p class="program-status">${s.message || (adapt ? 'La meta cambió. Conserva la dirección útil y ajusta la distancia.' : 'Programa el tramo repetido y después el giro sin entrar en la zona protegida.')}</p></div><div>${E.loopEditor(s.action, s.count, { max: 8, disabled: running })}<div class="loop-direction-picker compact">${Object.entries(E.actions).map(([id, item]) => `<button type="button" data-after="${id}" aria-pressed="${s.after === id}"><strong>${item.icon}</strong><span>${item.label}</span></button>`).join('')}</div></div></div>`; E.bindEditor(ui.body, s, render, context, { max: 8 }); bind(ui.body, '[data-after]', event => { s.after = event.currentTarget.dataset.after; render(); }, context); toolbar(ui, 'Ejecutar adaptación', run, context.signal); if (s.ready) nextButton(root, context, ui, s, levels.length, () => { for (const key of ['count', 'action', 'after', 'message']) delete s[key]; render(); }, adapt ? 'Adaptaste los programas cuando cambió la meta.' : 'Combinaste repeticiones y giros para respetar el sendero.', { looped: true, executed: true }); }
    async function run() { if (running) return; running = true; render(); const level = levels[s.round], segments = [{ type: 'loop', action: s.action, count: s.count }, { type: 'single', action: s.after }, ...(level.tail || []).map(action => ({ type: 'single', action }))]; const result = await E.executeProgram(ui.body, level, segments, context); running = false; s.executed = true; if (result.failed >= 0 || !E.same(result.position, level.flag) || s.action !== level.action || s.count !== level.count || s.after !== level.after) { s.message = result.failed >= 0 ? 'Una acción salió del sendero. Revisa el tramo repetido.' : 'La ruta terminó en otro lugar. Conserva lo útil y ajusta solamente lo necesario.'; context.feedback(s.message, 'retry'); render(); return; } s.ready = true; s.message = 'El programa nuevo cumple la meta completa.'; context.feedback(s.message, 'correct'); context.celebrate(); render(); }
    render();
  }

  const compareLevels = [
    { expected: 'Llegar a la bandera', observed: 'Terminó una casilla antes', answer: 'short', options: [['short', 'Faltó un movimiento'], ['direction', 'La bandera está mal'], ['all', 'Todo está mal']] },
    { expected: 'Rodear la roca', observed: 'Intentó entrar en la roca', answer: 'direction', options: [['count', 'Faltan vueltas'], ['direction', 'Una dirección apunta a la roca'], ['start', 'Debe comenzar después']] },
    { expected: 'Recoger y entregar', observed: 'Llegó al destino sin recoger', answer: 'order', options: [['order', 'El orden no visita primero el objeto'], ['count', 'Hay demasiadas vueltas'], ['none', 'Ya está completo']] },
    { expected: 'Repetir cuatro veces', observed: 'Repitió cinco', answer: 'count', options: [['direction', 'Cambiar dirección'], ['count', 'Reducir la cantidad'], ['order', 'Cambiar toda la lista']] },
  ];
  function debugChoices(root, context, mode = 'compare') {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(compareLevels, context, 3); s.round ??= 0;
    function render() { const level = levels[s.round]; ui.progress(`Caso ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="debug-choice-game"><div class="debug-compare-cards"><span><small>ESPERÁBAMOS</small>${level.expected}</span><span><small>OBSERVAMOS</small>${level.observed}</span></div><p class="path-task">${mode === 'classify' ? '¿Qué propiedad debemos revisar?' : '¿Qué descripción usa mejor la evidencia?'}</p><div class="debug-options">${level.options.map(([id, label]) => `<button type="button" data-debug-answer="${id}">${label}</button>`).join('')}</div></div>`; bind(ui.body, '[data-debug-answer]', event => { if (event.currentTarget.dataset.debugAnswer !== level.answer) { context.feedback('Esa opción no explica la diferencia observada. Lee las dos tarjetas otra vez.', 'retry'); return; } s.ready = true; context.feedback('La descripción coincide con la evidencia del caso.', 'correct'); context.celebrate(); render(); }, context); ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, render, 'Describiste fallos usando resultados observables.', { inspected: true }); }
    render();
  }

  const traceCases = [
    { expected: ['right', 'right', 'up', 'up'], actual: ['right', 'right', 'left', 'up'], fault: 2 },
    { expected: ['up', 'right', 'right', 'down'], actual: ['up', 'down', 'right', 'down'], fault: 1 },
    { expected: ['left', 'left', 'down', 'down'], actual: ['left', 'left', 'down', 'right'], fault: 3 },
    { expected: ['down', 'right', 'up', 'right'], actual: ['down', 'right', 'left', 'right'], fault: 2 },
  ];
  function debugTrace(root, context, visual = false) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(traceCases, context, 3); s.round ??= 0;
    function render() { const level = levels[s.round]; ui.progress(`Traza ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="trace-compare"><div><small>PLAN ESPERADO</small>${E.actionCards(level.expected)}</div><div><small>PROGRAMA OBSERVADO</small>${E.actionCards(level.actual, { buttons: true, selected: s.selected, error: s.ready ? level.fault : undefined })}</div><p>Marca el primer bloque que deja de coincidir.</p></div>`; ui.body.querySelectorAll('[data-action-index]').forEach(element => { const choose = () => { const index = +element.dataset.actionIndex; s.selected = index; if (index !== level.fault) { context.feedback(index < level.fault ? 'Ese paso todavía coincide con el plan.' : 'Hay una diferencia anterior. Busca el primer cambio.', 'retry'); render(); return; } s.ready = true; context.feedback('Encontraste el primer paso diferente.', 'correct'); context.celebrate(); render(); }; element.addEventListener('click', choose, { signal: context.signal }); element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } }, { signal: context.signal }); }); ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, () => { delete s.selected; render(); }, 'Localizaste la primera diferencia de cada traza.', { inspected: true, tested: true }); }
    render();
  }

  const repairCases = [
    { cols: 5, rows: 4, start: [0, 3], flag: [3, 0], blocks: [[2, 2]], puddles: [], flowers: [], queue: ['up', 'right', 'right', 'up', 'right', 'right'], fault: 2, correct: 'up', type: 'direction' },
    { cols: 6, rows: 4, start: [5, 3], flag: [1, 0], blocks: [[3, 2]], puddles: [], flowers: [], queue: ['left', 'left', 'up', 'left', 'left', 'up', 'up'], fault: 2, swap: [2, 4], type: 'order' },
    { cols: 6, rows: 5, start: [0, 4], flag: [5, 1], blocks: [[2, 3]], puddles: [], flowers: [], queue: ['right', 'right', 'up', 'right', 'right', 'up', 'up', 'up'], fault: 2, correct: 'right', type: 'direction' },
  ];
  function debugRepair(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(repairCases, context, 2); s.round ??= 0; s.queue ??= [...levels[0].queue]; let running = false;
    function render() { const level = levels[s.round]; ui.progress(`Reparación ${s.round + 1} de ${levels.length}`, s.round / levels.length); const editor = Number.isInteger(s.selected) ? level.type === 'order' ? `<div class="debug-swap-options"><p>Intercambia el bloque seleccionado con el otro bloque fuera de lugar.</p>${level.swap.map(index => `<button type="button" data-swap-index="${index}">Intercambiar con bloque ${index + 1}</button>`).join('')}</div>` : P.palette(running || s.ready) : ''; ui.body.innerHTML = `<div class="program-repair"><div>${E.board(level, level.start)}<p class="program-status">${s.message || 'Ejecuta, localiza el primer fallo y cambia solo lo necesario.'}</p></div><div>${P.blockList(s.queue, { selected: s.selected, failed: s.failed }, { disabled: running || s.ready })}${editor}</div></div>`; bind(ui.body, '[data-program-block]', event => { s.selected = +event.currentTarget.dataset.programBlock; render(); }, context); bind(ui.body, '[data-program-add]', event => { if (!Number.isInteger(s.selected)) return; s.queue[s.selected] = event.currentTarget.dataset.programAdd; s.changed = true; delete s.selected; delete s.failed; s.message = 'Bloque cambiado. Ejecuta desde Inicio para comprobar.'; render(); }, context); bind(ui.body, '[data-swap-index]', event => { if (!Number.isInteger(s.selected)) return; const other = +event.currentTarget.dataset.swapIndex; [s.queue[s.selected], s.queue[other]] = [s.queue[other], s.queue[s.selected]]; s.changed = true; delete s.selected; delete s.failed; s.message = 'Bloques intercambiados. Ejecuta desde Inicio para comprobar.'; render(); }, context); toolbar(ui, s.tested ? 'Volver a ejecutar' : 'Ejecutar programa', run, context.signal); if (s.ready) nextButton(root, context, ui, s, levels.length, () => { s.queue = [...levels[s.round].queue]; for (const key of ['selected', 'failed', 'message', 'changed', 'tested']) delete s[key]; render(); }, 'Reparaste programas y comprobaste las versiones nuevas.', { repaired: true, tested: true }); }
    async function run() { if (running) return; running = true; s.tested = true; render(); const level = levels[s.round], result = await P.execute(ui.body, level, s.queue, context); running = false; if (result.failed < 0 && E.same(result.position, level.flag) && s.changed) { s.ready = true; s.message = 'La nueva ejecución cumple la meta desde Inicio.'; context.feedback(s.message, 'correct'); context.celebrate(); render(); return; } s.failed = result.failed >= 0 ? result.failed : level.fault; s.message = result.failed >= 0 ? `La ejecución se detuvo en el bloque ${result.failed + 1}.` : 'El programa terminó en otra casilla. Compara con la meta.'; context.feedback(s.message, 'retry'); render(); }
    render();
  }

  const personalData = [
    ['Nombre completo', 'personal'], ['Dirección de la casa', 'personal'], ['Contraseña', 'personal'], ['Teléfono familiar', 'personal'],
    ['Me gustan las mariposas', 'general'], ['Mi color favorito es verde', 'general'], ['Hoy aprendemos patrones', 'general'], ['El oso vive en los Andes', 'general'],
  ];
  function safeDataSort(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store; s.round ??= 0; const items = context.finalStation ? [personalData[3]] : personalData.slice(0, context.extended ? 8 : 6);
    function render() { const [text, answer] = items[s.round]; ui.progress(`Tarjeta ${s.round + 1} de ${items.length}`, s.round / items.length); ui.body.innerHTML = `<div class="safe-data-game"><div class="safe-card"><small>EJEMPLO FICTICIO</small><strong>${text}</strong></div><div class="safe-data-options"><button type="button" data-safe-category="personal">Dato personal · proteger</button><button type="button" data-safe-category="general">Información general</button></div></div>`; bind(ui.body, '[data-safe-category]', event => { if (event.currentTarget.dataset.safeCategory !== answer) { context.feedback('Piensa si ese dato identifica, localiza o protege una cuenta.', 'retry'); return; } s.ready = true; context.feedback(answer === 'personal' ? 'Ese dato necesita protección y acompañamiento adulto.' : 'Este ejemplo describe información general sin localizar a una persona.', 'correct'); context.celebrate(); render(); }, context); ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, items.length, render, 'Clasificaste ejemplos sin escribir información real.', { decided: true }); }
    render();
  }

  const profileOptions = [
    ['Avatar de mariposa', true], ['Color favorito', true], ['Apodo del equipo elegido en clase', true], ['Dirección de la casa', false], ['Contraseña real', false], ['Teléfono familiar', false],
  ];
  function safeProfile(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store; s.selected ??= [];
    function render() { ui.progress(`Perfil escolar · ${s.selected.length} elementos elegidos`, Math.min(1, s.selected.length / 3)); ui.body.innerHTML = `<div class="safe-profile-game"><div class="safe-profile-preview">${E.art('butterfly')}<strong>Equipo Bosque</strong><span>Actividad de aula</span></div><p class="path-task">Elige tres opciones seguras y necesarias para este juego ficticio.</p><div class="safe-profile-options">${profileOptions.map(([label, safe], index) => `<button type="button" data-profile="${index}" aria-pressed="${s.selected.includes(index)}">${label}</button>`).join('')}</div></div>`; bind(ui.body, '[data-profile]', event => { const index = +event.currentTarget.dataset.profile; if (s.selected.includes(index)) s.selected = s.selected.filter(item => item !== index); else if (s.selected.length < 3) s.selected.push(index); else context.feedback('El perfil solo necesita tres elementos. Quita uno antes de agregar otro.'); render(); }, context); toolbar(ui, 'Revisar perfil', () => { if (s.selected.length !== 3 || s.selected.some(index => !profileOptions[index][1])) { context.feedback('El perfil contiene un dato innecesario o todavía no tiene tres opciones seguras.', 'retry'); return; } s.ready = true; context.feedback('El perfil usa únicamente datos ficticios y necesarios para la actividad.', 'correct'); context.celebrate(); render(); }, context.signal); if (s.ready) { s.solved = 1; s.decided = true; finish(root, context, 'Preparaste un perfil ficticio sin datos personales.'); } }
    render();
  }

  const safetyStories = [
    { scene: 0, text: 'Una página pide dirección y teléfono para entregar un premio.', answer: 'stop', options: [['continue', 'Escribirlos para continuar'], ['stop', 'Detenerse y llamar al profesor'], ['invent', 'Inventar datos']] },
    { scene: 3, text: 'Aparece una ventana extraña que presiona para pulsar rápido.', answer: 'close', options: [['reply', 'Responder al mensaje'], ['close', 'Cerrar y pedir ayuda'], ['share', 'Mostrarla a todos los compañeros']] },
    { scene: 2, text: 'Un mensaje pide guardar un secreto que hace sentir incómodo.', answer: 'tell', options: [['secret', 'Guardar el secreto'], ['tell', 'Contarlo a un adulto de confianza'], ['argue', 'Discutir con quien lo envió']] },
    { scene: 1, text: 'No sabemos quién envió una solicitud de amistad.', answer: 'ask', options: [['accept', 'Aceptar para averiguarlo'], ['ask', 'No aceptar y consultar a un adulto'], ['send', 'Enviar una foto primero']] },
  ];
  function safeStories(root, context, kind = 'story') {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(safetyStories, context, 3); s.round ??= 0;
    function render() { const level = levels[s.round]; ui.progress(`Historia ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="safe-story-game">${E.safetyScene(level.scene)}<div><p class="path-task">${level.text}</p><div class="safe-story-options">${level.options.map(([id, label]) => `<button type="button" data-story-answer="${id}">${label}</button>`).join('')}</div></div></div>`; bind(ui.body, '[data-story-answer]', event => { if (event.currentTarget.dataset.storyAnswer !== level.answer) { context.feedback('Esa opción mantiene al niño solo o comparte más información. Busca detenerse y pedir acompañamiento.', 'retry'); return; } s.ready = true; context.feedback('La decisión detiene la interacción y busca ayuda adulta.', 'correct'); context.celebrate(); render(); }, context); ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, levels.length, render, 'Elegiste actuaciones seguras en historias ficticias.', { decided: true }); }
    render();
  }

  const trustedLevels = [
    { situation: 'Apareció un mensaje que no entiendo.', adult: 'Profesor', phrase: 'Apareció esto y necesito ayuda.' },
    { situation: 'Una ventana me pidió información personal.', adult: 'Orientadora', phrase: 'No escribí nada; ¿puedes revisarlo conmigo?' },
    { situation: 'El profesor no está cerca y algo me incomoda.', adult: 'Persona cuidadora', phrase: 'Quiero contarte algo que apareció en el computador.' },
  ];
  function safeTrusted(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, levels = levelsFor(trustedLevels, context, 2); s.round ??= 0;
    function render() { const level = levels[s.round]; ui.progress(`Ayuda ${s.round + 1} de ${levels.length}`, s.round / levels.length); ui.body.innerHTML = `<div class="trusted-game">${E.safetyScene((s.round + 1) % 4)}<p class="path-task">${level.situation}</p><div class="trusted-columns"><div><small>¿A QUIÉN?</small>${['Profesor', 'Compañero desconocido en línea', 'Orientadora', 'Persona cuidadora'].map(label => `<button type="button" data-adult="${label}" aria-pressed="${s.adult === label}">${label}</button>`).join('')}</div><div><small>¿QUÉ DECIMOS?</small>${[level.phrase, 'No importa; lo esconderé.', 'Responderé primero y luego cuento.'].map(label => `<button type="button" data-phrase="${label}" aria-pressed="${s.phrase === label}">${label}</button>`).join('')}</div></div></div>`; bind(ui.body, '[data-adult]', event => { s.adult = event.currentTarget.dataset.adult; render(); }, context); bind(ui.body, '[data-phrase]', event => { s.phrase = event.currentTarget.dataset.phrase; render(); }, context); toolbar(ui, 'Comprobar pedido de ayuda', () => { const allowed = ['Profesor', 'Orientadora', 'Persona cuidadora']; if (!allowed.includes(s.adult) || s.phrase !== level.phrase) { context.feedback('Elige una persona adulta disponible y una frase que cuente lo ocurrido sin responder al mensaje.', 'retry'); return; } s.ready = true; context.feedback('La petición explica la situación y busca acompañamiento.', 'correct'); context.celebrate(); render(); }, context.signal); if (s.ready) nextButton(root, context, ui, s, levels.length, () => { delete s.adult; delete s.phrase; render(); }, 'Elegiste personas adultas y formas claras de pedir ayuda.', { decided: true }); }
    render();
  }

  const helpOrder = ['Qué apareció', 'Qué hice', 'Qué ayuda necesito'];
  function safeAskHelp(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store; s.order ??= [];
    function render() { ui.progress(`Mensaje de ayuda · ${s.order.length} de 3 partes`, s.order.length / 3); ui.body.innerHTML = `<div class="help-order-game"><p class="path-task">Construye una explicación clara en tres partes.</p><div class="help-result">${s.order.map((label, index) => `<span><strong>${index + 1}</strong>${label}</span>`).join('') || '<span>El mensaje aparecerá aquí.</span>'}</div><div class="help-pieces">${shuffle(helpOrder.filter(label => !s.order.includes(label))).map(label => `<button type="button" data-help-piece="${label}">${label}</button>`).join('')}</div>${s.order.length ? '<button type="button" class="demo-button" data-help-undo>Quitar última parte</button>' : ''}</div>`; bind(ui.body, '[data-help-piece]', event => { const expected = helpOrder[s.order.length]; if (event.currentTarget.dataset.helpPiece !== expected) { context.feedback('Primero contamos qué apareció; después qué hicimos y finalmente qué ayuda necesitamos.', 'retry'); return; } s.order.push(expected); context.feedback('Esa parte está en un lugar claro.', 'correct'); render(); }, context); ui.body.querySelector('[data-help-undo]')?.addEventListener('click', () => { s.order.pop(); render(); }, { signal: context.signal }); ui.toolbar.innerHTML = ''; if (s.order.length === 3) { s.ready = true; s.solved = 1; s.decided = true; toolbar(ui, 'Terminar práctica ✓', () => finish(root, context, 'Ordenaste una explicación breve para pedir ayuda.'), context.signal); } }
    render();
  }

  function safePlan(root, context) {
    const ui = setup(root, context); if (!ui) return; const s = context.store, stages = ['Detener', 'Cerrar o alejarse', 'Contar a un adulto']; s.round ??= 0; s.position ??= 0;
    function render() { ui.progress(`Escenario ${s.round + 1} de 3 · Paso ${s.position + 1}`, (s.round * 3 + s.position) / 9); ui.body.innerHTML = `<div class="safe-plan-game">${E.safetyScene(s.round)}<p class="path-task">Aplica el plan en orden.</p><div class="safe-plan-track">${stages.map((label, index) => `<span class="${index < s.position ? 'is-done' : index === s.position ? 'is-current' : ''}"><strong>${index + 1}</strong>${label}</span>`).join('')}</div><div class="safe-story-options">${shuffle(stages).map(label => `<button type="button" data-plan-step="${label}">${label}</button>`).join('')}</div></div>`; bind(ui.body, '[data-plan-step]', event => { if (event.currentTarget.dataset.planStep !== stages[s.position]) { context.feedback('El plan empieza por detener la interacción, después cerrar y finalmente contar.', 'retry'); return; } s.position++; if (s.position === 3) { s.ready = true; context.feedback('Aplicaste las tres acciones en orden.', 'correct'); context.celebrate(); } else context.feedback('Continúa con la siguiente acción segura.', 'correct'); render(); }, context); ui.toolbar.innerHTML = ''; if (s.ready) nextButton(root, context, ui, s, 3, () => { s.position = 0; render(); }, 'Aplicaste detener, cerrar y contar en tres escenarios.', { decided: true }); }
    render();
  }

  const finalSets = {
    patterns: [['Continuar la secuencia', 'pattern-complete'], ['Encontrar la unidad', 'pattern-group'], ['Reparar la regla', 'pattern-repair'], ['Descifrar el mensaje', 'cipher-decode']],
    loops: [['Comprimir acciones', 'loop-compress'], ['Construir el bucle', 'loop-build'], ['Programar el recorrido', 'loop-route'], ['Reparar la cantidad', 'loop-fix-count']],
    loopPractice: [['Predecir el resultado', 'loop-predict'], ['Calcular una ruta', 'loop-recycle'], ['Proteger el sendero', 'loop-bear'], ['Adaptar el programa', 'loop-adapt']],
    debug: [['Comparar resultados', 'debug-compare'], ['Localizar la diferencia', 'debug-trace'], ['Reparar un programa', 'debug-repair'], ['Comprobar un bucle', 'debug-loop']],
    safety: [['Reconocer datos', 'safe-data-sort'], ['Elegir ayuda', 'safe-trusted'], ['Decidir con calma', 'safe-story'], ['Aplicar el plan', 'safe-stop-close-tell']],
  };
  function finalGame(kind) { return (root, context) => G.runFinal(root, context, finalSets[kind]); }

  Object.assign(C, {
    'pattern-complete': patternComplete, 'pattern-group': patternGroup, 'pattern-rule': patternRule, 'pattern-repair': patternRepair,
    'cipher-decode': (root, context) => cipherGame(root, context, false), 'cipher-encode': (root, context) => cipherGame(root, context, true),
    'loop-compress': (root, context) => loopChoice(root, context, 'compress'), 'loop-count': (root, context) => loopChoice(root, context, 'count'),
    'loop-expand': (root, context) => loopBuild(root, context, true), 'loop-build': (root, context) => loopBuild(root, context, false),
    'loop-route': (root, context) => loopRoute(root, context, 'route'), 'loop-fix-count': (root, context) => loopRoute(root, context, 'fix'),
    'loop-predict': loopPredict, 'loop-safe-count': loopSafeCount, 'loop-recycle': (root, context) => contextLoops(root, context, 'recycle'),
    'loop-contexts': (root, context) => contextLoops(root, context, 'contexts'), 'loop-bear': (root, context) => loopMission(root, context, false),
    'loop-adapt': (root, context) => loopMission(root, context, true),
    'debug-compare': (root, context) => debugChoices(root, context, 'compare'), 'debug-first-error': debugTrace,
    'debug-trace': debugTrace, 'debug-classify': (root, context) => debugChoices(root, context, 'classify'),
    'debug-repair': debugRepair, 'debug-loop': (root, context) => loopRoute(root, context, 'fix'),
    'safe-data-sort': safeDataSort, 'safe-profile': safeProfile, 'safe-trusted': safeTrusted, 'safe-ask-help': safeAskHelp,
    'safe-story': safeStories, 'safe-stop-close-tell': safePlan,
    'path-final-patterns': finalGame('patterns'), 'path-final-loops': finalGame('loops'),
    'path-final-loop-practice': finalGame('loopPractice'), 'path-final-debug': finalGame('debug'), 'path-final-safety': finalGame('safety'),
  });
})();
