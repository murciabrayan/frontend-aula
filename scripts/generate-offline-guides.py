from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

import pdfplumber
from PIL import Image as PilImage
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"
PUBLIC = FRONTEND / "public" / "aula-aventura"
ASSETS = PUBLIC / "assets"
OUTPUT = ROOT / "output" / "pdf" / "aula-interactiva"
PUBLIC_OUTPUT = PUBLIC / "materiales-sin-conexion"
TMP = ROOT / "tmp" / "pdfs"

PAGE_W, PAGE_H = A4
GREEN = colors.HexColor("#244D3A")
GREEN_2 = colors.HexColor("#3F6A50")
SAGE = colors.HexColor("#DDE9D8")
CREAM = colors.HexColor("#FFF7E3")
GOLD = colors.HexColor("#D8A83E")
GOLD_SOFT = colors.HexColor("#F5E4B8")
CORAL = colors.HexColor("#DF765F")
SKY = colors.HexColor("#D9EAF0")
INK = colors.HexColor("#26362E")
MUTED = colors.HexColor("#617064")
LINE = colors.HexColor("#D9E1D7")
WHITE = colors.white


def activity(title: str, materials: str, steps: list[str], evidence: str) -> dict:
    return {"title": title, "materials": materials, "steps": steps, "evidence": evidence}


def profile(intro: str, objectives: list[str], materials: list[str], activities: list[dict]) -> dict:
    return {"intro": intro, "objectives": objectives, "materials": materials, "activities": activities}


