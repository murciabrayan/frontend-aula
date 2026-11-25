'use strict';
(() => {
  const root = document.documentElement;
  const aulaMarker = '/aula-aventura/';
  const markerIndex = location.pathname.indexOf(aulaMarker);
  const aulaRoot = markerIndex >= 0 ? location.pathname.slice(0, markerIndex + aulaMarker.length) : location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
  const aulaURL = path => `${aulaRoot}${path.replace(/^\/+/, '')}`;
  const api = window.AulaAPI;
  const accessTitle = document.getElementById('aula-access-title');
  const accessMessage = document.getElementById('aula-access-message');
  const accessLogin = document.getElementById('aula-access-login');
  const accessRetry = document.getElementById('aula-access-retry');
  const accessDeadline = 8000;
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
    button.innerHTML = tools
      ? `${icon}<span class="aula-logout-label">Salir</span>`
      : `<span>Cerrar sesi\u00f3n</span>${icon}`;
    button.addEventListener('click', () => {
      api.clearTeacherSession();
      leaveClassroom();
    });
    host.append(button);
  }

  const returnPath = () => {
    if (location.hash.startsWith('#/')) return location.hash.slice(2);
    let path = location.pathname.startsWith(aulaRoot) ? location.pathname.slice(aulaRoot.length) : '';
    if (!path || /^index(?:\.html)?\/?$/.test(path)) path = 'grados';
    return `${path}${location.search}${location.hash}`;
  };
  const loginURL = (reason, forceLogin = false) => {
    const query = new URLSearchParams({ acceso: 'aula', volver: returnPath() });
    if (reason) query.set('motivo', reason);
    if (forceLogin) query.set('reingresar', '1');
    return aulaURL(`docente?${query}`);
  };
  if (accessLogin) accessLogin.href = loginURL(null, true);
  accessRetry?.addEventListener('click', () => location.reload());

  const leaveClassroom = () => {
    root.classList.add('aula-auth-pending');
    if (accessTitle) accessTitle.textContent = 'Sesión cerrada';
    if (accessMessage) accessMessage.textContent = 'Puedes volver al inicio de sesión cuando quieras.';
    location.replace(aulaURL('docente?acceso=aula&salida=1'));
  };
  window.addEventListener('storage', event => {
    if ([null, 'access_token', 'refresh_token'].includes(event.key) && api && !api.hasTeacherSession()) leaveClassroom();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) location.reload();
  });
  function unavailable(message) {
    if (accessTitle) accessTitle.textContent = 'No pudimos comprobar tu acceso';
    if (accessMessage) accessMessage.textContent = message;
    if (accessRetry) accessRetry.hidden = false;
  }

  window.AulaTeacherAccess = (async () => {
    if (!api) {
      unavailable('No se cargó la comprobación de acceso. Puedes reintentar o abrir el inicio de sesión.');
      return null;
    }
    let timer;
    const controller = new AbortController();
    try {
      if (!api.hasTeacherSession()) {
        location.replace(loginURL());
        return null;
      }
      if (accessTitle) accessTitle.textContent = 'Comprobando acceso al aula...';
      if (accessMessage) accessMessage.textContent = 'Espera un momento o vuelve al inicio de sesión.';
      const timeout = new Promise(resolve => {
        timer = setTimeout(() => {
          controller.abort();
          resolve(null);
        }, accessDeadline);
      });
      const identity = await Promise.race([api.request('/api/aula/me/', { teacher: true, signal: controller.signal }), timeout]);
      if (controller.signal.aborted) throw new api.ApiError('Se agotó el tiempo de espera.', 0);
      if (!['ADMIN', 'TEACHER'].includes(identity?.role)) throw new api.ApiError('Acceso docente requerido.', 403);
      return release(identity);
    } catch (error) {
      if ([401, 403].includes(error?.status)) {
        api.clearTeacherSession();
        location.replace(loginURL(error.status === 403 ? 'permiso' : 'sesion', true));
        return null;
      }
      unavailable(controller.signal.aborted
        ? 'El servidor tardó en responder. Puedes reintentar o iniciar sesión de nuevo.'
        : 'El servicio de acceso no respondió correctamente. Puedes reintentar o volver al inicio de sesión.');
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
})();
