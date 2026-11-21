'use strict';
(() => {
  const G = window.ClassGames;
  const directions = {
    up: { icon: '↑', label: 'Arriba', dx: 0, dy: -1 },
    right: { icon: '→', label: 'Derecha', dx: 1, dy: 0 },
    down: { icon: '↓', label: 'Abajo', dx: 0, dy: 1 },
    left: { icon: '←', label: 'Izquierda', dx: -1, dy: 0 },
  };
  const objectNames = { envelope: 'sobre', mailbox: 'buzón', berries: 'canasta de bayas', bridge: 'puente', flag: 'bandera', stone: 'piedra', puddle: 'charco', flower: 'flor' };
  const art = id => `<span class="program-art program-art-${id}" role="img" aria-label="${objectNames[id] || id}"></span>`;
  const key = (x, y) => `${x},${y}`;
  const contains = (points = [], position) => points.some(([x, y]) => x === position[0] && y === position[1]);
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.querySelector('.motion-reduced');
  const wait = (ms, context) => new Promise(resolve => {
    if (reduced()) { resolve(!context.signal.aborted); return; }
    let remaining = ms;
    const tick = () => {
      if (context.signal.aborted) { resolve(false); return; }
      if (!context.paused() && !document.hidden) remaining -= 25;
      if (remaining <= 0) resolve(true); else setTimeout(tick, 25);
    };
    tick();
  });
  function cellObject(map, x, y, state = {}) {
    const at = id => map[id] && same(map[id], [x, y]);
    if (at('envelope') && !state.collected) return art('envelope');
    if (at('mailbox')) return art('mailbox');
    if (at('berries') && !state.collected) return art('berries');
    if (at('flag')) return art('flag');
    if (contains(map.bridges, [x, y])) return art('bridge');
    if (contains(map.flowers, [x, y])) return art('flower');
    return '';
  }
  function board(map, position = map.start, state = {}, options = {}) {
    const selectable = new Set((options.selectable || []).map(point => key(...point)));
    return `<div class="program-board program-cols-${map.cols} program-rows-${map.rows}" role="grid" aria-label="Tablero de ${map.cols} columnas y ${map.rows} filas">
      ${Array.from({ length: map.cols * map.rows }, (_, index) => {
        const x = index % map.cols, y = Math.floor(index / map.cols), blocked = contains(map.blocks, [x, y]), puddle = contains(map.puddles, [x, y]), start = same(map.start, [x, y]);
        const tag = selectable.has(key(x, y)) ? 'button' : 'span';
        return `<${tag} ${tag === 'button' ? 'type="button"' : ''} class="program-cell ${blocked ? 'is-blocked' : ''} ${puddle ? 'is-puddle' : ''} ${start ? 'is-start' : ''} ${selectable.has(key(x, y)) ? 'is-selectable' : ''}" data-x="${x}" data-y="${y}" role="gridcell" aria-label="Columna ${x + 1}, fila ${y + 1}${start ? ', inicio' : ''}">${start ? '<small>Inicio</small>' : ''}${cellObject(map, x, y, state)}</${tag}>`;
      }).join('')}
      <span class="program-walker program-x-${position[0]} program-y-${position[1]}" role="img" aria-label="Lechuza en columna ${position[0] + 1}, fila ${position[1] + 1}">${G.picture('owl')}</span>
    </div>`;
  }
  function blockList(queue, state = {}, options = {}) {
    if (!queue.length) return '<div class="program-list is-empty"><span>Agrega bloques aquí.</span></div>';
    return `<div class="program-list" role="list" aria-label="Programa de flechas">${queue.map((id, index) => `<button type="button" role="listitem" class="program-block ${state.active === index ? 'is-active' : ''} ${state.failed === index ? 'is-error' : ''} ${state.selected === index ? 'is-selected' : ''}" data-program-block="${index}" ${options.disabled ? 'disabled' : ''} aria-label="Bloque ${index + 1}: ${directions[id].label}"><small>${index + 1}</small><strong>${directions[id].icon}</strong><span>${directions[id].label}</span></button>`).join('')}</div>`;
  }
  const palette = disabled => `<div class="program-palette" role="group" aria-label="Bloques de dirección">${Object.entries(directions).map(([id, item]) => `<button type="button" data-program-add="${id}" ${disabled ? 'disabled' : ''}><strong>${item.icon}</strong><span>${item.label}</span><kbd>${({ up: '↑', right: '→', down: '↓', left: '←' })[id]}</kbd></button>`).join('')}</div>`;
  function moveWalker(root, position) {
    const walker = root.querySelector('.program-walker');
    if (!walker) return;
    [...walker.classList].filter(name => /^program-[xy]-\d+$/.test(name)).forEach(name => walker.classList.remove(name));
    walker.classList.add(`program-x-${position[0]}`, `program-y-${position[1]}`);
    walker.setAttribute('aria-label', `Lechuza en columna ${position[0] + 1}, fila ${position[1] + 1}`);
  }
  function nextPosition(position, id) { const d = directions[id]; return [position[0] + d.dx, position[1] + d.dy]; }
  function valid(map, position) { return position[0] >= 0 && position[1] >= 0 && position[0] < map.cols && position[1] < map.rows && !contains(map.blocks, position) && !contains(map.puddles, position); }
  async function animateMove(root, from, to, context) {
    const walker = root.querySelector('.program-walker');
    if (!walker) return false;
    walker.classList.add('is-moving'); moveWalker(root, to);
    const ok = await wait(420, context); walker.classList.remove('is-moving'); return ok;
  }
  async function execute(root, map, queue, context, hooks = {}) {
    let position = [...map.start], collected = false, visited = [[...map.start]];
    moveWalker(root, position);
    for (let index = 0; index < queue.length; index++) {
      hooks.active?.(index, position); const to = nextPosition(position, queue[index]);
      if (!await wait(130, context)) return { aborted: true };
      if (!valid(map, to)) return { position, failed: index, collected, visited };
      if (!await animateMove(root, position, to, context)) return { aborted: true };
      position = to; visited.push([...position]); hooks.step?.(index, position);
      if ((!collected && map.envelope && same(position, map.envelope)) || (!collected && map.berries && same(position, map.berries))) {
        collected = true; root.querySelector(`.program-cell[data-x="${position[0]}"][data-y="${position[1]}"] .program-art`)?.classList.add('is-collected'); hooks.collect?.(position);
      }
    }
    hooks.active?.(-1, position); return { position, collected, failed: -1, visited };
  }
  const arrowKeys = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left' };
  function listenArrows(context, callback) { G.shared.listenKey(context, event => { const id = arrowKeys[event.key]; if (id) { event.preventDefault(); callback(id); } }); }
  let ready;
  window.ProgrammingFirst = { directions, art, board, blockList, palette, contains, same, wait, nextPosition, valid, animateMove, execute, listenArrows, moveWalker, ready: () => ready ??= new Promise((resolve, reject) => { const image = new Image(); image.onload = resolve; image.onerror = () => { ready = null; reject(Error('No pudimos cargar las ilustraciones de programación.')); }; image.src = 'assets/programming-journey-v1.png'; }) };
})();
