import {withHistoryLock} from './batches.js';
// Web Locks serialize session-map edits across extension pages and the worker.
export async function updateCaseSession(projectId,change){
 if(globalThis.document&&!globalThis.navigator?.locks)throw new Error('Case editing requires browser Web Locks. Update Chrome or Edge.');
 const edit=()=>withHistoryLock(async()=>{const state=(await chrome.storage.local.get('gather.workspace.v1'))['gather.workspace.v1'];if(state&&!state.projects.some(p=>p.id===projectId))throw new Error('This case was closed. Choose a current project.');const key='gather.case.'+projectId,current=(await chrome.storage.session.get(key))[key]||{},next=change(current);await chrome.storage.session.set({[key]:next});return next;});
 return globalThis.navigator?.locks?navigator.locks.request('gather-case-session-'+projectId,edit):edit();
}
