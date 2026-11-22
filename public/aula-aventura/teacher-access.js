'use strict';
(() => {
  const root = document.documentElement;
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const release = detail => {
    root.classList.remove('aula-auth-pending');
    installLogout();
    window.dispatchEvent(new CustomEvent('aula-teacher-ready', { detail }));
    return detail;
  };
  function installLogout() {
    const catalog = document.querySelector('.catalog-header');
    const tools = document.querySelector('.hud-tools');
    const host = tools || catalog;
    if (!host || host.querySelector('[data-aula-logout]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = tools ? 'round-control aula-logout' : 'session-link aula-logout';
    button.dataset.aulaLogout = '';
    button.title = 'Cerrar sesi\u00f3n';
    button.setAttribute('aria-label', 'Cerrar sesi\u00f3n del aula');
    const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>';
    button.innerHTML = tools ? icon : `<span>Cerrar sesi\u00f3n</span>${icon}`;
    button.addEventListener('click', () => {
      clearCredentials();
      location.replace('docente.html?acceso=aula');
    });
    host.append(button);
  }

  if (loopback) {
    window.AulaTeacherAccess = Promise.resolve(release({ local: true }));
    return;
  }

  const returnPath = () => {
    const file = location.pathname.slice(location.pathname.lastIndexOf('/') + 1) || 'index.html';
    return `${file}${location.search}${location.hash}`;
  };
  const login = () => {
    const query = new URLSearchParams({ acceso: 'aula', volver: returnPath() });
    location.replace(`docente.html?${query}`);
  };
  const clearCredentials = () => {
    ['access_token', 'refresh_token', 'user'].forEach(key => localStorage.removeItem(key));
    window.dispatchEvent(new Event('auth-change'));
  };
  const unavailable = () => {
    root.classList.remove('aula-auth-pending');
    document.body.className = 'aula-access-error';
    document.body.innerHTML = `<main class="access-error-card"><img src="assets/school-logo.png" alt="Escudo del Gimnasio los Cerros"><p class="section-kicker">AULA INTERACTIVA</p><h1>No pudimos comprobar tu acceso</h1><p>Revisa la conexi\u00f3n a internet y vuelve a intentarlo. Las clases permanecen cerradas hasta validar tu cuenta.</p><button type="button" class="session-primary" data-access-retry>Volver a intentar</button></main>`;
    document.querySelector('[data-access-retry]').addEventListener('click', () => location.reload());
  };

  window.AulaTeacherAccess = (async () => {
    if (!localStorage.getItem('access_token') && !localStorage.getItem('refresh_token')) {
      login();
      return null;
    }
    try {
      const identity = await window.AulaAPI.request('/api/aula/me/', { teacher: true });
      if (!['ADMIN', 'TEACHER', 'AULA_DEMO'].includes(identity?.role)) throw new window.AulaAPI.ApiError('Acceso docente requerido.', 403);
      return release(identity);
    } catch (error) {
      if ([401, 403].includes(error?.status)) {
        clearCredentials();
        login();
        return null;
      }
      unavailable();
      return null;
    }
  })();
})();
