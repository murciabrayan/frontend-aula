'use strict';
(() => {
  for(const [lesson,part,title,challenges,games]of[
    ['tecnologia',null,'Tecnología para resolver y comunicar',['Organiza el museo','Crea una señal','Comparte tu señal','Prepara el rincón de lectura'],['technology-sort-final','technology-sign','technology-network-final','technology-project']],
    ['tecnologia-objetos','objetos','Naturaleza y objetos creados',['Clasificamos por su origen','Reconstruimos dos inventos'],['technology-sort','technology-puzzle']],
    ['tecnologia-necesidades','necesidades','Inventos y necesidades',['Usamos las herramientas','Probamos fuentes de luz'],['technology-solutions','technology-light']],
    ['tecnologia-informacion','informacion','Compartimos información',['Hacemos llegar los mensajes','Reparamos la información'],['technology-network','technology-repair']],
  ]){const version=`INF-1-C04-${part||'final'}-v1`;window.ClassFinalActivities[version]={lesson,parentLesson:part?'tecnologia':undefined,part,game:part?'part-workshop':'technology-final',games:part?games:undefined,requiresTechnology:true,stations:games.map((_,i)=>`${part||'tecnologia'}-${i+1}`),preview:{title:part?`Actividad: ${title}`:title,challenges},evidence(index,state){const kind=games[index];if(kind==='technology-sign')return{completed:!!state.complete,drawn:!!state.drawn,tool:!!state.tool};if(kind==='technology-project')return{completed:!!state.complete,tools:state.tools?.length||0,energy:state.energy==='battery',tested:!!state.tested};return{completed:!!state.complete,solved:state.solved||0};}};}
})();
