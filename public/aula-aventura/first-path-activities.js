'use strict';
(() => {
  const specs = [
    ['patrones-mensajes', 'C06', 'final', null, 'Patrones y mensajes secretos', ['Continúa la secuencia', 'Encuentra la unidad', 'Repara la regla', 'Descifra el mensaje'], ['pattern-complete', 'pattern-group', 'pattern-repair', 'cipher-decode']],
    ['patrones-mensajes-patrones', 'C06', 'patrones', 'patrones', 'Descubrimos patrones', ['La pieza que continúa', 'Encuentra la unidad'], ['pattern-complete', 'pattern-group']],
    ['patrones-mensajes-reglas', 'C06', 'reglas', 'reglas', 'Continuamos y reparamos reglas', ['Completa varios lugares', 'Taller de patrones'], ['pattern-rule', 'pattern-repair']],
    ['patrones-mensajes-codigos', 'C06', 'codigos', 'codigos', 'Representamos mensajes con una clave', ['Detectives de símbolos', 'Construimos un mensaje'], ['cipher-decode', 'cipher-encode']],

    ['bucles', 'C07', 'final', null, 'Acciones que se repiten', ['Comprime acciones', 'Construye el bucle', 'Programa el recorrido', 'Repara la cantidad'], ['loop-compress', 'loop-build', 'loop-route', 'loop-fix-count']],
    ['bucles-repeticion', 'C07', 'repeticion', 'repeticion', 'Descubrimos la repetición', ['La lista más clara', '¿Cuántas veces?'], ['loop-compress', 'loop-count']],
    ['bucles-bloque-repetir', 'C07', 'bloque-repetir', 'bloque-repetir', 'Conocemos el bloque Repetir', ['Desplegamos el bucle', 'Construimos un bloque'], ['loop-expand', 'loop-build']],
    ['bucles-programas', 'C07', 'programas', 'programas', 'Programamos recorridos con bucles', ['Recorridos compactos', 'Reparamos la cantidad'], ['loop-route', 'loop-fix-count']],

    ['bucles-practica', 'C08', 'final', null, 'Bucles en nuevas misiones', ['Predice el resultado', 'Calcula una ruta', 'Protege el sendero', 'Adapta el programa'], ['loop-predict', 'loop-recycle', 'loop-bear', 'loop-adapt']],
    ['bucles-practica-predecimos', 'C08', 'predecimos', 'predecimos', 'Predecimos repeticiones', ['¿Dónde terminará?', '¿Cabe la repetición?'], ['loop-predict', 'loop-safe-count']],
    ['bucles-practica-contextos', 'C08', 'contextos', 'contextos', 'Usamos bucles en otros contextos', ['La ruta del reciclaje', 'Órbitas y entrenamiento'], ['loop-recycle', 'loop-contexts']],
    ['bucles-practica-adaptamos', 'C08', 'adaptamos', 'adaptamos', 'Adaptamos un programa', ['El sendero del oso', 'La meta cambió'], ['loop-bear', 'loop-adapt']],

    ['errores-programas', 'C09', 'final', null, 'Detectives de programas', ['Compara resultados', 'Localiza la diferencia', 'Repara un programa', 'Comprueba un bucle'], ['debug-compare', 'debug-trace', 'debug-repair', 'debug-loop']],
    ['errores-programas-observamos', 'C09', 'observamos', 'observamos', 'Observamos antes de cambiar', ['Meta y resultado', 'La primera pista'], ['debug-compare', 'debug-first-error']],
    ['errores-programas-localizamos', 'C09', 'localizamos', 'localizamos', 'Seguimos la traza', ['La mesa de trazas', '¿Qué tipo de error es?'], ['debug-trace', 'debug-classify']],
    ['errores-programas-corregimos', 'C09', 'corregimos', 'corregimos', 'Corregimos y comprobamos', ['Reparamos flechas y orden', 'Reparamos repeticiones'], ['debug-repair', 'debug-loop']],

    ['ciudadania-digital', 'C10', 'final', null, 'Nos cuidamos en internet', ['Reconoce datos', 'Elige ayuda', 'Decide con calma', 'Aplica el plan'], ['safe-data-sort', 'safe-trusted', 'safe-story', 'safe-stop-close-tell']],
    ['ciudadania-digital-datos', 'C10', 'datos', 'datos', 'Protegemos nuestros datos', ['La caja de los datos', 'Un perfil para el juego'], ['safe-data-sort', 'safe-profile']],
    ['ciudadania-digital-confianza', 'C10', 'confianza', 'confianza', 'Pedimos ayuda a personas de confianza', ['¿A quién pedimos ayuda?', 'Contamos lo necesario'], ['safe-trusted', 'safe-ask-help']],
    ['ciudadania-digital-decisiones', 'C10', 'decisiones', 'decisiones', 'Actuamos ante algo incómodo', ['Historias para decidir', 'Detener, cerrar y contar'], ['safe-story', 'safe-stop-close-tell']],
  ];
  const parents = {
    C06: 'patrones-mensajes', C07: 'bucles', C08: 'bucles-practica', C09: 'errores-programas', C10: 'ciudadania-digital',
  };
  function evidence(game, state) {
    const result = { completed: !!state.complete, solved: state.solved || 0 };
    if (game.startsWith('pattern-')) result[game === 'pattern-repair' ? 'repaired' : 'patterned'] = game === 'pattern-repair' ? !!state.repaired : !!state.patterned;
    if (game === 'cipher-decode') result.decoded = !!state.decoded;
    if (game === 'cipher-encode') result.encoded = !!state.encoded;
    if (game.startsWith('loop-')) { result.looped = !!state.looped; if (['loop-route', 'loop-fix-count', 'loop-predict', 'loop-recycle', 'loop-contexts', 'loop-bear', 'loop-adapt'].includes(game)) result.executed = !!state.executed; }
    if (game.startsWith('debug-')) {
      if (['debug-compare', 'debug-first-error', 'debug-trace', 'debug-classify'].includes(game)) result.inspected = !!state.inspected;
      if (['debug-first-error', 'debug-trace', 'debug-repair'].includes(game)) result.tested = !!state.tested;
      if (game === 'debug-repair') result.repaired = !!state.repaired;
      if (game === 'debug-loop') Object.assign(result, { looped: !!state.looped, executed: !!state.executed });
    }
    if (game.startsWith('safe-')) result.decided = !!state.decided;
    return result;
  }
  for (const [lesson, code, suffix, part, title, challenges, games] of specs) {
    const version = `INF-1-${code}-${suffix}-v1`, parentLesson = parents[code];
    window.ClassFinalActivities[version] = {
      lesson, parentLesson: part ? parentLesson : undefined, part,
      game: part ? 'part-workshop' : `path-final-${code === 'C06' ? 'patterns' : code === 'C07' ? 'loops' : code === 'C08' ? 'loop-practice' : code === 'C09' ? 'debug' : 'safety'}`,
      games: part ? games : undefined, requiresFirstPath: true,
      stations: games.map((_, index) => `${part || parentLesson}-${index + 1}`),
      preview: { title: part ? `Actividad: ${title}` : title, challenges },
      evidence(index, state) { return evidence(games[index], state); },
    };
  }
})();
