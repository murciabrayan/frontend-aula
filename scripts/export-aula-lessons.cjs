const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = path.resolve(__dirname, '..', 'public', 'aula-aventura');
const context = {
  window: {},
  location: { search: '' },
  URLSearchParams,
  console,
  document: {
    title: '',
    documentElement: { dataset: {} },
    getElementById: () => null,
    querySelectorAll: () => [],
  },
};
context.window.window = context.window;
context.window.location = context.location;
context.window.URLSearchParams = URLSearchParams;
vm.createContext(context);

function load(file) {
  const code = fs.readFileSync(path.join(source, file), 'utf8');
  new vm.Script(code, { filename: file }).runInContext(context);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const first = [];
// Exploradores reuses the shared picture dictionary initialized by the
// original first-grade lesson content.
load('lesson-content.js');
load('exploradores-content.js');
context.window.ComputerClass.meta = {
  title: 'Exploradores digitales', ordinal: 'Primera', number: '01', slug: 'exploradores-digitales',
};
first.push(clone(context.window.ComputerClass));

load('lesson-content.js');
context.window.ComputerClass.meta = {
  title: 'Uso del teclado y del mouse', ordinal: 'Segunda', number: '02', slug: 'partes-del-computador',
};
first.push(clone(context.window.ComputerClass));

load('technology-content.js');
context.window.ComputerClass.meta = {title:'Tecnología y evolución',ordinal:'Tercera',number:'03',slug:'tecnologia'};
first.push(clone(context.window.ComputerClass));
load('sequence-content.js');
context.window.ComputerClass.meta = {title:'Algoritmos',ordinal:'Cuarta',number:'04',slug:'instrucciones'};
first.push(clone(context.window.ComputerClass));
load('programming-first-content.js');
context.window.ComputerClass.meta = {title:'Bloques de dirección',ordinal:'Quinta',number:'05',slug:'programacion-flechas'};
first.push(clone(context.window.ComputerClass));

load('first-path-content.js');
for (const lesson of Object.values(context.window.FirstPathClasses)) first.push(clone(lesson));

load('second-grade-content.js');
const second = Object.values(context.window.SecondGradeClasses).map(clone);

load('third-grade-content.js');
const third = Object.values(context.window.ThirdGradeClasses).map(clone);

process.stdout.write(JSON.stringify({ first, second, third }));
