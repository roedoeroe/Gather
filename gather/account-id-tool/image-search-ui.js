import {shareImage} from './capture-output.js';
export function imageSearchControl(id,report){
 const button=document.createElement('button');button.type='button';button.textContent='Reverse image search';
 button.onclick=async()=>{button.disabled=true;try{await shareImage(id);await chrome.tabs.create({url:chrome.runtime.getURL('image-search.html?id='+encodeURIComponent(id))});}catch(error){report(error.message);}finally{button.disabled=false;}};
 return button;
}
