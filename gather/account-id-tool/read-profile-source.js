// Serialized by chrome.scripting: this function must have no module closures.
// Runs only after an explicit lookup, in the already-authorized profile tab.
export async function readProfileSource(){
  const url=location.href,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal});
    if(!response.ok)return {error:'The profile source returned HTTP '+response.status+'. Reload the profile, then retry.'};
    if(!response.body)return {error:'The profile returned no readable source. Reload it, then retry.'};
    const reader=response.body.getReader(),decoder=new TextDecoder();let html='';
    try{
      for(;;){const {done,value}=await reader.read();if(done)break;html+=decoder.decode(value,{stream:true});if(html.length>15000000){await reader.cancel();return {error:'The profile source exceeds Gather’s reading limit.'};}}
      html+=decoder.decode();
    }finally{reader.releaseLock();}
    if(location.href!==url)return {error:'The page changed during lookup. Open the intended profile and retry.'};
    return {html,url:response.url};
  }catch(error){return {error:error.name==='AbortError'?'Reading the profile source timed out. Reload the profile, then retry.':'The site did not allow Gather to read its profile source. Reload the profile, then retry.'};}
  finally{clearTimeout(timer);}
}
