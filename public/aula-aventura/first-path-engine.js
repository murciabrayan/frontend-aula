'use strict';
(() => {
  const G = window.ClassGames, P = window.ProgrammingFirst;
  const actions = P.directions;
  const spriteNames = ['beads', 'tiles', 'key', 'message', 'recycle', 'earth', 'rocket', 'goal', 'bear', 'butterfly', 'backpack', 'bridge'];
  const labels = { beads: 'collar con patrón', tiles: 'fichas geométricas', key: 'llave', message: 'mensaje con símbolos', recycle: 'contenedor de reciclaje', earth: 'planeta Tierra', rocket: 'cohete', goal: 'portería y balón', bear: 'oso de anteojos', butterfly: 'mariposa', backpack: 'mochila', bridge: 'puente' };
  const tokenLabels = { coral: 'rojo coral', gold: 'amarillo', blue: 'azul', leaf: 'hoja', flower: 'flor', circle: 'círculo', triangle: 'triángulo', star: 'estrella', square: 'cuadrado', moon: 'luna', sun: 'sol', mountain: 'montaña' };
  const cipher = { A: '●', E: '◆', L: '▲', M: '≈', N: '■', O: '☀', S: '✦', U: '☾' };
  const escape = value => G.shared.escape(value);
  const art = id => `<span class="path-art path-art-${id}" role="img" aria-label="${labels[id] || id}"></span>`;
  const safetyScene = index => `<span class="safety-scene safety-scene-${index}" role="img" aria-label="Escena escolar ficticia ${index + 1}"></span>`;
  function token(id, options = {}) {
    const label = tokenLabels[id] || id;
    const tag = options.button ? 'button' : 'span';
    return `<${tag} ${tag === 'button' ? 'type="button"' : ''} class="pattern-token token-${id} ${options.selected ? 'is-selected' : ''} ${options.error ? 'is-error' : ''} ${options.correct ? 'is-correct' : ''}" ${options.index !== undefined ? `data-token-index="${options.index}"` : ''} aria-label="${label}"><span aria-hidden="true"></span></${tag}>`;
  }
  const patternRow = (sequence, options = {}) => `<div class="pattern-row" role="list" aria-label="Secuencia de ${sequence.length} elementos">${sequence.map((id, index) => id === '?' ? `<span class="pattern-blank" ${options.blankIndex === index ? 'data-active-blank="true"' : ''} aria-label="Espacio ${index + 1}">?</span>` : token(id, { button: options.buttons, index, selected: options.selected === index, error: options.error === index, correct: options.correct === index })).join('')}</div>`;
  const actionIcon = id => actions[id]?.icon || '·';
  const actionName = id => actions[id]?.label || id;
  function actionCards(queue, options = {}) {
    return `<div class="path-action-list" role="list" aria-label="Lista de acciones">${queue.map((id, index) => `<span role="listitem" class="path-action ${options.active === index ? 'is-active' : ''} ${options.error === index ? 'is-error' : ''} ${options.selected === index ? 'is-selected' : ''}" ${options.buttons ? `tabindex="0" role="button" data-action-index="${index}"` : ''}><small>${index + 1}</small><strong>${actionIcon(id)}</strong><span>${actionName(id)}</span></span>`).join('')}</div>`;
  }
  function loopBlock(action, count, options = {}) {
    return `<div class="loop-block ${options.selected ? 'is-selected' : ''}" ${options.button ? 'role="button" tabindex="0" data-loop-choice="${escape(options.value || `${action}:${count}`)}"' : ''}><span class="loop-cap">REPETIR <strong>${count}</strong> ${count === 1 ? 'VEZ' : 'VECES'}</span><span class="loop-action"><strong>${actionIcon(action)}</strong><span>${actionName(action)}</span></span></div>`;
  }
  const expandedLoop = (action, count) => actionCards(Array.from({ length: count }, () => action));
  function loopEditor(action, count, options = {}) {
    return `<div class="loop-editor"><div class="loop-direction-picker" role="group" aria-label="Dirección del bucle">${Object.entries(actions).map(([id, item]) => `<button type="button" data-loop-action="${id}" aria-pressed="${id === action}" ${options.disabled ? 'disabled' : ''}><strong>${item.icon}</strong><span>${item.label}</span></button>`).join('')}</div><div class="loop-counter"><button type="button" data-loop-minus aria-label="Restar una repetición" ${count <= 1 || options.disabled ? 'disabled' : ''}>−</button><span><strong>${count}</strong><small>${count === 1 ? 'vez' : 'veces'}</small></span><button type="button" data-loop-plus aria-label="Agregar una repetición" ${count >= (options.max || 8) || options.disabled ? 'disabled' : ''}>+</button></div>${loopBlock(action, count)}</div>`;
  }
  function bindEditor(root, state, render, context, options = {}) {
    root.querySelectorAll('[data-loop-action]').forEach(button => button.addEventListener('click', () => { if (context.paused()) return; state.action = button.dataset.loopAction; render(); }, { signal: context.signal }));
    root.querySelector('[data-loop-minus]')?.addEventListener('click', () => { state.count = Math.max(1, state.count - 1); render(); }, { signal: context.signal });
    root.querySelector('[data-loop-plus]')?.addEventListener('click', () => { state.count = Math.min(options.max || 8, state.count + 1); render(); }, { signal: context.signal });
  }
  const expandProgram = segments => segments.flatMap(segment => segment.type === 'loop' ? Array.from({ length: segment.count }, () => segment.action) : [segment.action]);
  async function executeProgram(root, map, segments, context, hooks = {}) {
    const queue = expandProgram(segments);
    return P.execute(root, map, queue, context, hooks);
  }
  const same = P.same;
  const board = P.board;
  const palette = P.palette;
  const wait = P.wait;
  function selectableBoard(map, position, choices) { return P.board(map, position, {}, { selectable: choices }); }
  function focusButton(button) { button?.focus({ preventScroll: true }); }
  let ready;
  function loadImage(src) { return new Promise((resolve, reject) => { const image = new Image(); image.onload = resolve; image.onerror = reject; image.src = src; }); }
  window.FirstPath = {
    actions, cipher, spriteNames, escape, art, safetyScene, token, patternRow, actionCards, loopBlock, expandedLoop, loopEditor, bindEditor,
    expandProgram, executeProgram, board, selectableBoard, palette, wait, same, focusButton,
    ready: () => ready ??= Promise.all([loadImage('assets/first-path-objects-v1.png'), loadImage('assets/digital-safety-scenes-v1.png')]).catch(error => { ready = null; throw error; }),
  };
})();
