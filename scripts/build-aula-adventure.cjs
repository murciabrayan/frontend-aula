const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const project = path.resolve(__dirname, '..');
const source = path.join(project, 'public', 'aula-aventura');
const output = path.join(project, 'dist-aula-aventura');
const publishedFirstGradeGuides = new Set([
  'primero-01-exploradores-digitales.pdf', 'primero-02-partes-del-computador.pdf',
  'primero-03-tecnologia.pdf', 'primero-04-instrucciones.pdf',
  'primero-05-programacion-flechas.pdf', 'primero-06-patrones-mensajes.pdf',
  'primero-07-bucles.pdf', 'primero-08-bucles-practica.pdf',
  'primero-09-errores-programas.pdf', 'primero-10-ciudadania-digital.pdf',
]);
const offlineMaterials = fs.readdirSync(path.join(source, 'materiales-sin-conexion'))
  // El corte publico actual contiene solamente las guias de grado primero.
  // Las guias de los demas grados permanecen en el repositorio para futuros
  // lanzamientos, pero no deben terminar en el artefacto de demostracion.
  .filter(file => publishedFirstGradeGuides.has(file))
  .sort()
  .map(file => `materiales-sin-conexion/${file}`);
const files = [
  'index.html', 'catalog.css', 'catalog-data.js', 'catalog.js', 'contrast.css',
  'leccion.html', 'lesson.css', 'class-responsive.css', 'renderer.js', 'lesson-content.js', 'lesson-games.js', 'lesson.js',
  'lesson-challenges.js', 'lesson-challenges.css', 'first-grade-curriculum.js', 'first-grade-exercises.js', 'first-grade-exercises.css',
  'aula-config.js', 'session-api.js', 'teacher-access.js', 'session-ui.js', 'activity-content.js', 'sessions.css',
  'docente.html', 'teacher-sessions.js', 'alumno.html', 'student-session.js',
  'exploradores.html', 'exploradores-content.js', 'exploradores-games.js', 'exploradores.css',
  'escritorio.html', 'desktop-content.js', 'desktop-lab.js', 'desktop-games.js', 'desktop.css', 'final-activities.js', 'part-activities.js', 'assets/desktop-icons-v1.png',
  'tecnologia.html', 'technology-content.js', 'technology-engine.js', 'technology-scenarios.js', 'technology-games.js', 'technology-messages.js', 'technology-demonstrations.js', 'technology-activities.js', 'technology.css', 'assets/technology-objects-v1.png', 'assets/technology-nature-v1.png',
  'programacion-flechas.html', 'programming-first-content.js', 'programming-first-engine.js', 'programming-first-games.js', 'programming-first-demonstrations.js', 'programming-first-activities.js', 'programming-first.css', 'assets/programming-journey-v1.png',
  'continuacion-primero.html', 'first-path-content.js', 'first-path-engine.js', 'first-path-games.js', 'first-path-demonstrations.js', 'first-path-activities.js', 'first-path.css', 'assets/first-path-objects-v1.png', 'assets/digital-safety-scenes-v1.png',
  'instrucciones.html', 'sequence-content.js', 'sequence-scenarios.js', 'sequence-precision.js', 'sequence-demonstrations.js', 'sequence-games.js', 'sequence-games-v1.js', 'sequence-activities.js', 'sequence-activities-v1.js', 'sequence.css', 'assets/sequence-plant-v1.png', 'assets/sequence-stories-v2.png',
  'assets/catalog-white-v2.png', 'assets/school-logo.png', 'assets/class-transition-vignettes-v1.png', 'assets/kid-ui-icons-v1.png',
  'assets/valley-minimal-v2.png', 'assets/activity-studio.png', 'assets/owl-atlas.png', 'assets/devices-atlas-clean.png',
  'assets/learning-pictures-v1.png', 'assets/equipment-v1.png',
  'assets/animals-v3.png', 'assets/puzzle-garden-v3.png', 'assets/puzzle-classroom-v3.png',
  'assets/nunito-regular.ttf', 'assets/nunito-bold.ttf', 'assets/OFL-Nunito.txt',
  'assets/favicon.svg',
  ...offlineMaterials,
];

try {
  const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
  if (!html.includes('lang="es"') || !html.includes('id="catalog-main"')) throw Error('La entrada del catálogo no es válida.');
  const lesson = fs.readFileSync(path.join(source, 'leccion.html'), 'utf8');
  if (!lesson.includes('id="adventure"')) throw Error('La entrada de la lección no es válida.');
  const runtimeConfig = require('./aula-runtime-config.cjs')(project, process.argv.includes('--local-api') ? '' : undefined);
  for (const file of files.filter(file => file.endsWith('.js'))) new vm.Script(file === 'aula-config.js' ? runtimeConfig : fs.readFileSync(path.join(source, file), 'utf8'), { filename: file });
  // Evita que archivos de un lanzamiento anterior permanezcan en el paquete.
  // `output` es siempre la carpeta de compilacion fija dist-aula-aventura.
  fs.rmSync(output, { recursive: true, force: true });
  const manifest = files.map(file => {
    const contents = file === 'aula-config.js' ? Buffer.from(runtimeConfig) : fs.readFileSync(path.join(source, file));
    const destination = path.join(output, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, contents);
    const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
    if (hash(fs.readFileSync(destination)) !== hash(contents)) throw Error(`Falló la verificación de ${file}.`);
    return { file, bytes: contents.length, sha256: hash(contents) };
  });
  fs.writeFileSync(path.join(output, 'build-manifest.json'), JSON.stringify({ builtAt: new Date().toISOString(), files: manifest }, null, 2));
  console.log(`Aventura preparada: ${output}`);
  console.log(`${files.length} archivos verificados. Sin dependencias externas en ejecución.`);
  console.log('Para abrir: node scripts/serve-aula-adventure.cjs');
} catch (error) { console.error(error.message); process.exitCode = 1; }
