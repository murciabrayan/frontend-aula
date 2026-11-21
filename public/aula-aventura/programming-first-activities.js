'use strict';
(() => {
  const specs = [
    ['programacion-flechas', 'final', 'Programamos con bloques y flechas', null,
      ['Predice la llegada', 'Programa el puente', 'Recoge y entrega', 'Repara la ruta'],
      ['programming-predict-final', 'programming-courier-final', 'programming-berries-final', 'programming-repair-final']],
    ['programacion-flechas-bloques', 'bloques', 'Bloques que dan instrucciones', 'bloques',
      ['El bloque que falta', '¿Dónde terminará?'], ['programming-block-choice', 'programming-predict']],
    ['programacion-flechas-construimos', 'construimos', 'Construimos y ejecutamos', 'construimos',
      ['El correo del bosque', 'La ruta de las bayas'], ['programming-courier', 'programming-berries']],
    ['programacion-flechas-corregimos', 'corregimos', 'Probamos y corregimos', 'corregimos',
      ['Inspectores del programa', 'Taller de reparación'], ['programming-trace', 'programming-repair']],
  ];
  for (const [lesson, suffix, title, part, challenges, games] of specs) {
    const version = `INF-1-C05-${suffix}-v1`;
    window.ClassFinalActivities[version] = {
      lesson, parentLesson: part ? 'programacion-flechas' : undefined, part,
      game: part ? 'part-workshop' : 'programming-final', games: part ? games : undefined,
      requiresProgramming: true,
      stations: games.map((_, index) => `${part || 'programacion'}-${index + 1}`),
      preview: { title: part ? `Actividad: ${title}` : title, challenges },
      evidence(index, state) {
        const game = games[index]; const evidence = { completed: !!state.complete, solved: state.solved || 0 };
        if (game.includes('predict')) evidence.executed = !!state.executed;
        if (game.includes('courier')) evidence.delivered = !!state.delivered;
        if (game.includes('berries')) Object.assign(evidence, { collected: !!state.collected, crossed: !!state.crossed });
        if (game.includes('trace')) Object.assign(evidence, { inspected: !!state.inspected, tested: !!state.tested });
        if (game.includes('repair')) Object.assign(evidence, { repaired: !!state.repaired, tested: !!state.tested });
        return evidence;
      },
    };
  }
})();
