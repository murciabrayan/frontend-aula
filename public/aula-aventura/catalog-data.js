'use strict';

// Available classes have complete lesson players and a fixed published final activity.
window.ClassroomCatalog = {
  // Corte público actual. El contenido de los demás grados permanece guardado,
  // pero el catálogo los presenta como "En preparación".
  releasedGrades: ['1'],
  grades: [
    { id: '1', name: 'Primero', tone: 'honey', description: 'Conocer y descubrir.', classes: [
      { id: 'exploradores-digitales', title: 'Exploradores digitales', description: 'Aprendemos a ingresar, cuidar nuestra contraseña, reconocer nuestro espacio digital y guardar trabajos.', available: true, illustration: 'desktop', href: 'exploradores', offline:'primero-01-exploradores-digitales.pdf', finalActivity: true, parts: [
        { id: 'inicio-sesion', title: 'Tutorial: iniciar sesión', description: 'Usuario, contraseña e ingreso con datos ficticios de práctica.', illustration: 'keyboard' },
        { id: 'rincon-digital', title: 'Mi rincón digital', description: 'Conocemos el escritorio, sus iconos, carpetas y programas.', illustration: 'desktop' },
        { id: 'artistas-digitales', title: 'Artistas digitales', description: 'Elegimos herramientas para dibujar, corregir y crear.', illustration: 'computer' },
        { id: 'guardar-tesoros', title: 'Guardar tesoros', description: 'Nombramos, guardamos y volvemos a encontrar nuestros trabajos.', illustration: 'review' },
      ] },
      { id: 'partes-del-computador', title: 'Uso del teclado y del mouse', description: 'Practicamos clic, doble clic, arrastre, rueda y las teclas que usamos para escribir y movernos.', available: true, illustration: 'computer', href: 'leccion', offline:'primero-02-partes-del-computador.pdf', finalActivity: true, parts: [
        { id: 'monitor', title: 'Mouse', description: 'Reconocemos sus partes y practicamos clic izquierdo, clic derecho y rueda.', illustration: 'mouse' },
        { id: 'mouse', title: 'Mouse: segunda parte', description: 'Seleccionamos, arrastramos y usamos el doble clic en actividades guiadas.', illustration: 'mouse' },
        { id: 'keyboard', title: 'Teclado', description: 'Encontramos letras, números, Espacio, Enter, Retroceso y flechas.', illustration: 'keyboard' },
        { id: 'repaso', title: 'Teclado: segunda parte', description: 'Escribimos, corregimos y completamos recorridos usando el teclado real.', illustration: 'keyboard' },
      ] },
      {id:'tecnologia',title:'Tecnología y evolución',description:'Reconocemos objetos, probamos herramientas y comprendemos cómo la tecnología cambia para resolver necesidades.',available:true,illustration:'technology',href:'tecnologia',offline:'primero-03-tecnologia.pdf',finalActivity:true,parts:[
        {id:'objetos',title:'Naturaleza y objetos creados',description:'Diferenciamos el origen de los objetos y reconstruimos inventos con puzles ilustrados.',illustration:'computer'},
        {id:'necesidades',title:'Inventos y necesidades',description:'Protegemos, transportamos, escribimos y probamos distintas fuentes de luz.',illustration:'blocks'},
        {id:'informacion',title:'Compartimos información',description:'Elegimos medios, conectamos destinatarios y reparamos mensajes con dibujos.',illustration:'messages'},
        {id:'repaso',title:'Tecnología para resolver y comunicar',description:'Creamos una señal, la compartimos y preparamos un rincón para leer sin corriente.',illustration:'review'},
      ]},
      { id: 'instrucciones', title: 'Algoritmos', description: 'Ordenamos acciones, damos instrucciones claras y probamos y corregimos recorridos.', available: true, illustration: 'sequence', href: 'instrucciones', offline:'primero-04-instrucciones.pdf', finalActivity: true, parts: [
 {id:'orden',title:'Pasos y orden',description:'Historias ilustradas, antes y después, tarjetas que se ordenan y pasos que faltan.',illustration:'sequence'},
 {id:'claridad',title:'Instrucciones claras',description:'Acción, objeto, lugar, dirección y cantidad. Ejecutamos para comprobar.',illustration:'messages'},
 {id:'prueba',title:'Probamos y corregimos',description:'Planeamos con flechas, observamos el resultado y reparamos instrucciones.',illustration:'blocks'},
 {id:'repaso',title:'Ordenamos, indicamos y comprobamos',description:'Cuatro desafíos para reunir lo aprendido y explicar una solución.',illustration:'review'},
 ] },
      {id:'programacion-flechas',title:'Bloques de dirección',description:'Construimos programas, ejecutamos recorridos y usamos la traza para encontrar y corregir errores.',available:true,illustration:'blocks',href:'programacion-flechas',finalActivity:true,parts:[
        {id:'bloques',title:'Bloques que dan instrucciones',description:'Una flecha mueve una casilla. Leemos programas y predecimos dónde terminarán.',illustration:'blocks'},
        {id:'construimos',title:'Construimos y ejecutamos',description:'Creamos listas con botones o teclado, recogemos objetos y completamos entregas.',illustration:'sequence'},
        {id:'corregimos',title:'Probamos y corregimos',description:'Seguimos la traza, localizamos el primer error y comprobamos una reparación.',illustration:'messages'},
        {id:'repaso',title:'Misión final de programación',description:'Cuatro tableros nuevos para predecir, construir, recoger y reparar.',illustration:'review'},
      ]},
      {id:'patrones-mensajes',title:'Patrones',description:'Descubrimos reglas, continuamos secuencias y usamos claves visibles para representar mensajes.',available:true,illustration:'repeat',href:'continuacion-primero?clase=patrones-mensajes',finalActivity:true,parts:[
        {id:'patrones',title:'Descubrimos patrones',description:'Observamos colores, formas y movimientos para encontrar la unidad que se repite.',illustration:'repeat'},
        {id:'reglas',title:'Continuamos y reparamos reglas',description:'Completamos varios lugares, localizamos cambios y construimos patrones propios.',illustration:'sequence'},
        {id:'codigos',title:'Representamos mensajes con una clave',description:'Relacionamos letras y símbolos sin usar contraseñas ni datos reales.',illustration:'messages'},
        {id:'repaso',title:'Misión final de patrones',description:'Cuatro estaciones nuevas para continuar, reconocer, reparar y descifrar.',illustration:'review'},
      ]},
      {id:'bucles',title:'Bucles',description:'Convertimos listas repetidas en bloques Repetir y programamos recorridos más claros.',available:true,illustration:'repeat',href:'continuacion-primero?clase=bucles',finalActivity:true,parts:[
        {id:'repeticion',title:'Descubrimos la repetición',description:'Reconocemos acciones iguales y comparamos una lista larga con un bucle.',illustration:'repeat'},
        {id:'bloque-repetir',title:'Conocemos el bloque Repetir',description:'Elegimos la acción y la cantidad, y desplegamos el bloque para comprobar.',illustration:'blocks'},
        {id:'programas',title:'Programamos recorridos con bucles',description:'Combinamos tramos repetidos, giros y correcciones de cantidad.',illustration:'sequence'},
        {id:'repaso',title:'Misión final de bucles',description:'Comprimimos, contamos, programamos y reparamos repeticiones.',illustration:'review'},
      ]},
      {id:'bucles-practica',title:'Más ejercicios con bucles',description:'Aplicamos repeticiones en el planeta, el espacio, los deportes y el cuidado de animales.',available:true,illustration:'repeat',href:'continuacion-primero?clase=bucles-practica',finalActivity:true,parts:[
        {id:'predecimos',title:'Predecimos repeticiones',description:'Leemos Inicio, dirección, cantidad y obstáculos antes de ejecutar.',illustration:'sequence'},
        {id:'contextos',title:'Usamos bucles en otros contextos',description:'Resolvemos reciclaje, órbitas y rutinas deportivas con estructuras distintas.',illustration:'repeat'},
        {id:'adaptamos',title:'Adaptamos un programa',description:'Conservamos lo que funciona y cambiamos distancia, giro o meta.',illustration:'blocks'},
        {id:'repaso',title:'Circuito de repeticiones',description:'Transferimos los bucles a cuatro problemas nuevos.',illustration:'review'},
      ]},
      {id:'errores-programas',title:'Seguimos practicando',description:'Comparamos resultados, seguimos trazas y corregimos dirección, orden o cantidad.',available:true,illustration:'messages',href:'continuacion-primero?clase=errores-programas',finalActivity:true,parts:[
        {id:'observamos',title:'Observamos antes de cambiar',description:'Diferenciamos la meta esperada del resultado que realmente ocurrió.',illustration:'messages'},
        {id:'localizamos',title:'Seguimos la traza',description:'Encontramos el primer paso diferente y clasificamos el tipo de error.',illustration:'sequence'},
        {id:'corregimos',title:'Corregimos y comprobamos',description:'Hacemos un cambio pequeño y ejecutamos otra vez desde Inicio.',illustration:'blocks'},
        {id:'repaso',title:'Archivo de programas',description:'Investigamos cuatro programas con fallos diferentes.',illustration:'review'},
      ]},
      {id:'ciudadania-digital',title:'Ciudadanía digital',description:'Protegemos datos, buscamos adultos de confianza y practicamos decisiones seguras.',available:true,illustration:'messages',href:'continuacion-primero?clase=ciudadania-digital',finalActivity:true,parts:[
        {id:'datos',title:'Protegemos nuestros datos',description:'Reconocemos información personal usando únicamente ejemplos ficticios.',illustration:'messages'},
        {id:'confianza',title:'Pedimos ayuda a personas de confianza',description:'Practicamos cómo contar lo ocurrido y buscar más de una persona disponible.',illustration:'computer'},
        {id:'decisiones',title:'Actuamos ante algo incómodo',description:'Nos detenemos, cerramos o nos alejamos y contamos a un adulto.',illustration:'sequence'},
        {id:'repaso',title:'Plan de cuidado digital',description:'Aplicamos el plan en cuatro historias sin compartir experiencias privadas.',illustration:'review'},
      ]},
    ] },
    { id: '2', name: 'Segundo', tone: 'sage', description: 'Probar y relacionar.', classes: [] },
    { id: '3', name: 'Tercero', tone: 'sky', description: 'Resolver y comprender.', classes: [] },
    { id: '4', name: 'Cuarto', tone: 'lilac', description: 'Crear y programar.', classes: [] },
    { id: '5', name: 'Quinto', tone: 'peach', description: 'Diseñar y construir.', classes: [] },
  ],
};
window.FirstGradeCurriculum?.supplementCatalog(window.ClassroomCatalog);
