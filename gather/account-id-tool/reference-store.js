import {buildReferencePack} from './reference-model.js';
const DB='gather-reference-v1';let connection;
const req=request=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
const done=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error||new Error('The local reference write was interrupted.'));});
async function open(){
 if(!connection)connection=new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{request.result.createObjectStore('packs',{keyPath:'id'});request.result.createObjectStore('meta');};request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};request.onerror=()=>{connection=null;reject(request.error);};request.onblocked=()=>{connection=null;reject(new Error('Close older Reference windows and try again.'));};});
 return connection;
}
export async function readReferenceLibrary(){const db=await open(),tx=db.transaction(['packs','meta']),complete=done(tx);const [packs,revision]=await Promise.all([req(tx.objectStore('packs').getAll()),req(tx.objectStore('meta').get('revision'))]);await complete;return {packs,revision:revision||0};}
async function mutate(expectedRevision,change){
 const db=await open(),tx=db.transaction(['packs','meta'],'readwrite'),complete=done(tx);
 try{const revision=await req(tx.objectStore('meta').get('revision'))||0;if(revision!==expectedRevision)throw new Error('The library changed in another window. Review it and try again.');await change(tx.objectStore('packs'));tx.objectStore('meta').put(revision+1,'revision');}catch(error){tx.abort();await complete.catch(()=>{});throw error;}
 await complete;const channel=new BroadcastChannel('gather-reference');channel.postMessage('changed');channel.close();
}
export async function saveReferencePack(value,revision){const pack=buildReferencePack(value);return mutate(revision,async store=>{const all=await req(store.getAll());if(all.filter(p=>p.id!==pack.id).reduce((n,p)=>n+p.bytes,0)+pack.bytes>100*1024*1024)throw new Error('Local Reference storage is limited to 100 MiB. Remove an older collection first.');store.put(pack);});}
export function deleteReferencePack(id,revision){if(typeof id!=='string')throw new Error('Choose a collection.');return mutate(revision,store=>{store.delete(id);});}
