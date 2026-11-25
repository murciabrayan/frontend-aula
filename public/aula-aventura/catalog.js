'use strict';
(async () => {
  if (document.documentElement.classList.contains('aula-auth-pending') && !await window.AulaTeacherAccess) return;
  const $ = id => document.getElementById(id);
  const { grades } = window.ClassroomCatalog;
  const releasedGrades = new Set(window.ClassroomCatalog.releasedGrades || grades.map(grade => grade.id));
  for (const grade of grades) {
    if (!releasedGrades.has(grade.id)) grade.classes.forEach(item => { item.available = false; });
  }
  const dialog = $('class-dialog');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const basePath = new URL(document.baseURI).pathname.replace(/\/?$/, '/');
  let viewKey = '', closeTimer, restoreRoute='';
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    desktop: svg('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4M7 8h3v3H7z"/>'),
    computer: svg('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>'),
    sequence: svg('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M15 6h4v5M5 14v5h5m7-10 2 2 2-2M8 17l2 2-2 2"/>'),
    repeat: svg('<path d="M20 8a8 8 0 0 0-14-2L3 9m0-5v5h5M4 16a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>'),
    blocks: svg('<path d="M4 3h5v2h6V3h5v7h-5v2H9v-2H4zM4 14h5v2h6v-2h5v7H4z"/>'),
    messages: svg('<path d="M3 4h13v10H9l-4 3v-3H3zM19 8h2v12h-4l-3-3h-3"/><path d="M7 8h5m-5 3h3"/>'),
    review: svg('<path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1-5.6-2.9L6.4 20l1.1-6.1L3 9.5l6.2-.9Z"/>'),
  };
  function illustration(kind, className = '') {
    if (['monitor', 'mouse', 'keyboard'].includes(kind)) return `<span class="device-sprite device-${kind} ${className}" aria-hidden="true"></span>`;
    return `<span class="topic-icon ${className}" aria-hidden="true">${icons[kind] || icons.computer}</span>`;
  }
  const secondHardware = new Set(['monitor','keyboard','mouse','tower','cpu','ram','drive','motherboard','folder','paint','window','ai']);
  const secondArt = id => `g2-art g2-${secondHardware.has(id) ? 'hardware' : 'programming'}-${id}`;
  const sprites = (family, ...ids) => ids.map(id => `${family} ${family}-${id}`);
  const device = id => `device-sprite device-${id}`;
  const kid = id => `kid-ui-icon icon-${id}`;
  const classArt = {
    'exploradores-digitales': [kid('login'), kid('key')],
    'partes-del-computador': [device('keyboard'), device('mouse')],
    escritorio: sprites('desktop-art', 'folder', 'paint'),
    tecnologia: sprites('tech-art', 'bicycle', 'umbrella'),
    instrucciones: sprites('sequence-art', 1, 3),
    'programacion-flechas': sprites('program-art', 'envelope', 'mailbox'),
    'patrones-mensajes': sprites('path-art', 'beads', 'key'),
    bucles: sprites('path-art', 'tiles', 'bridge'),
    'bucles-practica': sprites('path-art', 'earth', 'bear'),
    'errores-programas': [...sprites('project-art', 'map'), kid('retry')],
    'ciudadania-digital': [kid('lock'), ...sprites('path-art', 'message')],
    scratch: [...sprites('project-art', 'robot'), secondArt('flag')],
    animaciones: sprites('path-art', 'butterfly', 'rocket'),
    mensajes: [secondArt('bee'), secondArt('bell')],
    proyecto: sprites('project-art', 'robot', 'blueprint'),
    historias: [...sprites('desktop-art', 'stories'), secondArt('capybara')],
    juego: sprites('program-art', 'flag', 'bridge'),
  };
  const partArt = {
    'exploradores-digitales': {
      'inicio-sesion': [kid('user'), kid('key')],
      'rincon-digital': [device('monitor'), ...sprites('desktop-art', 'folder')],
      'artistas-digitales': [...sprites('desktop-art', 'paint'), ...sprites('tech-art', 'pencil')],
      'guardar-tesoros': sprites('desktop-art', 'work', 'photos'),
    },
    'partes-del-computador': {
      monitor: [device('mouse'), kid('confirm')],
      mouse: [device('mouse'), ...sprites('desktop-art', 'photos')],
      keyboard: [device('keyboard'), kid('next')],
      repaso: [device('keyboard'), ...sprites('program-art', 'flag')],
    },
    tecnologia: {
      objetos: sprites('tech-art', 'leaf', 'pencil'),
      necesidades: sprites('tech-art', 'umbrella', 'flashlight'),
      informacion: sprites('tech-art', 'phone', 'book'),
      repaso: sprites('tech-art', 'cloud', 'battery'),
    },
    instrucciones: {
      orden: sprites('sequence-art', 4),
      claridad: sprites('sequence-art', 8),
      prueba: sprites('sequence-art', 10),
      repaso: sprites('sequence-art', 2),
    },
    'programacion-flechas': {
      bloques: sprites('program-art', 'flag', 'flower'),
      construimos: sprites('program-art', 'mailbox', 'berries'),
      corregimos: sprites('program-art', 'stone', 'puddle'),
      repaso: sprites('program-art', 'berries', 'bridge'),
    },
    'patrones-mensajes': {
      patrones: sprites('path-art', 'beads', 'tiles'),
      reglas: sprites('path-art', 'tiles', 'butterfly'),
      codigos: sprites('path-art', 'key', 'message'),
      repaso: sprites('path-art', 'beads', 'goal'),
    },
    bucles: {
      repeticion: sprites('path-art', 'beads', 'butterfly'),
      'bloque-repetir': sprites('path-art', 'tiles', 'key'),
      programas: sprites('path-art', 'bridge', 'backpack'),
      repaso: sprites('path-art', 'rocket', 'goal'),
    },
    'bucles-practica': {
      predecimos: sprites('path-art', 'rocket', 'earth'),
      contextos: sprites('path-art', 'recycle', 'goal'),
      adaptamos: sprites('path-art', 'bear', 'backpack'),
      repaso: sprites('path-art', 'bridge', 'rocket'),
    },
    'errores-programas': {
      observamos: [...sprites('project-art', 'map'), ...sprites('path-art', 'goal')],
      localizamos: sprites('path-art', 'tiles', 'bridge'),
      corregimos: [...sprites('program-art', 'stone'), kid('retry')],
      repaso: [...sprites('project-art', 'blueprint'), ...sprites('desktop-art', 'work')],
    },
    'ciudadania-digital': {
      datos: [kid('lock'), kid('user')],
      confianza: [...sprites('path-art', 'bear'), kid('user')],
      decisiones: [...sprites('path-art', 'message'), kid('retry')],
      repaso: [kid('confirm'), ...sprites('path-art', 'butterfly')],
    },
    proyecto: {
      requisitos: sprites('project-scene', 0),
      diseno: sprites('project-scene', 1),
      programacion: sprites('project-scene', 3),
      repaso: sprites('project-scene', 7),
    },
  };
  function artwork(classes, size) {
    return `<span class="catalog-art catalog-art-${size} ${classes.length === 1 ? 'is-single' : ''}">${classes.map(name => `<span class="${escape(name)}"></span>`).join('')}</span>`;
  }
  function partIllustration(item, part) {
    if (Number.isInteger(part.trust)) return artwork(sprites('g2-trust-scene', part.trust), 'part');
    const art = part.art?.map(secondArt) || partArt[item.id]?.[part.id];
    return art ? artwork(art, 'part') : illustration(part.illustration);
  }
  const routeURL = path => `${basePath}${path.replace(/^\/+/, '')}`;
  function currentRoute() {
    const legacyPath = location.hash.startsWith('#/') ? location.hash.slice(1) : '';
    const relativePath = location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length) : '';
    const path = legacyPath || (relativePath && !/^index(?:\.html)?\/?$/.test(relativePath) ? `/${relativePath}` : '/grados');
    const match = path.match(/^\/grado\/([1-5])(?:\/clase\/([a-z0-9-]+))?\/?$/);
    if (!match) return { path: '/grados', grade: null, item: null };
    const grade = grades.find(item => item.id === match[1]);
    const item = match[2] && grade.classes.find(item => item.id === match[2] && item.available);
    return { path: item ? `/grado/${grade.id}/clase/${item.id}` : `/grado/${grade.id}`, grade, item: item || null };
  }
  function navigate(path, replace = false) {
    const isModal = path.includes('/clase/');
    history[replace ? 'replaceState' : 'pushState']({ catalogModal: isModal && !replace }, '', routeURL(path));
    renderRoute(true);
  }
  function breadcrumb(grade) {
    $('breadcrumbs').innerHTML = grade
      ? `<a href="${routeURL('/grados')}" data-route="/grados">${svg('<path d="m9 5-7 7 7 7m-7-7h20"/>')} Todos los grados</a><span class="breadcrumb-divider" aria-hidden="true">/</span><span aria-current="page">${escape(grade.name)}</span>`
      : '<span aria-current="page">Informática</span>';
  }
  function showGrades() {
    $('page-eyebrow').textContent = 'APRENDAMOS JUNTOS';
    $('page-title').textContent = 'Nuestros grados';
    $('page-description').textContent = 'Elige el grado para ver sus clases de informática.';
    $('catalog-content').innerHTML = `<div class="grade-grid">${grades.map(grade => {
      const available = grade.classes.filter(item => item.available).length;
      return `<a class="grade-card tone-${grade.tone}" href="${routeURL(`/grado/${grade.id}`)}" data-route="/grado/${grade.id}" aria-label="Ver las clases de ${escape(grade.name)}">
        <span class="grade-number" aria-hidden="true">${grade.id}<sup>º</sup></span>
        <h2>${escape(grade.name)}</h2><p>${escape(grade.description)}</p>
        <span class="grade-card-footer"><span>${available ? `${available} ${available===1?'clase disponible':'clases disponibles'}` : 'En preparación'}</span><span class="card-arrow" aria-hidden="true">→</span></span>
      </a>`;
    }).join('')}</div>`;
    $('catalog-status').textContent = 'Cinco grados de informática. Selecciona uno para ver sus clases.';
  }
  function showClasses(grade) {
    $('page-eyebrow').textContent = 'INFORMÁTICA';
    $('page-title').textContent = `Clases de ${grade.name.toLowerCase()}`;
    $('page-description').textContent = grade.classes.some(item => item.available)
      ? 'Elige una clase y conoce lo que vamos a aprender.'
      : 'Estamos preparando las clases para este grado.';
    $('catalog-content').innerHTML = `<div class="classes-grid">${grade.classes.map((item, index) => {
      const path = `/grado/${grade.id}/clase/${item.id}`;
      const art = item.art?.map(secondArt) || classArt[item.id];
      const image = `<div class="class-card-illustration" aria-hidden="true">${art ? artwork(art, 'class') : illustration(item.illustration)}</div>`;
      return `<article class="class-card ${item.available ? 'is-available' : 'is-planned'}" aria-labelledby="title-${escape(item.id)}">
        <div class="class-card-top"><span class="class-number">CLASE ${String(index + 1).padStart(2, '0')}</span>${item.available ? '<span class="availability">Disponible</span>' : ''}</div>
        ${image}<h2 id="title-${escape(item.id)}">${escape(item.title)}</h2><p>${escape(item.description)}</p>
        <div class="class-card-bottom">${item.available
          ? `<span class="part-count">${item.parts.length} partes</span><a class="open-parts" href="${routeURL(path)}" data-route="${path}" aria-label="Ver las partes de ${escape(item.title)}">Ver partes <span aria-hidden="true">→</span></a>`
          : '<span>En preparación</span><span aria-hidden="true">✦</span>'}</div>
      </article>`;
    }).join('')}</div>`;
    const count = grade.classes.filter(item => item.available).length;
    $('catalog-status').textContent = `${grade.name}: ${count} ${count === 1 ? 'clase disponible' : 'clases disponibles'}.`;
  }
  function showParts(grade, item) {
    restoreRoute=`/grado/${grade.id}/clase/${item.id}`;
    $('class-eyebrow').textContent = `INFORMÁTICA · ${grade.name.toUpperCase()} · CLASE ${String(grade.classes.indexOf(item)+1).padStart(2,'0')}`;
    $('class-title').textContent = item.title;
    $('class-objective').textContent = item.description;
    document.querySelector('.parts-heading > span').textContent = `${item.parts.length} partes`;
    $('class-parts').innerHTML = item.parts.map((part, index) => `<li class="part-row">
      <a class="part-link" href="${item.href}${item.href.includes('?')?'&':'?'}parte=${encodeURIComponent(part.id)}" aria-label="Abrir parte ${index + 1}: ${escape(part.title)}">
        <span class="part-illustration" aria-hidden="true">${partIllustration(item, part)}</span>
        <div class="part-copy"><span class="part-number">${String(index + 1).padStart(2, '0')}</span><h4>${escape(part.title)}</h4><p>${escape(part.description)}</p></div>
        <span class="part-chevron" aria-hidden="true">›</span>
      </a></li>`).join('');
    $('open-class').href = item.href;
    const classNumber=String(grade.classes.indexOf(item)+1).padStart(2,'0');
    const offlineAvailable=!!item.offline||['1','2','3'].includes(grade.id);
    $('offline-class-material').hidden=!offlineAvailable;
    const offlineFile=item.offline||`${grade.name.toLowerCase()}-${classNumber}-${item.id}.pdf`;
    $('offline-class-material').href=offlineAvailable?`materiales-sin-conexion/${offlineFile}`:'#';
    $('offline-class-material').download=offlineAvailable?`guia-${offlineFile}`:'';
    $('share-class-activity').hidden=!item.finalActivity;
    if(item.finalActivity)$('share-class-activity').href=`docente?crear=${encodeURIComponent(item.id)}`;
    if (!dialog.open) {
      dialog.scrollTop = 0;
      dialog.showModal();
    }
  }
  function renderRoute(focus = false) {
    const route = currentRoute();
    const canonicalPath = routeURL(route.path);
    if (location.pathname !== canonicalPath || location.hash) history.replaceState(history.state, '', canonicalPath);
    const key = route.grade ? `grade-${route.grade.id}` : 'grades';
    const changed = key !== viewKey;
    if (changed) {
      viewKey = key;
      breadcrumb(route.grade);
      route.grade ? showClasses(route.grade) : showGrades();
      if (focus && !route.item) { $('catalog-main').focus({ preventScroll: true }); window.scrollTo(0, 0); }
    }
    clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    if (route.item) showParts(route.grade, route.item);
    else if (dialog.open) dialog.close();
    document.title = `${route.item ? `${route.item.title} · ` : ''}${route.grade ? route.grade.name : 'Grados'} · Aula interactiva`;
  }
  function closeParts() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    const route = currentRoute();
    if (!route.item) return;
    const finish = () => {
      // Back closes an in-page modal; deep links return safely to the same grade.
      if (history.state?.catalogModal) history.back();
      else navigate(`/grado/${route.grade.id}`, true);
    };
    if (reducedMotion.matches) finish();
    else { dialog.classList.add('is-closing'); closeTimer = setTimeout(finish, 170); }
  }
  $('close-class').addEventListener('click', closeParts);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeParts(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeParts();
  });
  dialog.addEventListener('close', () => {
    const route = currentRoute();
    if (route.item) navigate(`/grado/${route.grade.id}`, true);
    document.querySelector(`.open-parts[data-route="${restoreRoute}"]`)?.focus({ preventScroll: true });
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-route]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (currentRoute().path !== link.dataset.route) navigate(link.dataset.route);
  });
  document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); $('catalog-main').focus(); });
  window.addEventListener('popstate', () => renderRoute());
  renderRoute();
})();
