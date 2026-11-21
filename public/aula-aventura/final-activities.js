'use strict';
// Stable published versions: old sessions keep their original activity and goals.
window.ClassFinalActivities={
  'INF-1-C01-final-v3':{
    lesson:'partes-del-computador',game:'final',stations:['puzzle','drawing','maze','creation'],
    preview:{title:'Practiquemos con el computador',challenges:['Puzle del computador','Dibujo del ave','Laberinto con flechas','Creación de una escena']},
    evidence(index,s){
      if(index===0)return{pieces:s.placed?.length||0};
      if(index===1)return{points:s.count||0};
      if(index===2)return{goal:!!s.won,key:!!s.collected?.includes('key'),star:!!s.collected?.includes('star')};
      return{stickers:Object.keys(s.placed||{}).length,edited:!!s.edited,title_confirmed:!!s.confirmed};
    },
  },
  'INF-1-C02-final-v1':{
    lesson:'escritorio',game:'desktop-final',stations:['desktop-find','desktop-open','desktop-windows','desktop-project'],
    preview:{title:'Mi primer escritorio de trabajo',challenges:['Encontrar iconos','Abrir programas','Organizar ventanas','Crear, guardar y recuperar un dibujo']},
    evidence(index,s){
      if(index===0)return{found:s.round||0};
      if(index===1)return{opened:s.round||0};
      if(index===2)return{actions:s.task||0};
      const p=s.lab?.project,copy=p?.saved;
      return{drawn:!!copy?.strokes?.some(stroke=>stroke.points.length>2),stamps:Math.min(2,copy?.stamps?.length||0),titled:!!copy?.title?.trim(),saved:!!copy,recovered:!!p?.recovered};
    },
  },
};
