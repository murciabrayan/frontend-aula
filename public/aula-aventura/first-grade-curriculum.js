'use strict';
(() => {
  const activities = {};
  const parts = {};
  const tile = (icon, text) => ({ icon, text });
  const question = (prompt, answer, options, hint, icon = '❔') => ({ prompt, answer, options, hint, icon });
  const order = (prompt, cards, hint) => ({ prompt, cards, hint });
  const words = (prompt, answer, model, icon) => ({ prompt, answer, model, icon });
  const route = (prompt, rows, options = {}) => ({ prompt, rows, ...options });

  function add(slug, partId, name, short, description, body, demo, exercises, options = {}) {
    const key = `${slug}:${partId}`;
    const demoStep = { id: `curr-${partId}-explica`, title: name, demo: 'curriculum-cards', body,
      prompt: options.prompt || 'Observa las tarjetas y cuéntale al grupo qué harías.', cards: demo, codebook: options.codebook };
    const games = exercises.map(([id, title, instruction, type, rounds]) => {
      const game = `curr-${id}`;
      activities[game] = { type, rounds };
      return { id: game, title, instruction, game };
    });
    parts[key] = { name, short, description, demoStep, games, practiceFirst: !!options.practiceFirst };
  }

  add('partes-del-computador', 'mouse', 'Arrastramos y clasificamos', 'Clasificar', 'Clasificamos comida, ropa, material escolar y pelotas con el mouse.',
    ['Mantén presionado el botón izquierdo del mouse para tomar un objeto. Muévelo hasta la caja y suelta el botón para dejarlo allí.',
      'Clasificar es juntar objetos que tienen algo en común. Podemos agrupar por lo que son o por dónde los guardamos.'],
    [tile('🧀', 'Mantén pulsado'), tile('➡️', 'Arrastra'), tile('📦', 'Suelta en la caja')],
    [['clasificar-mouse', 'Cada objeto en su caja', 'Arrastra el dibujo a su categoría. También puedes pulsar la caja con el mouse o con Tab y Enter.', 'sort', [
      { item: tile('🥛', 'Leche'), answer: 'Lácteos', options: ['Verduras', 'Lácteos', 'Postres'], hint: 'La leche es un lácteo.' },
      { item: tile('🥕', 'Zanahoria'), answer: 'Verduras', options: ['Postres', 'Lácteos', 'Verduras'], hint: 'Busca el grupo de las verduras.' },
      { item: tile('🍰', 'Pastel'), answer: 'Postres', options: ['Postres', 'Verduras', 'Lácteos'], hint: 'El pastel va con los postres.' },
      { item: tile('✏️', 'Lápiz'), answer: 'Útiles', options: ['Pelotas', 'Ropa', 'Útiles'], hint: 'El lápiz va en la caja de útiles.' },
      { item: tile('⚽', 'Balón'), answer: 'Pelotas', options: ['Ropa', 'Pelotas', 'Útiles'], hint: 'Un balón es una pelota de juego.' },
      { item: tile('🧦', 'Medias'), answer: 'Ropa', options: ['Útiles', 'Ropa', 'Pelotas'], hint: 'Nos ponemos las medias. Van con la ropa.' },
    ]]]);

  add('partes-del-computador', 'keyboard', 'Grupos de teclas', 'Teclado', 'Buscamos teclas de escritura, números, flechas, función y control.',
    ['Las teclas de escritura forman palabras. Los números pueden estar arriba de las letras o en un grupo aparte. Las flechas permiten mover un cursor o un personaje.',
      'Otras teclas tienen trabajos especiales. F1 es una tecla de función. Shift puede escribir una mayúscula al combinarse con una letra.'],
    [tile('Aa', 'Escritura'), tile('123', 'Números'), tile('↔', 'Desplazamiento'), tile('F1', 'Función'), tile('⇧', 'Control')],
    [['grupos-teclado', 'Encuentra el grupo', 'Mira cada tecla y elige su grupo. Señálala también en tu teclado.', 'choice', [
      question('¿Dónde está la tecla 7?', 'Números', ['Escritura', 'Números', 'Desplazamiento'], 'Piensa qué usamos para escribir siete.', '7'),
      question('¿A qué grupo pertenece →?', 'Desplazamiento', ['Desplazamiento', 'Función', 'Números'], 'La flecha indica movimiento.', '→'),
      question('¿Qué grupo tiene la letra A?', 'Escritura', ['Control', 'Números', 'Escritura'], 'A sirve para escribir palabras.', 'A'),
      question('¿Qué clase de tecla es F1?', 'Función', ['Función', 'Escritura', 'Desplazamiento'], 'Las F están en la fila de función.', 'F1'),
      question('¿En qué grupo está Shift?', 'Control', ['Números', 'Control', 'Escritura'], 'Shift ayuda a cambiar cómo trabaja otra tecla.', '⇧'),
    ]]]);

  add('partes-del-computador', 'repaso', 'Escribimos letras y palabras', 'Escribir', 'Escribimos letras resaltadas, completamos palabras y nombramos dibujos.',
    ['Para escribir una palabra, miramos cada letra y buscamos su tecla. Si falta una letra, podemos completarla. Si sobra una al final, usamos Retroceso.',
      'En pareja, una persona puede decir una palabra corta y la otra escribirla. Después cambian de turno.'],
    [tile('☀️', 'SOL'), tile('🌙', 'LUNA'), tile('🌸', 'FLOR')],
    [['palabras-teclado', 'Letras que hacen falta', 'Escribe con el teclado real o pulsa las letras en pantalla. Usa Enter para comprobar.', 'type', [
      words('Escribe solo la letra resaltada.', 'L', 'SO[L]', '☀️'),
      words('Completa la palabra. Escribe la letra que falta.', 'U', 'L[_]NA', '🌙'),
      words('Escribe el nombre completo del dibujo.', 'FLOR', '', '🌸'),
    ]]]);

  add('tecnologia', 'necesidades', 'El avance de la tecnología', 'Antes y ahora', 'Comparamos objetos de antes y de hoy e imaginamos un invento del futuro.',
    ['La misma necesidad se ha resuelto de formas diferentes. Antes era común oír música en discos o casetes. Hoy podemos escucharla desde un teléfono.',
      'También cambió la fotografía: una cámara de rollo guardaba pocas fotos en una película; una cámara digital guarda sus fotos como archivos. Algunas personas siguen usando ambas.',
      'Con ayuda del docente, busca en un libro quién trabajó en una versión de un invento. Después dibuja una herramienta para el salón en diez años. Ponle un nombre y cuenta qué mejoraría.'],
    [tile('📼', 'Música en casete'), tile('📱', 'Música en el teléfono'), tile('📷', 'Fotos en un rollo'), tile('🖼️', 'Fotos como archivos')],
    [['antes-ahora', 'El museo de antes y ahora', 'Observa el objeto y elige con qué época lo relaciona el museo.', 'choice', [
      question('¿Dónde pondrías el casete para escuchar música?', 'Antes', ['Antes', 'Hoy'], 'El casete era común antes de la música en el teléfono.', '📼'),
      question('¿Dónde pondrías una película vista en una tableta?', 'Hoy', ['Antes', 'Hoy'], 'Las tabletas son un ejemplo más reciente.', '📱'),
      question('¿Dónde pondrías una plancha antigua que se calentaba con carbón?', 'Antes', ['Hoy', 'Antes'], 'Esa plancha se usaba antes de la plancha eléctrica.', '♨️'),
      question('¿Dónde pondrías una cámara que guarda archivos sin usar rollo?', 'Hoy', ['Antes', 'Hoy'], 'Los archivos digitales se guardan en la cámara o el teléfono.', '📸'),
    ]]]);

  add('tecnologia', 'informacion', 'Las TIC', 'Las TIC', 'Reconocemos herramientas para buscar, guardar y comunicar información.',
    ['TIC significa <strong>tecnologías de la información y la comunicación</strong>. Nos permiten buscar, guardar o enviar información.',
      'Un teléfono sirve para hablar con alguien que está lejos. Una grabadora guarda un mensaje de voz. Una tijera también es tecnología, y su función es cortar.'],
    [tile('📱', 'Llamar'), tile('🎙️', 'Grabar'), tile('🔎', 'Buscar'), tile('✂️', 'Cortar')],
    [['elegir-tic', '¿Sirve para comunicar o informarnos?', 'Elige qué herramienta ayuda a cumplir cada tarea.', 'choice', [
      question('Quieres hablar con alguien que está lejos. ¿Qué eliges?', 'Teléfono', ['Tijeras', 'Teléfono', 'Linterna'], 'Busca lo que permite hablar a distancia.', '🗣️'),
      question('Quieres guardar una adivinanza dicha en voz alta. ¿Qué usas?', 'Grabadora', ['Paraguas', 'Grabadora', 'Tijeras'], 'La grabadora puede guardar el sonido.', '🎙️'),
      question('¿Cuál objeto sirve para cortar y no para comunicar?', 'Tijeras', ['Radio', 'Teléfono', 'Tijeras'], 'Piensa cuál es la función de cada herramienta.', '✂️'),
    ]]]);

  add('tecnologia', 'repaso', 'Datos personales y taller', 'Datos personales', 'Decidimos qué información proteger y cuándo pedir ayuda antes de compartirla.',
    ['Tu dirección, tu contraseña y una foto privada son ejemplos de datos que merecen cuidado. En clase usaremos ejemplos inventados.',
      'Si un desconocido pide un dato en un chat, deja la conversación y avisa a una persona adulta de confianza. Si un familiar lo pide, primero verifica con un adulto en persona o por un canal conocido.',
      'Dibuja un escudo con símbolos de cosas que cuidas: una llave para la contraseña y una casa para la dirección.'],
    [tile('🏠', 'Dirección'), tile('🔑', 'Contraseña'), tile('🛡️', 'Protección')],
    [['escudo-datos', 'El escudo de los datos', 'Lee cada situación inventada. Elige lo que harías para proteger los datos.', 'choice', [
      question('Una persona desconocida en un juego pide dónde vives.', 'Parar y avisar', ['Escribir mi dirección', 'Parar y avisar', 'Mandar una foto'], 'La dirección es privada. Puedes pedir ayuda sin responder.', '🏠'),
      question('Un mensaje dice que viene de un familiar y pide tu dirección.', 'Verificar con un adulto', ['Verificar con un adulto', 'Responder enseguida', 'Escribir una clave'], 'Puedes confirmar con la persona por un canal conocido y con ayuda adulta.', '💬'),
      question('¿Cuál dibujo pondrías en el escudo para recordar que la contraseña se cuida?', 'La llave', ['Un balón', 'La llave', 'Un lápiz'], 'Una llave representa el acceso que proteges.', '🛡️'),
    ]]]);

  add('instrucciones', 'orden', 'Algoritmos', 'Algoritmos', 'Ordenamos rutinas cotidianas, historias y los pasos para sembrar.',
    ['Un algoritmo es un grupo de instrucciones ordenadas para hacer algo. Podemos usar dibujos para aprender el orden antes de escribirlo.',
      'Mira lo que haces cada mañana. ¿Qué debe pasar antes de cepillarte? Dibuja los pasos de otra tarea y entrégaselos a una pareja para que los ordene.'],
    [tile('🪥', 'Prepara el cepillo'), tile('🦷', 'Cepilla'), tile('💧', 'Limpia el cepillo')],
    [['cepillo-pasos', 'Una rutina en orden', 'Pon los dibujos en orden para completar la rutina.', 'order', [
      order('Organiza los pasos del cepillado.', [tile('🪥', 'Pon pasta en el cepillo'), tile('🦷', 'Cepilla los dientes'), tile('💧', 'Enjuaga el cepillo')], 'Hay que preparar el cepillo antes de empezar a cepillar.'),
    ]]]);

  add('instrucciones', 'claridad', 'Fiesta sorpresa', 'Fiesta', 'Elegimos quién hace cada tarea y armamos el algoritmo de la fiesta.',
    ['La lechuza invitó a Pía, Nilo y Mía a preparar una fiesta. Pía hace las tarjetas, Nilo busca manteles, Mía prepara la mesa y la lechuza da la bienvenida.',
      'En un equipo, cada persona necesita saber su tarea. Algunas tareas deben ocurrir primero. Después del juego inventen un picnic y asignen cada encargo.'],
    [tile('💌', 'Pía escribe las invitaciones'), tile('🧺', 'Nilo trae el mantel'), tile('🎈', 'Mía prepara la mesa'), tile('🦉', 'La lechuza recibe al grupo')],
    [['fiesta-roles', '¿Quién tiene esta tarea?', 'Recuerda la historia y asigna cada encargo a su personaje.', 'choice', [
      question('¿Quién escribe las invitaciones?', 'Pía', ['Nilo', 'Pía', 'Mía'], 'El primer encargo de la historia era de Pía.', '💌'),
      question('¿Quién trae el mantel antes de preparar la mesa?', 'Nilo', ['Mía', 'La lechuza', 'Nilo'], 'Mía espera a que Nilo llegue con el mantel.', '🧺'),
      question('¿Quién da la bienvenida cuando todo está listo?', 'La lechuza', ['La lechuza', 'Mía', 'Pía'], 'La lechuza recibe a quienes fueron invitados.', '🦉'),
    ]], ['fiesta-orden', 'El algoritmo de la fiesta', 'Pon en orden las tareas de la historia. Arrastra o toca las tarjetas, una por una.', 'order', [
      order('Invitamos, preparamos y recibimos. ¿Qué hacemos primero?', [tile('💌', 'Escribir las invitaciones'), tile('🧺', 'Traer el mantel'), tile('🎈', 'Preparar la mesa'), tile('🦉', 'Recibir al grupo')], 'Mira qué tarea tiene que quedar lista antes de la siguiente.'),
    ]]]);

  add('instrucciones', 'prueba', 'Caminitos', 'Caminitos', 'Construimos dos recorridos diferentes para llegar a la misma meta.',
    ['Una flecha representa un paso. El mismo destino puede tener varios caminos. A veces una piedra nos hace cambiar de dirección.',
      'Primero señala el camino con el dedo. Después construye la lista y ejecútala para comprobar adónde llega.'],
    [tile('🦉', 'Salida'), tile('🪨', 'Busca un desvío'), tile('🏁', 'Mismo destino')],
    [['dos-caminitos', 'Dos caminos para la lechuza', 'Construye un camino y después encuentra otro distinto en el mismo tablero.', 'route', [
      route('Rodea la piedra para llegar a la bandera.', ['...', 'AXM', '...'], { alternate: true }),
    ]]]);

  add('instrucciones', 'repaso', 'Secuencias y taller', 'Secuencias', 'Escribimos y comprobamos secuencias para encontrar una zanahoria.',
    ['Una secuencia responde qué hacemos primero, qué sigue y dónde terminamos. Antes de mover un personaje podemos contar las casillas.',
      'Si hay un bloqueo, cambia el camino. Si agregas una flecha de más, vuelve a probar desde la salida.'],
    [tile('🦉', 'Inicio'), tile('➡️', 'Una flecha, un paso'), tile('🥕', 'Encuentra la zanahoria')],
    [['secuencia-zanahoria', 'En busca de la zanahoria', 'Programa dos secuencias con distintas salidas. Evita las piedras.', 'route', [
      route('La huerta está arriba. Pasa por el lado libre.', ['..M', '.X.', 'A..'], { goal: '🥕' }),
      route('Te espera otra huerta. Mira dónde está ahora la piedra.', ['..A', 'X..', 'M..'], { goal: '🥕' }),
    ]]]);

  add('programacion-flechas', 'bloques', 'Pintamos con bloques', 'Pintar', 'Usamos las flechas, Ejecutar y Reiniciar para dibujar en una cuadrícula.',
    ['En un programa podemos preparar flechas, ejecutar la lista y volver a Inicio. La lechuza pinta al pasar una vez por cada casilla marcada.',
      'Si se sale del dibujo, revisa la flecha que causó el desvío. Reiniciar te permite probar otra vez.'],
    [tile('🖍️', 'Pinta al pasar'), tile('▶', 'Ejecuta'), tile('↺', 'Vuelve al inicio')],
    [['pinta-cuadricula', 'Un dibujo por casillas', 'Pasa por todas las casillas marcadas. Mantente dentro del dibujo y termina en la bandera.', 'route', [
      route('Pinta este camino en forma de L.', ['A++', 'XX+', 'XXM'], { target: '🎨', strict: true }),
      route('Pinta una escalera en una dirección nueva.', ['X+M', 'X+X', 'A+X'], { target: '🎨', strict: true }),
    ]]]);

  add('programacion-flechas', 'construimos', 'Recogemos comida', 'Recoger', 'Movemos a la lechuza por casillas para recoger todo antes de llegar a la meta.',
    ['El objetivo puede tener dos condiciones: recoger toda la comida y llegar a la meta. Una flecha solo mueve una casilla.',
      'Cuenta qué piezas recogerás antes de pulsar Ejecutar. Si falta alguna, agrega las flechas para pasar por ella.'],
    [tile('🫐', 'Busca la comida'), tile('🪨', 'Rodea la piedra'), tile('🏁', 'Llega con todo')],
    [['recoleccion-bloques', 'Bayas para la merienda', 'Escribe las flechas para pasar por las dos canastas y terminar en la bandera.', 'route', [
      route('Recoge bayas a ambos lados de la piedra.', ['.+M', '.X.', 'A+.'], { target: '🫐' }),
    ]]]);

  add('programacion-flechas', 'corregimos', 'Preparamos una ensalada', 'Ensalada', 'Recogemos los ingredientes necesarios y revisamos el programa si algo falta.',
    ['Para preparar la ensalada necesitamos los ingredientes y un lugar para juntarlos. Marca primero cada verdura y el tazón.',
      'Si la lechuza llega con el tazón vacío, sigue la traza del programa y agrega el paso que faltó. Al final, cuenta los pasos de otra receta que conozcas.'],
    [tile('🥬', 'Lechuga'), tile('🥕', 'Zanahoria'), tile('🥗', 'Ensalada')],
    [['ensalada-bloques', 'La ensalada de la lechuza', 'Pasa por cada verdura y termina en el tazón.', 'route', [
      route('Recoge la lechuga antes de llevar todo al tazón.', ['+..M', '.XX.', 'A..+'], { target: '🥬', goal: '🥣' }),
    ]]]);

  add('programacion-flechas', 'repaso', 'Problemas de dirección', 'Problemas', 'Corregimos flechas y comprobamos que el recorrido recoge el maíz.',
    ['Cuando una flecha está equivocada, el primer paso diferente nos da una pista. Cambia la dirección que manda al personaje al lugar incorrecto.',
      'En el último camino, el programa debe pasar por todo el maíz y terminar en la canasta. Haz una segunda prueba después del cambio.'],
    [tile('❌', 'Localiza el giro incorrecto'), tile('🌽', 'Recoge el maíz'), tile('🧺', 'Termina en la canasta')],
    [['direcciones-maiz', 'Repara el camino al maíz', 'Ejecuta el programa de ejemplo y cambia el bloque que causa el error.', 'repair', [
      route('La segunda flecha sube hacia una piedra. ¿Cómo sigues por la fila del maíz?', ['.X..', 'A++M'], { target: '🌽', goal: '🧺', initial: ['right', 'up', 'right'] }),
    ]]]);

  add('patrones-mensajes', 'reglas', 'Mensajes secretos', 'Mensajes', 'Usamos claves con figuras y números para leer palabras inventadas.',
    ['Una clave de juego indica qué símbolo representa cada letra. Con 1 = S, 2 = O y 3 = L, podemos escribir SOL con 123.',
      'Sirve para jugar entre compañeros. Conversen cómo se compartiría una clave de juego sin escribir contraseñas reales.'],
    [tile('1', 'S'), tile('2', 'O'), tile('3', 'L')],
    [['codigo-numeros', 'Tres números, tres letras', 'Usa la clave que aparece arriba para leer y escribir un mensaje corto.', 'type', [
      { ...words('Lee la palabra. 1 = S, 2 = O, 3 = L.', 'SOL', '1 2 3', '🔎'), keys: 'SOL' },
      { ...words('Escribe la clave numérica para SOL. 1 = S, 2 = O, 3 = L.', '123', 'SOL', '✉️'), keys: '123' },
    ]]]);

  const alphabet = 'MURCIELAGO';
  const secret = (prompt, word, decode) => {
    const numbers = [...word].map(character => alphabet.indexOf(character)).join('');
    return { ...words(prompt, decode ? word : numbers, decode ? [...numbers].join(' ') : word, '🔍'),
      codebook: alphabet, keys: decode ? alphabet : '0123456789' };
  };
  add('patrones-mensajes', 'codigos', 'Código murciélago', 'Murciélago', 'Leemos y escribimos mensajes con las diez letras de MURCIÉLAGO.',
    ['La palabra MURCIÉLAGO tiene diez letras distintas. En este juego asignamos un número a cada letra, de izquierda a derecha y comenzando en cero.',
      'Con nuestra tabla, M vale 0, A vale 7 y R vale 2. Los números 0, 7 y 2 forman MAR. La E de la clave también sirve para escribir É.'],
    [...alphabet].map((letter, index) => tile(String(index), letter)),
    [['codigo-murcielago', 'Mensajes del murciélago', 'Busca cada número o letra en la tabla. Escribe la respuesta o toca los botones.', 'type', [
      secret('Lee el primer mensaje secreto.', 'MAR', true), secret('Lee el segundo mensaje secreto.', 'LAGO', true),
      secret('Ahora escribe el código de esta palabra.', 'LAGO', false),
    ]]], { practiceFirst: true, codebook: alphabet });

  add('bucles', 'repeticion', 'Bucles para recoger comida', 'Comida', 'Comparamos una fila de flechas con un bloque Repetir que alcanza la misma comida.',
    ['Tres flechas a la derecha hacen lo mismo que Repetir 3 veces: derecha. Las dos listas pasan por las mismas casillas y recogen la misma comida.',
      'Comprueba contando cuántas veces se mueve el personaje en las dos listas.'],
    [tile('→ → →', 'Lista de tres pasos'), tile('×3', 'Repetir derecha'), tile('🫐', 'Misma comida')],
    [['comida-repetir', 'Dos programas, un camino', 'Compara las listas y decide cuál conserva la acción y la cantidad.', 'choice', [
      question('¿Cuál llega al mismo lugar que → → →?', 'Repetir 3: derecha', ['Repetir 2: derecha', 'Repetir 3: derecha', 'Repetir 3: arriba'], 'Cuenta tres movimientos iguales hacia la derecha.', '🫐'),
      question('¿→ → y Repetir 3: derecha terminan juntos?', 'No, uno avanza más', ['Sí, siempre', 'No, uno avanza más'], 'Una lista tiene dos pasos y la otra tiene tres.', '🏁'),
    ]]]);

  add('bucles', 'bloque-repetir', 'Bucles para recoger verduras', 'Verduras', 'Repetimos un grupo entero de acciones para recoger en cada vuelta.',
    ['Un bucle puede repetir más de una acción. Si escribimos <strong>avanzar y recoger</strong> dentro de Repetir 3, las dos acciones suceden en cada vuelta.',
      'Si avanzas tres veces y recoges solo al final, quedan verduras atrás. Marca lo que haces en cada casilla.'],
    [tile('→', 'Avanza'), tile('🥕', 'Recoge'), tile('×3', 'Repite las dos acciones')],
    [['grupo-verduras', 'Tres vueltas en la huerta', 'Elige el bucle que pasa por cada verdura y la recoge en su casilla.', 'choice', [
      question('Hay tres verduras seguidas. ¿Qué programa recoge las tres?', 'Repetir 3: avanzar y recoger', ['Repetir 3: avanzar; recoger al final', 'Repetir 2: avanzar y recoger', 'Repetir 3: avanzar y recoger'], 'La pareja de acciones va junta en cada vuelta.', '🥕'),
      question('Aparece una cuarta verdura al final. ¿Qué tienes que cambiar?', 'Repetir 4 veces', ['Quitar Recoger', 'Repetir 4 veces', 'Girar a la izquierda'], 'Conserva las acciones y aumenta el número de vueltas.', '🥬'),
    ]]]);

  add('bucles', 'programas', 'Bucles y problemas', 'Problemas', 'Buscamos si el error está en la acción repetida, el número de vueltas o el giro.',
    ['A veces el bucle mueve en la dirección correcta, pero el número de vueltas no es suficiente. Otras veces, lo que está mal es la acción de adentro.',
      'Compara con el dibujo esperado y modifica una cosa cada vez. Ejecuta otra vez para comprobar tu arreglo.'],
    [tile('🔢', 'Revisa cuántas veces'), tile('↪', 'Revisa el giro'), tile('🎨', 'Compara el dibujo')],
    [['repara-dibujo-bucle', 'El dibujo incompleto', 'Mira qué debe cambiar en el bloque para completar el dibujo.', 'choice', [
      question('El borde necesita cuatro pasos a la derecha. El bloque dice Repetir 3: derecha.', 'Cambiar 3 por 4', ['Cambiar a izquierda', 'Cambiar 3 por 4', 'Borrar la flecha'], 'La dirección es correcta. Cuenta cuántas casillas faltan.', '🖍️'),
      question('Tres pasos hacia arriba salen del dibujo. El dibujo sigue tres casillas abajo.', 'Cambiar la dirección', ['Cambiar la dirección', 'Repetir seis veces', 'Empezar por el final'], 'Conserva el tres y revisa hacia dónde apunta la flecha.', '🎨'),
    ]]]);

  add('bucles', 'repaso', 'Bucles y el ambiente', 'Ambiente', 'Usamos repeticiones para recoger todo el material de un camino.',
    ['Imagina una patrulla de limpieza. Al entrar en una casilla del camino puede recoger una pieza de chatarra.',
      'Agrupa avances iguales en un bloque Repetir. Comprueba que la patrulla pasa por las piezas y llega al contenedor.'],
    [tile('♻️', 'Material para recuperar'), tile('×3', 'Movimientos repetidos'), tile('📦', 'Contenedor')],
    [['bucles-chatarra', 'Patrulla de limpieza', 'Escoge una dirección y una cantidad para alcanzar todas las piezas. Agrega el giro si hace falta.', 'loop-route', [
      route('Recoge las tres piezas y llega al contenedor.', ['A+++M'], { target: '🔩', goal: '♻️' }),
      route('Recoge las piezas en la fila superior y baja al contenedor.', ['A++.', 'XXXM'], { target: '🔩', goal: '♻️' }),
    ]]]);

  const planets = ['Mercurio', 'Venus', 'Tierra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'];
  const planetTiles = planets.map((planet, index) => tile(['⚪', '🟡', '🌍', '🔴', '🟠', '🪐', '🔹', '🔵'][index], planet));

  add('bucles-practica', 'predecimos', 'Ayudemos al planeta', 'Planeta', 'Clasificamos residuos y elegimos alternativas que se pueden volver a usar.',
    ['En el juego usamos tres cestos: aprovechables limpios y secos, orgánicos y no aprovechables. Sigue siempre las señales de los cestos del colegio.',
      'También podemos evitar algunos residuos: una botella que se puede rellenar reemplaza varias botellas de un solo uso.'],
    [tile('📦', 'Aprovechables'), tile('🍌', 'Orgánicos'), tile('🗑️', 'No aprovechables')],
    [['separar-residuos', 'La estación de reciclaje', 'Arrastra el residuo a la caja indicada o pulsa su nombre.', 'sort', [
      { item: tile('📦', 'Cartón limpio y seco'), answer: 'Aprovechables', options: ['Aprovechables', 'Orgánicos', 'No aprovechables'], hint: 'El cartón limpio y seco se puede aprovechar.' },
      { item: tile('🍌', 'Cáscara de banano'), answer: 'Orgánicos', options: ['Aprovechables', 'Orgánicos', 'No aprovechables'], hint: 'La cáscara es un residuo de comida.' },
      { item: tile('🧻', 'Servilleta usada'), answer: 'No aprovechables', options: ['Aprovechables', 'Orgánicos', 'No aprovechables'], hint: 'En esta estación la servilleta usada va a no aprovechables.' },
    ]], ['reemplazar-desechable', 'Una cosa que vuelve a usarse', 'Elige un objeto que puedas volver a usar para la misma tarea.', 'choice', [
      question('¿Qué llevarías para tomar agua todos los días?', 'Botella rellenable', ['Vaso desechable', 'Botella rellenable', 'Otra botella desechable'], 'Busca la que puedes lavar y rellenar.', '🚰'),
      question('¿Qué puedes llevar para guardar una merienda muchas veces?', 'Lonchera lavable', ['Papel para botar', 'Lonchera lavable', 'Una bolsa de un solo uso'], 'Busca un recipiente que puedas traer otra vez.', '🥪'),
    ]]]);

  add('bucles-practica', 'contextos', 'Bucles y planetas', 'Planetas', 'Ordenamos los planetas y agrupamos los pasos de un viaje con un bucle.',
    ['Desde el Sol, primero están Mercurio, Venus, Tierra y Marte. Después siguen Júpiter, Saturno, Urano y Neptuno.',
      'En el tablero del telescopio agrupamos varios pasos iguales. Cuenta los movimientos entre dos paradas antes de programar.'],
    [tile('☀️', 'Sol'), ...planetTiles],
    [['planetas-en-orden', 'Del Sol hacia afuera', 'Pon en orden los planetas, comenzando por el más cercano al Sol.', 'order', [
      order('Primera parte del viaje: los cuatro planetas cercanos.', planetTiles.slice(0, 4), 'Desde el Sol: Mercurio, Venus, Tierra y Marte.'),
      order('Segunda parte del viaje: los cuatro planetas lejanos.', planetTiles.slice(4), 'Desde Marte hacia afuera: Júpiter, Saturno, Urano y Neptuno.'),
    ]], ['telescopio-repetir', 'Ruta al telescopio', 'Repite una flecha para llegar al telescopio. Agrega otro bloque cuando el camino gire.', 'loop-route', [
      route('Recorre la fila de estrellas y baja al telescopio.', ['A+++', 'XXXM'], { target: '⭐', goal: '🔭' }),
    ]]]);

  add('bucles-practica', 'adaptamos', 'Bucles y deportes', 'Deportes', 'Relacionamos útiles deportivos con su deporte y diseñamos un circuito repetido.',
    ['En distintos deportes se utilizan diferentes materiales. Una raqueta sirve para tenis; un balón de baloncesto se lanza a una canasta.',
      'En un circuito se puede repetir un grupo de acciones, por ejemplo un salto y una palmada. Cambia una parte del circuito y prueba otra vez.'],
    [tile('🎾', 'Tenis'), tile('🏀', 'Baloncesto'), tile('🏊', 'Natación')],
    [['unir-deportes', 'Material para entrenar', 'Empareja cada material con su deporte.', 'choice', [
      question('¿Para qué deporte usamos una raqueta y una red?', 'Tenis', ['Natación', 'Tenis', 'Baloncesto'], 'En tenis usamos la raqueta para golpear la pelota.', '🎾'),
      question('¿Para qué deporte sirve un balón que lanzamos a una canasta?', 'Baloncesto', ['Tenis', 'Baloncesto', 'Natación'], 'Piensa en la canasta que está arriba.', '🏀'),
      question('¿En qué deporte usamos gafas para ver bajo el agua?', 'Natación', ['Natación', 'Tenis', 'Baloncesto'], 'Busca el deporte que se practica en el agua.', '🥽'),
    ]]]);

  add('bucles-practica', 'repaso', 'Bucles y animales amenazados', 'Animales', 'Reconocemos cómo cuidar un hábitat y hacemos un recorrido de observación.',
    ['Una especie amenazada corre riesgo de desaparecer. En Colombia hay tortugas carey. Cuidar las playas donde anidan les ayuda a tener un lugar para dejar sus huevos.',
      'La lechuza va a fotografiar mariposas desde el sendero. Pasa por las paradas para su álbum y observa sin tocar ni perseguir a los animales.'],
    [tile('🐢', 'Cuidamos la playa'), tile('🦋', 'Observamos desde el sendero'), tile('📷', 'Guardamos una foto')],
    [['cuidar-habitat', 'Un lugar seguro para los animales', 'Elige cómo observar y cuidar a los animales del dibujo.', 'choice', [
      question('¿Qué animal de este ejemplo necesita una playa segura para poner sus huevos?', 'Tortuga carey', ['Gallina', 'Tortuga carey', 'Mariposa'], 'Recuerda quién anida en la playa.', '🐢'),
      question('¿Qué hacemos para observar una mariposa sin dañarla?', 'Mirar desde el sendero', ['Mirar desde el sendero', 'Perseguirla', 'Quitar sus flores'], 'Podemos ver y fotografiar sin tocar.', '🦋'),
    ]], ['album-mariposas', 'El álbum del sendero', 'Usa Repetir para pasar por cada mariposa y llegar al álbum.', 'loop-route', [
      route('Mantente en la fila del sendero hasta el álbum.', ['A+++M', 'XXXXX'], { target: '🦋', goal: '📷' }),
    ]]]);

  add('errores-programas', 'observamos', 'Seguimos programando en la pista', 'Pista', 'Conocemos los Juegos Olímpicos y comprobamos un recorrido hacia los premios.',
    ['En los Juegos Olímpicos de verano se reúnen atletas de muchos lugares. Cada edición de verano se programa cada cuatro años.',
      'El programa de la pista debe pasar por los tres materiales de entrenamiento y luego llegar a la meta. Compara lo que esperabas con lo que hizo la lechuza.'],
    [tile('🏃', 'Atletas'), tile('4', 'Años entre ediciones de verano'), tile('🥇', 'Medallas')],
    [['quiz-olimpico', 'Pistas de los Juegos Olímpicos', 'Elige la respuesta y explica al grupo cómo la encontraste.', 'choice', [
      question('¿Cada cuántos años se programa una edición de los Juegos Olímpicos de verano?', 'Cada 4 años', ['Cada año', 'Cada 4 años', 'Cada mes'], 'Cuenta cuatro años entre ediciones de verano.', '🏃'),
      question('¿Qué premio reciben quienes quedan en los primeros lugares?', 'Medallas', ['Raquetas', 'Cuadernos', 'Medallas'], 'Oro, plata y bronce son tres medallas.', '🥇'),
    ]], ['ruta-deportiva', 'Recoge el material de la pista', 'Escribe un bucle para recoger el material deportivo y termina en la meta.', 'loop-route', [
      route('Recoge los tres balones y llega a la medalla.', ['A+++.M'], { target: '🏀', goal: '🥇' }),
    ]]]);

  add('errores-programas', 'localizamos', 'Observamos las estrellas', 'Estrellas', 'Repasamos el sistema solar y seguimos la traza de un viaje espacial.',
    ['La Tierra da una vuelta alrededor del Sol siguiendo su órbita. Plutón pertenece al grupo de los planetas enanos.',
      'La Luna gira alrededor de la Tierra. Un programa lleva al observatorio paso a paso: señala dónde queda el personaje después de cada flecha.'],
    [tile('🌍', 'La Tierra'), tile('☀️', 'El Sol'), tile('🌙', 'La Luna'), tile('🔭', 'El observatorio')],
    [['observatorio-preguntas', 'Preguntas del observatorio', 'Lee las preguntas del sistema solar antes de revisar el programa.', 'choice', [
      question('¿Alrededor de qué da vueltas la Tierra?', 'El Sol', ['La Luna', 'El Sol', 'Marte'], 'La Tierra recorre su órbita alrededor del Sol.', '🌍'),
      question('¿Cuál de estos es un planeta enano?', 'Plutón', ['Tierra', 'Júpiter', 'Plutón'], 'Plutón es un planeta enano.', '🔭'),
      question('¿En qué lugar caminaron por primera vez personas desde la Tierra?', 'La Luna', ['La Luna', 'Marte', 'Saturno'], 'La Luna es el lugar que visitaron los astronautas en este ejemplo.', '🌙'),
    ]], ['trayectoria-estrellas', 'Corrige la ruta al observatorio', 'Prueba el programa. Señala el primer desvío y cambia solo esa flecha.', 'repair', [
      route('El programa sale de la ruta después de la primera estrella.', ['..M', 'A+X'], { target: '⭐', goal: '🔭', initial: ['right', 'right', 'right'] }),
    ]]]);

  add('errores-programas', 'corregimos', 'Encontramos errores', 'Errores', 'Reparamos el primer desvío en un recorrido por las flores.',
    ['En el jardín debemos pasar por todas las flores. Si la lechuza choca con una piedra, el bloque que intentó atravesarla se marca.',
      'Busca el primer paso que falla y cambia solo esa flecha. Muchas veces el resto del programa sirve.'],
    [tile('🌸', 'Flores'), tile('🪨', 'Primer bloqueo'), tile('✏️', 'Una corrección')],
    [['corrige-flores', 'El jardín de las flores', 'Cambia la flecha incorrecta y comprueba que la lechuza recoge todas las flores.', 'repair', [
      route('Deja la fila solo cuando hayas pasado las dos flores.', ['.X..', 'A++M'], { target: '🌸', initial: ['right', 'up', 'right'] }),
      route('La flecha final debe llevar a la bandera de abajo.', ['A++', 'XXM'], { target: '🌸', initial: ['right', 'right', 'up'] }),
    ]]]);

  add('errores-programas', 'repaso', 'Ordenamos bloques para corregir', 'Ordenar', 'Revisamos el orden de las flechas en programas con distintos objetivos.',
    ['Con los bloques correctos en el orden equivocado, el programa cambia. Prueba una flecha a la vez y verifica qué casillas visita.',
      'Recoger una pieza antes de ir a la meta puede obligarnos a cambiar el orden de dos flechas.'],
    [tile('1', 'Lee el programa'), tile('2', 'Cambia el orden'), tile('3', 'Prueba otra vez')],
    [['reordenar-programa', 'Cinco programas por ordenar', 'Usa las mismas flechas del programa y colócalas en el orden que permite completar cada tablero.', 'reorder', [
      route('Sube antes de avanzar a la meta.', ['..M', 'AX.'], { initial: ['right', 'up', 'right'] }),
      route('Baja para rodear la piedra.', ['AXM', '...'], { initial: ['right', 'up', 'right', 'down'] }),
      route('Recoge el objeto antes de subir.', ['.XM', 'A+.'], { initial: ['up', 'right', 'right'] }),
      route('Baja primero para llegar a las flores de la izquierda.', ['XA.', 'M+.'], { target: '🌸', initial: ['left', 'down'] }),
      route('Pasa por las dos piezas antes de acabar en la canasta.', ['A+X', '.+M'], { target: '🔩', goal: '♻️', initial: ['right', 'right', 'down'] }),
    ]]]);

  add('ciudadania-digital', 'datos', 'El tesoro de los datos personales', 'Datos', 'Protegemos la información que identifica o permite encontrar a un niño.',
    ['En un juego imaginario, Lía quiere una estrella y la pantalla le pide su dirección. Lía deja la pantalla y avisa a un adulto.',
      'Dibuja la información que guardarías en un cofre. Usa ejemplos inventados: una llave, una foto o una casa.'],
    [tile('⭐', 'Un premio en pantalla'), tile('🏠', 'Piden la dirección'), tile('🤝', 'Pido ayuda')],
    [['historia-resguardo', 'El cofre de Lía', 'Elige qué información guardaría Lía y qué puede contar en la actividad de clase.', 'choice', [
      question('El juego pide la dirección para dar una estrella. ¿Qué harías?', 'Parar y pedir ayuda', ['Parar y pedir ayuda', 'Escribir la dirección', 'Dar la contraseña'], 'Una estrella no necesita tu dirección.', '⭐'),
      question('¿Cuál tarjeta pondrías dentro del cofre?', 'Una contraseña', ['Una forma favorita', 'Un color favorito', 'Una contraseña'], 'La contraseña es una llave privada.', '🔑'),
    ]]]);

  add('ciudadania-digital', 'confianza', '¿Quién puede ayudarme?', 'Ayuda', 'Identificamos adultos de confianza y practicamos qué decir ante mensajes inesperados.',
    ['A Tomi le llega un mensaje en un juego que dice ser de un amigo. El nombre en la pantalla no le dice con seguridad quién lo escribió.',
      'Tomi le muestra el mensaje a una persona adulta que conoce y que puede ayudarle. Si no está disponible, busca otra.'],
    [tile('💬', 'Llega un mensaje'), tile('🔎', 'Verifico con un adulto'), tile('🤝', 'Pido ayuda')],
    [['historia-verificar', 'Un mensaje para Tomi', 'Elige a quién puede acudir Tomi y qué haría ante un pedido de foto.', 'choice', [
      question('Una cuenta dice ser de su amigo y pide una foto. ¿A quién busca Tomi?', 'A un adulto de confianza', ['A la cuenta del mensaje', 'A un adulto de confianza', 'A cualquier contacto del juego'], 'Busca a alguien que conozcas y pueda ayudarte en persona.', '💬'),
      question('¿Qué puede decir Tomi a su profesora?', '¿Me ayudas a revisar este mensaje?', ['Envíale mi foto', '¿Me ayudas a revisar este mensaje?', 'Nunca le contaré a nadie'], 'Puede pedir ayuda sin contestar a quien escribió.', '🤝'),
    ]]]);

  add('ciudadania-digital', 'decisiones', '¡Algo no me gusta!', 'Semáforo', 'Reconocemos emociones y distinguimos una sorpresa que termina de un secreto que pide ayuda.',
    ['Sofi recibe un mensaje que le dice que guarde un secreto y se siente asustada. Puede parar y contarlo, aunque alguien le diga que no lo haga.',
      'Una sorpresa de cumpleaños termina cuando entregamos el regalo. Un secreto que da miedo o que alguien exige para pedir una foto se cuenta a un adulto.',
      'Usamos un semáforo: verde para una situación tranquila, amarillo para pausar y preguntar y rojo para detenerse y contar.'],
    [tile('🟢', 'Tranquilo'), tile('🟡', 'Pausa y pregunta'), tile('🔴', 'Detén y cuenta')],
    [['semaforo-emociones', 'El semáforo de Sofi', 'Escucha cada historia y elige qué tipo de situación es.', 'choice', [
      question('Preparan una tarjeta para un cumpleaños. La entregarán al final del día.', 'Verde: sorpresa que termina', ['Verde: sorpresa que termina', 'Rojo: detén y cuenta', 'Dar la contraseña'], 'La tarjeta se mostrará y la situación es tranquila.', '🎁'),
      question('Alguien pide una foto y dice «que nadie se entere». Sofi se asusta.', 'Rojo: detén y cuenta', ['Verde: todo está bien', 'Rojo: detén y cuenta', 'Responder enseguida'], 'Sentir miedo y recibir presión son señales para pedir ayuda.', '🔴'),
      question('Un mensaje desconocido dice hola y no sabes quién lo mandó.', 'Amarillo: pausa y pregunta', ['Responder y dar datos', 'Amarillo: pausa y pregunta', 'Compartir una foto'], 'Si tienes dudas puedes pausar y preguntar.', '🟡'),
    ]]]);

  add('ciudadania-digital', 'repaso', 'Misión de guardianes digitales', 'Guardianes', 'Completamos las reglas de cuidado y hacemos un cartel para el salón.',
    ['Las reglas ayudan a recordar cuándo proteger un dato y cuándo pedir ayuda. Si algo incomoda, podemos detenernos, cerrar la ventana y contarlo.',
      'En grupo hagan un cartel con tres reglas. Dibujen junto a cada una lo que se debe hacer, como una mano de alto o una persona adulta escuchando.'],
    [tile('✋', 'Detener'), tile('🚪', 'Cerrar o alejarse'), tile('🤝', 'Contar a un adulto')],
    [['reglas-guardianes', 'Nuestro cartel de cuidado', 'Completa cada regla. Después, dibújenlas para el salón.', 'choice', [
      question('Si alguien pide una contraseña, yo…', 'La protejo y pido ayuda', ['La escribo en el juego', 'La protejo y pido ayuda', 'La leo en voz alta'], 'La contraseña es una llave privada.', '🔑'),
      question('Si algo me asusta, primero…', 'Me detengo', ['Me detengo', 'Sigo mirando', 'Respondo enseguida'], 'Puedes parar en cualquier momento.', '✋'),
      question('Cuando cierro una ventana incómoda, después…', 'Lo cuento a un adulto', ['Vuelvo a abrirla', 'Mando una foto', 'Lo cuento a un adulto'], 'Un adulto de confianza puede ayudarte.', '🤝'),
    ]]]);

  function supplement(content) {
    for (const part of content.parts) {
      const update = parts[`${content.meta.slug}:${part.id}`];
      if (!update || part.steps.some(step => step.id === update.demoStep.id)) continue;
      part.name = update.name;
      part.short = update.short;
      part.curriculumSummary = update.description;
      const practice = part.steps.findIndex(step => step.game);
      part.steps.splice(0, 0, update.demoStep);
      if (update.practiceFirst) part.steps.splice(1, 0, ...update.games);
      else part.steps.splice(practice < 0 ? part.steps.length : practice + 1, 0, ...update.games);
    }
    return content;
  }

  function supplementCatalog(catalogue) {
    const grade = catalogue.grades.find(grade => grade.id === '1');
    for (const lesson of grade.classes) {
      for (const part of lesson.parts) {
        const update = parts[`${lesson.id}:${part.id}`];
        if (update) Object.assign(part, { title: update.name, description: update.description });
      }
    }
  }

  window.FirstGradeCurriculum = { supplement, supplementCatalog, activities };
})();
