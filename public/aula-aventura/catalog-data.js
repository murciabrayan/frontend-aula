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
      {id:'alternativas-sin-gcompris',title:'Alternativas sin GCompris',description:'Actividades equivalentes para practicar cuando GCompris no esté disponible.',available:false,illustration:'computer',finalActivity:false,parts:[]},
    ] },
    { id: '2', name: 'Segundo', tone: 'sage', description: 'Probar y relacionar.', classes: [
      {id:'entorno-trabajo',title:'Nuestro espacio de trabajo digital',description:'Ingresamos con ejemplos ficticios, creamos una producción y organizamos archivos para recuperarlos.',available:true,illustration:'computer',art:['folder','paint'],href:'continuacion-segundo?clase=entorno-trabajo',finalActivity:true,parts:[
        {id:'acceso',title:'Ingresamos y cuidamos una sesión',description:'Interpretamos campos, usamos credenciales ficticias y cerramos una sesión compartida.',art:['keyboard','window']},
        {id:'produccion',title:'Creamos y corregimos una producción',description:'Planeamos, elegimos herramientas, corregimos y guardamos con intención.',art:['paint','folder']},
        {id:'organizacion',title:'Organizamos y recuperamos archivos',description:'Diferenciamos archivos, carpetas, nombres claros y rutas.',art:['folder','drive']},
        {id:'repaso',title:'El estudio digital organizado',description:'Completamos el flujo de ingreso, creación, guardado y recuperación.',art:['folder','monitor']},
      ]},
      {id:'componentes-programas',title:'Dentro y fuera del computador',description:'Relacionamos periféricos, piezas internas, programas y usos responsables de inteligencia artificial.',available:true,illustration:'computer',art:['tower','motherboard'],href:'continuacion-segundo?clase=componentes-programas',finalActivity:true,parts:[
        {id:'externos',title:'Componentes que podemos ver y tocar',description:'Reconocemos entrada, salida, conexiones y diagnóstico seguro.',art:['monitor','tower']},
        {id:'internos',title:'Piezas que colaboran por dentro',description:'Procesador, RAM, almacenamiento y tarjeta principal cumplen funciones distintas.',art:['cpu','motherboard']},
        {id:'sistemas',title:'Hardware, software e inteligencia artificial',description:'Explicamos cómo colaboran y por qué los resultados de IA necesitan revisión.',art:['window','ai']},
        {id:'repaso',title:'El laboratorio del computador',description:'Seguimos una tarea desde la entrada hasta el resultado y el guardado.',art:['keyboard','drive']},
      ]},
      {id:'eventos',title:'Programas que despiertan',description:'Descubrimos eventos, construimos respuestas y seguimos la ejecución desde el inicio correcto.',available:true,illustration:'sequence',art:['flag','robot'],href:'continuacion-segundo?clase=eventos',finalActivity:true,parts:[
        {id:'eventos',title:'Qué hace comenzar un programa',description:'Diferenciamos el disparador de las acciones que vienen después.',art:['flag','button']},
        {id:'secuencias',title:'Construimos respuestas a eventos',description:'Programamos respuestas y coordinamos más de una señal.',art:['robot','bell']},
        {id:'pruebas',title:'Seguimos y reparamos la ejecución',description:'Usamos trazas para observar, comparar y corregir.',art:['robot','bee']},
        {id:'repaso',title:'Festival de programas',description:'Resolvemos cuatro estaciones de eventos, predicción, programación y reparación.',art:['flag','bee']},
      ]},
      {id:'bucles-dibujan',title:'Bucles que dibujan',description:'Comprimimos acciones repetidas, dibujamos patrones y corregimos cantidades.',available:true,illustration:'repeat',art:['monkey','rug'],href:'continuacion-segundo?clase=bucles-dibujan',finalActivity:true,parts:[
        {id:'repeticion',title:'Comprimimos sin cambiar el resultado',description:'Comparamos listas con bucles y ajustamos cuántas vueltas se ejecutan.',art:['robot','monkey']},
        {id:'dibujos',title:'Dibujamos con repeticiones',description:'Construimos cuadrados, filas y patrones a partir de una acción repetida.',art:['rug','flower2']},
        {id:'depuracion',title:'Seguimos y corregimos bucles',description:'Trazamos cada vuelta y cambiamos solo la acción o cantidad equivocada.',art:['robot','rug']},
        {id:'repaso',title:'Taller de bucles',description:'Demostramos que una repetición conserva el comportamiento esperado.',art:['monkey','rug']},
      ]},
      {id:'bucles-anidados',title:'Patrones dentro de patrones',description:'Leemos y construimos repeticiones con un nivel exterior y otro interior.',available:true,illustration:'repeat',art:['rug','capybara'],href:'continuacion-segundo?clase=bucles-anidados',finalActivity:true,parts:[
        {id:'patrones',title:'Encontramos unidades y grupos',description:'Reconocemos la unidad mínima y contamos cuántas veces aparece.',art:['flower2','rug']},
        {id:'anidados',title:'Construimos bucles de dos niveles',description:'Separamos grupos, elementos por grupo y acción.',art:['capybara','basket']},
        {id:'comprobacion',title:'Predecimos y reparamos niveles',description:'Anticipamos qué cambia al modificar el exterior o el interior.',art:['rug','basket']},
        {id:'repaso',title:'Feria de patrones',description:'Construimos y explicamos patrones con dos niveles.',art:['rug','capybara']},
      ]},
      {id:'condicionales',title:'Decisiones en el programa',description:'Creamos reglas que actúan cuando una condición se cumple y las probamos con casos opuestos.',available:true,illustration:'blocks',art:['gate','bee'],href:'continuacion-segundo?clase=condicionales',finalActivity:true,parts:[
        {id:'condiciones',title:'Si se cumple, entonces actuamos',description:'Interpretamos estados verdaderos y falsos y predecimos respuestas.',art:['gate','button']},
        {id:'sensores',title:'Leemos señales del entorno',description:'Convertimos puertas, botones, flores y canastas en señales observables.',art:['gate','flower2']},
        {id:'combinacion',title:'Construimos y depuramos reglas',description:'Programamos condiciones completas y revisamos ambos casos.',art:['bee','basket']},
        {id:'repaso',title:'Huerto de decisiones',description:'Probamos reglas con evidencias y corregimos las que fallan.',art:['gate','basket']},
      ]},
      {id:'historias-bloques',title:'Creamos historias con bloques',description:'Preparamos escenas, movemos personajes, coordinamos mensajes y diseñamos un proyecto breve.',available:true,illustration:'messages',art:['capybara','bee'],href:'continuacion-segundo?clase=historias-bloques',finalActivity:true,parts:[
        {id:'escenario',title:'Preparamos escena y movimiento',description:'Elegimos fondo, personaje, estado inicial y un recorrido coherente.',art:['capybara','rug']},
        {id:'mensajes',title:'Coordinamos personajes con mensajes',description:'Enviamos y recibimos señales para ordenar una historia.',art:['bee','bell']},
        {id:'proyecto',title:'Diseñamos un juego o historia breve',description:'Definimos meta, reglas, reinicio y una prueba observable.',art:['robot','flag']},
        {id:'repaso',title:'Estudio de historias',description:'Construimos un proyecto corto y explicamos cómo funciona.',art:['capybara','bee']},
      ]},
      {id:'confianza-digital',title:'Detectives de confianza digital',description:'Verificamos identidades, reconocemos presión y practicamos decisiones seguras con acompañamiento.',available:true,illustration:'messages',art:['ai','bell'],href:'continuacion-segundo?clase=confianza-digital',finalActivity:true,parts:[
        {id:'identidad',title:'Conocidos, desconocidos y verificación',description:'Una foto o un nombre conocido no bastan para confirmar quién escribe.',art:['ai','window'],trust:0},
        {id:'senales',title:'Reconocemos presión y engaño',description:'Identificamos premios, secretos, urgencia y solicitudes inesperadas.',art:['bell','button'],trust:1},
        {id:'decisiones',title:'Actuamos con acompañamiento',description:'Nos detenemos, no compartimos, verificamos y pedimos ayuda.',art:['capybara','bell'],trust:2},
        {id:'repaso',title:'Agencia de confianza digital',description:'Resolvemos casos ficticios sin revelar experiencias personales.',art:['ai','capybara'],trust:3},
      ]},
    ] },
    { id: '3', name: 'Tercero', tone: 'sky', description: 'Resolver y comprender.', classes: [
      {id:'proyecto-archivos',title:'Organizamos un proyecto digital',description:'Creamos una estructura de carpetas, controlamos versiones y recuperamos un trabajo con menos ayuda.',available:true,illustration:'computer',art:['folder','drive'],href:'continuacion-tercero?clase=proyecto-archivos',finalActivity:true,parts:[
        {id:'estructura',title:'Diseñamos la estructura del proyecto',description:'Convertimos las necesidades de un encargo en carpetas y nombres claros.',art:['folder','window']},
        {id:'versiones',title:'Controlamos cambios y versiones',description:'Distinguimos borrador, copia y entrega final sin perder trabajo.',art:['drive','paint']},
        {id:'recuperacion',title:'Buscamos, recuperamos y explicamos',description:'Usamos rutas, búsqueda y pistas para encontrar un archivo.',art:['folder','drive']},
        {id:'repaso',title:'Archivo de proyectos',description:'Organizamos y recuperamos un proyecto completo y justificamos la estructura.',art:['folder','monitor']},
      ]},
      {id:'sistema-computador',title:'Diseñamos un sistema para una tarea',description:'Elegimos hardware y software para resolver situaciones y explicamos cómo viaja la información.',available:true,illustration:'computer',art:['motherboard','window'],href:'continuacion-tercero?clase=sistema-computador',finalActivity:true,parts:[
        {id:'necesidades',title:'De la necesidad a los componentes',description:'Seleccionamos entrada, procesamiento, salida y almacenamiento.',art:['keyboard','monitor']},
        {id:'flujo',title:'Seguimos el flujo de información',description:'Explicamos cómo colaboran las partes durante una tarea.',art:['cpu','drive']},
        {id:'elecciones',title:'Comparamos soluciones digitales',description:'Valoramos compatibilidad, propósito y límites, incluida la IA.',art:['ai','motherboard']},
        {id:'repaso',title:'Laboratorio de soluciones',description:'Diseñamos un sistema completo y defendemos cada elección.',art:['tower','window']},
      ]},
      {id:'eventos-soluciones',title:'Diseñamos respuestas a eventos',description:'Planeamos programas a partir de un encargo, coordinamos eventos y comparamos soluciones.',available:true,illustration:'sequence',art:['flag','robot'],href:'continuacion-tercero?clase=eventos-soluciones',finalActivity:true,parts:[
        {id:'encargo',title:'Leemos el encargo y definimos la respuesta',description:'Separamos evento, acciones y resultado observable.',art:['flag','button']},
        {id:'coordinacion',title:'Coordinamos varios eventos',description:'Evitamos conflictos y ordenamos respuestas simultáneas.',art:['bell','robot']},
        {id:'alternativas',title:'Comparamos y depuramos soluciones',description:'Seguimos trazas y elegimos la solución más clara.',art:['robot','bee']},
        {id:'repaso',title:'Central de eventos',description:'Construimos, probamos y defendemos un programa orientado a eventos.',art:['flag','bell']},
      ]},
      {id:'bucles-eficientes',title:'Programas más cortos, mismas metas',description:'Elegimos cuándo repetir, simplificamos programas y comprobamos que conserven el resultado.',available:true,illustration:'repeat',art:['robot','rug'],href:'continuacion-tercero?clase=bucles-eficientes',finalActivity:true,parts:[
        {id:'estrategias',title:'Comparamos estrategias de repetición',description:'Medimos claridad y cantidad de bloques, no solo longitud visual.',art:['monkey','banana']},
        {id:'construccion',title:'Construimos bucles eficientes',description:'Combinamos tramos repetidos con acciones únicas.',art:['robot','rug']},
        {id:'depuracion',title:'Probamos y corregimos cantidades',description:'Localizamos el primer resultado distinto y ajustamos el bucle.',art:['bee','flower2']},
        {id:'repaso',title:'Taller de eficiencia',description:'Transformamos programas largos y demostramos que hacen lo mismo.',art:['robot','monkey']},
      ]},
      {id:'patrones-programados',title:'Diseñamos patrones con bucles',description:'Construimos figuras propias con dos niveles de repetición y predecimos sus cambios.',available:true,illustration:'repeat',art:['rug','capybara'],href:'continuacion-tercero?clase=patrones-programados',finalActivity:true,parts:[
        {id:'diseno',title:'Descomponemos una figura',description:'Identificamos unidad, grupo y regla antes de programar.',art:['rug','flower2']},
        {id:'anidamiento',title:'Programamos dos niveles',description:'Controlamos repeticiones exteriores e interiores.',art:['capybara','basket']},
        {id:'transformacion',title:'Predecimos y transformamos patrones',description:'Cambiamos un parámetro y anticipamos el efecto.',art:['rug','basket']},
        {id:'repaso',title:'Galería de patrones',description:'Diseñamos, programamos y explicamos una figura original.',art:['rug','capybara']},
      ]},
      {id:'decisiones-casos',title:'Programas que deciden y explican',description:'Diseñamos reglas, probamos casos opuestos y corregimos decisiones incompletas.',available:true,illustration:'blocks',art:['gate','bee'],href:'continuacion-tercero?clase=decisiones-casos',finalActivity:true,parts:[
        {id:'reglas',title:'Escribimos reglas precisas',description:'Convertimos condiciones observables en respuestas comprobables.',art:['gate','button']},
        {id:'casos',title:'Probamos casos y casos límite',description:'Usamos evidencia verdadera, falsa y cercana al límite.',art:['flower2','basket']},
        {id:'correccion',title:'Corregimos decisiones del programa',description:'Comparamos resultado esperado y real antes de cambiar la regla.',art:['bee','gate']},
        {id:'repaso',title:'Laboratorio de decisiones',description:'Diseñamos una regla y presentamos pruebas contrastantes.',art:['gate','basket']},
      ]},
      {id:'proyecto-interactivo',title:'Creamos un juego interactivo',description:'Planeamos una experiencia, coordinamos mensajes, programamos reglas y corregimos un error.',available:true,illustration:'messages',art:['capybara','robot'],href:'continuacion-tercero?clase=proyecto-interactivo',finalActivity:true,parts:[
        {id:'plan',title:'Planeamos el juego',description:'Definimos meta, controles, reglas y evidencia de éxito.',art:['flag','rug']},
        {id:'programacion',title:'Programamos personajes y mensajes',description:'Coordinamos eventos, movimientos y comunicación.',art:['robot','bell']},
        {id:'pruebas',title:'Probamos, depuramos y mejoramos',description:'Ejecutamos casos, localizamos fallos y verificamos la corrección.',art:['bee','button']},
        {id:'repaso',title:'Estudio de videojuegos',description:'Entregamos un prototipo funcional y explicamos una mejora.',art:['capybara','flag']},
      ]},
      {id:'investigacion-digital',title:'Investigamos antes de confiar',description:'Combinamos varias pistas, verificamos mensajes y sabemos cuándo pedir ayuda a un adulto.',available:true,illustration:'messages',art:['ai','bell'],href:'continuacion-tercero?clase=investigacion-digital',finalActivity:true,parts:[
        {id:'pistas',title:'Reunimos pistas de confianza',description:'Diferenciamos apariencia, afirmación y evidencia verificable.',art:['window','ai']},
        {id:'verificacion',title:'Verificamos por otro canal',description:'Comparamos fuentes sin abrir enlaces ni compartir datos.',art:['bell','monitor']},
        {id:'respuesta',title:'Decidimos y pedimos ayuda',description:'Elegimos una respuesta segura según el riesgo y la incertidumbre.',art:['capybara','gate']},
        {id:'repaso',title:'Agencia de investigación digital',description:'Resolvemos casos ficticios justificando cada decisión con varias pistas.',art:['ai','capybara']},
      ]},
    ] },
    { id: '4', name: 'Cuarto', tone: 'lilac', description: 'Crear y programar.', classes: [
      { id: 'scratch', title: 'Primeros pasos en Scratch', description: 'Conocemos el escenario, los personajes y los bloques.', available: false, illustration: 'blocks' },
      { id: 'animaciones', title: 'Animamos un personaje', description: 'Combinamos eventos y repeticiones para dar movimiento.', available: false, illustration: 'repeat' },
      { id: 'mensajes', title: 'Mensajes entre personajes', description: 'Coordinamos una escena con acciones y conversaciones.', available: false, illustration: 'messages' },
    ] },
    { id: '5', name: 'Quinto', tone: 'peach', description: 'Diseñar y construir.', classes: [
      { id: 'proyecto', title: 'Planeamos un proyecto', description: 'Convertimos un problema en requisitos, diseño, programa y evidencia de pruebas.', available: true, illustration: 'project', href: 'proyecto', finalActivity: true, parts: [
        {id:'requisitos',title:'Del reto a los requisitos',description:'Interpretamos encargos, fijamos criterios de éxito y decidimos alcance y restricciones.',illustration:'messages'},
        {id:'diseno',title:'Descomponemos y diseñamos',description:'Separamos responsabilidades, dependencias, entradas, salidas y casos de prueba.',illustration:'blocks'},
        {id:'programacion',title:'Programamos, probamos y corregimos',description:'Construimos programas con coordenadas, repetición y sensores; analizamos su traza.',illustration:'sequence'},
        {id:'repaso',title:'Proyecto final: entrega autónoma',description:'Resolvemos una misión nueva y defendemos la solución con pruebas y correcciones.',illustration:'review'},
      ] },
      { id: 'historias', title: 'Historias interactivas', description: 'Coordinamos personajes, mensajes y decisiones.', available: false, illustration: 'messages' },
      { id: 'juego', title: 'Un juego con nuestras reglas', description: 'Representamos puntos y probamos cómo funciona un juego.', available: false, illustration: 'sequence' },
    ] },
  ],
};
