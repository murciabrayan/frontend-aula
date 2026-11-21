'use strict';
(() => {
  // Each published part contains its existing classroom exercises in base mode.
  const specs=[
    ['partes-del-computador','monitor','INF-1-C01-monitor-v1','La pantalla',['¿Qué muestra la pantalla?','¿Qué cambió en la escena?','Encuentra las parejas'],['screen-sort','observe','memory']],
    ['partes-del-computador','mouse','INF-1-C01-mouse-v1','El mouse',['Descubre el dibujo','Dibujamos punto por punto','Cuidemos el jardín','Reconstruimos la ilustración'],['reveal','trace','context','jigsaw']],
    ['partes-del-computador','keyboard','INF-1-C01-keyboard-v1','El teclado',['Encuentra la tecla','Escribimos y corregimos','Caminos con objetivos'],['find-key','copy','maze']],
    ['escritorio','escritorio','INF-1-C02-escritorio-v1','El escritorio',['Encuentra el icono','Un escritorio diferente'],['desktop-search','desktop-layout']],
    ['escritorio','programas','INF-1-C02-programas-v1','Iconos y programas',['La herramienta adecuada','Creamos dentro de un programa','Herramientas, carpetas y trabajos'],['desktop-launch','desktop-paint','desktop-classify']],
    ['escritorio','ventanas','INF-1-C02-ventanas-v1','Ventanas y trabajos',['Cada control tiene una función','Encuentra el archivo'],['desktop-windows','desktop-files']],
  ];
  const results={
    'screen-sort':s=>({rounds:(s.round??-1)+1}),observe:s=>({scenes:(s.round??-1)+1}),memory:s=>({levels:(s.level??-1)+1,pairs:(s.matched?.length||0)/2}),
    reveal:s=>({zones:s.cleared?.length||0}),trace:s=>({drawings:(s.level??-1)+1,points:s.count||0}),context:s=>({actions:s.effects?.length||0}),jigsaw:s=>({levels:(s.level??-1)+1,pieces:s.placed?.length||0}),
    'find-key':s=>({models:(s.round??-1)+1}),copy:s=>({models:(s.round??-1)+1}),maze:s=>({levels:(s.level??-1)+1,goal:!!s.won,key:!!s.collected?.includes('key')}),
    'desktop-search':s=>({found:s.round||0}),'desktop-layout':s=>({actions:s.task||0}),'desktop-launch':s=>({opened:s.round||0}),
    'desktop-paint':s=>({drawn:!!s.lab?.project?.strokes?.some(stroke=>stroke.points.length>2),stamps:Math.min(2,s.lab?.project?.stamps?.length||0)}),
    'desktop-classify':s=>({placed:s.placed?.length||0}),'desktop-windows':s=>({actions:s.task||0}),'desktop-files':s=>({found:s.round||0}),
  };
  for(const [parentLesson,part,version,title,challenges,games] of specs){
    window.ClassFinalActivities[version]={lesson:`${parentLesson}-${part}`,parentLesson,part,game:'part-workshop',requiresDesktop:parentLesson==='escritorio',games,
      stations:games.map((_,i)=>`${part}-${i+1}`),preview:{title:`Actividad: ${title}`,challenges},
      evidence(index,state){return{completed:!!state.complete,...results[games[index]](state)};},
    };
  }
  window.PublishedClassActivities=()=>Object.values(window.ClassFinalActivities).filter((item,index,items)=>!items.slice(index+1).some(other=>other.lesson===item.lesson));
  window.ClassPartActivity=(lesson,part)=>window.PublishedClassActivities().find(item=>part==='repaso'?item.lesson===lesson:item.parentLesson===lesson&&item.part===part);
})();
