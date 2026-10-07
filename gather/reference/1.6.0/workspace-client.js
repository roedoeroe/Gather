export async function request(type,data={}){
  const response=await chrome.runtime.sendMessage({type,...data});
  if(!response||response.error)throw new Error(response?.error||'Gather is unavailable. Reload the extension.');
  return response;
}
export const act=action=>request('workspace.action',{action});
export function downloadFile(name,data,type='application/json'){
  const blob=new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
