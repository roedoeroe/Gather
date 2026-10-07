import './test-worker-chrome.js';
import './background.js';
import {parseIntake} from './case-model.js';
import {listSubjects, selectSubject, resolveCaptureDestination, beginCapture, completeCapture,
  snapshotCaptureBundle, hashBytes, writeCaptureSetting} from './capture-store.js';
import {createFullBackup, readFullBackup, stageFullRestore} from './capture-backup.js';
import {projectSignature} from './case-close.js';
import {reduceWorkspace} from './workspace-model.js';

const generation = crypto.randomUUID();
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
async function runtime(message, page = 'workspace.html') {
  return new Promise(resolve => {
    const handled = chrome.runtime.onMessage.emit(message, {id:chrome.runtime.id,url:chrome.runtime.getURL(page)}, resolve);
    if (!handled.includes(true)) resolve(null);
  });
}
async function execute({command, payload}) {
  if (command === 'runtime') return runtime(payload.message, payload.page);
  if (command === 'environment') return {generation,scope:self.constructor.name,hasDocument:typeof document !== 'undefined',hasIndexedDB:!!indexedDB};
  if(command==='pauseLookup'){testPauseLookup();return true;}
  if(command==='releaseLookup'){testReleaseLookup();return true;}
  if(command==='local')return chrome.storage.local.get(null);
  if(command==='writeLocal'){await chrome.storage.local.set(payload);return true;}
  if (command === 'tabs') return chrome.tabs.query({});
  if (command === 'session') return chrome.storage.session.get(null);
  if (command === 'caseInput') return {name:'Northbridge',scanName:'October review',mode:'ephemeral',fields:parseIntake('SOC: Alex Example\nSchool: Northbridge School')};
  if (command === 'roles') return listSubjects(payload);
  if (command === 'selectRole') return selectSubject(payload.scanId,payload.subjectId,payload.projectId);
  if (command === 'image') {
    const {state} = await runtime({type:'workspace.state'});
    const context = await resolveCaptureDestination(state,payload.scanId,payload.subjectId);
    const record = await beginCapture({context,source:{url:'https://example.test/fictional',title:'Fictional screenshot'},mode:'visible'});
    const canvas = new OffscreenCanvas(8,8); canvas.getContext('2d').fillRect(0,0,8,8);
    return completeCapture(record.id,{assets:[{role:'original',blob:await canvas.convertToBlob({type:'image/png'})}],dimensions:{width:8,height:8}});
  }
  if (command === 'bundle') {
    const bundle = await snapshotCaptureBundle();return {...bundle,assets:bundle.assets.map(({blob,...record})=>record)};
  }
  if (command === 'stageBackup') {
    const {backup} = await runtime({type:'workspace.backup'});
    const bytes = await createFullBackup(backup);
    return stageFullRestore(await readFullBackup(bytes));
  }
  if (command === 'guard') {
    const {state} = await runtime({type:'workspace.state'}), bundle = await snapshotCaptureBundle();
    return {revision:state.revision,digest:await hashBytes(new Blob([projectSignature(bundle,payload)]))};
  }
  if (command === 'pendingWrite') {
    const key='gather.workspace.v1', previous=await chrome.storage.local.get(key);
    const next=reduceWorkspace(previous[key],{type:'task.create',scanId:payload,title:'Recovered fictional task'}).state;
    await writeCaptureSetting('pending-workspace-restore',{previous,writes:{[key]:next}});return next.revision;
  }
  throw new Error('Unknown test command');
}
self.addEventListener('message', event => {
  event.waitUntil(execute(event.data).then(value=>event.ports[0].postMessage({value}),error=>event.ports[0].postMessage({error:error.message})));
});
