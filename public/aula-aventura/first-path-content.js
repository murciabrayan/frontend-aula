'use strict';
(() => {
  const explain = (id, title, demo, body, prompt, data = {}) => ({ id, title, demo, body, prompt, ...data });
  const play = (id, title, game, instruction) => ({ id, title, game, instruction });
  const part = (id, name, short, steps) => ({ id, name, short, steps });
  const concept = 'first-path-concept', pattern = 'first-path-pattern', code = 'first-path-code';
  const loop = 'first-path-loop', program = 'first-path-program', context = 'first-path-context';
  const debug = 'first-path-debug', story = 'first-path-story', reflection = 'first-path-reflection';

  const classes = {
    'patrones-mensajes': {
      version: 'INF-1-C06-v1',
      meta: { title: 'Patrones y mensajes secretos', ordinal: 'Sexta', slug: 'patrones-mensajes', number: '06' },
      intro: 'Descubrimos reglas que se repiten, completamos secuencias y usamos una clave visible para representar mensajes.',
      loading: 'Preparando secuencias, fichas y claves.',
      closing: '¡Reglas y mensajes completados!',
      summary: 'Reconocimos unidades que se repiten, reparamos patrones y usamos claves para codificar y descifrar.',
      guide: ['Patrones: observar, comparar y reconocer qué se repite.', 'Reglas: encontrar la unidad, continuar y reparar secuencias.', 'Mensajes: usar una tabla visible para cambiar letras por símbolos y volver a leerlas.', 'Misión final: cuatro estaciones con reglas nuevas.'],
      assets: ['assets/first-path-objects-v1.png', 'assets/owl-atlas.png'],
      parts: [
        part('patrones', 'Descubrimos patrones', 'Patrones', [
          explain('look-for-change', 'Un patrón tiene una regla', pattern, ['Un patrón es una secuencia organizada. Sus elementos no aparecen al azar: siguen una <strong>regla que podemos descubrir</strong>.', 'Para encontrarla observamos qué cambia y qué vuelve a aparecer. Podemos señalar cada elemento mientras decimos sus características.'], 'Pulsa las fichas en orden y escucha cómo vuelve a comenzar la secuencia.', { sequence: ['coral', 'gold', 'coral', 'gold', 'coral', 'gold'], unit: 2 }),
          explain('repeat-unit', 'La unidad es la parte que se repite', pattern, ['La <strong>unidad de patrón</strong> es el grupo más pequeño que vuelve a comenzar. En rojo, amarillo, rojo, amarillo, la unidad es rojo–amarillo.', 'Una secuencia puede mostrar esa unidad dos, tres o muchas veces. El tamaño de la unidad no depende de cuántas veces se repita.'], 'Cambia el marco para comparar una unidad correcta con un grupo demasiado largo.', { sequence: ['leaf', 'leaf', 'gold', 'leaf', 'leaf', 'gold'], unit: 3, inspect: true }),
          explain('different-features', 'Podemos repetir colores, formas o movimientos', concept, ['Una regla puede fijarse en el color, la forma, el tamaño, la posición, un sonido o un movimiento.', 'Antes de responder preguntamos: <strong>¿qué característica se mantiene organizada?</strong> Dos secuencias pueden usar los mismos dibujos y seguir reglas diferentes.'], 'Selecciona Color, Forma o Movimiento para comparar tres maneras de organizar.', { cards: [['color', 'Color', 'coral · azul · coral · azul'], ['shape', 'Forma', 'círculo · estrella · círculo · estrella'], ['move', 'Movimiento', 'arriba · abajo · arriba · abajo']] }),
          explain('say-the-rule', 'Explicar la regla ayuda a comprobarla', concept, ['No basta con señalar la ficha siguiente. También podemos decir la regla con palabras: “se repiten dos hojas y una flor”.', 'Si nuestra explicación permite continuar varias veces sin cambiar, probablemente encontramos la regla.'], 'Elige una explicación y observa cuál permite continuar toda la fila.', { cards: [['one', 'Una hoja y una flor', 'No explica las dos hojas seguidas.'], ['two', 'Dos hojas y una flor', 'La regla se conserva al repetir.'], ['three', 'Tres dibujos diferentes', 'Describe cantidad, pero no el orden.']], answer: 'two' }),
          play('complete-pattern', 'La pieza que continúa', 'pattern-complete', 'Observa la unidad que se repite y elige la ficha que continúa cada secuencia.'),
          play('find-pattern-unit', 'Encuentra la unidad', 'pattern-group', 'Marca el grupo más pequeño que puede repetirse para construir toda la secuencia.'),
        ]),
        part('reglas', 'Continuamos y reparamos reglas', 'Reglas', [
          explain('predict-before-choice', 'Primero predecimos, después elegimos', pattern, ['Podemos tapar el final de una secuencia e imaginar qué debería aparecer. La predicción nace de la regla, no de adivinar entre botones.', 'Después destapamos o elegimos la ficha para comprobar. Si no coincide, volvemos a revisar dónde inicia la unidad.'], 'Pulsa Predecir, selecciona una ficha y luego destapa la respuesta.', { sequence: ['circle', 'triangle', 'triangle', 'circle', 'triangle', 'triangle', '?'], unit: 3, predict: true }),
          explain('two-step-pattern', 'Algunas respuestas necesitan más de una ficha', pattern, ['Cuando faltan dos o tres lugares, debemos continuar la regla durante varios pasos. Cada respuesta cambia lo que esperamos después.', 'Colocamos una ficha, repetimos la regla desde el comienzo y comprobamos antes de añadir la siguiente.'], 'Completa mentalmente los dos espacios, de izquierda a derecha.', { sequence: ['coral', 'blue', 'gold', 'coral', 'blue', 'gold', '?', '?'], unit: 3 }),
          explain('find-the-break', 'Una ficha puede romper el patrón', pattern, ['Si una secuencia cambia inesperadamente, buscamos el primer lugar donde deja de cumplirse la regla.', 'Las fichas anteriores pueden estar correctas. Reparar significa cambiar solo la que rompe la repetición y volver a leer la fila completa.'], 'Pulsa cada ficha hasta localizar la primera que no sigue la regla.', { sequence: ['leaf', 'flower', 'leaf', 'flower', 'flower', 'flower'], unit: 2, fault: 4 }),
          explain('create-and-test', 'También podemos construir una regla', pattern, ['Para crear un patrón elegimos una unidad corta, la repetimos por lo menos tres veces y dejamos una pista clara.', 'Después otra persona intenta continuarla. Si existen varias respuestas posibles, necesitamos hacer la regla más clara.'], 'Crea una unidad de dos o tres fichas y pulsa Repetir para verla tres veces.', { creator: true }),
          play('continue-rule', 'Completa varios lugares', 'pattern-rule', 'Arrastra o selecciona las fichas necesarias para continuar secuencias de dos y tres pasos.'),
          play('repair-pattern', 'Taller de patrones', 'pattern-repair', 'Encuentra la primera ficha que rompe cada regla, reemplázala y comprueba la secuencia completa.'),
        ]),
        part('codigos', 'Representamos mensajes con una clave', 'Mensajes', [
          explain('what-is-a-code', 'Una clave relaciona dos representaciones', code, ['En esta actividad una tabla relaciona letras con símbolos. Por ejemplo, la letra A puede representarse con un sol y la letra M con una montaña.', 'La clave debe permanecer visible. No estamos ocultando información importante: estamos practicando <strong>correspondencias</strong>.'], 'Pulsa una letra de la tabla para ver su símbolo y volver a convertirlo.', { mode: 'key' }),
          explain('encode-left-to-right', 'Codificamos una letra a la vez', code, ['Para codificar leemos la palabra de izquierda a derecha. Buscamos la primera letra en la clave, copiamos su símbolo y continuamos.', 'No cambiamos el orden ni inventamos un símbolo nuevo. Cada letra conserva siempre la misma correspondencia dentro de esa clave.'], 'Codifica la palabra SOL usando la tabla visible.', { mode: 'encode', word: 'SOL' }),
          explain('decode-with-the-key', 'Descifrar es recorrer la clave al contrario', code, ['Al descifrar vemos un símbolo, buscamos con qué letra está relacionado y escribimos esa letra.', 'Repetimos el proceso símbolo por símbolo. Después leemos la palabra completa para comprobar si tiene sentido.'], 'Descifra los tres símbolos y comprueba la palabra LUNA.', { mode: 'decode', word: 'LUNA' }),
          explain('code-is-not-password', 'Un código de juego no es una contraseña segura', concept, ['Esta clave está a la vista de todos y sirve para aprender. Una contraseña, en cambio, protege una cuenta y no debe compartirse con compañeros.', 'No escribiremos contraseñas reales ni datos personales. Todos los mensajes de esta clase son palabras ficticias y breves.'], 'Compara las tarjetas y decide cuál pertenece al juego y cuál debe protegerse.', { cards: [['game', 'Clave de símbolos', 'La usamos juntos para descifrar.'], ['password', 'Contraseña personal', 'No se escribe ni se comparte en esta clase.']], answer: 'game' }),
          play('decode-messages', 'Detectives de símbolos', 'cipher-decode', 'Usa la clave visible para convertir símbolos en letras y descubrir palabras cortas.'),
          play('encode-messages', 'Construimos un mensaje', 'cipher-encode', 'Elige los símbolos correctos, en orden, para representar cada palabra del modelo.'),
        ]),
        part('repaso', 'Misión final', 'Misión final', [
          explain('patterns-final-brief', 'Preparamos cuatro retos diferentes', concept, ['La misión final combina observación, explicación, reparación y codificación.', 'Cada estación presenta una regla nueva. Podemos volver al inicio de la fila, señalar la unidad y usar la clave visible cuantas veces sea necesario.'], 'Revisen las estaciones: continuar, encontrar la unidad, reparar y descifrar.', { cards: [['1', 'Continuar', 'Elegir las fichas que siguen.'], ['2', 'Reconocer', 'Marcar la unidad mínima.'], ['3', 'Reparar', 'Cambiar la primera ficha incorrecta.'], ['4', 'Descifrar', 'Usar la tabla de correspondencias.']] }),
          play('patterns-final', 'El archivo de patrones', 'path-final-patterns', 'Completa cuatro estaciones con secuencias y mensajes que no aparecieron en las prácticas anteriores.'),
          explain('patterns-reflection', 'Explicamos la regla que encontramos', reflection, ['Podemos justificar una respuesta diciendo qué unidad se repite y en qué lugar vuelve a comenzar.', 'En los mensajes podemos explicar qué símbolo buscamos, qué letra representa y cómo comprobamos la palabra final.'], 'Elige una estación y explica la pista que te permitió resolverla.', { formula: 'Observar → encontrar la unidad → continuar o reparar → comprobar' }),
        ]),
      ],
    },

    'bucles': {
      version: 'INF-1-C07-v1',
      meta: { title: 'Acciones que se repiten', ordinal: 'Séptima', slug: 'bucles', number: '07' },
      intro: 'Reconocemos instrucciones repetidas y usamos un bloque Repetir para construir programas más cortos y claros.',
      loading: 'Preparando repeticiones y recorridos.',
      closing: '¡Primeros bucles completados!',
      summary: 'Convertimos acciones repetidas en bucles, elegimos cantidades y ejecutamos programas con bloques Repetir.',
      guide: ['Repetición: reconocer una misma acción varias veces.', 'Bloque Repetir: distinguir la acción de la cantidad.', 'Programas: combinar bloques normales y bucles en recorridos.', 'Misión final: comprimir, predecir, construir y corregir.'],
      assets: ['assets/first-path-objects-v1.png', 'assets/programming-journey-v1.png', 'assets/owl-atlas.png'],
      parts: [
        part('repeticion', 'Descubrimos la repetición', 'Repetición', [
          explain('same-action-again', 'A veces hacemos la misma acción varias veces', loop, ['Si damos cuatro pasos hacia la derecha, la instrucción “derecha” aparece cuatro veces.', 'Reconocer esa repetición nos permite describir el plan con menos tarjetas sin cambiar lo que hará el personaje.'], 'Pulsa Paso y cuenta cuántas veces se repite el mismo movimiento.', { action: 'right', count: 4 }),
          explain('expanded-program', 'Una lista larga muestra cada movimiento', program, ['Un programa expandido contiene una tarjeta por cada acción. Es útil para comenzar porque podemos seguir todos los movimientos uno a uno.', 'Pero cuando una acción se repite muchas veces, la fila puede ser difícil de leer y modificar.'], 'Ejecuta las cinco flechas y observa que todas producen el mismo tipo de movimiento.', { mode: 'expanded', queue: ['right', 'right', 'right', 'right', 'right'] }),
          explain('same-result-shorter', 'Dos programas pueden producir el mismo resultado', loop, ['Cinco flechas derechas y “repetir 5 veces: derecha” describen los mismos cinco movimientos.', 'El segundo programa no hace menos trabajo en el tablero: solamente expresa la repetición de una manera más corta.'], 'Alterna entre la lista larga y el bloque Repetir para comparar.', { action: 'right', count: 5, compare: true }),
          explain('when-not-to-repeat', 'Solo repetimos la acción que permanece igual', concept, ['Un bucle sirve cuando la instrucción o el grupo de instrucciones vuelve a ocurrir sin cambiar.', 'Si la ruta dice derecha, derecha, arriba, no podemos encerrar las tres como si fueran la misma acción repetida.'], 'Decide cuál de las dos listas contiene una repetición exacta.', { cards: [['yes', '→ → → →', 'La misma instrucción aparece cuatro veces.'], ['no', '→ → ↑ →', 'Hay un cambio dentro de la fila.']], answer: 'yes' }),
          play('compress-actions', 'La lista más clara', 'loop-compress', 'Elige el bloque Repetir que representa exactamente cada lista de acciones.'),
          play('count-actions', '¿Cuántas veces?', 'loop-count', 'Cuenta las acciones del modelo y ajusta la cantidad del bloque Repetir.'),
        ]),
        part('bloque-repetir', 'Conocemos el bloque Repetir', 'Bloque Repetir', [
          explain('loop-has-two-parts', 'El bloque necesita una acción y una cantidad', loop, ['Dentro de Repetir colocamos la acción. En el número indicamos cuántas veces debe ejecutarse.', 'Cambiar la acción modifica la dirección; cambiar el número modifica la cantidad de movimientos. Son decisiones diferentes.'], 'Cambia primero la flecha y después la cantidad para observar qué parte controla cada cosa.', { action: 'up', count: 3, editable: true }),
          explain('read-loop-out-loud', 'Leemos el bloque antes de ejecutarlo', loop, ['“Repetir 4 veces: abajo” significa realizar cuatro movimientos hacia abajo.', 'Leerlo en voz alta permite predecir el resultado y detectar una cantidad que no cabe en el tablero.'], 'Ajusta el contador y di en voz alta lo que hará el bloque.', { action: 'down', count: 4, editable: true }),
          explain('unfold-loop', 'Podemos desplegar un bucle para comprobarlo', loop, ['Desplegar significa mostrar todas las acciones que el bloque representa.', 'Repetir 3 veces una flecha izquierda se despliega como izquierda, izquierda, izquierda. Así comparamos la cantidad con el resultado.'], 'Pulsa Desplegar y cuenta las tarjetas que aparecen.', { action: 'left', count: 3, unfold: true }),
          explain('loop-stops', 'El bucle termina al completar la cantidad', program, ['El computador no repite “hasta que quiera”. Cuenta cada vuelta y se detiene exactamente en el número indicado.', 'Después continúa con el siguiente bloque del programa, si existe.'], 'Ejecuta Repetir 3 y observa el contador de vueltas antes de pasar al bloque final.', { mode: 'loop', action: 'right', count: 3, after: 'up' }),
          play('expand-loop', 'Desplegamos el bucle', 'loop-expand', 'Relaciona cada bloque Repetir con la lista completa de acciones que representa.'),
          play('build-loop', 'Construimos un bloque', 'loop-build', 'Elige una dirección y una cantidad para reproducir exactamente cada modelo.'),
        ]),
        part('programas', 'Programamos recorridos con bucles', 'Programas', [
          explain('observe-straight-segment', 'Buscamos tramos rectos que se repiten', program, ['En un recorrido, un tramo de varias casillas en la misma dirección puede convertirse en un bucle.', 'Primero contamos las casillas libres. No incluimos la casilla de Inicio y nos detenemos antes de un obstáculo.'], 'Señala el tramo horizontal y cuenta cuántas flechas derechas necesita.', { mode: 'route', route: 'straight' }),
          explain('combine-loop-and-turn', 'Podemos combinar un bucle con otros bloques', program, ['Un recorrido puede empezar con Repetir 4 veces derecha, continuar con una flecha arriba y terminar con otro bloque.', 'El bucle no reemplaza todo el programa. Reemplaza únicamente el fragmento que se repite.'], 'Ejecuta el programa y observa cuándo termina el bucle y comienza el giro.', { mode: 'route', route: 'turn' }),
          explain('predict-loop-end', 'Predecimos dónde termina cada repetición', program, ['Antes de ejecutar contamos desde Inicio una casilla por cada vuelta.', 'Si el número es demasiado grande, el personaje puede intentar salir del tablero o entrar en un obstáculo. Esa predicción nos ayuda a corregir.'], 'Marca primero la casilla final y después ejecuta el bucle.', { mode: 'route', route: 'predict' }),
          explain('fix-loop-number', 'Un error puede estar en la cantidad', debug, ['La flecha puede ser correcta y aun así el programa fallar porque repite demasiadas o muy pocas veces.', 'Probamos, observamos dónde termina y ajustamos solamente el número. Después ejecutamos desde Inicio otra vez.'], 'Compara 3, 4 y 5 repeticiones y encuentra la cantidad que llega a la bandera.', { mode: 'count' }),
          play('loop-route', 'Recorridos compactos', 'loop-route', 'Construye programas que combinen una repetición y uno o dos bloques adicionales.'),
          play('loop-fix-count', 'Reparamos la cantidad', 'loop-fix-count', 'Ejecuta cada programa, detecta si faltan o sobran vueltas y corrige únicamente el número.'),
        ]),
        part('repaso', 'Misión final', 'Misión final', [
          explain('loops-final-brief', 'Preparamos una misión con repeticiones', concept, ['Resolveremos cuatro tareas: comprimir una lista, elegir una cantidad, construir un recorrido y reparar un bucle.', 'Podemos desplegar cualquier repetición para contar sus acciones antes de ejecutar.'], 'Revisen cuál información deben mirar en cada estación.', { cards: [['1', 'Comprimir', 'Misma acción y misma cantidad.'], ['2', 'Contar', 'Una vuelta por cada acción.'], ['3', 'Programar', 'Bucle más bloques de giro.'], ['4', 'Reparar', 'Probar y ajustar el número.']] }),
          play('loops-final', 'El sendero de los bucles', 'path-final-loops', 'Completa cuatro estaciones con listas y recorridos nuevos.'),
          explain('loops-reflection', 'Explicamos qué repite el programa', reflection, ['Un bucle debe responder dos preguntas: <strong>qué acción se repite</strong> y <strong>cuántas veces</strong>.', 'También podemos desplegarlo y demostrar que produce la misma secuencia que una lista larga.'], 'Elige un bloque y explica su acción, su cantidad y el lugar donde termina.', { formula: 'Reconocer la repetición → elegir acción y cantidad → ejecutar → comprobar' }),
        ]),
      ],
    },

    'bucles-practica': {
      version: 'INF-1-C08-v1',
      meta: { title: 'Bucles en nuevas misiones', ordinal: 'Octava', slug: 'bucles-practica', number: '08' },
      intro: 'Aplicamos repeticiones en el planeta, el espacio, los deportes y el cuidado de animales; cada contexto cambia el problema.',
      loading: 'Preparando misiones del planeta y el espacio.',
      closing: '¡Bucles aplicados en nuevas misiones!',
      summary: 'Predijimos repeticiones, elegimos bucles útiles y adaptamos programas cuando cambió la meta.',
      guide: ['Predecimos: leer bucles y anticipar resultados.', 'Contextos: reciclaje, espacio, deporte y fauna.', 'Adaptamos: cambiar acción, cantidad o lugar del bucle.', 'Misión final: transferir lo aprendido a situaciones nuevas.'],
      assets: ['assets/first-path-objects-v1.png', 'assets/programming-journey-v1.png', 'assets/owl-atlas.png'],
      parts: [
        part('predecimos', 'Predecimos repeticiones', 'Predecimos', [
          explain('loop-start-matters', 'La misma repetición cambia si cambia el inicio', program, ['Repetir tres veces derecha siempre realiza tres movimientos, pero la casilla final depende de dónde comienza el personaje.', 'Por eso leemos el bloque y también localizamos Inicio antes de responder.'], 'Mueve Inicio entre dos casillas y compara el resultado del mismo bucle.', { mode: 'practice', scene: 'start' }),
          explain('direction-matters', 'La dirección cambia todo el recorrido', loop, ['Repetir cuatro veces arriba no es igual que repetir cuatro veces a la derecha.', 'Antes de contar revisamos hacia dónde apunta la flecha. Después avanzamos una casilla por cada vuelta.'], 'Alterna la dirección sin cambiar el número y observa los dos destinos.', { action: 'right', count: 4, editable: true }),
          explain('obstacles-interrupt', 'Un obstáculo puede detener la repetición', program, ['El bucle intenta cumplir todas sus vueltas, pero una casilla bloqueada puede impedir el siguiente movimiento.', 'La traza muestra cuántas vueltas sí se realizaron y cuál fue la primera que no pudo avanzar.'], 'Ejecuta el bucle y mira en qué vuelta aparece el obstáculo.', { mode: 'practice', scene: 'obstacle' }),
          explain('predict-without-running', 'Predecir significa decidir antes de pulsar Ejecutar', concept, ['Primero marcamos el resultado esperado; después usamos la ejecución como comprobación.', 'Si solo miramos la animación y respondemos al final, no estamos practicando predicción.'], 'Marca una casilla, explica tu conteo y luego comprueba.', { cards: [['plan', 'Antes', 'Contamos y elegimos una casilla.'], ['run', 'Después', 'Ejecutamos para comparar.']], answer: 'plan' }),
          play('predict-loop-result', '¿Dónde terminará?', 'loop-predict', 'Marca la casilla final antes de ejecutar bucles con distintos inicios y direcciones.'),
          play('choose-safe-loop', '¿Cabe la repetición?', 'loop-safe-count', 'Elige la mayor cantidad que puede ejecutarse sin salir del tablero ni tocar un obstáculo.'),
        ]),
        part('contextos', 'Usamos bucles en otros contextos', 'Contextos', [
          explain('recycle-context', 'Repetimos para organizar el reciclaje', context, ['Una cinta mueve varios envases iguales hasta el contenedor. La acción “avanzar una posición” se repite para cada espacio.', 'El contexto cambia, pero seguimos identificando una acción y una cantidad.'], 'Ajusta la cantidad para que el envase llegue exactamente al contenedor.', { scene: 'recycle' }),
          explain('space-context', 'Una órbita repite un grupo de acciones', context, ['El cohete puede avanzar y girar para visitar varias posiciones alrededor del planeta.', 'Aquí no repetimos una sola flecha: repetimos un <strong>grupo corto</strong> formado por avanzar y girar.'], 'Reproduce una vuelta y observa qué dos acciones vuelven a comenzar.', { scene: 'space' }),
          explain('sport-context', 'Una práctica deportiva también tiene repeticiones', context, ['En un entrenamiento podemos repetir “avanzar, tocar el balón y regresar”.', 'El bloque describe una rutina; el número indica cuántas rondas se realizan. No aumenta los puntos por sí solo.'], 'Cambia las rondas y observa el contador de la práctica.', { scene: 'soccer' }),
          explain('animal-context', 'Un sendero puede proteger una zona', context, ['La lechuza debe llevar alimento sin entrar en las casillas reservadas para el oso de anteojos.', 'Usamos repeticiones en los tramos rectos y bloques normales para rodear la zona protegida.'], 'Señala qué tramo se puede convertir en bucle sin invadir el refugio.', { scene: 'bear' }),
          play('planet-recycling', 'La ruta del reciclaje', 'loop-recycle', 'Programa repeticiones para llevar objetos al contenedor sin sobrepasarlo.'),
          play('space-and-sport', 'Órbitas y entrenamiento', 'loop-contexts', 'Resuelve una órbita con un grupo repetido y una rutina deportiva con otra estructura.'),
        ]),
        part('adaptamos', 'Adaptamos un programa', 'Adaptamos', [
          explain('goal-moves', 'Si cambia la meta, revisamos la cantidad', program, ['Un programa que funcionaba puede quedar corto o pasarse cuando la meta se mueve.', 'No empezamos de cero: conservamos la dirección correcta y calculamos cuántas vueltas necesita el nuevo recorrido.'], 'Mueve la bandera y ajusta únicamente el contador.', { mode: 'practice', scene: 'goal' }),
          explain('path-turns', 'Si aparece un giro, separamos los tramos', program, ['Un bucle recto no puede doblar una esquina por sí solo.', 'Separamos el recorrido en tramo repetido, giro y nuevo tramo. Cada parte debe corresponder al dibujo del camino.'], 'Divide el sendero en tres fragmentos antes de programarlo.', { mode: 'practice', scene: 'turns' }),
          explain('compare-solutions', 'Podemos comparar dos soluciones correctas', concept, ['Dos programas pueden llegar a la misma meta. Preferimos el que sea correcto, fácil de leer y adecuado para la consigna.', 'Tener menos bloques no sirve si el programa omite una condición, como recoger un objeto o respetar una zona.'], 'Compara las dos soluciones y explica cuál comunica mejor la repetición.', { cards: [['long', '→ → → → →', 'Correcta, pero repite cinco tarjetas.'], ['loop', 'Repetir 5: →', 'Correcta y muestra la regla.']], answer: 'loop' }),
          explain('test-new-case', 'Después de adaptar, volvemos a probar', debug, ['Cambiar un número o una flecha produce una versión nueva del programa.', 'La ejecutamos desde Inicio y observamos si cumple la meta completa. Una solución anterior no demuestra que la nueva también funcione.'], 'Cambia la meta, ajusta el bucle y ejecuta la versión nueva.', { mode: 'adapt' }),
          play('bear-trail', 'El sendero del oso', 'loop-bear', 'Combina bucles y giros para llevar la mochila sin entrar en el refugio protegido.'),
          play('adapt-loop', 'La meta cambió', 'loop-adapt', 'Modifica solo lo necesario cuando cambian el inicio, la distancia o el giro del recorrido.'),
        ]),
        part('repaso', 'Misión final', 'Misión final', [
          explain('loop-practice-final-brief', 'Cuatro contextos, cuatro decisiones', concept, ['La misión final no repite el mismo tablero con otro dibujo. Cada estación pide una decisión diferente: predecir, calcular, construir y adaptar.', 'La estrategia común es leer Inicio, meta, acción, cantidad y condiciones antes de ejecutar.'], 'Revisen qué cambia entre reciclaje, órbita, sendero y adaptación.', { cards: [['1', 'Predecir', 'Elegir destino antes de ejecutar.'], ['2', 'Calcular', 'Ajustar una cantidad exacta.'], ['3', 'Construir', 'Combinar grupo y repetición.'], ['4', 'Adaptar', 'Conservar lo útil y cambiar lo necesario.']] }),
          play('loop-practice-final', 'Circuito de repeticiones', 'path-final-loop-practice', 'Completa cuatro estaciones nuevas con estructuras y objetivos diferentes.'),
          explain('loop-practice-reflection', 'Transferimos una idea a problemas diferentes', reflection, ['Un bucle no pertenece únicamente a un laberinto: representa cualquier acción o grupo que se repite de manera exacta.', 'Para transferirlo identificamos qué permanece igual y qué cambia en cada situación.'], 'Explica qué se repetía en dos contextos y qué era diferente.', { formula: 'Leer el contexto → encontrar lo repetido → elegir cantidad → probar el caso nuevo' }),
        ]),
      ],
    },

    'errores-programas': {
      version: 'INF-1-C09-v1',
      meta: { title: 'Detectives de programas', ordinal: 'Novena', slug: 'errores-programas', number: '09' },
      intro: 'Comparamos lo esperado con lo observado, seguimos trazas y corregimos dirección, orden o cantidad.',
      loading: 'Preparando pistas, trazas y programas.',
      closing: '¡Programas investigados y reparados!',
      summary: 'Observamos resultados, localizamos el primer cambio y comprobamos correcciones con una nueva prueba.',
      guide: ['Observar: diferenciar meta esperada y resultado real.', 'Localizar: seguir una traza hasta el primer paso distinto.', 'Corregir: cambiar dirección, orden o cantidad y volver a probar.', 'Misión final: cuatro investigaciones con fallos diferentes.'],
      assets: ['assets/first-path-objects-v1.png', 'assets/programming-journey-v1.png', 'assets/owl-atlas.png'],
      parts: [
        part('observamos', 'Observamos antes de cambiar', 'Observamos', [
          explain('expected-observed', 'Comparamos lo esperado y lo observado', debug, ['La meta explica qué debía ocurrir. La ejecución muestra qué ocurrió realmente.', 'La diferencia entre esas dos cosas es nuestra primera pista. Todavía no cambiamos bloques: primero describimos el problema con precisión.'], 'Alterna entre Meta y Resultado y señala la primera diferencia visible.', { mode: 'compare' }),
          explain('error-is-information', 'Un error nos da información', concept, ['Si el personaje termina en otra casilla, sabemos que al menos una instrucción produjo un movimiento distinto del esperado.', 'Probar no es perder. Cada resultado reduce las posibilidades y nos ayuda a formular una corrección.'], 'Elige la observación más útil, sin culpar al estudiante ni borrar todo.', { cards: [['useful', 'Terminó una casilla antes de la meta', 'Describe algo que podemos investigar.'], ['vague', 'Todo está mal', 'No indica qué ocurrió ni dónde revisar.']], answer: 'useful' }),
          explain('do-not-guess', 'No cambiamos bloques al azar', debug, ['Cambiar varias instrucciones sin observar puede crear errores nuevos y ocultar la causa original.', 'Conservamos lo que ya funcionó y buscamos el primer punto donde el resultado se separa del plan.'], 'Compara cambiar todo con seguir la ejecución paso a paso.', { mode: 'method' }),
          explain('run-from-start', 'Cada prueba comienza desde el mismo Inicio', program, ['Para comparar dos versiones necesitamos las mismas condiciones: mismo Inicio, misma meta y mismos obstáculos.', 'Después de editar reiniciamos la posición. Si continuamos desde el lugar donde falló, no estamos probando el programa completo.'], 'Pulsa Reiniciar antes de ejecutar la segunda versión.', { mode: 'practice', scene: 'restart' }),
          play('compare-results', 'Meta y resultado', 'debug-compare', 'Observa una ejecución y elige la frase que describe exactamente la diferencia encontrada.'),
          play('first-difference', 'La primera pista', 'debug-first-error', 'Compara dos secuencias de estados y marca el primer momento en que dejan de coincidir.'),
        ]),
        part('localizamos', 'Seguimos la traza', 'Localizamos', [
          explain('trace-links-three-things', 'La traza une bloque, acción y resultado', debug, ['En cada paso relacionamos el número del bloque, la instrucción que contiene y el lugar donde terminó el personaje.', 'Esa relación evita señalar un bloque solamente porque “se ve diferente”. La evidencia está en el movimiento producido.'], 'Avanza paso a paso y observa las tres columnas de la traza.', { mode: 'trace' }),
          explain('first-wrong-step', 'Buscamos el primer paso incorrecto', debug, ['Un bloque posterior puede parecer extraño porque el personaje ya llegó a una posición equivocada.', 'Por eso elegimos el <strong>primer</strong> paso que no coincide con el plan, no necesariamente el último que vemos fallar.'], 'Marca el primer paso distinto, aunque después aparezcan más diferencias.', { mode: 'first' }),
          explain('classify-error', 'El fallo puede ser de dirección, orden o cantidad', concept, ['Dirección: una flecha apunta hacia otro lado. Orden: dos acciones correctas están intercambiadas. Cantidad: un bucle repite de más o de menos.', 'Nombrar el tipo de error ayuda a cambiar únicamente la propiedad necesaria.'], 'Pulsa cada tipo para ver un ejemplo y la corrección mínima.', { cards: [['direction', 'Dirección', 'Cambiar ↑ por →.'], ['order', 'Orden', 'Intercambiar dos bloques.'], ['count', 'Cantidad', 'Cambiar Repetir 5 por Repetir 4.']] }),
          explain('evidence-before-edit', 'Señalamos la evidencia antes de editar', debug, ['Antes de reparar podemos decir: “los dos primeros bloques coinciden; el tercero intenta entrar en la roca”.', 'Esa explicación relaciona la traza con la corrección y permite comprobar después si resolvimos el problema correcto.'], 'Completa oralmente: funciona hasta…, falla cuando…, revisaré…', { mode: 'evidence' }),
          play('trace-programs', 'La mesa de trazas', 'debug-trace', 'Ejecuta paso a paso y señala el primer bloque cuya acción no coincide con el recorrido esperado.'),
          play('name-the-error', '¿Qué tipo de error es?', 'debug-classify', 'Decide si cada programa necesita corregir dirección, orden o cantidad.'),
        ]),
        part('corregimos', 'Corregimos y comprobamos', 'Corregimos', [
          explain('minimal-change', 'Hacemos el cambio más pequeño posible', debug, ['Si la traza localiza una flecha incorrecta, reemplazamos esa flecha y conservamos los demás bloques.', 'Una corrección pequeña permite relacionar claramente el cambio con el nuevo resultado.'], 'Selecciona un solo bloque, cámbialo y compara las dos versiones.', { mode: 'direction' }),
          explain('repair-order', 'A veces los bloques correctos están en otro orden', debug, ['Un programa puede contener todas las acciones necesarias y aun así ejecutarlas en el momento equivocado.', 'Intercambiamos únicamente las dos tarjetas relacionadas y volvemos a leer desde el inicio.'], 'Arrastra o selecciona dos bloques para intercambiarlos.', { mode: 'order' }),
          explain('repair-count', 'En un bucle corregimos el número', debug, ['Si el personaje avanza en la dirección correcta pero se pasa de la meta, revisamos la cantidad.', 'Reducimos o aumentamos una vuelta y comprobamos el recorrido completo.'], 'Ajusta una sola unidad y ejecuta de nuevo.', { mode: 'count' }),
          explain('test-more-than-once', 'Una corrección necesita una prueba nueva', concept, ['Después de editar ejecutamos desde Inicio y revisamos la meta completa.', 'En programas sencillos una prueba puede bastar; si existen varios caminos o casos, probamos cada condición importante.'], 'Elige la evidencia que demuestra la reparación, no solo que el bloque cambió.', { cards: [['edit', 'El bloque se ve diferente', 'Muestra una edición, no el resultado.'], ['test', 'La nueva ejecución cumple la meta', 'Comprueba el comportamiento.']], answer: 'test' }),
          play('repair-directions', 'Reparamos flechas y orden', 'debug-repair', 'Corrige un programa con una dirección equivocada y otro con dos bloques intercambiados.'),
          play('repair-loop-count', 'Reparamos repeticiones', 'debug-loop', 'Ajusta cantidades de bucles y vuelve a ejecutar desde Inicio para comprobar.'),
        ]),
        part('repaso', 'Misión final', 'Misión final', [
          explain('debug-final-brief', 'Preparamos cuatro investigaciones', concept, ['Cada estación conserva una evidencia diferente: comparación, traza, tipo de error y nueva ejecución.', 'No se acepta una corrección hasta que el programa reparado se pruebe desde Inicio y cumpla toda la meta.'], 'Revisen qué evidencia deben producir en cada investigación.', { cards: [['1', 'Comparar', 'Esperado frente a observado.'], ['2', 'Localizar', 'Primer paso diferente.'], ['3', 'Corregir', 'Cambio mínimo.'], ['4', 'Comprobar', 'Nueva ejecución completa.']] }),
          play('debug-final', 'El archivo de programas', 'path-final-debug', 'Resuelve cuatro casos nuevos con fallos de dirección, orden y cantidad.'),
          explain('debug-reflection', 'Explicamos una corrección con evidencia', reflection, ['Una explicación completa nombra el resultado observado, el primer paso incorrecto, el cambio realizado y la prueba final.', 'Así la depuración deja de ser ensayo al azar y se convierte en un proceso que podemos repetir.'], 'Cuenta un caso siguiendo: esperaba…, observé…, cambié…, comprobé…', { formula: 'Esperar → observar → localizar → cambiar → volver a probar' }),
        ]),
      ],
    },

    'ciudadania-digital': {
      version: 'INF-1-C10-v1',
      meta: { title: 'Nos cuidamos en internet', ordinal: 'Décima', slug: 'ciudadania-digital', number: '10' },
      intro: 'Reconocemos datos personales, identificamos adultos de confianza y practicamos detenernos, cerrar y pedir ayuda.',
      loading: 'Preparando historias y decisiones seguras.',
      closing: '¡Plan de cuidado digital completado!',
      summary: 'Protegimos datos ficticios, elegimos adultos de confianza y practicamos pedir ayuda ante situaciones incómodas.',
      guide: ['Datos: distinguir información personal y ejemplos que pueden compartirse en una actividad.', 'Confianza: reconocer adultos disponibles y explicar lo ocurrido.', 'Decisiones: detenerse, no responder, cerrar y pedir ayuda.', 'Misión final: aplicar el plan a historias ficticias.'],
      assets: ['assets/digital-safety-scenes-v1.png', 'assets/first-path-objects-v1.png', 'assets/owl-atlas.png'],
      parts: [
        part('datos', 'Protegemos nuestros datos', 'Datos', [
          explain('what-is-personal', 'Un dato personal habla de una persona identificable', concept, ['El nombre completo, la dirección, el teléfono, la contraseña y el lugar donde estamos pueden ayudar a reconocer o localizar a alguien.', 'En los juegos usaremos ejemplos ficticios. Nunca pediremos a los niños escribir datos reales para completar una actividad.'], 'Pulsa las tarjetas para descubrir por qué cada ejemplo necesita cuidado.', { cards: [['name', 'Nombre completo', 'Identifica a una persona.'], ['address', 'Dirección de la casa', 'Indica dónde vive.'], ['password', 'Contraseña', 'Protege una cuenta.'], ['location', 'Ubicación actual', 'Puede mostrar dónde está.']] }),
          explain('public-private-context', 'La decisión también depende del contexto', concept, ['Decir “me gustan las mariposas” no es igual que publicar la dirección de la casa.', 'Incluso un dato sencillo puede necesitar acompañamiento si una página o una persona desconocida lo solicita. Cuando dudamos, preguntamos a un adulto de confianza.'], 'Compara un gusto general con un dato que permite localizar a alguien.', { cards: [['interest', 'Me gustan las mariposas', 'Gusto general en una actividad guiada.'], ['location', 'Estoy solo en…', 'Ubicación y situación personal: no compartir.']], answer: 'interest' }),
          explain('password-never-here', 'Las contraseñas no se escriben en esta clase', story, ['Una contraseña es personal. No la compartimos con compañeros ni la probamos en juegos que no sean la página oficial acompañada por un adulto.', 'Esta plataforma no solicita contraseñas infantiles para las actividades. El nombre de participación no convierte el enlace en una cuenta escolar.'], 'Observa la escena y pulsa Detener antes de compartir.', { scene: 0, action: 'stop' }),
          explain('ask-before-form', 'Antes de llenar un formulario, pedimos ayuda', story, ['Si una página pide nombre, foto, dirección, edad o teléfono, nos detenemos y buscamos al profesor o a la persona adulta responsable.', 'No inventamos un dato para continuar ni pulsamos botones sin comprender. Cerrar la ventana también es una opción segura.'], 'Elige entre continuar solo, cerrar o pedir ayuda y explica la decisión.', { scene: 0, action: 'ask' }),
          play('sort-personal-data', 'La caja de los datos', 'safe-data-sort', 'Clasifica ejemplos ficticios entre “dato personal” y “información general”.'),
          play('safe-profile', 'Un perfil para el juego', 'safe-profile', 'Elige únicamente la información necesaria y segura para una actividad escolar ficticia.'),
        ]),
        part('confianza', 'Pedimos ayuda a personas de confianza', 'Confianza', [
          explain('trusted-adult', 'Un adulto de confianza escucha y ayuda', story, ['Puede ser el profesor, la orientadora o una persona cuidadora acordada por la familia.', 'No tiene que saber la solución inmediatamente. Lo importante es que escuche, cuide al niño y busque la ayuda necesaria.'], 'Pulsa la escena y observa cómo el niño cuenta lo ocurrido sin ocultarlo.', { scene: 1, action: 'tell' }),
          explain('tell-what-happened', 'Podemos contar qué vimos y cómo nos sentimos', story, ['Para pedir ayuda podemos decir: “apareció este mensaje”, “no sé quién lo envió” o “esto me hizo sentir incómodo”.', 'No necesitamos responder al mensaje ni investigar solos. También podemos mostrar la pantalla sin reenviar el contenido a otras personas.'], 'Ordena oralmente: qué apareció, qué hiciste y cómo te sentiste.', { scene: 2, action: 'explain' }),
          explain('not-the-child-fault', 'Pedir ayuda no trae castigo por haber contado', concept, ['Si algo inesperado aparece, el niño puede pedir ayuda aunque haya pulsado un botón por error.', 'Los adultos deben ayudar a proteger y comprender la situación. Ocultar el problema permite que continúe.'], 'Elige la respuesta adulta que escucha y acompaña.', { cards: [['help', 'Gracias por contarlo; vamos a revisarlo juntos', 'Escucha y protege.'], ['blame', 'Es tu culpa; resuélvelo solo', 'Culpa y deja al niño sin apoyo.']], answer: 'help' }),
          explain('more-than-one-helper', 'Podemos buscar otra persona si la primera no está disponible', story, ['Es útil reconocer varias personas de confianza y saber cómo encontrarlas en el colegio o en casa.', 'Si una persona no escucha o no puede ayudar, seguimos buscando otra. No tenemos que resolver la situación solos.'], 'Recorre las opciones: profesor, orientación y persona cuidadora.', { scene: 3, action: 'helpers' }),
          play('choose-trusted-help', '¿A quién pedimos ayuda?', 'safe-trusted', 'En historias ficticias, elige una persona adulta disponible y una forma clara de contar lo ocurrido.'),
          play('build-help-message', 'Contamos lo necesario', 'safe-ask-help', 'Ordena frases sencillas para explicar qué apareció, qué hiciste y qué ayuda necesitas.'),
        ]),
        part('decisiones', 'Actuamos ante algo incómodo', 'Decisiones', [
          explain('pause-not-reply', 'Primero nos detenemos y no respondemos', story, ['Un mensaje puede presionar para actuar rápido, guardar un secreto o entregar información.', 'Detenerse permite pensar. No respondemos, no enviamos datos y no seguimos instrucciones de una persona desconocida.'], 'Pulsa Pausa antes de tocar cualquier opción del mensaje.', { scene: 0, action: 'pause' }),
          explain('close-and-leave', 'Podemos cerrar la ventana o alejarnos del equipo', story, ['Cerrar una ventana incómoda no borra la posibilidad de pedir ayuda. Podemos llamar al profesor y mostrarle lo ocurrido.', 'Si el contenido asusta o confunde, también podemos apartarnos de la pantalla mientras llega el adulto.'], 'Practica cerrar el cuadro ficticio y activar el aviso para el profesor.', { scene: 3, action: 'close' }),
          explain('do-not-keep-secret', 'Los secretos que incomodan se cuentan', story, ['Una persona desconocida no debe pedir a un niño ocultar mensajes, regalos o conversaciones a los adultos que lo cuidan.', 'Contarlo no rompe una regla: es una forma de protección. El adulto puede conservar evidencia sin que el niño siga interactuando.'], 'Elige contar la situación y observa la respuesta de acompañamiento.', { scene: 2, action: 'tell' }),
          explain('simple-safety-plan', 'Nuestro plan: detener, cerrar y contar', concept, ['Recordamos tres acciones: <strong>detenernos</strong>, <strong>cerrar o alejarnos</strong> y <strong>contarle a un adulto de confianza</strong>.', 'Según la situación, el adulto decidirá si debe bloquear, guardar evidencia, informar al colegio o buscar otra ayuda. Esa responsabilidad no recae en el niño.'], 'Pulsa las tres acciones en orden y repítanlas juntos.', { cards: [['stop', '1 · Detener', 'No responder ni compartir.'], ['close', '2 · Cerrar', 'Salir o apartarse.'], ['tell', '3 · Contar', 'Buscar a un adulto de confianza.']], ordered: true }),
          play('safe-story-decisions', 'Historias para decidir', 'safe-story', 'Elige la primera acción segura en situaciones ficticias y observa qué ocurre después.'),
          play('stop-close-tell', 'Detener, cerrar y contar', 'safe-stop-close-tell', 'Ordena y aplica el plan completo en tres escenarios diferentes.'),
        ]),
        part('repaso', 'Misión final', 'Misión final', [
          explain('safety-final-brief', 'Practicamos sin usar datos reales', concept, ['La misión final utiliza nombres, mensajes y perfiles inventados. No escribiremos contraseñas, direcciones, teléfonos ni experiencias personales.', 'Si una historia recuerda una situación real, el estudiante puede dejar el juego y hablar en privado con un adulto de confianza.'], 'Revisen el acuerdo: ejemplos ficticios, derecho a pausar y ayuda disponible.', { cards: [['fiction', 'Ejemplos ficticios', 'No contamos datos privados al grupo.'], ['pause', 'Podemos pausar', 'Nadie está obligado a responder una historia personal.'], ['help', 'Ayuda disponible', 'El profesor acompaña la actividad.']] }),
          play('safety-final', 'El plan de cuidado digital', 'path-final-safety', 'Completa cuatro estaciones: reconocer datos, elegir ayuda, decidir y aplicar el plan.'),
          explain('safety-reflection', 'Cuidarnos es pedir acompañamiento', reflection, ['No necesitamos memorizar todas las situaciones posibles. Podemos detenernos cuando algo parece extraño y buscar ayuda.', 'Proteger datos, no responder bajo presión y contar lo ocurrido son decisiones que los adultos deben acompañar.'], 'Repitan juntos el plan y nombren dos adultos disponibles en el colegio, sin contar situaciones privadas.', { formula: 'Detenernos → cerrar o alejarnos → contar a un adulto de confianza' }),
        ]),
      ],
    },
  };

  const params = new URLSearchParams(location.search);
  const selected = classes[params.get('clase')] || classes['patrones-mensajes'];
  selected.pictures = window.ComputerClass?.pictures || [];
  window.FirstPathClasses = classes;
  window.ComputerClass = selected;

  function configurePage() {
    const meta = selected.meta;
    document.documentElement.dataset.firstPathClass = meta.slug;
    document.title = `${meta.title} · ${meta.ordinal} clase`;
    const root = document.getElementById('adventure');
    if (!root) return;
    root.dataset.classSlug = meta.slug;
    root.setAttribute('aria-label', `${meta.ordinal} clase: ${meta.title}`);
    document.querySelectorAll('[data-class-number]').forEach(node => { node.textContent = meta.number; });
    document.querySelectorAll('[data-class-ordinal]').forEach(node => { node.textContent = meta.ordinal.toUpperCase(); });
    document.querySelectorAll('[data-class-title]').forEach(node => { node.textContent = meta.title; });
    document.querySelectorAll('[data-class-intro]').forEach(node => { node.textContent = selected.intro; });
    document.querySelectorAll('[data-class-loading]').forEach(node => { node.textContent = selected.loading; });
    document.querySelectorAll('[data-class-closing]').forEach(node => { node.textContent = selected.closing; });
    document.querySelectorAll('[data-class-summary]').forEach(node => { node.textContent = selected.summary; });
    document.querySelectorAll('[data-class-back]').forEach(node => { node.href = `grado/1/clase/${meta.slug}`; });
    document.querySelectorAll('[data-class-create]').forEach(node => { node.href = `docente?crear=${encodeURIComponent(meta.slug)}`; });
    const guide = document.getElementById('dynamic-guide-list');
    if (guide) guide.innerHTML = selected.guide.map(item => `<li>${item}</li>`).join('');
  }
  configurePage();
})();