PROFILES = {
    "1:exploradores-digitales": profile(
        "La clase introduce el ingreso a un espacio digital escolar con ejemplos ficticios. El grupo aprende a reconocer usuario y contraseña, explorar el escritorio, crear un dibujo y guardar el trabajo sin depender de internet.",
        [
            "Diferenciar el usuario de la contraseña y explicar para qué sirve cada dato.",
            "Seguir la secuencia de ingreso usando únicamente credenciales ficticias de práctica.",
            "Reconocer escritorio, iconos, carpetas y programas dentro de un espacio digital.",
            "Elegir herramientas sencillas para crear y corregir una producción gráfica.",
            "Guardar un trabajo con un nombre claro, volver a encontrarlo y cerrar la sesión al terminar.",
        ],
        ["Tarjetas de usuario y contraseña ficticios", "Tarjetas de iconos y herramientas", "Sobres para representar carpetas", "Hojas, colores y dibujos pequeños que funcionen como archivos"],
        [
            activity("Tutorial de inicio de sesión", "Tarjetas con usuario LECHUZA y contraseña SOL7", ["Explique que el usuario dice quién intenta entrar y la contraseña funciona como una llave privada.", "Un estudiante sostiene cada tarjeta; el grupo indica cuál debe escribirse primero.", "Representen el botón Ingresar y comparen los datos antes de pasar.", "Al terminar, practiquen la acción de cerrar sesión en un equipo compartido."], "Ordena los pasos, diferencia los dos datos y recuerda mantener privada la contraseña."),
            activity("Mi rincón digital", "Tarjetas de escritorio, iconos, carpetas y programas", ["Delimite en el tablero el escritorio y la barra de tareas.", "Ubique varios iconos y pida encontrar el programa o carpeta indicado.", "Practiquen seleccionar con un toque y abrir con doble toque o con la opción Abrir.", "Relacionen cada icono con la tarea que permite realizar."], "Reconoce los elementos del escritorio y elige cómo abrirlos."),
            activity("Artistas digitales", "Hojas, colores y tarjetas de lápiz, borrador, formas, zoom y deshacer", ["Presente una acción y el grupo levanta la herramienta adecuada.", "Cada estudiante inicia un dibujo sencillo y agrega dos formas.", "Incluya un cambio para practicar borrar o deshacer sin empezar todo de nuevo.", "Observen el resultado y expliquen qué herramienta utilizaron."], "Elige herramientas por su función y mejora una creación."),
            activity("Guardar tesoros", "Sobres rotulados como carpetas y dibujos como archivos", ["Cada estudiante pone un nombre claro a su dibujo.", "Ordenen los pasos: crear, guardar, elegir carpeta, escribir nombre y comprobar.", "Guarden el dibujo dentro del sobre acordado.", "Otro estudiante sigue la ruta y recupera el archivo correcto."], "Usa nombre y ubicación para guardar y recuperar un trabajo."),
        ],
    ),
    "1:partes-del-computador": profile(
        "La clase presenta el computador como un conjunto de partes que colaboran. El docente alterna observación, demostración con equipos reales y cuatro retos que pueden realizarse sin conexión.",
        [
            "Reconocer la pantalla, el mouse y el teclado en un computador de escritorio o portátil.",
            "Explicar con palabras sencillas para qué sirve cada parte.",
            "Usar clic izquierdo, clic derecho, rueda y arrastre de manera intencional.",
            "Escribir, separar palabras, corregir y usar flechas con el teclado.",
            "Elegir la parte adecuada para una acción concreta y explicar la decisión.",
        ],
        ["Un computador o imágenes impresas de sus partes", "Mouse y teclado reales", "Hojas, lápices y cuatro tarjetas de objetos", "Cinta o tizas para marcar un recorrido"],
        [
            activity("La pantalla detective", "Tres dibujos: imagen quieta, palabra y secuencia de movimiento", ["Muestre cada dibujo y pregunte qué información podría aparecer en una pantalla.", "Cambie una pequeña parte de la escena; el grupo identifica qué cambió.", "Un estudiante señala marco, zona de imagen y botón del monitor real sin pulsarlo."], "Distingue lo que muestra la pantalla de las partes físicas del monitor."),
            activity("Mouse humano", "Mouse real, tres tarjetas y una hoja con un camino", ["Modele apuntar, clic izquierdo, clic derecho y rueda.", "Por turnos, un estudiante mueve el mouse; otro levanta la tarjeta de la acción observada.", "Para practicar arrastre, mantenga una ficha bajo un dedo, muévala por el camino y suéltela en la meta."], "Nombra la acción y controla inicio, movimiento y soltado."),
            activity("Teclado gigante", "Tarjetas con letras, Espacio, Retroceso, Enter y flechas", ["Distribuya las tarjetas en el piso como un teclado sencillo.", "Dicte una palabra corta; varios estudiantes pisan las teclas en orden.", "Incluya un error para que el grupo use Retroceso, y una separación para usar Espacio.", "Terminen un recorrido corporal siguiendo tarjetas de flecha."], "Relaciona cada tecla con el efecto esperado."),
            activity("¿Qué parte necesito?", "Tarjetas de pantalla, mouse, teclado y acciones", ["Coloque las tres partes en lugares distintos del salón.", "Lea una acción: ver un video, mover un dibujo, escribir el nombre o corregir una letra.", "Los estudiantes van a la parte correspondiente y justifican la elección.", "Repita con acciones que requieren más de una parte."], "Elige y explica cómo colaboran dos o más partes."),
        ],
    ),
    "1:escritorio": profile(
        "La clase usa un escritorio de práctica para comprender iconos, programas, ventanas y archivos. Sin internet, el salón se transforma en un escritorio físico que permite representar las mismas acciones.",
        [
            "Reconocer escritorio, iconos, área de trabajo y barra de tareas.",
            "Seleccionar y abrir un programa mediante doble clic o menú contextual.",
            "Mover, minimizar, recuperar y cerrar una ventana con intención.",
            "Diferenciar programa, carpeta y archivo.",
            "Guardar un trabajo con nombre claro y explicar cómo volver a encontrarlo.",
        ],
        ["Tarjetas de iconos", "Dos marcos de cartulina como ventanas", "Sobres rotulados como carpetas", "Dibujos pequeños que funcionen como archivos"],
        [
            activity("El escritorio del salón", "Tarjetas de iconos y cinta", ["Delimite área de trabajo y barra de tareas en el tablero.", "Ubique iconos y pida a los estudiantes identificar qué representan.", "Cambie un icono de lugar y compruebe que sigue representando lo mismo."], "Distingue zona, icono y elemento representado."),
            activity("Seleccionar no es abrir", "Tarjeta de un programa", ["Un toque coloca un marco alrededor de la tarjeta: seleccionar.", "Dos toques seguidos abren el programa; practiquen un ritmo cómodo.", "Como alternativa, representen clic derecho y luego la opción Abrir."], "Diferencia selección, doble clic y abrir desde un menú."),
            activity("Teatro de ventanas", "Marcos de cartulina y tarjetas de controles", ["Un equipo sostiene una ventana y la mueve desde su barra superior.", "Minimizar significa llevarla a la barra de tareas; recuperar significa traerla de vuelta.", "Comparen minimizar con cerrar: la primera sigue disponible; la segunda termina."], "Predice qué ocurre con cada control."),
            activity("Guardar y encontrar", "Sobres y dibujos", ["Cada estudiante nombra un dibujo con tema y estado, por ejemplo sol-final.", "Guarde el dibujo en el sobre indicado y escriba la ruta en el tablero.", "Otro estudiante sigue la ruta, abre el sobre y recupera el archivo."], "Usa nombre y ubicación para recuperar un trabajo."),
        ],
    ),
    "1:instrucciones": profile(
        "Los estudiantes descubren que una instrucción útil indica qué hacer, con qué, dónde y en qué orden. El trabajo sin conexión combina historias, desplazamientos y depuración corporal.",
        [
            "Ordenar acciones usando antes, después, primero y al final.",
            "Identificar cuándo falta un paso en una secuencia.",
            "Dar instrucciones con acción, objeto, lugar, dirección y cantidad.",
            "Probar una secuencia y comparar el resultado con la meta.",
            "Corregir un solo paso y volver a comprobar desde el inicio.",
        ],
        ["Tarjetas de acciones cotidianas", "Flechas de papel", "Cuadrícula marcada en el piso", "Una ficha y un objeto meta"],
        [
            activity("Historia desordenada", "Cuatro tarjetas de una rutina", ["Entregue las tarjetas mezcladas.", "El grupo las ordena y usa primero, luego y al final para narrarlas.", "Retire una tarjeta; deben explicar qué paso falta y dónde va."], "Justifica el orden y detecta una omisión."),
            activity("Instrucción precisa", "Objeto escolar y dos lugares marcados", ["Diga una instrucción ambigua: mueve eso allá.", "El grupo propone una versión clara con acción, objeto, dirección y lugar.", "Un estudiante la ejecuta exactamente; si hay dudas, se mejora la frase."], "Formula una instrucción que otra persona puede ejecutar sin adivinar."),
            activity("Robot en la cuadrícula", "Cuadrícula y flechas", ["Ubique robot, meta y obstáculo.", "El equipo construye una lista de flechas antes de mover la ficha.", "Ejecuten una tarjeta cada vez y marquen la traza.", "Si no llega, localicen el primer paso distinto de lo planeado."], "Planea, ejecuta y compara recorrido con meta."),
            activity("Taller de reparación", "Tres secuencias con un error diferente", ["Presente una secuencia con orden incorrecto, otra con paso faltante y otra con dirección errónea.", "Cada equipo diagnostica un caso sin mover todas las tarjetas.", "Cambian un elemento, reinician y explican por qué la reparación funciona."], "Corrige con un cambio pequeño y evidencia."),
        ],
    ),
    "1:tecnologia": profile(
        "La clase relaciona objetos tecnológicos con necesidades humanas y con la comunicación. Las actividades parten de objetos cercanos, evitando presentar la tecnología como sinónimo exclusivo de pantalla.",
        [
            "Diferenciar elementos de la naturaleza y objetos creados por personas.",
            "Relacionar inventos con la necesidad que ayudan a resolver.",
            "Comparar herramientas según propósito, seguridad y contexto.",
            "Elegir un medio adecuado para compartir información.",
            "Diseñar una solución tecnológica sencilla y explicar su función.",
        ],
        ["Objetos o fotografías del entorno", "Tarjetas de necesidades", "Papel, colores y cinta", "Una linterna o dibujo de fuentes de luz"],
        [
            activity("¿Naturaleza o creación?", "Ocho imágenes variadas", ["Clasifiquen imágenes en naturaleza y objetos creados.", "Para cada objeto creado, nombren el material y la necesidad asociada.", "Analicen un caso mixto, como una mesa de madera, sin confundir origen y transformación."], "Explica el criterio de clasificación."),
            activity("Invento y necesidad", "Tarjetas de objeto y necesidad", ["Coloque las necesidades proteger, transportar, iluminar y comunicar.", "Los equipos emparejan cada invento con una necesidad.", "Propongan otra herramienta posible y comparen ventajas y límites."], "Relaciona función con necesidad, no solo por apariencia."),
            activity("Mensaje que sí llega", "Tarjetas de destinatario, medio y mensaje", ["Elija una situación: avisar al profesor, orientar a un visitante o recordar una tarea.", "Los estudiantes seleccionan medio y destinatario.", "Crean una señal con dibujo y pocas palabras; otro equipo interpreta el mensaje."], "El mensaje es comprensible para el destinatario previsto."),
            activity("Rincón de lectura sin corriente", "Papel y materiales disponibles", ["Definan la necesidad: leer con claridad y seguridad.", "Diseñen una solución que use luz natural, orientación o reflectores de papel.", "Presenten el diseño indicando materiales, lugar y forma de uso.", "El grupo verifica si responde a la necesidad inicial."], "Propone y evalúa una solución coherente."),
        ],
    ),
    "1:programacion-flechas": profile(
        "La programación se presenta como construcción y prueba de instrucciones. Los estudiantes leen, predicen, ejecutan y depuran programas reales con flechas sobre tableros físicos.",
        [
            "Interpretar cada flecha como una instrucción de movimiento.",
            "Predecir la posición final antes de ejecutar.",
            "Construir programas que recojan objetos y alcancen una meta.",
            "Seguir una traza paso a paso.",
            "Localizar y corregir el primer error de un programa.",
        ],
        ["Cuadrícula en papel o piso", "Flechas recortables", "Ficha de personaje", "Dos objetos meta y fichas de obstáculo"],
        [
            activity("Leo antes de mover", "Tablero, ficha y cuatro flechas", ["Muestre inicio, orientación y programa.", "Cada estudiante predice la casilla final con el dedo, sin mover la ficha.", "Ejecuten y comparen predicción con resultado."], "Lee el programa de izquierda a derecha y considera la orientación."),
            activity("Entrega programada", "Dos objetos y flechas", ["Ubique un objeto para recoger y una meta de entrega.", "El equipo construye todo el programa antes de ejecutar.", "Al pasar por el objeto, lo une a la ficha y continúa hasta la meta."], "Incluye ambos objetivos en el orden correcto."),
            activity("La traza habla", "Programa numerado y marcador", ["Ejecuten una flecha cada vez y marquen la casilla visitada con el número del paso.", "Comparen la traza con el camino esperado.", "Señalen el primer paso que aleja al personaje de la meta."], "Usa la traza como evidencia y no adivina."),
            activity("Cuatro tableros, cuatro decisiones", "Cuatro mini tableros", ["Estación 1: predecir final. Estación 2: construir camino.", "Estación 3: recoger y entregar. Estación 4: reparar una flecha.", "Roten los equipos y registren una explicación breve por estación."], "Transfiere la estrategia a tableros diferentes."),
        ],
    ),
    "1:patrones-mensajes": profile(
        "Los estudiantes buscan la unidad que se repite y usan claves visibles para representar mensajes. No se emplean contraseñas ni datos reales.",
        [
            "Reconocer la unidad mínima de un patrón.",
            "Continuar patrones de colores, formas y movimientos.",
            "Detectar y reparar un elemento que rompe la regla.",
            "Crear un patrón propio y explicar su regla.",
            "Codificar y descifrar mensajes breves con una clave visible.",
        ],
        ["Fichas de colores y formas", "Tarjetas de movimientos", "Clave de símbolos y letras", "Sobres con mensajes ficticios"],
        [
            activity("La unidad escondida", "Fichas de dos o tres tipos", ["Construya una secuencia repetida y cubra una parte.", "El grupo identifica la unidad mínima, no toda la fila.", "Descubran la parte cubierta y comprueben la predicción."], "Separa la unidad y cuenta sus repeticiones."),
            activity("Médicos de patrones", "Tres patrones con errores", ["Cada equipo recibe una secuencia con un cambio.", "Rodea el primer elemento que rompe la regla.", "Sustituye solo esa ficha y explica qué debe aparecer después."], "Repara manteniendo la misma regla."),
            activity("Mensaje con clave", "Tabla visible de seis símbolos", ["Modele cómo una letra se representa con un símbolo.", "Cada equipo codifica una palabra escolar ficticia.", "Otro equipo la descifra consultando la misma clave."], "Usa correspondencias exactas y conserva el orden."),
            activity("Estaciones secretas", "Patrones y mensajes", ["Organice cuatro estaciones: continuar, reconocer unidad, reparar y descifrar.", "Los equipos dejan una respuesta y una frase de justificación.", "Cierre comparando patrón, regla y clave."], "Explica qué regla aplicó en cada caso."),
        ],
    ),
    "1:bucles": profile(
        "La clase transforma listas repetidas en instrucciones Repetir. El énfasis está en conservar el mismo resultado con un programa más claro.",
        [
            "Reconocer acciones consecutivas que se repiten.",
            "Interpretar acción y cantidad dentro de un bucle.",
            "Comparar una lista larga con una repetición equivalente.",
            "Combinar bucles, desplazamientos y giros.",
            "Corregir una cantidad o acción sin rehacer todo el programa.",
        ],
        ["Tarjetas de acción", "Tarjetas Repetir y números", "Cuadrícula", "Ficha de personaje"],
        [
            activity("Lista larga, programa corto", "Seis tarjetas iguales y un bloque Repetir", ["Muestre seis pasos hacia adelante.", "Sustituyan la lista por Repetir 6: avanzar.", "Ejecuten ambas versiones y comparen el resultado."], "Comprueba equivalencia entre lista y bucle."),
            activity("Abre el bucle", "Bloques Repetir con cantidades", ["Un estudiante toma Repetir 4: palmada.", "Cuatro compañeros representan cada vuelta del bucle.", "Cambien la cantidad y predigan cuántas acciones se ejecutarán."], "Diferencia acción interior y cantidad."),
            activity("Camino con giro", "Cuadrícula y bloques", ["Construyan un tramo con varias casillas iguales y un giro.", "Usen un bucle solo en el tramo repetido; el giro queda fuera.", "Ejecuten señalando dónde empieza y termina la repetición."], "Delimita correctamente qué se repite."),
            activity("Reparación mínima", "Tres programas con un dato incorrecto", ["Prueben el programa completo desde Inicio.", "Decidan si falla la acción, la cantidad o la posición del giro.", "Cambien una tarjeta y vuelvan a ejecutar."], "Repara una causa concreta y verifica."),
        ],
    ),
    "1:bucles-practica": profile(
        "Los bucles se transfieren a contextos variados para evitar que el estudiante memorice un solo tablero. Cada misión exige leer inicio, meta, obstáculos y repeticiones.",
        [
            "Predecir el efecto de un bucle antes de ejecutarlo.",
            "Aplicar repeticiones en situaciones diferentes.",
            "Distinguir lo que se conserva y lo que cambia al adaptar un programa.",
            "Combinar repetición y acciones no repetidas.",
            "Justificar una solución mediante una ejecución paso a paso.",
        ],
        ["Cuatro tableros temáticos", "Flechas y bloques Repetir", "Fichas de meta y obstáculo", "Hoja de predicciones"],
        [
            activity("Predicción espacial", "Tablero de planeta", ["Muestre inicio, orientación y obstáculo.", "Cada equipo dibuja la casilla final sin ejecutar.", "Desplieguen el bucle vuelta por vuelta y comprueben."], "Predice considerando cantidad y obstáculos."),
            activity("Órbita y reciclaje", "Dos tableros distintos", ["Resuelvan primero una órbita con giros regulares.", "Luego usen repeticiones para recoger objetos en una fila.", "Comparen qué parte de los programas se parece y cuál cambia."], "Transfiere el concepto sin copiar una secuencia completa."),
            activity("Adapta, no reinicies", "Programa base y nueva meta", ["Entregue un programa que ya funciona para una distancia.", "Cambie meta, orientación o giro.", "El equipo conserva tarjetas útiles y modifica solo lo necesario."], "Identifica componentes reutilizables."),
            activity("Circuito de repeticiones", "Cuatro estaciones temáticas", ["Prepare estaciones de espacio, deporte, animales y reciclaje.", "En cada una deben predecir, programar o reparar.", "Al rotar, el equipo anterior deja una pista, no la solución."], "Explica la adaptación realizada en cada contexto."),
        ],
    ),
    "1:errores-programas": profile(
        "La clase convierte el error en información para mejorar. Los estudiantes comparan meta y resultado, siguen trazas y prueban una corrección controlada.",
        [
            "Diferenciar resultado esperado y resultado real.",
            "Seguir una traza sin saltar pasos.",
            "Localizar el primer punto donde cambia el recorrido.",
            "Clasificar errores de dirección, orden o cantidad.",
            "Modificar un elemento y comprobar nuevamente desde Inicio.",
        ],
        ["Cuadrículas", "Programas numerados", "Marcadores de traza", "Tarjetas dirección, orden y cantidad"],
        [
            activity("Dos finales", "Tarjetas de meta esperada y resultado real", ["Presente una meta y una ejecución fallida.", "Los estudiantes describen ambas sin proponer todavía una solución.", "Subrayan la primera diferencia observable."], "Observa antes de cambiar el programa."),
            activity("Huella numerada", "Tablero y fichas numeradas", ["Ejecuten un programa dejando el número de cada paso en la casilla visitada.", "Comparen la huella con el recorrido correcto.", "Detengan la revisión en el primer paso distinto."], "Localiza el primer error usando evidencia."),
            activity("Archivo de fallos", "Tres casos", ["Caso A cambia dirección; B intercambia orden; C usa cantidad equivocada.", "Los equipos clasifican el tipo antes de corregir.", "Intercambien casos y revisen el diagnóstico de otro equipo."], "Nombra el tipo de error y la evidencia."),
            activity("Una corrección, una prueba", "Programa con una tarjeta reemplazable", ["El equipo propone un solo cambio.", "Reinicia la ficha y ejecuta el programa completo.", "Si aún falla, registra qué nueva información produjo la prueba."], "Comprueba y no declara éxito sin ejecutar."),
        ],
    ),
    "1:ciudadania-digital": profile(
        "La clase enseña decisiones de cuidado con casos completamente ficticios. No se solicita que los niños cuenten experiencias privadas ni compartan información real.",
        [
            "Reconocer ejemplos de información personal y pública.",
            "Comprender que contraseñas, dirección y datos familiares no se comparten libremente.",
            "Identificar adultos de confianza disponibles.",
            "Aplicar la secuencia detenerse, alejarse o cerrar y contar.",
            "Resolver situaciones ficticias sin revelar experiencias personales.",
        ],
        ["Tarjetas con datos ficticios", "Historias ilustradas", "Cartel Detener - Cerrar - Contar", "Tarjetas de adultos de confianza"],
        [
            activity("Semáforo de datos", "Tarjetas ficticias", ["Clasifiquen gustos generales, contraseña inventada, dirección ficticia y nombre de mascota ficticia.", "Usen verde para información compartible en clase, amarillo para preguntar y rojo para datos protegidos.", "Aclare que la decisión depende del contexto y del adulto responsable."], "Reconoce datos que requieren cuidado."),
            activity("Red de ayuda", "Tarjetas de adultos escolares y familiares", ["Cada caso presenta un adulto no disponible.", "El grupo elige otra persona de confianza y practica una frase para pedir ayuda.", "Refuerce que se puede insistir hasta ser escuchado."], "Propone más de una opción de acompañamiento."),
            activity("Pausa segura", "Historias ficticias", ["Lea una situación incómoda sin detalles personales.", "Los estudiantes levantan Detener, Cerrar o Alejarse y luego Contar.", "Representen cómo decir: pasó esto, me sentí así, necesito ayuda."], "Aplica la secuencia completa."),
            activity("Plan de cuidado", "Cuatro casos", ["En equipos, resuelvan un mensaje extraño, un premio, una solicitud de secreto y una ventana inesperada.", "Registren qué no compartir, qué acción inmediata tomar y a quién contar.", "Cierre recordando que pedir ayuda nunca es causar problemas."], "Decide con cuidado y acompañamiento."),
        ],
    ),
    "2:entorno-trabajo": profile(
        "La clase conecta ingreso, producción, guardado y recuperación. Todas las credenciales y archivos usados en ejemplos son ficticios.",
        [
            "Interpretar campos de usuario y contraseña con datos ficticios.",
            "Cerrar una sesión en un equipo compartido.",
            "Planear, crear y corregir una producción digital.",
            "Diferenciar archivo, carpeta, nombre y ruta.",
            "Guardar una versión y recuperarla siguiendo una ubicación.",
        ],
        ["Formulario impreso de práctica", "Tarjetas de herramientas", "Sobres como carpetas", "Producciones de papel con nombres ficticios"],
        [
            activity("Ingreso de práctica", "Formularios con datos ficticios", ["Identifiquen los campos antes de escribir.", "Copien usuario y contraseña ficticios respetando orden y símbolos.", "Comprueben y representen el cierre de sesión al terminar."], "Completa la secuencia sin compartir datos reales."),
            activity("Del boceto a la versión", "Hoja y tarjetas de herramientas", ["Definan propósito y destinatario de un afiche.", "Elijan una herramienta para cada cambio: dibujar, borrar, rellenar o deshacer.", "Marquen borrador, revisión y versión final."], "Explica qué corrección mejoró la producción."),
            activity("Ruta de carpetas", "Sobres anidados", ["Organice sobres Segundo, Informática y Dibujos.", "Guarden un archivo con nombre claro y escriban la ruta.", "Otro equipo recupera el archivo y vuelve un nivel si entra a la carpeta equivocada."], "Lee y sigue una ruta jerárquica."),
            activity("Estudio digital organizado", "Formulario, producción y sobres", ["Realicen ingreso ficticio, creación breve, guardado y cierre.", "Intercambien la ruta con otro equipo para recuperar el trabajo.", "El equipo explica herramienta, corrección, nombre y ubicación."], "Completa el flujo y puede explicarlo."),
        ],
    ),
    "2:componentes-programas": profile(
        "La clase sigue una tarea desde los periféricos hasta las piezas internas, el software y el almacenamiento. Incluye una introducción responsable a inteligencia artificial.",
        [
            "Clasificar periféricos como entrada, salida o conexión.",
            "Explicar funciones de procesador, RAM, almacenamiento y tarjeta principal.",
            "Diferenciar hardware y software.",
            "Seguir la ruta de una señal a través del sistema.",
            "Revisar resultados de IA y proteger datos personales.",
        ],
        ["Tarjetas de componentes", "Cinta para una ruta de datos", "Etiquetas hardware y software", "Casos ficticios de uso de IA"],
        [
            activity("Entrada, salida y conexión", "Tarjetas de periféricos", ["Clasifiquen teclado, mouse, monitor y audífonos.", "Representen qué señal entra y qué resultado sale.", "Ante un fallo, describan el síntoma antes de tocar conexiones."], "Clasifica por función y formula un diagnóstico seguro."),
            activity("Viaje de una pulsación", "Tarjetas CPU, RAM, almacenamiento y tarjeta principal", ["Formen una cadena humana desde teclado hasta monitor.", "Pasen una tarjeta letra por cada componente y expliquen su participación.", "Añadan Guardar para enviar una copia al almacenamiento."], "Distingue trabajo temporal y conservación."),
            activity("Equipo físico, instrucciones digitales", "Objetos y nombres de programas", ["Emparejen hardware con software que lo utiliza.", "Expliquen por qué ninguno completa la tarea por sí solo.", "Clasifiquen nuevos ejemplos y justifiquen."], "Diferencia lo físico de programas y datos."),
            activity("Revisor de IA", "Tres respuestas ficticias", ["Identifiquen una propuesta útil, una dudosa y una que solicita datos privados.", "Apliquen: no entregar datos, comparar fuentes y revisión humana.", "Reescriban una consigna escolar segura."], "No acepta una salida solo porque fue generada rápidamente."),
        ],
    ),
    "2:eventos": profile(
        "Los programas se organizan alrededor de eventos que inician respuestas. Los estudiantes distinguen el disparador de las acciones y coordinan más de una señal.",
        [
            "Identificar el evento que inicia un programa.",
            "Separar disparador y secuencia de respuesta.",
            "Construir respuestas para bandera, clic, tecla o mensaje.",
            "Coordinar dos personajes mediante señales.",
            "Seguir y reparar una ejecución desde el evento correcto.",
        ],
        ["Tarjetas de bandera, clic, tecla y mensaje", "Tarjetas de acciones", "Dos personajes de papel", "Hoja de traza"],
        [
            activity("¿Qué lo despertó?", "Eventos y acciones mezcladas", ["Separe tarjetas que pueden iniciar de las que ocurren después.", "Formen pares evento-respuesta.", "Cambien el evento y predigan si la respuesta se ejecuta."], "Distingue causa de inicio y acción posterior."),
            activity("Orquesta de eventos", "Tarjetas para equipos", ["Cada grupo recibe un evento diferente: bandera, palmada o palabra clave.", "Solo ejecutan su secuencia cuando ocurre su evento.", "Repitan con dos eventos cercanos para comprobar atención."], "Responde solo al disparador asignado."),
            activity("Mensaje entre personajes", "Dos personajes y señal", ["Personaje A ejecuta acciones y envía un mensaje.", "Personaje B espera y comienza al recibirlo.", "Intercambien el orden y analicen qué sucede si el mensaje no llega."], "Coordina sin iniciar antes de la señal."),
            activity("Festival de programas", "Cuatro tarjetas de caso", ["Predigan un caso, construyan otro, sigan una traza y reparen el último.", "En cada estación marquen el evento inicial.", "Expliquen por qué probar desde una acción intermedia puede ocultar el error."], "Repara desde el inicio correcto."),
        ],
    ),
    "2:bucles-dibujan": profile(
        "Los bucles se usan para crear dibujos y patrones. El estudiante conecta cantidad de repeticiones, acción interior y resultado geométrico.",
        [
            "Comprimir acciones repetidas sin cambiar el resultado.",
            "Usar bucles para construir filas y figuras.",
            "Relacionar lados, movimientos y cantidad de vueltas.",
            "Seguir cada iteración durante una prueba.",
            "Corregir acción o cantidad según la figura obtenida.",
        ],
        ["Papel cuadriculado", "Lápices de colores", "Tarjetas Repetir, avanzar y girar", "Fichas numeradas de iteración"],
        [
            activity("Comprimir una fila", "Papel cuadriculado", ["Dibujen cinco cuadrados uno por uno.", "Escriban una instrucción repetida equivalente.", "Cambien la cantidad y predigan el nuevo largo."], "Mantiene el mismo patrón con una descripción más corta."),
            activity("Cuadrado programado", "Tarjetas avanzar y girar", ["Construyan Repetir 4 con avanzar y girar dentro.", "Un estudiante dibuja mientras otro lee cada vuelta.", "Comparen qué ocurre si el giro queda fuera del bucle."], "Relaciona cuatro lados con cuatro repeticiones."),
            activity("Traza por colores", "Cuatro lápices", ["Use un color distinto en cada iteración.", "Numere la vuelta y marque inicio y final.", "Localice dónde cambia una figura incorrecta."], "Usa la traza visual para diagnosticar."),
            activity("Taller de bucles", "Tres figuras incompletas", ["Una figura tiene cantidad errónea, otra acción ausente y otra giro incorrecto.", "Cada equipo identifica el tipo de problema.", "Corrijan, redibujen y comparen antes y después."], "Explica qué instrucción produjo el cambio."),
        ],
    ),
    "2:bucles-anidados": profile(
        "La clase introduce patrones dentro de patrones: un bucle interior crea un grupo y uno exterior repite ese grupo. Se trabaja con materiales visibles antes de usar símbolos.",
        [
            "Encontrar la unidad mínima y agrupar repeticiones.",
            "Diferenciar cantidad exterior e interior.",
            "Construir un patrón con dos niveles.",
            "Predecir qué cambia al modificar cada nivel.",
            "Reparar el nivel correcto y explicar la decisión.",
        ],
        ["Fichas de colores", "Aros o marcos para agrupar", "Tarjetas Repetir exterior e interior", "Papel cuadriculado"],
        [
            activity("Grupos visibles", "Fichas y aros", ["Cree grupos iguales de tres fichas dentro de aros.", "Identifiquen elemento, grupo y número de grupos.", "Escriban una frase: repetir 4 grupos de 3."], "Distingue ambos niveles de cantidad."),
            activity("Bucle dentro de bucle", "Tarjetas anidadas", ["Coloque la acción en el bloque interior.", "Rodee ese bloque con Repetir exterior.", "Desplieguen manualmente primero interior y después exterior."], "Respeta el orden de ejecución."),
            activity("¿Qué número cambio?", "Dos patrones parecidos", ["Cambie solo el número interior y comparen tamaño de cada grupo.", "Cambie solo el exterior y comparen cantidad de grupos.", "Los estudiantes predicen antes de reorganizar fichas."], "Relaciona parámetro y efecto."),
            activity("Feria de patrones", "Material libre", ["Cada equipo diseña un patrón de dos niveles.", "Otro equipo escribe los dos bucles sin ver la explicación.", "Comparen programa y patrón; reparen el nivel que no coincide."], "Construye y comunica una estructura anidada."),
        ],
    ),
    "2:condicionales": profile(
        "Los estudiantes programan decisiones del tipo Si... entonces... y prueban tanto el caso verdadero como el falso. La evidencia observable guía la decisión.",
        [
            "Interpretar una condición como pregunta que puede cumplirse o no.",
            "Relacionar condición y acción.",
            "Representar señales de botones, puertas y sensores.",
            "Probar una regla con dos casos opuestos.",
            "Corregir condiciones incompletas o acciones equivocadas.",
        ],
        ["Tarjetas Si y entonces", "Puerta de cartulina", "Fichas de estado abierto/cerrado", "Casos verdaderos y falsos"],
        [
            activity("Si ocurre, actúo", "Tarjetas condición-acción", ["Lea: si la puerta está abierta, entonces avanza.", "Muestre puerta abierta y cerrada; ejecuten ambos casos.", "Aclare que en el caso falso no se realiza esa acción."], "No ejecuta la acción cuando la condición no se cumple."),
            activity("Sensores humanos", "Señales de botón, luz y objeto", ["Un estudiante representa el sensor y observa un estado.", "Comunica verdadero o falso sin decidir la meta.", "Otro estudiante ejecuta la acción programada."], "Diferencia observar una señal de actuar."),
            activity("Regla completa", "Mitades de condiciones y acciones", ["Emparejen una condición observable con una respuesta coherente.", "Prueben un caso que cumple y otro que no.", "Reescriban reglas ambiguas para que puedan comprobarse."], "Construye reglas verificables."),
            activity("Huerto de decisiones", "Cuatro casos", ["Prueben puerta, botón, flor y canasta con estados opuestos.", "Registren condición, resultado esperado y resultado real.", "Si falla, cambien condición o acción, no ambas a la vez."], "Depura con pruebas contrastantes."),
        ],
    ),
    "2:historias-bloques": profile(
        "La clase organiza una historia interactiva como proyecto: escenario, estados iniciales, movimientos, mensajes, meta, reglas y reinicio.",
        [
            "Definir escenario, personajes y estado inicial.",
            "Construir movimientos coherentes con una historia.",
            "Coordinar personajes mediante mensajes.",
            "Establecer meta, regla y forma de reiniciar.",
            "Probar el proyecto y explicar cómo funciona.",
        ],
        ["Personajes y fondos de papel", "Tarjetas de movimiento y mensaje", "Guion gráfico de cuatro cuadros", "Ficha de prueba"],
        [
            activity("Escena preparada", "Fondo y personajes", ["Elijan dónde comienza cada personaje y hacia dónde mira.", "Marquen un recorrido que tenga sentido en la escena.", "Reinicien colocando todos los elementos en el estado inicial."], "Puede reconstruir la escena inicial."),
            activity("Mensaje en cadena", "Dos personajes y tarjetas enviar/recibir", ["A realiza una acción y envía un mensaje.", "B comienza solo cuando recibe ese mensaje.", "Agreguen una respuesta de B y comprueben el orden de la conversación."], "Coordina turnos mediante señales."),
            activity("Diseño del proyecto", "Guion gráfico", ["Definan meta del jugador y una regla.", "Dibujen inicio, acción, cambio y cierre.", "Incluyan cómo reiniciar para realizar otra prueba."], "El proyecto tiene propósito y estados identificables."),
            activity("Estudio de pruebas", "Ficha de observación", ["Un equipo presenta sin explicar la solución.", "Otro prueba inicio, regla, mensaje y reinicio.", "Registran un comportamiento esperado, uno real y una mejora."], "Usa la prueba para mejorar el proyecto."),
        ],
    ),
    "2:confianza-digital": profile(
        "La clase trabaja verificación, presión y acompañamiento mediante casos ficticios. Una foto, nombre o tono conocido no confirma por sí solo una identidad.",
        [
            "Diferenciar identidad mostrada e identidad verificada.",
            "Reconocer señales de urgencia, premio, secreto o solicitud inesperada.",
            "Evitar compartir datos o responder bajo presión.",
            "Verificar por un canal conocido y con un adulto.",
            "Aplicar detenerse, no compartir, cerrar y pedir ayuda.",
        ],
        ["Mensajes completamente ficticios", "Tarjetas señal y evidencia", "Cartel de pasos seguros", "Personajes de papel"],
        [
            activity("¿Quién dice ser?", "Perfiles ficticios", ["Compare nombre, foto y mensaje con evidencia independiente.", "Clasifiquen: conocido, desconocido o sin verificar.", "Practiquen no continuar la conversación hasta verificar con un adulto."], "No confunde apariencia con identidad confirmada."),
            activity("Radar de presión", "Mensajes ficticios", ["Subrayen urgencia, premio, secreto o amenaza.", "Expliquen cómo esa frase intenta apresurar una decisión.", "Transformen el mensaje en una situación segura de consulta."], "Reconoce estrategias de presión."),
            activity("Ruta de verificación", "Tarjetas de canales", ["Elijan un canal conocido: hablar en persona o usar un contacto verificado.", "Nunca usen el enlace o número enviado por el mensaje dudoso.", "Incluyan a un adulto antes de compartir o realizar una acción."], "Verifica fuera del canal sospechoso."),
            activity("Agencia de confianza", "Cuatro expedientes ficticios", ["Cada expediente incluye identidad, presión y solicitud.", "El equipo registra señal, acción inmediata, forma de verificar y adulto de apoyo.", "Cierre sin pedir relatos personales a los estudiantes."], "Aplica el plan completo con acompañamiento."),
        ],
    ),
    "3:proyecto-archivos": profile(
        "La clase convierte un encargo escolar en una estructura de archivos comprensible. Los estudiantes organizan recursos, controlan versiones y recuperan una entrega usando varias pistas.",
        [
            "Diseñar carpetas y nombres a partir de las necesidades de un proyecto.",
            "Diferenciar borrador, revisión y entrega final.",
            "Conservar una versión anterior antes de realizar cambios importantes.",
            "Recuperar archivos mediante ruta, nombre, tipo y fecha.",
            "Explicar y justificar una estructura para que otra persona pueda usarla.",
        ],
        ["Tarjetas de archivos y carpetas", "Sobres rotulados como directorios", "Fichas de versión y fecha", "Un expediente escolar ficticio"],
        [
            activity("Arquitectos de carpetas", "Sobres, tarjetas de recursos y una hoja de encargo", ["Lean el encargo y subrayen qué elementos deben conservarse.", "Agrupen las tarjetas en Recursos, En proceso y Entrega, o propongan categorías equivalentes.", "Pongan nombres claros a carpetas y archivos.", "Otro equipo intenta guardar un archivo nuevo siguiendo únicamente la estructura propuesta."], "La estructura responde al encargo y puede ser comprendida por otro equipo."),
            activity("Línea del tiempo de versiones", "Cuatro versiones impresas de un mismo trabajo", ["Ordenen borrador, primera revisión, corrección y entrega verificada.", "Escriban un nombre que incluya tema y estado para cada versión.", "Simulen un cambio que sale mal y determinen qué versión permite regresar.", "Expliquen cuándo usar Guardar y cuándo crear una copia."], "Distingue estados y conserva una referencia anterior."),
            activity("Expediente perdido", "Sobres anidados y tarjetas con nombre, tipo y fecha", ["Un equipo oculta una entrega respetando una ruta acordada.", "Entrega al otro equipo tres pistas, sin revelar la ubicación completa.", "El equipo buscador registra la ruta seguida y comprueba contenido y versión antes de declarar el hallazgo.", "Cambien una pista y comparen qué estrategia deja de funcionar."], "Combina varias pistas y verifica el archivo encontrado."),
            activity("Auditoría del proyecto", "Proyecto ficticio mezclado", ["Clasifiquen recursos, borradores y entregas.", "Detecten un nombre ambiguo y una versión ubicada en la carpeta incorrecta.", "Corrijan únicamente lo necesario.", "Presenten la estructura final y demuestren cómo recuperar la entrega."], "Organiza, corrige y explica un proyecto completo."),
        ],
    ),
    "3:sistema-computador": profile(
        "Los estudiantes diseñan un sistema digital desde la necesidad. Cada solución debe incluir entrada, procesamiento, salida, almacenamiento y software, además de una justificación basada en criterios.",
        [
            "Elegir componentes y programas según una tarea concreta.",
            "Diferenciar entrada, procesamiento, salida y almacenamiento.",
            "Representar el recorrido de la información durante una tarea.",
            "Comparar soluciones por propósito, compatibilidad, privacidad y facilidad de uso.",
            "Reconocer que los resultados de inteligencia artificial requieren revisión humana.",
        ],
        ["Tarjetas de componentes y programas", "Hilo o flechas para representar datos", "Tres encargos impresos", "Matriz sencilla de criterios"],
        [
            activity("Sistema por encargo", "Tarjetas de hardware y software", ["Elijan un encargo: grabar una entrevista, crear un afiche o presentar una animación.", "Seleccionen una entrada, un programa, una salida y una forma de guardar.", "Retiren una tarjeta y expliquen qué parte de la tarea ya no podría completarse.", "Justifiquen cada componente por su función, no por su apariencia."], "Construye una combinación completa y coherente."),
            activity("Viaje de un dato", "Tarjetas, flechas e hilo", ["Representen una pulsación del teclado que se convierte en texto guardado.", "Cada estudiante sostiene una etapa y recibe el dato del paso anterior.", "Incluyan programa, pantalla y almacenamiento.", "Introduzcan una interrupción y localicen qué resultado deja de aparecer."], "Explica el flujo en el orden correcto y localiza un fallo."),
            activity("Consejo de compra escolar", "Dos soluciones ficticias y matriz de criterios", ["Definan cuatro criterios antes de mirar las opciones.", "Puntúen compatibilidad, propósito, privacidad y facilidad de uso.", "Descarten una opción que no funciona en los equipos disponibles aunque tenga más funciones.", "Defiendan la elección con al menos dos criterios."], "Compara alternativas con evidencia y reconoce compensaciones."),
            activity("Laboratorio de soluciones", "Encargo sorpresa y tarjetas completas", ["Diseñen el sistema sin recibir una lista de pasos.", "Dibujen el flujo de información.", "Otro equipo prueba la propuesta con un caso normal y uno problemático.", "Revisen cualquier resultado producido por IA antes de aceptarlo."], "Entrega una solución completa, probada y explicada."),
        ],
    ),
    "3:eventos-soluciones": profile(
        "La clase parte de encargos incompletos para que los estudiantes definan eventos, respuestas y evidencias. Se coordinan varios objetos mediante mensajes y se comparan programas con trazas.",
        [
            "Separar evento, acciones y resultado observable dentro de un encargo.",
            "Construir una respuesta sin recibir el programa completo.",
            "Coordinar objetos mediante mensajes y estados.",
            "Detectar conflictos entre eventos que actúan al mismo tiempo.",
            "Comparar soluciones y depurar usando una traza de ejecución.",
        ],
        ["Tarjetas de eventos y acciones", "Personajes de papel", "Mensajes en sobres", "Hoja de traza con pasos numerados"],
        [
            activity("Del encargo al guion", "Tres encargos breves", ["Subrayen cuándo comienza, qué debe ocurrir y cómo se comprobará.", "Escriban un evento y una secuencia de respuesta.", "Intercambien el guion con otro equipo para comprobar si falta información.", "Ajusten el resultado para que sea observable."], "Distingue disparador, respuesta y evidencia."),
            activity("Orquesta de eventos", "Tres personajes y sobres de mensajes", ["Asigne una responsabilidad diferente a cada personaje.", "El primero envía un mensaje cuando termina su acción; el siguiente espera ese mensaje.", "Ejecuten sin hablar fuera de los mensajes previstos.", "Agreguen un reinicio que devuelva a todos al estado inicial."], "Coordina acciones sin depender de tiempos adivinados."),
            activity("Carrera de soluciones", "Dos programas en tarjetas", ["Predigan el resultado de ambos programas.", "Ejecuten y registren la traza.", "Comprueben si cumplen todos los criterios, no solo el resultado final.", "Elijan la solución más clara y propongan una mejora."], "Compara alternativas mediante criterios y trazas."),
            activity("Central de eventos", "Escena con varios eventos y un conflicto", ["Localicen los objetos que intentan cambiar el mismo estado.", "Definan un responsable y mensajes de coordinación.", "Prueben inicio, interacción y reinicio.", "Expliquen el error encontrado y la evidencia de la corrección."], "Construye y depura un sistema orientado a eventos."),
        ],
    ),
    "3:bucles-eficientes": profile(
        "Los estudiantes transforman programas largos en soluciones con bucles, pero deben demostrar que el resultado se conserva. Se trabaja con tramos únicos, unidades repetidas y pruebas vuelta por vuelta.",
        [
            "Identificar una unidad estable que puede repetirse.",
            "Comparar listas y bucles por equivalencia y claridad.",
            "Separar preparación, repetición y cierre.",
            "Combinar acciones únicas con tramos repetidos.",
            "Depurar acción, cantidad o límite mediante pruebas controladas.",
        ],
        ["Tarjetas de bloques", "Cuadrícula o mosaico", "Fichas de acciones", "Tabla de vueltas y resultados"],
        [
            activity("Misma meta, menos bloques", "Dos programas equivalentes", ["Ejecuten la lista larga y registren el resultado.", "Marquen la unidad que se repite y sustitúyanla por Repetir.", "Ejecuten la versión corta con la misma entrada.", "Comparen orden, cantidad y resultado antes de declarar equivalencia."], "Demuestra que la simplificación conserva el comportamiento."),
            activity("Dentro o fuera", "Tarjetas de inicio, acciones, giro y cierre", ["Construyan un recorrido con un tramo repetido.", "Clasifiquen cada tarjeta como preparación, interior del bucle o cierre.", "Muevan intencionalmente una tarjeta al lugar incorrecto y predigan el efecto.", "Restauren el programa y justifiquen los límites del bucle."], "Delimita con precisión qué se repite."),
            activity("Tabla de vueltas", "Programa con error y tabla", ["Predigan el estado después de cada vuelta.", "Ejecuten una vuelta a la vez y completen la tabla.", "Encuentren la primera fila diferente de lo esperado.", "Decidan si la causa es acción, cantidad o límite, cambien una sola y repitan."], "Diagnostica el parámetro responsable del error."),
            activity("Taller de eficiencia", "Tres programas largos", ["Cada equipo simplifica un programa diferente.", "Otro equipo intenta demostrar si es equivalente.", "Corrijan cualquier diferencia encontrada.", "Presenten versión inicial, versión mejorada y evidencia de prueba."], "Optimiza y defiende una solución con resultados comparables."),
        ],
    ),
    "3:patrones-programados": profile(
        "La clase conecta diseño visual y programación. Los estudiantes descomponen figuras, controlan bucles interiores y exteriores, calculan totales y transforman patrones cambiando un solo parámetro.",
        [
            "Identificar unidad, grupo y regla de una figura.",
            "Representar patrones mediante dos niveles de repetición.",
            "Calcular el total de elementos en bucles anidados.",
            "Predecir el efecto de cambiar el interior o el exterior.",
            "Diseñar y explicar un patrón propio con parámetros definidos.",
        ],
        ["Fichas geométricas o semillas", "Tarjetas Repetir", "Cuadrícula", "Hoja de predicción y resultado"],
        [
            activity("Rayos X de una figura", "Tres patrones impresos", ["Rodeen la unidad mínima de cada patrón.", "Marquen qué elementos forman un grupo.", "Escriban la regla exterior que repite el grupo.", "Comprueben reconstruyendo la figura con fichas."], "Diferencia unidad, grupo y repetición exterior."),
            activity("Bucles humanos anidados", "Tarjetas exterior, interior y acción", ["Un estudiante controla el bucle exterior y anuncia cada grupo.", "Otro controla el interior y entrega la cantidad de fichas del grupo.", "Registren grupos por elementos para calcular el total.", "Intercambien cantidades y repitan."], "Lee y ejecuta ambos niveles en el orden correcto."),
            activity("Una variable cambia", "Patrón base y tarjetas de parámetros", ["Anoten una predicción antes de tocar el patrón.", "Cambien solo la cantidad interior y reconstruyan.", "Restauren y cambien solo la cantidad exterior.", "Comparen qué aspecto de la figura modifica cada nivel."], "Predice y explica el efecto de un parámetro."),
            activity("Galería programada", "Fichas de colores y hoja de diseño", ["Diseñen una unidad visual y definan elementos por grupo.", "Elijan cuántos grupos aparecerán.", "Otro equipo construye la figura siguiendo únicamente la regla escrita.", "Corrijan la regla si el resultado no coincide con el diseño."], "Produce una figura reproducible y una explicación precisa."),
        ],
    ),
    "3:decisiones-casos": profile(
        "Los estudiantes escriben condiciones observables, construyen respuestas y prueban casos verdaderos, falsos y cercanos al límite. La corrección se valida repitiendo una tabla de pruebas.",
        [
            "Escribir condiciones que puedan evaluarse como verdaderas o falsas.",
            "Diferenciar dato, comparación y respuesta.",
            "Diseñar casos verdaderos, falsos y de frontera.",
            "Seguir la traza de una decisión.",
            "Corregir una regla y demostrar que no rompió casos anteriores.",
        ],
        ["Tarjetas Si, Entonces y Si no", "Fichas con datos numéricos", "Tabla de casos", "Semáforo o puerta de cartulina"],
        [
            activity("Clínica de condiciones", "Frases precisas y ambiguas", ["Clasifiquen condiciones como observables o ambiguas.", "Transformen expresiones como está bastante lleno en una comparación comprobable.", "Separen dato, operador y valor.", "Otro equipo evalúa la condición con dos entradas."], "Escribe una condición que distintas personas evalúan igual."),
            activity("Mesa de tres casos", "Regla y fichas de entrada", ["Preparen un caso que cumple, uno que no y uno exactamente en el límite.", "Anoten el resultado esperado antes de ejecutar.", "Representen qué rama se activa.", "Comparen la tabla con la regla escrita."], "Usa casos contrastantes y reconoce el borde de la condición."),
            activity("Traza de la decisión", "Programa en tarjetas y hoja de traza", ["Lean el dato de entrada.", "Evalúen la comparación y registren verdadero o falso.", "Sigan únicamente la rama correspondiente.", "Si el resultado falla, señalen la primera etapa distinta."], "Localiza si el problema está en dato, comparación o respuesta."),
            activity("Laboratorio de reglas", "Regla defectuosa y cinco casos", ["Reproduzcan el fallo con un caso concreto.", "Cambien una sola causa.", "Repitan los casos verdadero, falso y límite usados antes.", "Agreguen un caso nuevo y presenten la evidencia."], "Corrige sin perder comportamientos que ya funcionaban."),
        ],
    ),
    "3:proyecto-interactivo": profile(
        "La clase organiza un pequeño videojuego como proyecto de ingeniería: requisitos, responsabilidades, mensajes, casos de prueba y depuración. El resultado puede representarse completamente con papel y actuación.",
        [
            "Definir meta, controles, reglas, éxito y reinicio.",
            "Asignar responsabilidades a personajes y objetos.",
            "Coordinar cambios mediante eventos y mensajes.",
            "Diseñar pruebas para inicio, interacción, final y reinicio.",
            "Localizar un error y explicar la corrección aplicada.",
        ],
        ["Guion gráfico", "Personajes y objetos de papel", "Tarjetas de eventos, acciones y mensajes", "Ficha de requisitos y pruebas"],
        [
            activity("Documento de diseño", "Ficha de una página", ["Escriban una meta alcanzable y un control disponible.", "Definan una regla de puntos o vidas.", "Describan cuándo se gana y cómo se reinicia.", "Reduzcan cualquier elemento que no sea esencial para el primer prototipo."], "El plan es pequeño, completo y comprobable."),
            activity("Juego de mesa ejecutable", "Tablero, personajes y bloques", ["Asignen a cada estudiante un objeto y su responsabilidad.", "El jugador usa controles; los objetos responden a contactos o mensajes.", "Representen marcador, meta y condición de final.", "Ejecuten una partida siguiendo literalmente los bloques."], "Las responsabilidades y mensajes producen una interacción coherente."),
            activity("Equipo de pruebas", "Prototipo de otro equipo y tabla", ["Prueben comenzar desde cero, obtener un punto, ganar y reiniciar.", "Para cada caso anoten entrada, esperado y real.", "Prioricen un fallo que impida jugar antes de sugerir adornos.", "Devuelvan evidencia concreta al equipo creador."], "Registra resultados reproducibles y prioriza fallos funcionales."),
            activity("Estudio de videojuegos", "Plan, prototipo y registro", ["Presenten la meta sin explicar cómo está programada.", "Otro equipo ejecuta los casos acordados.", "Localicen un fallo, cambien una causa y repitan.", "Cierren mostrando requisito, prueba, corrección y resultado final."], "Entrega un prototipo probado y explica una mejora real."),
        ],
    ),
    "3:investigacion-digital": profile(
        "La clase desarrolla criterio de confianza digital sin pedir experiencias personales. Los estudiantes separan afirmaciones de evidencia, verifican por canales independientes y eligen respuestas seguras con acompañamiento adulto.",
        [
            "Diferenciar apariencia, afirmación, señal y evidencia independiente.",
            "Combinar varias pistas antes de considerar confiable un mensaje.",
            "Verificar por un canal que no dependa del mensaje sospechoso.",
            "Evitar abrir enlaces o compartir datos durante la verificación.",
            "Elegir cuándo pausar, cerrar, conservar evidencia y pedir ayuda adulta.",
        ],
        ["Expedientes completamente ficticios", "Tarjetas de pistas", "Mapa de canales de confianza", "Cartel del plan detener-proteger-contar"],
        [
            activity("Afirmación o evidencia", "Tarjetas de perfiles y confirmaciones", ["Clasifiquen foto, nombre y frase soy soporte como afirmaciones o apariencia.", "Clasifiquen confirmación en persona o canal oficial como evidencia independiente.", "Construyan un caso donde una apariencia conocida contradice otras señales.", "Decidan qué información todavía falta."], "No trata una sola señal visual como prueba de identidad."),
            activity("Tablero de pistas", "Mensaje ficticio y fichas", ["Lean sin responder ni abrir enlaces.", "Marquen contexto esperado, canal, solicitud, urgencia y datos pedidos.", "Coloquen cada pista como favorable, de alerta o insuficiente.", "Formulen una decisión usando al menos dos pistas."], "Justifica con varias señales y reconoce incertidumbre."),
            activity("Verificación por otra ruta", "Mapa de personas y canales", ["Elijan una persona adulta y un canal ya conocido.", "Descarten números y enlaces entregados por el mismo mensaje.", "Representen la consulta sin copiar datos personales.", "Comparen la respuesta con la actividad anunciada."], "Verifica de forma independiente y acompañada."),
            activity("Agencia de investigación", "Cuatro expedientes ficticios", ["Cada equipo registra afirmación, pistas, riesgo y acción inmediata.", "Elige pausar o cerrar, protege la información y busca ayuda.", "Otro equipo revisa si la respuesta es proporcional y segura.", "Cierren recordando que no es necesario demostrar un engaño para pedir ayuda."], "Aplica un plan completo y respetuoso sin revelar experiencias privadas."),
        ],
    ),
}


