import {buildReferencePack,readReferencePack,searchReferences,REFERENCE_LIMITS,DEFAULT_ALIASES,excludedReference} from './reference-model.js';
import {readReferenceLibrary,saveReferencePack,deleteReferencePack} from './reference-store.js';
import {downloadVerifiedBlob} from './capture-files.js';
const host=document.getElementById('referenceLibrary');
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const button=(text,action)=>{const node=el('button',text);node.type='button';node.onclick=()=>Promise.resolve().then(action).catch(error=>status.textContent=error.message);return node;};
let snapshot={packs:[],revision:0},selected=null,ticket=0;
const heading=el('h2','Reference'),intro=el('p','Search your local reference collections. Copy exact source wording.','quiet');
const search=el('input');search.type='search';search.placeholder='e.g. no accounts, snap username';search.id='referenceSearch';search.autocomplete='off';search.setAttribute('aria-label','Search all references');
const filter=el('select');filter.setAttribute('aria-label','Reference collection');
const status=el('p','','micro');status.setAttribute('role','status');
const toolbar=el('div',undefined,'reference-search');toolbar.append(search,filter);
const results=el('div',undefined,'reference-results'),preview=el('section',undefined,'reference-preview');preview.hidden=true;
const management=el('details',undefined,'reference-management');management.append(el('summary','Manage local library'));
const collection=el('input');collection.placeholder='e.g. Client Communications';collection.maxLength=100;collection.setAttribute('aria-label','Collection name');
const version=el('input');version.placeholder='e.g. 2026-10';version.value=new Date().toISOString().slice(0,10);version.maxLength=100;version.setAttribute('aria-label','Collection version');
const folder=el('input');folder.type='file';folder.setAttribute('webkitdirectory','');folder.multiple=true;folder.hidden=true;
const packFile=el('input');packFile.type='file';packFile.accept='.json,application/json';packFile.hidden=true;
const aliases=el('textarea');aliases.rows=4;aliases.placeholder='no accounts = no findings\nsnap username = snapchat username';aliases.setAttribute('aria-label','Local aliases, one phrase = related words per line');
const controls=el('div',undefined,'reference-management-fields');const nameLabel=el('label','Collection name');nameLabel.append(collection);const versionLabel=el('label','Version');versionLabel.append(version);controls.append(nameLabel,versionLabel,button('Import Markdown folder…',()=>folder.click()),button('Import JSON pack…',()=>packFile.click()),folder,packFile);
management.append(el('p','Imports stay in this browser profile, separate from cases. Login-Info, archived, media and duplicate export folders are excluded. Case backups do not include Reference; export each collection here.','micro'),controls,aliases);
const manageActions=el('div',undefined,'export-actions');
function chosen(){const pack=snapshot.packs.find(p=>p.id===filter.value);if(!pack)throw new Error('Choose a collection first.');return pack;}
manageActions.append(button('Save local aliases',async()=>{const pack=chosen(),map={};for(const line of aliases.value.split('\n').filter(l=>l.trim())){const split=line.indexOf('=');if(split<1)throw new Error('Use phrase = related words, one per line.');const key=line.slice(0,split).trim();if(['__proto__','constructor','prototype'].includes(key))throw new Error('Invalid alias.');map[key]=line.slice(split+1).trim();}await saveReferencePack({...pack,aliases:map},snapshot.revision);await refresh();status.textContent='Local aliases saved.';}),button('Export collection…',async()=>{const {entries,excluded,...pack}=chosen();await downloadVerifiedBlob(new Blob([JSON.stringify(pack,null,2)],{type:'application/json'}),'Gather-reference-'+pack.id+'.json',{saveAs:true});status.textContent='Collection exported to a separate local file.';}));
const remove=button('Delete collection…',async()=>{const pack=chosen(),revision=snapshot.revision;if(!confirm('Remove '+pack.collection+' from Gather’s local Reference storage? Your original files and exports remain.'))return;await deleteReferencePack(pack.id,revision);await refresh();status.textContent='Collection removed from Gather’s local storage.';});remove.className='danger';manageActions.append(remove);management.append(manageActions);
host.append(heading,intro,toolbar,status,management,results,preview);
function syncAliases(){const pack=snapshot.packs.find(p=>p.id===filter.value);aliases.value=Object.entries(pack?.aliases||DEFAULT_ALIASES).map(([key,value])=>key+' = '+value).join('\n');}
function render(){
 const found=searchReferences(snapshot.packs,search.value,{collection:filter.value});results.replaceChildren();
 if(!snapshot.packs.length){results.append(el('p','Your library is empty. Open Manage local library to import a Markdown folder or JSON pack.','empty'));return;}
 if(!found.length){results.append(el('p','No matching references. Try fewer words or add a local alias.','empty'));return;}
 const fragment=document.createDocumentFragment();for(const entry of found){const row=el('article',undefined,'reference-result');const open=button(entry.title+(entry.section&&entry.section!==entry.title?' — '+entry.section:''),()=>show(entry));open.className='reference-title';row.append(open,el('p',entry.collection+' › '+entry.path+' · '+(entry.type==='example'?'Example — not a template':entry.type==='possible-template'?'Possible template':entry.type),'micro'),el('p',entry.body.replace(/\s+/g,' ').slice(0,180),'quiet'));fragment.append(row);}results.append(fragment);
}
function show(entry){
 selected=entry;preview.replaceChildren();preview.hidden=false;
 const title=el('h3',entry.section||entry.title),type=el('p',entry.type==='example'?'Example — not a template':entry.type==='possible-template'?'Possible template — review the source instructions before use':entry.type==='template'?'Template — review the source instructions before use':'Reference — source wording','reference-type');
 const body=el('pre',entry.body),copy=button('Copy exact text',async()=>{const current=await readReferenceLibrary();if(current.revision!==snapshot.revision)throw new Error('The library changed. Reopen the reference before copying.');await navigator.clipboard.writeText(entry.body);status.textContent='Source wording copied. Review before using it.';});
 const full=button('Open full reference',()=>{const file=snapshot.packs.find(p=>p.id===entry.packId)?.files.find(f=>f.path===entry.path);if(file)show({...entry,body:file.text,section:entry.title});});
 preview.append(title,type,el('p',entry.collection+' › '+entry.path+' · '+entry.version,'micro'),copy,full,button('Close preview',()=>{preview.hidden=true;search.focus();}),body);preview.scrollIntoView({block:'nearest'});copy.focus();
}
async function importPack(pack,revision){
 if(snapshot.packs.some(p=>p.id===pack.id)&&!confirm('Replace the local '+pack.collection+' collection with version '+pack.version+'? The previous local index will be replaced.'))return;
 await saveReferencePack(pack,revision);await refresh();filter.value=pack.id;syncAliases();render();status.textContent='Imported '+pack.files.length+' files · '+pack.entries.length+' sections'+(pack.excluded.length?' · '+pack.excluded.length+' excluded':'')+'. Stored only in this browser profile.';
}
folder.onchange=async()=>{const revision=snapshot.revision;try{const files=[...folder.files];if(files.length>REFERENCE_LIMITS.files)throw new Error('Choose at most 2,000 files.');const name=collection.value.trim()||files[0]?.webkitRelativePath.split('/')[0];status.textContent='Reading local Markdown files…';let bytes=0;const input=[];for(const file of files){const path=file.webkitRelativePath||file.name;if(excludedReference(path)){input.push({path,text:''});continue;}bytes+=file.size;if(file.size>REFERENCE_LIMITS.fileBytes||bytes>REFERENCE_LIMITS.totalBytes)throw new Error('Import limit: 2 MiB per file and 20 MiB per collection.');input.push({path,text:await file.text(),modified:file.lastModified});}await importPack(buildReferencePack({collection:name,version:version.value,files:input}),revision);}catch(error){status.textContent=error.message;}finally{folder.value='';}};
packFile.onchange=async()=>{const revision=snapshot.revision;try{const file=packFile.files[0];if(file){if(file.size>REFERENCE_LIMITS.totalBytes*2)throw new Error('The reference pack is too large.');await importPack(readReferencePack(await file.text()),revision);}}catch(error){status.textContent=error.message;}finally{packFile.value='';}};
async function refresh(){const serial=++ticket,current=await readReferenceLibrary();if(serial!==ticket)return;snapshot=current;const value=filter.value;filter.replaceChildren(new Option('All collections',''),...current.packs.map(p=>new Option(p.collection,p.id)));filter.value=current.packs.some(p=>p.id===value)?value:'';preview.hidden=true;selected=null;syncAliases();render();}
search.oninput=()=>{preview.hidden=true;render();};filter.onchange=()=>{preview.hidden=true;syncAliases();render();};
host.addEventListener('keydown',event=>{if(event.key==='Escape'){preview.hidden=true;search.focus();return;}if(event.target===search&&event.key==='Enter'){event.preventDefault();results.querySelector('button')?.click();}else if(event.target===search&&event.key==='ArrowDown'){event.preventDefault();results.querySelector('button')?.focus();}else if(event.target.closest('.reference-results')&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();const buttons=[...results.querySelectorAll('button')],i=buttons.indexOf(event.target);buttons[(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});
document.addEventListener('gather:view-changed',event=>{if(event.detail==='reference')search.focus();});
const channel=new BroadcastChannel('gather-reference');channel.onmessage=()=>refresh().catch(error=>status.textContent=error.message);window.addEventListener('pagehide',()=>channel.close());
refresh().then(()=>{if(location.pathname.endsWith('/reference.html'))search.focus();}).catch(error=>status.textContent=error.message);
