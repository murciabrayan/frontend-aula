'use strict';
window.ComputerClass = {
  version: 'INF-1-C01-v2',
  pictures: [
    { id: 'sun', name: 'Sol', word: 'SOL', frame: 0 },
    { id: 'moon', name: 'Luna', word: 'LUNA', frame: 1 },
    { id: 'butterfly', name: 'Mariposa', word: 'MARIPOSA', frame: 2 },
    { id: 'flower', name: 'Flor', word: 'FLOR', frame: 4 },
    { id: 'apple', name: 'Manzana', word: 'MANZANA', frame: 5 },
    { id: 'owl', name: 'Lechuza', word: 'LECHUZA', owl: true },
    { id: 'rabbit', name: 'Conejo', word: 'CONEJO' },
    { id: 'snail', name: 'Caracol', word: 'CARACOL' },
    { id: 'frog', name: 'Rana', word: 'RANA' },
    { id: 'bird', name: 'Ave', word: 'AVE' },
  ],
  parts: [
    { id: 'monitor', name: 'La pantalla', short: 'Pantalla', steps: [
      { id: 'screen-purpose', title: 'La pantalla', demo: 'screen', body: ['La <strong>pantalla</strong> nos muestra lo que ocurre en el computador: dibujos, palabras, fotografías y videos.', 'Cuando abrimos un programa o escribimos, vemos su resultado en ella.'], prompt: 'Cambia lo que aparece y cuéntale al grupo qué ves.' },
      { id: 'screen-anatomy', title: 'Conozcamos el monitor', demo: 'screen-anatomy', body: ['La zona donde vemos la información está rodeada por un <strong>marco</strong>. En este monitor hay un botón para encender o apagar la pantalla.', 'Apagar el monitor no siempre apaga el computador. En el salón seguimos las indicaciones del profesor.'], prompt: 'Señala la zona de imagen y después prueba el botón del dibujo.' },
      { id: 'screen-motion', title: 'Una imagen puede moverse', demo: 'screen-motion', body: ['Una imagen puede quedarse quieta. Una <strong>animación</strong> cambia para que veamos movimiento.', 'Un conejo puede saltar, un caracol avanzar y un ave mover sus alas. La pantalla muestra cómo cambian esas imágenes.'], prompt: 'Elige distintos animales. Ponlos en pausa y compara cómo se mueve cada uno.' },
      { id: 'screen-computer', title: 'La pantalla es una parte', demo: 'equipment', body: ['En un equipo de escritorio, el monitor muestra la información y la <strong>torre</strong> contiene otras partes del computador.', 'En un portátil, pantalla y teclado están unidos. El panel táctil también puede mover el puntero.'], prompt: 'Comparemos los dibujos con los computadores del salón.' },
      { id: 'screen-sort', title: '¿Qué muestra la pantalla?', game: 'screen-sort', instruction: 'Observa el ejemplo y elige si es una imagen, una palabra o una animación.' },
      { id: 'screen-observe', title: '¿Qué cambió en la escena?', game: 'observe', instruction: 'Observa dónde está cada dibujo. Cuando estés listo, mira la segunda escena y encuentra el cambio.' },
      { id: 'screen-memory', title: 'Encuentra las parejas', game: 'memory', instruction: 'Abre dos tarjetas y busca dibujos iguales. Observa y recuerda dónde están.' },
    ] },
    { id: 'mouse', name: 'El mouse', short: 'Mouse', steps: [
      { id: 'mouse-purpose', title: 'El mouse', demo: 'pointer', body: ['El <strong>mouse</strong> nos ayuda a señalar, elegir y mover elementos. La flechita que vemos en la pantalla se llama <strong>puntero</strong>.', 'Deslizamos el mouse sobre la mesa y observamos hacia dónde se mueve el puntero.'], prompt: 'Mueve el cursor dentro del recuadro. También puedes probar las flechas.' },
      { id: 'mouse-buttons', title: 'Botones y rueda', demo: 'mouse-anatomy', body: ['Este mouse tiene un <strong>botón izquierdo</strong>, un <strong>botón derecho</strong> y una <strong>rueda</strong> en el centro.', 'Cada uno nos permite hacer algo distinto. Conozcamos primero sus lugares y después practiquemos sus funciones.'], prompt: 'Toca cada señal del dibujo y encuentra esa parte en el mouse real.' },
      { id: 'mouse-left', title: 'Clic izquierdo: elegir', demo: 'left-click', body: ['Para hacer <strong>clic</strong>, pulsamos una vez el botón izquierdo y lo soltamos.', 'Lo usamos para seleccionar una imagen o activar un botón. Primero apuntamos y después hacemos clic.'], prompt: 'Haz clic izquierdo en las imágenes para elegir una.' },
      { id: 'mouse-right', title: 'Clic derecho: ver opciones', demo: 'context', body: ['El <strong>clic derecho</strong> puede abrir un menú con acciones para el elemento que señalamos.', 'En nuestro jardín, haz clic derecho sobre la flor. Después elige una acción del menú con clic izquierdo.'], prompt: 'Abre el menú de la flor y elige «Regar». En pantalla táctil usa «Ver opciones».' },
      { id: 'mouse-wheel', title: 'La rueda: recorrer', demo: 'wheel', body: ['La <strong>rueda</strong> ayuda a subir y bajar cuando el contenido no cabe completo en la pantalla.', 'Con el puntero sobre el recuadro, gira la rueda suavemente. Aparecerán imágenes que estaban más abajo.'], prompt: 'Recorre el recuadro y busca la manzana. También puedes usar su barra de desplazamiento.' },
      { id: 'mouse-drag', title: 'Arrastrar y soltar', demo: 'drag-demo', body: ['Para <strong>arrastrar</strong>, apuntamos a un objeto y mantenemos pulsado el botón izquierdo mientras movemos el mouse.', 'Al llegar a su lugar, soltamos el botón. Así podemos mover una pieza sin hacer varios clics.'], prompt: 'Observa los tres pasos: pulsar y sostener, mover, soltar.' },
      { id: 'mouse-reveal', title: 'Descubre el dibujo', game: 'reveal', instruction: 'Mueve el puntero por todas las zonas del tablero para descubrir la ilustración.' },
      { id: 'mouse-choose', title: 'Dibujamos punto por punto', game: 'trace', instruction: 'Pulsa los puntos en orden para dibujar. Sigue los números y observa cómo aparece la ilustración.' },
      { id: 'mouse-context-game', title: 'Cuidemos el jardín', game: 'context', instruction: 'Usa clic derecho sobre la flor y elige la acción indicada. Después observa qué sucede.' },
      { id: 'mouse-sort', title: 'Reconstruimos la ilustración', game: 'jigsaw', instruction: 'Une las piezas de la imagen. Compara sus bordes y colores; puedes consultar el modelo cuando lo necesites.' },
    ] },
    { id: 'keyboard', name: 'El teclado', short: 'Teclado', steps: [
      { id: 'keyboard-purpose', title: 'El teclado', demo: 'typing', body: ['El <strong>teclado</strong> tiene teclas con letras, números y otros símbolos.', 'Cuando pulsamos una letra o un número, podemos verlo en la pantalla. Algunas teclas nos permiten hacer otras acciones.'], prompt: 'Prueba letras y números con tu teclado. Las teclas en pantalla son otra forma de practicar.' },
      { id: 'keyboard-space', title: 'Espacio separa palabras', demo: 'space', body: ['La barra de <strong>Espacio</strong> es una tecla larga situada en la parte de abajo.', 'Al pulsarla dejamos un espacio. Así separamos palabras: MI SOL se lee mejor que MISOL.'], prompt: 'Copia el modelo «MI SOL» y observa el espacio entre las dos palabras.' },
      { id: 'keyboard-backspace', title: 'Retroceso nos ayuda a corregir', demo: 'backspace', body: ['La tecla <strong>Retroceso</strong>, también llamada Backspace, borra lo que está antes del lugar donde escribimos.', 'Si hay una letra de más, podemos borrarla y corregir. No tenemos que empezar siempre desde el principio.'], prompt: 'Hay una L de más en «SOLL». Usa Retroceso para dejar la palabra «SOL».' },
      { id: 'keyboard-enter', title: 'Enter confirma una acción', demo: 'enter', body: ['La tecla <strong>Enter</strong> puede confirmar una respuesta. En otros programas también sirve para comenzar una línea nueva.', 'En esta práctica, escribe una palabra y pulsa Enter para mostrarla en la pantalla de confirmación.'], prompt: 'Escribe una palabra y pulsa Enter. También puedes confirmar con el botón.' },
      { id: 'keyboard-arrows', title: 'Las flechas dan dirección', demo: 'arrows', body: ['Las teclas con <strong>flechas</strong> indican izquierda, derecha, arriba y abajo.', 'En un juego pueden mover un personaje. Lo que hace una tecla también depende del programa que estamos usando.'], prompt: 'Lleva la lechuza hasta la manzana usando las flechas. Puedes usar los botones de dirección.' },
      { id: 'keyboard-find', title: 'Encuentra la tecla', game: 'find-key', instruction: 'Observa la letra o el número y púlsalo en tu teclado. Sigue el modelo con calma.' },
      { id: 'keyboard-copy', title: 'Escribimos y corregimos', game: 'copy', instruction: 'Copia el modelo. Usa Espacio y Retroceso cuando los necesites y después comprueba.' },
      { id: 'keyboard-path', title: 'Caminos con objetivos', game: 'maze', instruction: 'Busca la salida con las flechas. Observa los objetivos del mapa: algunas puertas necesitan una llave.' },
    ] },
    { id: 'repaso', name: 'Repaso final', short: 'Repaso', steps: [
      { id: 'review-intro', title: 'Practiquemos lo aprendido', demo: 'final-intro', body: ['Ya observamos la pantalla y practicamos con el mouse y el teclado.', 'En el taller final resolveremos <strong>cuatro desafíos</strong>: un puzle nuevo, un dibujo, un recorrido y una escena que crearemos con imágenes y texto.'], prompt: 'Ahora vamos a aplicar lo aprendido en situaciones diferentes.' },
      { id: 'review-workshop', title: 'El taller del computador', game: 'final', instruction: 'Resuelve los cuatro desafíos y crea una escena usando mouse y teclado.' },
      { id: 'review-reflection', title: '¿Qué aprendimos hoy?', demo: 'reflection', body: ['La <strong>pantalla</strong> muestra la información. El <strong>mouse</strong> permite señalar, elegir, abrir opciones y mover objetos.', 'Con el <strong>teclado</strong> escribimos y damos instrucciones. ¿Qué acción te salió mejor? ¿Cuál quieres volver a practicar?'], prompt: 'Menciona una parte del computador y muestra al grupo cómo la usaste.' },
    ] },
  ],
};

