'use strict';
(() => {
  const specs=[
    ['instrucciones','INF-1-C03-final-v1','Ordenamos, indicamos y comprobamos',null,['Ordena una historia','Elige la instrucción','Programa un camino','Corrige y comprueba'],['sequence-order-final','sequence-clear-final','sequence-route-final','sequence-debug-final']],
    ['instrucciones-orden','INF-1-C03-orden-v1','Pasos y orden','orden',['Ordenamos una historia','¿Qué paso falta?'],['sequence-order','sequence-missing']],
    ['instrucciones-claridad','INF-1-C03-claridad-v1','Instrucciones claras','claridad',['Elige una instrucción precisa','Construye la instrucción'],['sequence-clear','sequence-compose']],
    ['instrucciones-prueba','INF-1-C03-prueba-v1','Probamos y corregimos','prueba',['Programa el recorrido','Reparamos las instrucciones'],['sequence-route','sequence-debug']],
  ];
  for(const [lesson,version,title,part,challenges,games]of specs){
    window.ClassFinalActivities[version]={lesson,parentLesson:part?'instrucciones':undefined,part,game:part?'part-workshop':'sequence-final-v1',games:part?games.map(game=>game+'-v1'):undefined,requiresSequence:true,
      stations:games.map((_,i)=>`${part||'secuencia'}-${i+1}`),preview:{title:part?`Actividad: ${title}`:title,challenges},
      evidence(index,state){const kind=games[index];return{completed:!!state.complete,solved:state.solved||0,...(kind.includes('route')||kind.includes('debug')?{tested:!!state.tested}:{}),...(kind.includes('debug')?{repaired:!!state.repaired}:{})};},
    };
  }
})();
