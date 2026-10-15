import {normalizeLookup} from './core.js';
import {readPostDate} from './post-read-client.js';

export function mountPostTools(host){
  const row=document.createElement('section');row.className='post-tools';row.setAttribute('aria-label','Post date');
  const get=document.createElement('button');get.type='button';get.className='text-button';get.textContent='Get real post date';
  const result=document.createElement('div');result.className='post-date-result';result.hidden=true;result.setAttribute('role','status');
  const value=document.createElement('strong'),detail=document.createElement('span'),copy=document.createElement('button');copy.type='button';copy.className='text-button';copy.textContent='Copy date';copy.hidden=true;
  result.append(value,detail,copy);row.append(get,result);host.append(row);
  let serial=0,current=null,activeTab=null,busy=false;
  const clear=()=>{serial++;current=null;result.hidden=true;copy.hidden=true;get.disabled=false;get.textContent='Get real post date';busy=false;};
  chrome.tabs.onActivated?.addListener(clear);
  chrome.tabs.onUpdated?.addListener((id,change)=>{if(id===activeTab&&(change.url||change.status==='loading'))clear();});
  get.onclick=async()=>{
    if(busy)return;const token=++serial;busy=true;current=null;copy.hidden=true;get.disabled=true;get.textContent='Reading post date…';result.hidden=false;value.textContent='';detail.textContent='Reading this post…';
    try{
      const [tab]=await chrome.tabs.query({active:true,currentWindow:true});activeTab=tab?.id;
      if(!Number.isInteger(activeTab)||!normalizeLookup(tab.url).content)throw Error('Open an individual post, reel or video, then try again.');
      const found=await readPostDate(activeTab,tab.url);if(token!==serial)return;
      if(found.error)throw Error(found.error);
      current=found;value.textContent=found.precision==='date'?found.value:(found.precision==='minute'?found.value.slice(0,16).replace('T',' ')+' UTC':found.value.replace('T',' ').replace('.000Z',' UTC').replace('Z',' UTC'));
      detail.textContent=found.precision==='date'?'Date only · time and timezone not supplied':(found.precision==='minute'?'Minute precision · ':'')+'Your local time: '+new Date(found.value).toLocaleString(undefined,{timeZoneName:'short'});
      detail.textContent+=' · '+found.method;copy.hidden=false;
    }catch(error){if(token===serial){current=null;value.textContent='';detail.textContent=error.message||'This post could not be read.';}}
    finally{if(token===serial){get.disabled=false;get.textContent='Get real post date';busy=false;}}
  };
  copy.onclick=async()=>{
    if(!current)return;const frozen=current,token=serial;
    try{await navigator.clipboard.writeText(frozen.precision==='date'?frozen.value+' (date only; time/timezone unavailable)':frozen.value+(frozen.precision==='minute'?' (minute precision)':''));if(token===serial)copy.textContent='Copied';}
    catch{if(token===serial)detail.textContent='Clipboard access was blocked. Select the displayed date and copy it manually.';}
  };
  get.addEventListener('click',()=>{copy.textContent='Copy date';});
}
