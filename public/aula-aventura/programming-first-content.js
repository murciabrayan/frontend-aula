'use strict';

window.ComputerClass = {
  version: 'INF-1-C05-v1',
  meta: { title: 'Bloques de dirección', ordinal: 'Quinta', slug: 'programacion-flechas' },
  pictures: window.ComputerClass.pictures,
  assets: ['assets/programming-journey-v1.png', 'assets/owl-atlas.png'],
  parts: [
    {
      id: 'bloques', name: 'Bloques que dan instrucciones', short: 'Bloques', steps: [
        { id: 'program-is-list', title: 'Un programa es una lista de instrucciones', demo: 'programming-program', body: ['Un programa le dice a un personaje <strong>qué hacer y en qué orden</strong>. Cada tarjeta de nuestra lista será una instrucción.', 'La lechuza no adivina el camino ni cambia los pasos. Lee el primer bloque, realiza esa acción y continúa con el siguiente.'], prompt: 'Pulsa Ejecutar y observa qué bloque está leyendo la lechuza en cada movimiento.' },
        { id: 'one-block-one-step', title: 'Cada flecha mueve una casilla', demo: 'programming-one-step', body: ['Una flecha es un bloque de movimiento. <strong>Una flecha mueve exactamente una casilla</strong> hacia arriba, abajo, izquierda o derecha.', 'La dirección se entiende mirando la pantalla. Antes de ejecutar podemos señalar dónde creemos que terminará el personaje.'], prompt: 'Prueba las cuatro flechas. Compara la dirección del símbolo con el movimiento en el tablero.' },
        { id: 'start-and-goal', title: 'Reconocemos el inicio y la meta', demo: 'programming-goal', body: ['Todo recorrido empieza en una casilla marcada como <strong>Inicio</strong>. La meta muestra el lugar al que queremos llegar.', 'Primero observamos dónde estamos y dónde queremos terminar. Después elegimos los bloques; así programamos con una intención.'], prompt: 'Señala Inicio, la bandera y las casillas que podrían formar un camino.' },
        { id: 'read-order', title: 'Leemos de izquierda a derecha', demo: 'programming-order', body: ['Los bloques tienen un orden. En esta clase los leemos <strong>de izquierda a derecha</strong>, igual que una fila de palabras.', 'Durante la ejecución se ilumina el bloque activo. Eso permite relacionar cada instrucción con el movimiento que produce.'], prompt: 'Cambia el orden de dos bloques y ejecuta otra vez. ¿Termina en la misma casilla?' },
        { id: 'block-choice-game', title: 'El bloque que falta', game: 'programming-block-choice', instruction: 'Observa Inicio y la meta. Elige la única flecha que mueve a la lechuza una casilla hasta el destino.' },
        { id: 'predict-game', title: '¿Dónde terminará?', game: 'programming-predict', instruction: 'Lee el programa sin mover a la lechuza. Marca primero la casilla final y después ejecuta para comprobar tu predicción.' },
      ],
    },
    {
      id: 'construimos', name: 'Construimos y ejecutamos', short: 'Construimos', steps: [
        { id: 'observe-before-build', title: 'Observamos antes de agregar bloques', demo: 'programming-plan', body: ['Antes de programar miramos el tablero: contamos columnas y filas, buscamos los obstáculos y reconocemos los objetos de la misión.', 'Podemos recorrer el camino con el dedo y decir las direcciones en voz alta. Después convertimos ese plan en bloques.'], prompt: 'Traza con el dedo un camino desde el sobre hasta el buzón sin pasar por el charco.' },
        { id: 'build-program', title: 'Construimos una fila de bloques', demo: 'programming-build', body: ['Al pulsar una flecha, el bloque se agrega al final del programa. También podemos seleccionar un bloque para cambiarlo o borrar el último.', 'Las flechas físicas del teclado agregan los mismos bloques. Así usamos el teclado real para construir, pero el personaje todavía no se mueve.'], prompt: 'Agrega tres bloques con el teclado. Comprueba que la lechuza permanece en Inicio mientras planeamos.' },
        { id: 'execute-program', title: 'Ejecutar no es lo mismo que construir', demo: 'programming-execute', body: ['Mientras construimos, preparamos instrucciones. Al pulsar <strong>Ejecutar</strong>, la lechuza comienza desde Inicio y sigue toda la lista.', 'No necesitamos pulsar las flechas durante el recorrido. El programa se encarga de reproducirlas en el orden que elegimos.'], prompt: 'Construye la lista y pulsa Ejecutar una sola vez. Sigue con el dedo el bloque que se ilumina.' },
        { id: 'collect-before-deliver', title: 'Una misión puede tener más de un objetivo', demo: 'programming-collect', body: ['Llegar a una casilla no siempre basta. En la misión del correo debemos <strong>recoger primero el sobre</strong> y terminar después en el buzón.', 'El orden importa: si visitamos el buzón antes de recoger el sobre, la entrega aún no está completa.'], prompt: 'Compara los dos planes. ¿Cuál recoge el sobre antes de llegar al buzón?' },
        { id: 'courier-game', title: 'El correo del bosque', game: 'programming-courier', instruction: 'Construye un programa, ejecútalo y entrega el sobre en el buzón. Puedes usar los botones o las flechas de tu teclado.' },
        { id: 'berries-game', title: 'La ruta de las bayas', game: 'programming-berries', instruction: 'Programa una ruta distinta: recoge la canasta, cruza por el puente y termina en la bandera sin pisar los charcos.' },
      ],
    },
    {
      id: 'corregimos', name: 'Probamos y corregimos', short: 'Corregimos', steps: [
        { id: 'test-to-learn', title: 'Probar nos muestra lo que hace el programa', demo: 'programming-test', body: ['Un programa puede verse correcto y producir otro resultado. Por eso lo ejecutamos y observamos cada movimiento.', 'Equivocarnos no termina la actividad. La prueba nos da información: muestra hasta dónde llegó la lechuza y qué instrucción estaba usando.'], prompt: 'Ejecuta el ejemplo. Observa el bloque iluminado cuando la lechuza se detiene.' },
        { id: 'trace-program', title: 'La traza sigue los bloques uno por uno', demo: 'programming-trace', body: ['Llamamos <strong>traza</strong> al seguimiento de la ejecución paso a paso. La traza une tres pistas: el número del bloque, la flecha y la nueva casilla.', 'Si el recorrido falla, volvemos al último movimiento correcto y revisamos el siguiente bloque. No necesitamos cambiar toda la lista.'], prompt: 'Usa Paso a paso y cuenta cuántas instrucciones funcionan antes del problema.' },
        { id: 'locate-error', title: 'Primero localizamos el error', demo: 'programming-locate', body: ['Antes de editar, señalamos la primera instrucción que intenta salir del tablero, entrar en un obstáculo o alejarse de la meta.', 'Localizar el error evita cambiar bloques que sí funcionaban. Una buena corrección conserva lo que ya estaba bien.'], prompt: 'Pulsa el bloque que causa el primer movimiento incorrecto. La pista está en la traza.' },
        { id: 'repair-and-retest', title: 'Cambiamos, reiniciamos y volvemos a probar', demo: 'programming-repair', body: ['Seleccionamos el bloque incorrecto y elegimos otra dirección. Después reiniciamos la posición y ejecutamos desde el primer bloque.', 'Una corrección se comprueba con una nueva prueba. Si llega a la meta y cumple la misión, tenemos evidencia de que el programa funciona.'], prompt: 'Reemplaza solo el bloque marcado y vuelve a ejecutar el programa completo.' },
        { id: 'trace-game', title: 'Inspectores del programa', game: 'programming-trace', instruction: 'Ejecuta programas ya construidos. Sigue la traza y señala el primer bloque que impide continuar correctamente.' },
        { id: 'repair-game', title: 'Taller de reparación', game: 'programming-repair', instruction: 'En tableros nuevos, identifica una flecha incorrecta, reemplázala y ejecuta desde el inicio para comprobar la solución.' },
      ],
    },
    {
      id: 'repaso', name: 'Misión final', short: 'Misión final', steps: [
        { id: 'final-brief', title: 'Preparamos una misión completa', demo: 'programming-final-map', body: ['Ya podemos leer bloques, predecir un resultado, construir un programa y corregirlo. En la misión final reuniremos esas acciones en cuatro estaciones diferentes.', 'No hay cronómetro. Podemos observar, explicar el plan, probar y volver a intentarlo. Lo importante es relacionar los bloques con lo que ocurre en el tablero.'], prompt: 'Revisen juntos las cuatro estaciones antes de comenzar: predecir, construir, recoger y reparar.' },
        { id: 'programming-final-game', title: 'La entrega de la lechuza', game: 'programming-final', instruction: 'Completa cuatro estaciones: predice una llegada, programa un puente, recoge un envío y repara una ruta distinta.' },
        { id: 'final-reflection', title: 'Explicamos nuestro programa', demo: 'programming-reflection', body: ['Programar no es pulsar flechas al azar. Primero definimos una meta, construimos instrucciones y luego observamos la ejecución.', 'Si algo falla, la traza nos ayuda a encontrar el bloque que debemos revisar. Podemos explicar qué cambiamos y por qué la nueva instrucción funciona.'], prompt: 'Elige un bloque de tu solución y explica qué movimiento produjo y qué habría ocurrido con otra flecha.' },
      ],
    },
  ],
};
