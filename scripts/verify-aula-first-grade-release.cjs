const connect=require('./aula-session-cdp.cjs');
const base='http://127.0.0.1:5182/';

(async()=>{
  const info=await(await fetch('http://127.0.0.1:9226/json/version')).json();
  const browser=await connect(info.webSocketDebuggerUrl);
  const {browserContextId}=await browser.send('Target.createBrowserContext');
  const {targetId}=await browser.send('Target.createTarget',{url:'about:blank',browserContextId});
  const page=await connect(`ws://127.0.0.1:9226/devtools/page/${targetId}`);
  await page.send('Page.enable');await page.send('Runtime.enable');await page.viewport(1440,900);
  const check=(expression,name)=>page.check(expression,name);
  try{
    await page.navigate(`${base}#/grados`);
    await page.until("document.querySelectorAll('.grade-card').length===5");
    await check("document.querySelectorAll('.grade-card').length===5",'Se muestran los cinco grados');
    await check("document.querySelector('.grade-card[href=\"#/grado/1\"] .grade-card-footer').textContent.includes('10 clases disponibles')",'Primero anuncia sus diez clases');
    await check("[2,3,4,5].every(id=>document.querySelector(`.grade-card[href=\"#/grado/${id}\"] .grade-card-footer`).textContent.includes('En preparación'))",'Segundo a quinto aparecen en preparación');
    await page.navigate(`${base}#/grado/1`);await page.until("document.querySelectorAll('.class-card').length===10");
    await check("document.querySelectorAll('.class-card.is-available').length===10",'Las diez clases de primero están disponibles');
    for(const grade of [2,3,4,5]){
      await page.navigate(`${base}#/grado/${grade}`);await page.until("document.querySelectorAll('.class-card').length>0");
      await check("document.querySelectorAll('.class-card.is-available').length===0&&document.querySelectorAll('.open-parts').length===0",`Grado ${grade} no publica clases`);
    }
    await page.navigate(`${base}#/grado/2/clase/entorno-trabajo`);await page.sleep(200);
    await check("location.hash==='#/grado/2'&&!document.getElementById('class-dialog').open",'Un enlace oculto de segundo vuelve al listado sin abrir clase');
    if(page.errors.length)throw Error(JSON.stringify(page.errors));
    console.log('PASS corte público: únicamente grado primero');
  }finally{page.ws.close();await browser.send('Target.disposeBrowserContext',{browserContextId});browser.ws.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
