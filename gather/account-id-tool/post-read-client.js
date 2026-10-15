import {parsePostTimestamp} from './post-date.js';
import {normalizeLookup} from './core.js';
export async function readPostDate(tabId,url){
  const post=normalizeLookup(url);if(!post.content)throw Error('Open an individual post, reel or video first.');
  const check=async()=>{const tab=await chrome.tabs.get(tabId);if(normalizeLookup(tab.url).key!==post.key||tab.pendingUrl&&normalizeLookup(tab.pendingUrl).key!==post.key)throw Error('The post changed. Run Get real post date again.');};
  await check();
  const loaded=await chrome.scripting.executeScript({target:{tabId},world:'ISOLATED',files:['profile-reader.js']});
  const documentId=loaded[0]?.documentId;if(!documentId)throw Error('Could not read this page. Reopen Gather from the browser toolbar.');
  const rows=await chrome.scripting.executeScript({target:{tabId,documentIds:[documentId]},world:'ISOLATED',func:async function(url){return globalThis.__gatherPostDateReader(url);},args:[url]});
  await check();
  if(rows[0]?.documentId!==documentId)throw Error('The page changed while its date was being read.');
  const result=rows[0]?.result,allowed=['value','precision','timezone','raw','method','postUrl','platform','checkedAt','error'];
  if(!result||typeof result!=='object'||Array.isArray(result)||JSON.stringify(result).length>4096||Object.keys(result).some(k=>!allowed.includes(k))||Object.values(result).some(v=>typeof v==='string'&&v.length>2048))throw Error('The page returned invalid date information.');
  if(result.error){if(typeof result.error!=='string'||result.value)throw Error('Invalid date response.');return result;}
  if(!['date','minute','second'].includes(result.precision)||typeof result.value!=='string'||result.postUrl!==post.url||result.platform!==post.platform||!Number.isSafeInteger(result.checkedAt)||!['UTC','not supplied'].includes(result.timezone))throw Error('The page returned invalid date information.');
  if(!parsePostTimestamp(result.value)||typeof result.method!=='string'||typeof result.raw!=='string')throw Error('Invalid date response.');
  return result;
}