def clean(value: object) -> str:
    text = str(value or "")
    text = re.sub(r"<\s*strong\s*>", "<b>", text, flags=re.I)
    text = re.sub(r"<\s*/\s*strong\s*>", "</b>", text, flags=re.I)
    text = re.sub(r"<(?!/?b\b)[^>]+>", "", text)
    text = text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    text = text.replace("→", " -> ").replace("←", " <- ").replace("↑", "arriba").replace("↓", "abajo")
    return text.strip()


def plain(value: object) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", clean(value))).strip()


def load_lessons() -> list[tuple[int, dict]]:
    result = subprocess.run(
        ["node", str(FRONTEND / "scripts" / "export-aula-lessons.cjs")],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    data = json.loads(result.stdout)
    lessons = ([(1, lesson) for lesson in data["first"]]
               + [(2, lesson) for lesson in data["second"]]
               + [(3, lesson) for lesson in data["third"]])
    if len(lessons) != 26:
        raise RuntimeError(f"Se esperaban 26 clases y se encontraron {len(lessons)}")
    return lessons


def prepare_assets() -> list[Path]:
    TMP.mkdir(parents=True, exist_ok=True)
    atlas = PilImage.open(ASSETS / "owl-atlas.png").convert("RGBA")
    owls = []
    cell_w = atlas.width // 4
    cell_h = atlas.height // 2
    for row in range(2):
        for column in range(4):
            left = column * cell_w
            top = row * cell_h
            right = atlas.width if column == 3 else left + cell_w
            bottom = atlas.height if row == 1 else top + cell_h
            cell = atlas.crop((left, top, right, bottom))
            bbox = cell.getbbox()
            if bbox:
                cell = cell.crop(bbox)
            owl = TMP / f"owl-guide-{row * 4 + column + 1}.png"
            cell.save(owl)
            owls.append(owl)
    return owls


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Nunito", str(ASSETS / "nunito-regular.ttf")))
    pdfmetrics.registerFont(TTFont("Nunito-Bold", str(ASSETS / "nunito-bold.ttf")))


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("Title", parent=base["Title"], fontName="Nunito-Bold", fontSize=24, leading=28, textColor=GREEN, spaceAfter=8),
        "h1": ParagraphStyle("H1", parent=base["Heading1"], fontName="Nunito-Bold", fontSize=22, leading=26, textColor=GREEN, spaceBefore=4, spaceAfter=10),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Nunito-Bold", fontSize=14.8, leading=18, textColor=GREEN_2, spaceBefore=8, spaceAfter=5),
        "h3": ParagraphStyle("H3", parent=base["Heading3"], fontName="Nunito-Bold", fontSize=11.5, leading=14.5, textColor=INK, spaceBefore=4, spaceAfter=3),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Nunito", fontSize=10, leading=14, textColor=INK, spaceAfter=5),
        "small": ParagraphStyle("Small", parent=base["BodyText"], fontName="Nunito", fontSize=8.7, leading=11.8, textColor=MUTED, spaceAfter=3),
        "bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName="Nunito", fontSize=9.7, leading=13.2, textColor=INK, leftIndent=12, firstLineIndent=-8, bulletIndent=0, spaceAfter=3),
        "step": ParagraphStyle("Step", parent=base["BodyText"], fontName="Nunito", fontSize=9.5, leading=13.2, textColor=INK, leftIndent=18, firstLineIndent=-18, spaceAfter=4),
        "part_h2": ParagraphStyle("PartH2", parent=base["Heading2"], fontName="Nunito-Bold", fontSize=11.2, leading=13.8, textColor=GREEN_2, spaceBefore=5, spaceAfter=3),
        "part_h3": ParagraphStyle("PartH3", parent=base["Heading3"], fontName="Nunito-Bold", fontSize=9.2, leading=11.2, textColor=INK, spaceBefore=2, spaceAfter=1.5),
        "part_body": ParagraphStyle("PartBody", parent=base["BodyText"], fontName="Nunito", fontSize=8.25, leading=10.5, textColor=INK, spaceAfter=2.5),
        "part_small": ParagraphStyle("PartSmall", parent=base["BodyText"], fontName="Nunito", fontSize=7.45, leading=9.4, textColor=MUTED, spaceAfter=2.5),
        "part_bullet": ParagraphStyle("PartBullet", parent=base["BodyText"], fontName="Nunito", fontSize=7.9, leading=10.1, textColor=INK, leftIndent=9, firstLineIndent=-6, spaceAfter=2.5),
        "part_step": ParagraphStyle("PartStep", parent=base["BodyText"], fontName="Nunito", fontSize=7.9, leading=10.1, textColor=INK, leftIndent=12, firstLineIndent=-12, spaceAfter=2.5),
        "part_callout": ParagraphStyle("PartCallout", parent=base["BodyText"], fontName="Nunito", fontSize=8.1, leading=10.4, textColor=GREEN, spaceAfter=0),
        "tag": ParagraphStyle("Tag", parent=base["BodyText"], fontName="Nunito-Bold", fontSize=8.5, leading=10.8, textColor=GREEN_2, alignment=TA_CENTER),
        "callout": ParagraphStyle("Callout", parent=base["BodyText"], fontName="Nunito", fontSize=9.8, leading=13.8, textColor=GREEN, spaceAfter=0),
        "center": ParagraphStyle("Center", parent=base["BodyText"], fontName="Nunito", fontSize=8.7, leading=11.5, alignment=TA_CENTER, textColor=MUTED),
    }


