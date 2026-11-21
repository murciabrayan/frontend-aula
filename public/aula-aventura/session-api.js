'use strict';
(() => {
  const origin=(window.AULA_CONFIG?.apiOrigin||'').replace(/\/+$/,'');
  class ApiError extends Error { constructor(message,status){super(message);this.status=status;} }
  async function request(path,{method='GET',body,credential,teacher=false,retry=true}={}) {
    const headers={Accept:'application/json'};
    if(body!==undefined)headers['Content-Type']='application/json';
    if(credential)headers.Authorization=`Participation ${credential}`;
    else if(teacher){const token=localStorage.getItem('access_token');if(token)headers.Authorization=`Bearer ${token}`;}
    let response;
    try { response=await fetch(`${origin}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body),credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)}); }
    catch { throw new ApiError('No pudimos conectar. Comprueba la conexión y vuelve a intentar.',0); }
    if(response.status===401&&teacher&&retry&&localStorage.getItem('refresh_token')){
      try {
        const tokens=await request('/api/token/refresh/',{method:'POST',body:{refresh:localStorage.getItem('refresh_token')}});
        localStorage.setItem('access_token',tokens.access);
        return request(path,{method,body,teacher,retry:false});
      } catch(error) { if(![401,403].includes(error.status))throw error; }
    }
    let data;
    try { data=response.status===204?null:await response.json(); }
    catch { throw new ApiError('El servicio de actividades no está disponible. Intenta nuevamente.',response.status); }
    if(!response.ok){const value=data?.detail||Object.values(data||{})[0];throw new ApiError(Array.isArray(value)?value.join(' '):typeof value==='string'?value:'No pudimos completar esta acción.',response.status);}
    return data;
  }
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.AulaAPI={request,ApiError,escape,activities:window.ClassFinalActivities,version:'INF-1-C01-final-v3',stations:['puzzle','drawing','maze','creation']};
})();
