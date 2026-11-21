'use strict';
window.SequenceScenarios={
  labels:['Preparar la tierra','Colocar la semilla','Regar con cuidado','Esperar y cuidar','Preparar el pan','Agregar el relleno','Cerrar el sándwich','Servir la merienda','Abrir Dibujo','Crear la imagen','Guardar el trabajo','Volver a abrirlo'],
  orderLevels(final,extended){return final?[{steps:[8,9,10,11],initial:[10,8,3,11,9],extra:true,title:'Prepara los pasos para crear, guardar y recuperar un dibujo. Hay una tarjeta que no necesitas.'}]:[
    {steps:[4,5,6],initial:[6,4,5],title:'Prepara el sándwich: empieza por el pan y termina al cerrarlo.'},
    {steps:[8,9,10,11],initial:[10,11,8,9],title:'Del programa al archivo: crea, guarda y vuelve a abrir tu dibujo.'},
    ...extended?[{steps:[0,1,2,3],initial:[0,2,1,3],title:'Dos acciones cambiaron de lugar. Corrige la historia de la semilla.'}]:[],
  ];},
  missingLevels(extended){return[
    {steps:[0,1,2,3],missing:2,title:'La semilla está sembrada. ¿Qué cuidado falta antes de esperar el brote?'},
    {steps:[4,5,6,7],missing:6,title:'La merienda tiene pan y relleno. ¿Qué falta antes de servirla?'},
    {steps:[8,9,10,11],missing:10,title:'Ya dibujamos. ¿Qué falta para poder recuperar el trabajo después?'},
    ...extended?[{steps:[0,1,2,3],missing:1,title:'Preparamos la tierra. ¿Qué necesitamos colocar antes de regar?'}]:[],
  ];},
  routeMaps:[
    {id:'flor-para-el-ave',title:'Una flor para el ave',goalText:'Recoge la flor y llévala al ave.',theme:'garden',cols:5,rows:3,start:[0,2],goal:[4,0],rocks:[[1,2],[3,1]],target:'bird',items:[{id:'flower',label:'Flor',at:[2,1]}]},
    {id:'merienda-del-conejo',title:'La merienda del conejo',goalText:'Recoge la manzana antes de llegar al conejo.',theme:'orchard',cols:4,rows:5,start:[3,4],goal:[0,0],rocks:[[2,4],[2,3],[1,1]],target:'rabbit',items:[{id:'apple',label:'Manzana',at:[1,3]}]},
    {id:'visita-al-estanque',title:'Visita al estanque',goalText:'Recoge la flor y la manzana. Después visita a la rana.',theme:'pond',cols:6,rows:3,start:[0,1],goal:[5,1],rocks:[[2,1],[3,1]],target:'frog',items:[{id:'flower',label:'Flor',at:[1,0]},{id:'apple',label:'Manzana',at:[4,2]}]},
  ],
  debugMaps:[
    {id:'una-flecha-de-mas',title:'La flecha que sobra',goalText:'La lechuza llega al sol, pero sigue avanzando. Quita la instrucción que sobra.',theme:'sunny',cols:3,rows:4,start:[0,3],goal:[2,3],rocks:[[1,2]],target:'sun',items:[],initial:['right','right','right'],repair:'remove'},
    {id:'el-ultimo-paso',title:'El último paso',goalText:'El programa termina antes de la flor. Agrega el movimiento que falta.',theme:'garden',cols:5,rows:2,start:[0,1],goal:[4,0],rocks:[[2,1]],target:'flower',items:[],initial:['up','right','right','right'],repair:'append'},
    {id:'la-direccion-equivocada',title:'Una dirección equivocada',goalText:'Una flecha aleja a la lechuza de la manzana. Encuentra cuál conviene reemplazar.',theme:'orchard',cols:4,rows:3,start:[3,2],goal:[0,0],rocks:[[2,2],[1,1]],target:'apple',items:[],initial:['up','left','up','right','left'],repair:'replace'},
  ],
  finalRouteMap:{id:'entrega-doble',title:'La entrega del jardín',goalText:'Recoge la manzana y la flor. Entrega ambas al ave.',theme:'garden',cols:5,rows:4,start:[0,3],goal:[4,3],rocks:[[1,3],[2,2],[3,1]],target:'bird',items:[{id:'apple',label:'Manzana',at:[2,0]},{id:'flower',label:'Flor',at:[4,1]}]},
  finalDebugMap:{id:'el-paso-olvidado',title:'El paso olvidado',goalText:'El programa se queda cerca de la flor. Complétalo y comprueba el resultado.',theme:'pond',cols:3,rows:5,start:[2,4],goal:[0,0],rocks:[[1,4],[1,3]],target:'flower',items:[],initial:['up','up','left','left','up'],repair:'append'},
  demos:{
    'test-plan':{id:'demo-plan',title:'Elegimos un plan',mode:'plan',cols:3,rows:3,start:[0,2],goal:[2,1],rocks:[[1,2]],target:'flower',queue:['up','right','right'],other:['right','right','up']},
    'test-run':{id:'demo-run',title:'Seguimos tres instrucciones',mode:'run',cols:3,rows:2,start:[0,1],goal:[2,0],rocks:[],target:'sun',queue:['up','right','right']},
    'test-result':{id:'demo-result',title:'Comparamos el resultado',mode:'result',cols:4,rows:3,start:[0,2],goal:[3,0],rocks:[[3,2]],target:'apple',queue:['right','right','up']},
    'test-error':{id:'demo-error',title:'Localizamos el problema',mode:'error',cols:4,rows:2,start:[0,1],goal:[3,1],rocks:[[1,0]],target:'bird',queue:['up','right','down','right','right','right'],fault:1},
    'test-again':{id:'demo-correct',title:'Comprobamos una corrección',mode:'correct',cols:4,rows:4,start:[3,3],goal:[0,3],rocks:[[2,3],[1,1]],target:'rabbit',queue:['left','left','left'],correct:['up','left','left','left','down']},
  },
};