class DotRule(Flowable):
    def __init__(self, color=LINE, thickness=0.8, space=7):
        super().__init__()
        self.color = color
        self.thickness = thickness
        self.spaceBefore = space
        self.spaceAfter = space
        self.height = 1

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self._availWidth, 0)

    def wrap(self, availWidth, availHeight):
        self._availWidth = availWidth
        return availWidth, 1


def bullet(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(f"- {clean(text)}", style)


def boxed(flowables: list[Flowable], background=CREAM, border=GOLD_SOFT, padding=10, width=None) -> Table:
    table = Table([[flowables]], colWidths=[width or PAGE_W - 36 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.7, border),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
    ]))
    return table


def metadata(lesson: dict) -> dict:
    meta = lesson.get("meta", {})
    return {
        "title": meta.get("title", "Clase de informática"),
        "number": str(meta.get("number") or {"Primera": "01", "Segunda": "02", "Tercera": "03", "Cuarta": "04", "Quinta": "05"}.get(meta.get("ordinal"), "00")),
        "slug": meta.get("slug", "clase"),
        "ordinal": meta.get("ordinal", "Clase"),
    }


def draw_leaf(canvas, x, y, scale=1.0, color=SAGE):
    canvas.saveState()
    canvas.setFillColor(color)
    canvas.translate(x, y)
    canvas.rotate(28)
    canvas.ellipse(-4 * scale, -10 * scale, 4 * scale, 10 * scale, fill=1, stroke=0)
    canvas.restoreState()


