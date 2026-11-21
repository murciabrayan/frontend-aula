'use strict';
window.TechnologyScenarios={
  sort:['leaf','pencil','rock','umbrella','tree','bicycle','cloud','phone'],
  sortExtra:['book','lamp','flashlight','battery'],
  sortFinal:['battery','cloud','book','rock','lamp','leaf'],
  puzzles:[{object:'bicycle',cols:3,rows:2,caption:'Las ruedas y el manubrio ayudan a desplazarnos y dirigir la bicicleta.'},{object:'umbrella',cols:2,rows:3,caption:'La cubierta abierta del paraguas protege lo que queda debajo.'},{object:'book',cols:4,rows:2,caption:'Las páginas conservan dibujos y palabras que podemos leer.'}],
  solutions:[
    {id:'rain',title:'Lluvia en el patio',need:'La lechuza quiere mantenerse seca. Elige una herramienta y úsala.',tool:'umbrella',options:['pencil','umbrella','phone']},
    {id:'ride',title:'Llevamos la merienda',need:'Transporta la manzana hasta el ave. Prepara el vehículo y muévelo con → o arrástralo.',tool:'bicycle',options:['book','bicycle','lamp']},
    {id:'write',title:'Una palabra en el cuaderno',need:'La lechuza quiere escribir SOL en su cuaderno. Elige la herramienta y escribe.',tool:'pencil',options:['pencil','umbrella','flashlight']},
    {id:'read',title:'Un cuento para compartir',need:'Abre un libro y recorre sus tres páginas con el grupo.',tool:'book',options:['phone','battery','book']},
  ],
  lights:[
    {id:'outage',title:'Noche sin corriente',condition:'No hay corriente eléctrica. Hay una pila con energía.',device:'flashlight',energy:'battery'},
    {id:'desk',title:'La mesa de trabajo',condition:'Es de noche y hay corriente en esta mesa.',device:'lamp',energy:'electricity'},
    {id:'day',title:'La ventana del salón',condition:'Es de día. Podemos aprovechar la luz que entra por la ventana.',device:'window',energy:null},
    {id:'depleted',title:'La pila agotada',condition:'No hay corriente. La pila marcada Agotada ya no tiene energía.',device:'flashlight',energy:'battery'},
  ],
  messages:[
    {id:'near',title:'Un compañero está cerca',condition:'Queremos avisarle ahora. El compañero está a nuestro lado.',medium:'voice',receiver:'Compañero'},
    {id:'far',title:'La familia está lejos',condition:'Necesitamos comunicar el aviso rápidamente a alguien que está lejos.',medium:'phone',receiver:'Familia'},
    {id:'group',title:'Un aviso para el salón',condition:'Todos deben poder ver el aviso cuando entren al salón.',medium:'poster',receiver:'Salón'},
    {id:'later',title:'El aviso permanece',condition:'Queremos que quien llegue más tarde también encuentre la información.',medium:'poster',receiver:'Visitantes'},
  ],
  repairs:[
    {kind:'replace',original:['book','umbrella'],received:['pencil','umbrella'],title:'Un dibujo cambió'},
    {kind:'missing',original:['battery','flashlight','book'],received:['battery',null,'book'],title:'Falta una parte'},
    {kind:'extra',original:['bicycle','apple'],received:['bicycle','pencil','apple'],title:'Llegó algo de más'},
    {kind:'replace',original:['lamp','book','pencil'],received:['lamp','book','phone'],title:'Un último cambio'},
  ],
};
