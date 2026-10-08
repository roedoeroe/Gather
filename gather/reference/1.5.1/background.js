import {trackTemporary, untrackTemporary, tabRemoved} from './tab-ownership.js';
import {handleQuick} from './quick-worker.js';
import {patchPreferences} from './preferences.js';

async function openFull(batchId) {
  const base = chrome.runtime.getURL('index.html');
  const url = base + (/^[\w-]{1,80}$/.test(batchId || '') ? '?batch='+encodeURIComponent(batchId) : '');
  const tabs = await chrome.tabs.query({url:base+'*'});
  const match = tabs.find(tab => tab.url === url);
  if (match) {
    await chrome.tabs.update(match.id,{active:true});
    await chrome.windows.update(match.windowId,{focused:true});
  } else await chrome.tabs.create({url});
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return;
  const page = sender.url?.split('?')[0];
  const full = page === chrome.runtime.getURL('index.html');
  const quick = page === chrome.runtime.getURL('popup.html');
  if((full||quick)&&message?.type==='savePreferences'&&message.patch&&typeof message.patch==='object'){
    patchPreferences(message.patch).then(()=>reply({ok:true}),error=>reply({error:error.message}));return true;
  }
  if (quick && message?.type === 'quick.open') {
    openFull(message.batchId).then(()=>reply({ok:true}),error=>reply({error:error.message})); return true;
  }
  if (quick && message?.type?.startsWith('quick.')) {
    handleQuick(message).then(reply,error=>reply({error:error.message})); return true;
  }
  if (!full || !sender.tab || !['trackTab','untrackTab'].includes(message?.type) || !Number.isInteger(message.tabId)) return;
  const action = message.type === 'trackTab' ? trackTemporary : untrackTemporary;
  action(message.tabId,sender.tab.id).then(()=>reply({ok:true}),()=>reply({ok:false}));return true;
});
chrome.tabs.onRemoved.addListener(id=>{tabRemoved(id).catch(()=>{});});
