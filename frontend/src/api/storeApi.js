export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_ENABLED = Boolean(import.meta.env.DEV || API_BASE || !location.hostname.endsWith('github.io'));
let csrf='';
export const setCsrf=value=>{csrf=value||'';};
export async function api(path,{method='GET',body,raw=false}={}) {
  const response=await fetch(`${API_BASE}/api${path}`,{
    method,credentials:'include',
    headers:{...(body?{'Content-Type':raw?body.type:'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},
    body:body?(raw?body:JSON.stringify(body)):undefined,
  });
  const data=await response.json().catch(()=>({error:'서버에 연결할 수 없습니다.'}));
  if(!response.ok)throw Object.assign(new Error(data.error||'요청 실패'),{status:response.status});
  return data;
}