def cover_callback(lesson: dict, grade: int, owls: list[Path]):
    meta = metadata(lesson)

    def draw(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#FBFCF8"))
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(GREEN)
        canvas.rect(0, PAGE_H - 44 * mm, PAGE_W, 44 * mm, fill=1, stroke=0)
        canvas.setFillColor(GOLD)
        canvas.roundRect(18 * mm, PAGE_H - 30 * mm, 47 * mm, 9 * mm, 4.5 * mm, fill=1, stroke=0)
        canvas.setFont("Nunito-Bold", 9)
        canvas.setFillColor(GREEN)
        canvas.drawCentredString(41.5 * mm, PAGE_H - 26.8 * mm, "MATERIAL SIN CONEXIÓN")

        logo = str(ASSETS / "school-logo.png")
        canvas.drawImage(logo, PAGE_W - 42 * mm, PAGE_H - 37 * mm, 25 * mm, 29 * mm, preserveAspectRatio=True, mask="auto", anchor="c")

        canvas.setFillColor(GREEN)
        canvas.roundRect(17 * mm, 28 * mm, PAGE_W - 34 * mm, PAGE_H - 91 * mm, 7 * mm, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor("#FFFDF7"))
        canvas.roundRect(19 * mm, 30 * mm, PAGE_W - 38 * mm, PAGE_H - 95 * mm, 6 * mm, fill=1, stroke=0)
        draw_leaf(canvas, 31 * mm, PAGE_H - 64 * mm, 1.0, GOLD_SOFT)
        draw_leaf(canvas, 39 * mm, PAGE_H - 60 * mm, 0.75, SAGE)
        draw_leaf(canvas, PAGE_W - 30 * mm, 50 * mm, 1.0, GOLD_SOFT)
        draw_leaf(canvas, PAGE_W - 39 * mm, 45 * mm, 0.75, SAGE)

        canvas.drawImage(str(owls[0]), PAGE_W - 77 * mm, 39 * mm, 53 * mm, 55 * mm, preserveAspectRatio=True, mask="auto")
        canvas.setFillColor(GREEN_2)
        canvas.setFont("Nunito-Bold", 9)
        canvas.drawString(31 * mm, PAGE_H - 73 * mm, f"INFORMÁTICA · GRADO {grade_word(grade).upper()}")
        canvas.setFillColor(GOLD)
        canvas.setFont("Nunito-Bold", 46)
        canvas.drawString(30 * mm, PAGE_H - 102 * mm, meta["number"])
        canvas.setFillColor(GREEN)
        canvas.setFont("Nunito-Bold", 25)
        title_lines = wrap_canvas_text(meta["title"], 23, PAGE_W - 75 * mm)
        y = PAGE_H - 121 * mm
        for line in title_lines:
            canvas.drawString(31 * mm, y, line)
            y -= 10 * mm
        canvas.setFillColor(MUTED)
        canvas.setFont("Nunito", 11)
        canvas.drawString(31 * mm, y - 3 * mm, "Guía didáctica de apoyo al docente")
        canvas.setFillColor(GREEN)
        canvas.setFont("Nunito-Bold", 9)
        canvas.drawString(31 * mm, 42 * mm, "CLASE COMPLETA · 60 A 120 MINUTOS")
        canvas.setFont("Nunito", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(31 * mm, 35 * mm, "Explicación, práctica, evaluación y material de apoyo")
        canvas.restoreState()

    return draw


def later_callback(lesson: dict, grade: int, owls: list[Path]):
    meta = metadata(lesson)

    def draw(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#FBFCF8"))
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(GREEN)
        canvas.rect(0, PAGE_H - 17 * mm, PAGE_W, 17 * mm, fill=1, stroke=0)
        canvas.drawImage(str(ASSETS / "school-logo.png"), 13 * mm, PAGE_H - 15 * mm, 11 * mm, 12 * mm, preserveAspectRatio=True, mask="auto")
        canvas.setFont("Nunito-Bold", 8)
        canvas.setFillColor(WHITE)
        canvas.drawString(28 * mm, PAGE_H - 10.7 * mm, f"GRADO {grade_word(grade).upper()} · CLASE {meta['number']} · {meta['title'].upper()}")
        draw_leaf(canvas, PAGE_W - 18 * mm, PAGE_H - 8 * mm, 0.45, GOLD)
        canvas.setStrokeColor(LINE)
        canvas.line(17 * mm, 15 * mm, PAGE_W - 17 * mm, 15 * mm)
        canvas.setFont("Nunito", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(17 * mm, 9.5 * mm, "Aula Interactiva · Guía docente sin conexión")
        canvas.setFont("Nunito-Bold", 8)
        canvas.drawRightString(PAGE_W - 17 * mm, 9.5 * mm, str(doc.page))

        # The mascot accompanies the teacher without covering the lesson.
        pose = owls[(doc.page - 1) % len(owls)]
        accent = GOLD_SOFT if doc.page % 2 else SAGE
        if doc.page % 2:
            canvas.setFillColor(accent)
            canvas.circle(PAGE_W + 1 * mm, 33 * mm, 18 * mm, fill=1, stroke=0)
            draw_leaf(canvas, PAGE_W - 24 * mm, 33 * mm, 0.52, GREEN_2)
            draw_leaf(canvas, PAGE_W - 19 * mm, 39 * mm, 0.38, GOLD)
            canvas.drawImage(str(pose), PAGE_W - 24 * mm, 19 * mm, 29 * mm, 32 * mm, preserveAspectRatio=True, mask="auto")
        else:
            canvas.setFillColor(accent)
            canvas.circle(-1 * mm, 35 * mm, 18 * mm, fill=1, stroke=0)
            draw_leaf(canvas, 22 * mm, 34 * mm, 0.52, GREEN_2)
            draw_leaf(canvas, 17 * mm, 41 * mm, 0.38, GOLD)
            canvas.drawImage(str(pose), -5 * mm, 20 * mm, 29 * mm, 32 * mm, preserveAspectRatio=True, mask="auto")
        canvas.restoreState()

    return draw


def grade_word(grade: int) -> str:
    return {1: "Primero", 2: "Segundo", 3: "Tercero"}[grade]


def wrap_canvas_text(text: str, font_size: float, width: float) -> list[str]:
    words = text.split()
    lines, current = [], ""
    for word in words:
        probe = f"{current} {word}".strip()
        if pdfmetrics.stringWidth(probe, "Nunito-Bold", font_size) <= width:
            current = probe
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]


def lesson_description(lesson: dict) -> str:
    return plain(lesson.get("intro") or lesson.get("summary") or "Una clase para comprender, practicar y explicar lo aprendido.")


def concept_steps(part: dict) -> list[dict]:
    return [step for step in part.get("steps", []) if step.get("body")]


def practice_steps(part: dict) -> list[dict]:
    return [step for step in part.get("steps", []) if step.get("game") or step.get("instruction")]


def cards_for_lesson(lesson: dict) -> list[tuple[str, str]]:
    cards = []
    for part in lesson.get("parts", []):
        for step in concept_steps(part)[:2]:
            bodies = step.get("body", [])
            summary = plain(bodies[0]) if bodies else plain(step.get("prompt", ""))
            cards.append((plain(step.get("title", "Idea clave")), summary))
    return cards[:8]


def build_story(lesson: dict, grade: int, style: dict[str, ParagraphStyle], guide: dict) -> list[Flowable]:
    meta = metadata(lesson)
    story: list[Flowable] = [Spacer(1, 235 * mm), PageBreak()]
    story += [Paragraph("Planeación de la clase", style["h1"])]
    story.append(boxed([
        Paragraph("PROPÓSITO", style["tag"]),
        Spacer(1, 2 * mm),
        Paragraph(clean(guide["intro"]), style["callout"]),
    ], background=CREAM, border=GOLD_SOFT))
    story += [Spacer(1, 4 * mm), Paragraph("Objetivos de aprendizaje", style["h2"])]
    for item in guide["objectives"]:
        story.append(bullet(item, style["bullet"]))
    story += [Paragraph("Materiales", style["h2"])]
    materials = [[Paragraph(f"<b>{i + 1:02d}</b>", style["tag"]), Paragraph(clean(item), style["body"])] for i, item in enumerate(guide["materials"])]
    material_table = Table(materials, colWidths=[12 * mm, PAGE_W - 52 * mm], hAlign="LEFT")
    material_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, -1), SAGE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(material_table)
    story += [Paragraph("Ruta sugerida · 60 a 120 minutos", style["h2"])]
    route = [
        ("10 min", "Inicio", "Activar ideas previas y presentar el propósito."),
        ("40-70 min", "Desarrollo", "Recorrer las cuatro partes con explicación y práctica."),
        ("15-25 min", "Misión integrada", "Resolver el reto final sin conexión."),
        ("10 min", "Cierre", "Explicar lo aprendido y registrar evidencias."),
    ]
    route_table = Table([[Paragraph(f"<b>{a}</b>", style["small"]), Paragraph(f"<b>{b}</b><br/>{c}", style["small"])] for a, b, c in route], colWidths=[24 * mm, PAGE_W - 64 * mm], hAlign="LEFT")
    route_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story.append(route_table)
    story.append(Spacer(1, 3 * mm))
    story.append(boxed([Paragraph("Antes de comenzar", style["h3"]), Paragraph("Revise los materiales, prepare ejemplos ficticios cuando corresponda y decida qué momentos hará todo el grupo y cuáles realizará por equipos. No es necesario reproducir una pantalla: la guía convierte cada concepto en una experiencia observable.", style["body"])], background=SKY, border=colors.HexColor("#BDD3DD"), padding=9))

    parts = lesson.get("parts", [])
    for index, part in enumerate(parts):
        offline = guide["activities"][index]
        part_name = plain(part.get("name") or part.get("title"))
        intention = plain(part.get("description") or "")
        if not intention:
            intention = (
                f"Integrar lo aprendido sobre {part_name.lower()} y explicarlo con evidencias."
                if "final" in part_name.lower()
                else f"Comprender {part_name.lower()} y demostrarlo mediante una explicación y una práctica guiada."
            )
        story.append(PageBreak())
        story.append(Paragraph(f"PARTE {index + 1:02d} · {part_name}", style["tag"]))
        story.append(Paragraph(part_name, style["h1"]))
        story.append(boxed([
            Paragraph("INTENCIÓN DE ESTE MOMENTO", style["tag"]),
            Paragraph(clean(intention), style["callout"]),
        ], background=SAGE, border=colors.HexColor("#C6D8C2"), padding=8))
        left: list[Flowable] = [Paragraph("Explicación para el grupo", style["part_h2"])]
        concepts = concept_steps(part)
        split_at = 4 if part.get("id") == "ventanas" else 5
        rebalance = len(concepts) > 6 or part.get("id") == "ventanas"
        left_concepts = concepts[:split_at] if rebalance else concepts
        continued_concepts = concepts[split_at:] if rebalance else []
        for step in left_concepts:
            body = " ".join(clean(value) for value in step.get("body", []))
            chunk = [Paragraph(clean(step.get("title", "Idea clave")), style["part_h3"]), Paragraph(body, style["part_body"])]
            if step.get("prompt"):
                chunk.append(Paragraph(f"<b>Demostración:</b> {clean(step['prompt'])}", style["part_small"]))
            left.extend(chunk)
            left.append(DotRule(space=2))
        if not concepts:
            left.append(Paragraph("Presente la idea con un ejemplo visible, pida una predicción y compruebe el resultado con el grupo.", style["part_body"]))

        practices = practice_steps(part)
        right: list[Flowable] = []
        if continued_concepts:
            right.append(Paragraph("Continuamos la explicación", style["part_h2"]))
            for step in continued_concepts:
                body = " ".join(clean(value) for value in step.get("body", []))
                right.append(Paragraph(clean(step.get("title", "Idea clave")), style["part_h3"]))
                right.append(Paragraph(body, style["part_body"]))
                if step.get("prompt"):
                    right.append(Paragraph(f"<b>Demostración:</b> {clean(step['prompt'])}", style["part_small"]))
                right.append(DotRule(space=2))
        if practices:
            right.append(Paragraph("Qué se practica en la versión digital", style["part_h2"]))
            for step in practices:
                instruction = plain(step.get("instruction") or step.get("prompt") or "")
                right.append(bullet(f"{plain(step.get('title', 'Práctica'))}: {instruction}", style["part_bullet"]))

        offline_flow: list[Flowable] = [
            Paragraph(f"ACTIVIDAD SIN INTERNET · {clean(offline['title'])}", style["part_h2"]),
            Paragraph(f"<b>Materiales:</b> {clean(offline['materials'])}", style["part_body"]),
        ]
        for step_index, instruction in enumerate(offline["steps"], 1):
            offline_flow.append(Paragraph(f"<b>{step_index}.</b> {clean(instruction)}", style["part_step"]))
        offline_flow.append(Paragraph(f"<b>Evidencia:</b> {clean(offline['evidence'])}", style["part_callout"]))
        right.append(Spacer(1, 2 * mm))
        right.append(boxed(offline_flow, background=CREAM, border=GOLD, padding=7, width=78 * mm))
        right.append(Paragraph("Comprobación rápida", style["part_h2"]))
        right.append(bullet(f"Pide explicar con sus palabras qué significa «{part_name}».", style["part_bullet"]))
        right.append(bullet("Presenta un ejemplo correcto y otro con un error; el grupo indica cuál funciona y por qué.", style["part_bullet"]))
        right.append(bullet("Registra si lo realiza de manera autónoma, con una pista o con acompañamiento.", style["part_bullet"]))

        columns = Table([[left, right]], colWidths=[84 * mm, 84 * mm], hAlign="CENTER")
        columns.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 6),
            ("LEFTPADDING", (1, 0), (1, 0), 6),
            ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ("LINEAFTER", (0, 0), (0, 0), 0.5, LINE),
        ]))
        story.append(columns)

    story.append(PageBreak())
    story += [Paragraph("Cierre, evaluación y continuidad", style["h1"])]
    story.append(boxed([
        Paragraph("PUESTA EN COMÚN", style["tag"]),
        Paragraph(f"Vuelvan a la pregunta central: ¿qué aprendimos en la clase «{clean(meta['title'])}» y cómo lo comprobamos? Solicite ejemplos, no solo definiciones.", style["callout"]),
    ], background=SKY, border=colors.HexColor("#BDD3DD")))
    story += [Paragraph("Preguntas para cerrar", style["h2"])]
    close_questions = [
        "¿Qué idea nueva podrías explicarle a otro compañero?",
        "¿Qué paso fue necesario repetir o corregir?",
        "¿Qué evidencia te permitió saber que la solución funcionaba?",
        "¿En qué otra situación podrías usar lo aprendido?",
    ]
    for question in close_questions:
        story.append(bullet(question, style["bullet"]))

    story += [Paragraph("Lista de observación docente", style["h2"])]
    rows = [[Paragraph("Indicador", style["h3"]), Paragraph("A", style["tag"]), Paragraph("AP", style["tag"]), Paragraph("AA", style["tag"])]]
    for objective in guide["objectives"][:5]:
        rows.append([Paragraph(clean(objective), style["small"]), Paragraph("[ ]", style["center"]), Paragraph("[ ]", style["center"]), Paragraph("[ ]", style["center"])])
    checklist = Table(rows, colWidths=[PAGE_W - 76 * mm, 12 * mm, 12 * mm, 12 * mm], repeatRows=1, hAlign="LEFT")
    checklist.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
        ("FONTNAME", (1, 1), (-1, -1), "Nunito"),
        ("FONTSIZE", (1, 1), (-1, -1), 11),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F5F8F3")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(checklist)
    story.append(Paragraph("A = autónomo · AP = con una pista · AA = con acompañamiento", style["small"]))

    story += [Paragraph("Apoyos y ampliación", style["h2"])]
    support_data = [
        [Paragraph("Si necesita apoyo", style["h3"]), Paragraph("Reduzca la cantidad de elementos, modele una vez, entregue una pista visual y permita repetir con el mismo material.", style["body"])],
        [Paragraph("Si está listo para avanzar", style["h3"]), Paragraph("Cambie una condición del reto y pida predecir el efecto antes de probar. Solicite que explique la estrategia a otro equipo.", style["body"])],
    ]
    support = Table(support_data, colWidths=[42 * mm, PAGE_W - 82 * mm], hAlign="LEFT")
    support.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, LINE), ("BACKGROUND", (0, 0), (0, -1), SAGE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    story.append(support)
    story += [Spacer(1, 4 * mm), boxed([Paragraph("Criterio de cierre", style["h3"]), Paragraph("La clase termina cuando los estudiantes pueden mostrar una acción o decisión y explicar por qué produce el resultado. Completar una actividad sin poder explicarla todavía requiere otra oportunidad de práctica.", style["callout"])], background=CREAM, border=GOLD_SOFT)]

    story.append(PageBreak())
    story += [Paragraph("Tarjetas de apoyo para recortar", style["h1"]), Paragraph("Recorta o copia estas tarjetas en el tablero. Sirven para recordar vocabulario, organizar equipos o iniciar la siguiente clase con un repaso.", style["body"])]
    cards = cards_for_lesson(lesson)
    card_rows = []
    for i in range(0, len(cards), 2):
        row = []
        for title, body in cards[i:i + 2]:
            short_body = body if len(body) <= 145 else body[:142].rsplit(" ", 1)[0] + "..."
            row.append([Paragraph(clean(title), style["h3"]), Spacer(1, 2 * mm), Paragraph(clean(short_body), style["small"])])
        while len(row) < 2:
            row.append("")
        card_rows.append(row)
    cards_table = Table(card_rows, colWidths=[(PAGE_W - 42 * mm) / 2] * 2, rowHeights=[42 * mm] * len(card_rows), hAlign="LEFT")
    cards_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, GREEN_2),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#8AA08E")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [CREAM, colors.HexColor("#F1F6EF")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(cards_table)
    story += [Spacer(1, 4 * mm), Paragraph("Notas del docente", style["h2"])]
    for _ in range(5):
        story.append(Spacer(1, 5 * mm))
        story.append(DotRule(color=colors.HexColor("#BFC9BF"), thickness=0.5, space=1))
    return story