// Verified curriculum: this class is now dedicated to the real use of the
// mouse and keyboard. The former screen-only block is no longer part of the
// published route; the existing polished practices are grouped into the four
// moments requested by the teachers.
(() => {
  const source = window.ComputerClass.parts;
  const mouse = source.find(part => part.id === 'mouse');
  const keyboard = source.find(part => part.id === 'keyboard');
  const review = source.find(part => part.id === 'repaso');
  window.ComputerClass.version = 'INF-1-MOUSE-KEYBOARD-v2';
  window.ComputerClass.meta = {title:'Uso del teclado y del mouse',ordinal:'Segunda',slug:'partes-del-computador'};
  window.ComputerClass.parts = [
    {id:'monitor',name:'Mouse',short:'Mouse',steps:[...mouse.steps.slice(0,5),mouse.steps[6]]},
    {id:'mouse',name:'Mouse: segunda parte',short:'Mouse 2',steps:[mouse.steps[5],...mouse.steps.slice(7)]},
    {id:'keyboard',name:'Teclado',short:'Teclado',steps:[...keyboard.steps.slice(0,4),keyboard.steps[5]]},
    {id:'repaso',name:'Teclado: segunda parte',short:'Teclado 2',steps:[keyboard.steps[4],...keyboard.steps.slice(6),...review.steps]},
  ];
})();
