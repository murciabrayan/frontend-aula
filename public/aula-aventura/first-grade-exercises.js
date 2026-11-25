'use strict';
(() => {
  const { frame, toolbar, finish, completed, listenKey, escape } = window.ClassGames.shared;
  const { activities } = window.FirstGradeCurriculum;
  const directions = {
    left: ['←', 'Izquierda', -1, 0], up: ['↑', 'Arriba', 0, -1],
    down: ['↓', 'Abajo', 0, 1], right: ['→', 'Derecha', 1, 0],
  };
  const keys = { ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down', ArrowRight: 'right' };
  const samePoint = (a, b) => a.x === b.x && a.y === b.y;
  const pictures = { '🦉': 'owl', '☀️': 'sun', '🌙': 'moon', '🦋': 'butterfly', '🌸': 'flower' };
  const icon = value => `<span class="curr-icon" aria-hidden="true">${pictures[value] ? window.ClassGames.picture(pictures[value]) : escape(value)}</span>`;
  const label = card => `${icon(card.icon)}<span>${escape(card.text)}</span>`;
  const cards = items => `<div class="curr-demo-cards">${items.map(item => `<div class="curr-tile">${label(item)}</div>`).join('')}</div>`;
  const codeTable = alphabet => `<div class="curr-codebook" role="list" aria-label="Clave del murciélago">${[...alphabet].map((letter, index) => `<div class="curr-tile" role="listitem"><b>${escape(letter)}</b><span>${index}</span></div>`).join('')}</div>`;
  const button = (action, text, value, extra = '') => `<button type="button" class="curr-tile" data-action="${action}" data-value="${escape(value)}" ${extra}>${text}</button>`;

  function evaluateRoute(level, queue) {
    const map = level.rows.map(row => [...row]);
    const row = level.rows.findIndex(line => line.includes('A'));
    const path = [{ x: level.rows[row].indexOf('A'), y: row }];
    const collected = new Set();
    for (const [index, action] of queue.entries()) {
      const [,, dx, dy] = directions[action];
      const last = path.at(-1);
      const next = { x: last.x + dx, y: last.y + dy };
      const cell = map[next.y]?.[next.x];
      if (!cell || cell === 'X' || (level.strict && cell === '.')) return { path, collected, failed: index, reached: false };
      path.push(next);
      if (cell === '+') collected.add(`${next.x},${next.y}`);
    }
    const end = path.at(-1);
    const targets = map.flat().filter(cell => cell === '+').length;
    return { path, collected, reached: map[end.y][end.x] === 'M', missing: targets - collected.size };
  }

  function renderDemo(step, host) {
    host.innerHTML = `<div class="curr-demo">${step.codebook ? codeTable(step.codebook) : cards(step.cards)}</div>`;
  }

  function mount(spec, root, context) {
    const state = context.store;
    if (state.complete) { completed(root, context); return; }
    const ui = frame(root, context);
    state.round ??= 0;
    let running = false;
    const round = () => spec.rounds[state.round];
    const boardMode = ['route', 'loop-route', 'repair', 'reorder'].includes(spec.type);
    const isLoop = spec.type === 'loop-route';
    const locked = () => context.paused() || context.signal.aborted || state.ready || running;
    const text = value => `<p class="curr-prompt">${escape(value)}</p>`;

    function render() {
      const data = round();
      const count = spec.rounds.length;
      ui.progress(data.alternate ? `Camino ${state.firstPath ? 2 : 1} de 2` : `Reto ${state.round + 1} de ${count}`,
        data.alternate ? (state.ready ? 1 : state.firstPath ? .5 : 0) : (state.round + Number(!!state.ready)) / count);
      let body;
      if (boardMode) body = renderBoard(data);
      else if (spec.type === 'order') body = renderOrder(data);
      else if (spec.type === 'type') body = renderTyping(data);
      else body = renderChoices(data);
      ui.body.innerHTML = `<div class="curr-workspace">${body}</div>`;
      toolbar(ui, '', null, context.signal);
      if (state.ready) {
        toolbar(ui, state.round + 1 === count ? 'Terminar práctica ✓' : 'Siguiente reto →', advance, context.signal);
      } else if (boardMode && data.alternate && state.firstPath && state.awaitAlternate) {
        toolbar(ui, 'Construir otro camino', () => {
          state.awaitAlternate = false; state.queue = []; delete state.selected; resetBoard();
        }, context.signal);
      } else if (boardMode && !running) {
        toolbar(ui, 'Ejecutar', runBoard, context.signal);
      }
    }

    function advance() {
      if (context.paused() || !state.ready) return;
      if (state.round + 1 >= spec.rounds.length) {
        finish(root, context, '¡Completaste la práctica! Cuéntale al grupo cómo lo hiciste.');
        return;
      }
      state.round++;
      for (const key of ['ready', 'selected', 'chosen', 'input', 'queue', 'count', 'direction', 'extra', 'firstPath', 'awaitAlternate', 'result', 'failed']) delete state[key];
      context.feedback('');
      render();
      ui.body.querySelector('button:not([disabled]), input:not([disabled])')?.focus({ preventScroll: true });
    }

    function solved(message) {
      state.ready = true;
      context.feedback(message, 'correct');
      context.celebrate();
      render();
      ui.toolbar.querySelector('button')?.focus({ preventScroll: true });
    }

    function renderChoices(data) {
      const source = spec.type === 'sort'
        ? `<div class="curr-tile curr-source" ${state.ready ? '' : 'draggable="true"'}>${label(data.item)}</div>`
        : icon(data.icon) + text(data.prompt);
      return `<div class="curr-feature">${source}</div><div class="curr-options">${data.options.map(option =>
        button('choice', escape(option), option, `${state.ready ? 'disabled' : ''}${state.selected === option ? ' aria-pressed="true"' : ''}`)).join('')}</div>`;
    }

    function renderOrder(data) {
      state.chosen ??= [];
      const available = data.cards.map((card, index) => ({ card, index })).reverse();
      if (available.length > 2) available.push(available.shift());
      const options = available.filter(({ index }) => !state.chosen.includes(index));
      return `${text(data.prompt)}<div class="curr-track" data-drop-order aria-label="Orden que elegiste">${data.cards.map((_, index) =>
        `<span class="curr-slot">${state.chosen[index] === undefined ? `<b>${index + 1}</b>` : label(data.cards[state.chosen[index]])}</span>`).join('')}</div>
        <div class="curr-options">${options.map(({ card, index }) => button('order', label(card), index, 'draggable="true"')).join('')}</div>`;
    }

    function renderTyping(data) {
      const model = escape(data.model).replace(/\[([^\]]+)\]/g, '<mark>$1</mark>');
      const codebook = data.codebook ? codeTable(data.codebook) : '';
      const keyboard = data.keys || [...new Set(`${data.answer}ALSNROET`)].join('');
      return `${codebook}<div class="curr-feature">${icon(data.icon)}${text(data.prompt)}${model ? `<div class="curr-model">${model}</div>` : ''}</div>
        <form class="curr-form"><label for="curr-answer">Tu respuesta</label><input id="curr-answer" type="text" inputmode="${/^\d+$/.test(data.answer) ? 'numeric' : 'text'}" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" value="${escape(state.input || '')}" ${state.ready ? 'disabled' : ''}>
        <button type="submit" class="green-button" ${state.ready ? 'disabled' : ''}>Comprobar</button></form>
        <div class="curr-keypad" aria-label="Teclas en pantalla">${[...keyboard].map(key => button('letter', escape(key), key, state.ready ? 'disabled' : '')).join('')}${button('erase', '⌫', '', `aria-label="Borrar última letra" ${state.ready ? 'disabled' : ''}`)}</div>`;
    }

    function renderBoard(level) {
      state.queue ??= [...(level.initial ?? [])];
      state.direction ??= 'right';
      state.count ??= 2;
      const start = evaluateRoute(level, []).path[0];
      const final = state.result?.path?.at(-1) || start;
      const done = state.result?.collected || new Set();
      const board = level.rows.flatMap((row, y) => [...row].map((token, x) => {
        const item = { X: '🪨', M: level.goal || '🏁', '+': level.target || '⭐' }[token] || '';
        const taken = done.has(`${x},${y}`);
        const actor = samePoint({ x, y }, final);
        const description = token === 'A' ? ' Inicio' : token === 'X' ? ' Bloqueo' : token === 'M' ? ' Meta' : token === '+' ? taken ? ' Visitada' : ' Objetivo' : '';
        return `<span class="curr-cell ${token === 'X' ? 'is-rock' : token === '+' ? 'is-target' : ''} ${taken ? 'is-taken' : ''}" role="gridcell" data-cell="${x},${y}" aria-label="Columna ${x + 1}, fila ${y + 1}${description}"><span class="curr-cell-item" aria-hidden="true">${escape(item)}</span><span class="curr-walker" aria-hidden="true" ${actor ? '' : 'hidden'}>${window.ClassGames.picture('owl')}</span></span>`;
      })).join('');
      const disabled = state.ready || running || state.awaitAlternate ? 'disabled' : '';
      const palette = Object.entries(directions).map(([value, [symbol, name]]) => button('direction', symbol, value,
        `aria-label="${name}" ${isLoop ? `aria-pressed="${state.direction === value}"` : ''} ${disabled}`)).join('');
      const queue = isLoop ? `<div class="curr-loop"><b>Repetir</b>${button('count', '−', -1, `aria-label="Quitar una vuelta" ${disabled || (state.count <= 1 ? 'disabled' : '')}`)}<b>${state.count}</b>${button('count', '+', 1, `aria-label="Añadir una vuelta" ${disabled || (state.count >= 6 ? 'disabled' : '')}`)}<b>${directions[state.direction][0]}</b><label>Después <select data-extra aria-label="Flecha después del bucle" ${disabled}><option value="">Sin otra flecha</option>${Object.entries(directions).map(([id, [arrow, name]]) => `<option value="${id}" ${state.extra === id ? 'selected' : ''}>${arrow} ${name}</option>`).join('')}</select></label></div>`
        : `<div class="curr-queue" aria-label="Orden de los bloques">${state.queue.length ? state.queue.map((dir, index) => button('block', `${index + 1}. ${directions[dir][0]}`, index,
          `aria-label="Bloque ${index + 1}: ${directions[dir][1]}" aria-pressed="${state.selected === index}" ${state.failed === index ? 'data-failed' : ''} ${disabled}`)).join('') : '<span>Agrega flechas al programa.</span>'}</div>`;
      const actions = spec.type === 'reorder'
        ? `${button('swap', 'Mover antes', -1, disabled)}${button('swap', 'Mover después', 1, disabled)}`
        : spec.type === 'route' ? `${button('undo', 'Quitar última', '', disabled)}${button('clear', 'Borrar programa', '', disabled)}` : '';
      return `${text(level.prompt)}<div class="curr-route-layout"><div class="curr-grid" role="grid" aria-label="Tablero de la lechuza" data-cols="${level.rows[0].length}">${board}</div>
        <div class="curr-route-tools"><p>${isLoop ? 'Dirección y cantidad' : spec.type === 'repair' ? 'Selecciona una flecha para cambiarla' : spec.type === 'reorder' ? 'Selecciona y mueve un bloque' : 'Agrega flechas o usa tu teclado'}</p>${queue}${spec.type === 'reorder' ? '' : `<div class="curr-keypad">${palette}</div>`}<div class="curr-route-actions">${actions}</div></div></div>`;
    }

    function resetBoard(message = '') {
      delete state.result;
      delete state.failed;
      context.feedback(message);
      render();
    }

    function direction(value) {
      if (locked() || state.awaitAlternate || spec.type === 'reorder') return;
      if (isLoop) state.direction = value;
      else if (Number.isInteger(state.selected)) { state.queue[state.selected] = value; delete state.selected; }
      else if (spec.type === 'repair') { context.feedback('Selecciona el bloque que vas a cambiar.'); return; }
      else if (state.queue.length < 12) state.queue.push(value);
      resetBoard();
    }

    function displayPosition(point, visited) {
      ui.body.querySelector('.curr-walker:not([hidden])')?.setAttribute('hidden', '');
      const cell = ui.body.querySelector(`[data-cell="${point.x},${point.y}"]`);
      cell?.querySelector('.curr-walker').removeAttribute('hidden');
      if (visited) cell?.classList.add('is-taken');
    }

    async function runBoard() {
      if (locked() || state.awaitAlternate) return;
      const level = round();
      const queue = isLoop ? Array(state.count).fill(state.direction).concat(state.extra ? [state.extra] : []) : state.queue;
      if (!queue.length) { context.feedback('Agrega alguna flecha para preparar el programa.', 'retry'); return; }
      running = true;
      resetBoard('Mira cómo se mueve la lechuza.');
      const result = evaluateRoute(level, queue);
      const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
      for (const point of result.path.slice(1)) {
        if (delay) await new Promise(resolve => setTimeout(resolve, delay));
        if (context.signal.aborted) return;
        displayPosition(point, result.collected.has(`${point.x},${point.y}`));
      }
      running = false;
      state.result = result;
      if (result.failed !== undefined) {
        state.failed = result.failed;
        context.feedback(`La flecha ${result.failed + 1} intenta llevar a la lechuza fuera del camino. Revísala y ejecuta otra vez.`, 'retry');
      } else if (!result.reached || result.missing) {
        context.feedback(result.missing ? 'Aún falta pasar por alguna casilla marcada.' : 'El programa terminó antes de llegar a la meta. Revisa las flechas.', 'retry');
      } else if (level.alternate) {
        if (queue.length !== 4 || state.firstPath === queue.join(',')) {
          context.feedback(queue.length !== 4 ? 'Busca el camino en cuatro pasos, rodeando la piedra.' : 'Ese es el camino que ya hiciste. Rodea la piedra por el otro lado.', 'retry');
        } else if (!state.firstPath) {
          state.firstPath = queue.join(',');
          state.awaitAlternate = true;
          context.feedback('¡Primer camino listo! Ahora encuentra otro, por el otro lado de la piedra.', 'correct');
        } else { solved('¡Encontraste dos caminos distintos para la misma meta!'); return; }
      } else { solved('¡El programa llegó a la meta y visitó todas las casillas pedidas!'); return; }
      render();
      ui.toolbar.querySelector('button')?.focus({ preventScroll: true });
    }

    function choose(value) {
      if (locked()) return;
      const data = round();
      if (value !== data.answer) { context.feedback(data.hint, 'retry'); return; }
      state.selected = value;
      solved('¡Muy bien! Esa elección coincide con lo que pide el reto.');
    }

    function place(index) {
      if (locked()) return;
      if (index !== state.chosen.length) { context.feedback(round().hint, 'retry'); return; }
      state.chosen.push(index);
      if (state.chosen.length === round().cards.length) solved('¡Pusiste todos los pasos en orden!');
      else { context.feedback('Ese paso va aquí. Busca el siguiente.'); render(); ui.body.querySelector('[data-action="order"]')?.focus({ preventScroll: true }); }
    }

    function type(value, erase = false) {
      const input = ui.body.querySelector('input');
      input.focus({ preventScroll: true });
      const start = input.selectionStart, end = input.selectionEnd;
      if (!erase && input.value.length - (end - start) >= input.maxLength) return;
      input.setRangeText(value, erase && start === end ? Math.max(0, start - 1) : start, end, 'end');
      state.input = input.value;
    }

    function swap(amount) {
      if (!Number.isInteger(state.selected)) { context.feedback('Elige el bloque que quieres mover.'); return; }
      const from = state.selected, to = from + amount;
      if (to < 0 || to >= state.queue.length) return;
      [state.queue[from], state.queue[to]] = [state.queue[to], state.queue[from]];
      state.selected = to;
      resetBoard();
    }

    ui.body.addEventListener('click', event => {
      const control = event.target.closest('[data-action]');
      if (!control || locked()) return;
      const { action, value } = control.dataset;
      if (state.awaitAlternate) return;
      switch (action) {
        case 'choice': choose(value); break;
        case 'order': place(Number(value)); break;
        case 'letter': type(value); break;
        case 'erase': type('', true); break;
        case 'direction': direction(value); break;
        case 'block': state.selected = Number(value); render(); break;
        case 'count': state.count += Number(value); resetBoard(); break;
        case 'swap': swap(Number(value)); break;
        case 'undo': state.queue.pop(); delete state.selected; resetBoard(); break;
        case 'clear': state.queue = []; delete state.selected; resetBoard(); break;
      }
    }, { signal: context.signal });
    ui.body.addEventListener('input', event => { if (event.target.matches('input')) state.input = event.target.value; }, { signal: context.signal });
    ui.body.addEventListener('change', event => { if (event.target.matches('[data-extra]') && !locked()) { state.extra = event.target.value; resetBoard(); } }, { signal: context.signal });
    ui.body.addEventListener('submit', event => {
      event.preventDefault();
      if (locked()) return;
      const answer = ui.body.querySelector('input').value.trim().normalize('NFD').replace(/\p{M}/gu, '').toLocaleUpperCase('es');
      if (answer === round().answer) solved('¡Bien! Escribiste lo que pedía el reto.');
      else context.feedback('Revisa cada letra o número del ejemplo y vuelve a comprobar.', 'retry');
    }, { signal: context.signal });

    if (spec.type === 'sort' || spec.type === 'order') {
      const target = spec.type === 'sort' ? '[data-action="choice"]' : '[data-drop-order]';
      ui.body.addEventListener('dragstart', event => {
        const source = event.target.closest('[draggable="true"]');
        if (!source || locked()) { event.preventDefault(); return; }
        event.dataTransfer.setData('text/plain', source.dataset.value ?? 'item');
      }, { signal: context.signal });
      ui.body.addEventListener('dragover', event => { if (!locked() && event.target.closest(target)) event.preventDefault(); }, { signal: context.signal });
      ui.body.addEventListener('drop', event => {
        const dropZone = event.target.closest(target);
        if (!dropZone || locked()) return;
        event.preventDefault();
        const item = event.dataTransfer.getData('text/plain');
        if (spec.type === 'sort' && item === 'item') choose(dropZone.dataset.value);
        else if (spec.type === 'order' && /^\d+$/.test(item)) place(Number(item));
      }, { signal: context.signal });
    }
    if (boardMode && spec.type !== 'reorder') listenKey(context, event => {
      if (!keys[event.key]) return;
      const host = event.target.closest?.('.curr-workspace');
      if (host && host !== ui.body.firstElementChild) return;
      event.preventDefault();
      direction(keys[event.key]);
    });
    render();
  }

  window.ClassChallenges ||= {};
  for (const [id, spec] of Object.entries(activities)) window.ClassChallenges[id] = (root, context) => mount(spec, root, context);
  window.FirstGradeExercises = { renderDemo, evaluateRoute };
})();