def output_name(grade: int, lesson: dict) -> str:
    meta = metadata(lesson)
    return f"{grade_word(grade).lower()}-{meta['number']}-{meta['slug']}.pdf"


def generate_pdf(grade: int, lesson: dict, owls: list[Path], style: dict[str, ParagraphStyle]) -> tuple[Path, int]:
    meta = metadata(lesson)
    key = f"{grade}:{meta['slug']}"
    guide = PROFILES.get(key)
    if not guide:
        raise KeyError(f"Falta perfil pedagógico para {key}")
    output = OUTPUT / output_name(grade, lesson)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=23 * mm,
        bottomMargin=21 * mm,
        title=f"{meta['title']} - Grado {grade_word(grade)}",
        author="Gimnasio Los Cerros",
        subject="Guía didáctica sin conexión",
        creator="Aula Interactiva",
    )
    doc.build(build_story(lesson, grade, style, guide), onFirstPage=cover_callback(lesson, grade, owls), onLaterPages=later_callback(lesson, grade, owls))
    reader = PdfReader(str(output))
    pages = len(reader.pages)
    if pages < 7:
        raise RuntimeError(f"{output.name} quedó incompleto: {pages} páginas")
    with pdfplumber.open(output) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    for required in [meta["title"], "Objetivos de aprendizaje", "Lista de observación docente", "Tarjetas de apoyo"]:
        if required not in text:
            raise RuntimeError(f"Falta contenido requerido «{required}» en {output.name}")
    destination = PUBLIC_OUTPUT / output.name
    shutil.copy2(output, destination)
    return output, pages


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera las guías didácticas sin conexión.")
    parser.add_argument("--grade", type=int, choices=[1, 2, 3], help="Generar únicamente un grado y conservar el resto del manifiesto.")
    parser.add_argument("--slug", help="Generar únicamente una clase por su identificador.")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT.mkdir(parents=True, exist_ok=True)
    owls = prepare_assets()
    register_fonts()
    style = styles()
    lessons = load_lessons()
    if args.grade:
        lessons = [(grade, lesson) for grade, lesson in lessons if grade == args.grade]
    if args.slug:
        lessons = [(grade, lesson) for grade, lesson in lessons if metadata(lesson)["slug"] == args.slug]
        if not lessons:
            raise KeyError(f"No existe una clase con slug {args.slug}")
    manifest = []
    for grade, lesson in lessons:
        path, pages = generate_pdf(grade, lesson, owls, style)
        manifest.append({"grade": grade, "slug": metadata(lesson)["slug"], "file": path.name, "pages": pages, "bytes": path.stat().st_size})
        print(f"OK {path.name}: {pages} páginas")
    generated_count = len(manifest)
    manifest_path = OUTPUT / "manifest.json"
    if (args.grade or args.slug) and manifest_path.exists():
        previous = json.loads(manifest_path.read_text(encoding="utf-8")).get("guides", [])
        if args.slug:
            manifest = [item for item in previous if not (item.get("grade") == args.grade and item.get("slug") == args.slug)] + manifest
        else:
            manifest = [item for item in previous if item.get("grade") != args.grade] + manifest
        manifest.sort(key=lambda item: (item["grade"], item["file"]))
    manifest_path.write_text(json.dumps({"guides": manifest}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generadas {generated_count} guías; el manifiesto contiene {len(manifest)} en {OUTPUT}")


if __name__ == "__main__":
    main()
