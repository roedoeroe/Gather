import {readWorkspace} from './workspace-store.js';
import {resolveTabContext} from './tab-context.js';
import {resolveCaptureDestination,getCaptureSettings} from './capture-store.js';
export async function launchSourceImage(info,tab) {
  const statePromise=readWorkspace();
  const imageUrl=typeof info.srcUrl==='string'&&info.srcUrl.length<=4096?info.srcUrl:'',startedAt=Date.now();
  if(!Number.isInteger(tab?.id)||!/^https?:\/\//.test(info.pageUrl||tab.url||''))throw new Error('Open the image on a web page before saving it.');
  const state=await statePromise,{context:assignment}=await resolveTabContext(state,tab.id);
  const context=await resolveCaptureDestination(state,assignment.scanId),settings=await getCaptureSettings();
  const job={id:crypto.randomUUID(),context,startedAt,imageUrl,source:{url:info.pageUrl||tab.url,title:String(tab.title||'Source image').slice(0,500),tabId:tab.id,windowId:tab.windowId},automaticCopy:settings.automaticSourceCopy===true};
  const key='gather.sourceImage.'+job.id;
  await chrome.storage.session.set({[key]:job});
  try {await chrome.windows.create({url:chrome.runtime.getURL('source-image.html?job='+job.id),type:'popup',width:860,height:720,focused:true});}
  catch(error){await chrome.storage.session.remove(key);throw error;}
  return {id:job.id};
}
