// Private reference material never ships in Gather. These are generic local rules.
export const REFERENCE_LIMITS=Object.freeze({files:2000,fileBytes:2*1024*1024,totalBytes:20*1024*1024,sections:20000});
export const DEFAULT_ALIASES=Object.freeze({'no accounts':'no findings','peer names':'peers family','need family':'family peers','snap username':'snapchat username','priv account':'private account','missing info':'missing information'});
const normalize=value=>String(value).normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function referencePath(path) {
 if(typeof path!=='string'||path.length>1000||/[\u0000-\u001f\\]/.test(path)||path.split('/').some(x=>!x||x==='.'||x==='..'))throw new Error('Invalid reference file path.');
 return path;
}
export function excludedReference(path) {
 const parts=referencePath(path).split('/');
 return parts.some(p=>/^(logininfo|archiveddontuse|media|docx|docxexport|docxexports|wordexport)$/.test(p.toLowerCase().replace(/[^a-z0-9]/g,'')))||! /\.md$/i.test(path);
}
export function referenceHazard(text) {
 return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:^|\n)\s*(?:password|passwd|api[_ -]?key|access[_ -]?token|client[_ -]?secret)\s*[:=]\s*\S+/i.test(text);
}
export function referenceSections(file,collection) {
 const source=file.text,lines=source.split(/(?<=\n)/);let offset=0,starts=[0],fenced=false;
 for(const line of lines){if(/^\s*(```|~~~)/.test(line))fenced=!fenced;
  if(!fenced&&offset&&(/^(?:#{1,6}\s+|\*\*[^*\n]{2,120}\*\*\s*$)/.test(line.trimEnd())))starts.push(offset);
  offset+=line.length;
 }
 starts.push(source.length);
 const title=source.match(/^#\s+(.+)$/m)?.[1]?.trim()||file.path.split('/').at(-1).replace(/\.md$/i,'');
 const fileExample=/\bEXAMPLES?\s+(?:NOT\s+TEMPLATES?|—\s*not\s+templates?)\b/i.test(source);
 return starts.slice(0,-1).flatMap((start,i)=>{
  const body=source.slice(start,starts[i+1]);if(!body.trim()||/^# [^\n]+\n(?:\s|Created:[^\n]*\n|Modified:[^\n]*\n|---\n)*$/.test(body))return [];
  const section=body.match(/^(?:#{1,6}\s+|\*\*)([^\n*]+)/)?.[1]?.trim()||'';
  const type=fileExample||/\bEXAMPLES?\b/i.test(section)?'example':/\bPOSS\s+TEMPLATE\b/i.test(section)?'possible-template':/\bTEMPLATE\b/i.test(section)?'template':/\b(?:WARNING|INSTRUCTIONS|GUIDANCE)\b/i.test(section)?'guidance':'reference';
  return [{id:file.path+'#'+start,title,section,collection,path:file.path,body,type,modified:file.modified||null,start,end:starts[i+1]}];
 });
}
export function buildReferencePack({collection,version,files,aliases=DEFAULT_ALIASES}) {
 if(typeof collection!=='string'||!normalize(collection)||collection.length>100)throw new Error('Name this local collection (up to 100 characters).');
 if(typeof version!=='string'||!version.trim()||version.length>100)throw new Error('Enter a library version.');
 if(!Array.isArray(files)||files.length>REFERENCE_LIMITS.files)throw new Error('Import at most 2,000 Markdown files at a time.');
 if(!aliases||typeof aliases!=='object'||Array.isArray(aliases)||Object.keys(aliases).length>200)throw new Error('Use at most 200 local aliases.');
 const cleanAliases={};for(const [key,value] of Object.entries(aliases)){if(!normalize(key)||key.length>100||typeof value!=='string'||!value.trim()||value.length>300||['__proto__','constructor','prototype'].includes(key))throw new Error('Invalid reference alias.');cleanAliases[key]=value;}
 let bytes=0;const retained=[],excluded=[],paths=new Set();
 for(const file of files){
  const path=referencePath(file.path);if(paths.has(path))throw new Error('The import contains duplicate file paths.');paths.add(path);
  if(excludedReference(path)){excluded.push({path,reason:'Excluded folder or file type'});continue;}
  if(typeof file.text!=='string')throw new Error('Reference files must contain Markdown text.');
  const size=new TextEncoder().encode(file.text).length;bytes+=size;
  if(size>REFERENCE_LIMITS.fileBytes||bytes>REFERENCE_LIMITS.totalBytes)throw new Error('Reference import limit: 2 MiB per file and 20 MiB per collection.');
  if(referenceHazard(file.text)){excluded.push({path,reason:'Possible credential content'});continue;}
  retained.push({path,text:file.text,modified:Number.isFinite(file.modified)?file.modified:null});
 }
 const entries=retained.flatMap(file=>referenceSections(file,collection.trim()));
 if(entries.length>REFERENCE_LIMITS.sections)throw new Error('This collection contains too many sections.');
 if(!entries.length)throw new Error('No usable Markdown references were found. Excluded folders and credential content are not imported.');
 return {format:'gather-reference-pack',schemaVersion:1,id:normalize(collection).replaceAll(' ','-'),collection:collection.trim(),version:version.trim(),files:retained,aliases:cleanAliases,entries,excluded,bytes};
}
export function readReferencePack(text) {
 if(typeof text!=='string'||new TextEncoder().encode(text).length>REFERENCE_LIMITS.totalBytes*2)throw new Error('The reference pack is too large.');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Choose a valid Gather reference JSON pack.');}
 if(value?.format!=='gather-reference-pack'||value.schemaVersion!==1)throw new Error('Unsupported reference pack version.');
 return buildReferencePack(value);
}
// Packs are immutable until replaced. Normalize their text once per load,
// rather than allocating the whole library on every keystroke.
const indexes=new WeakMap();
function nearWord(a,b){
 if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,edits=0;
 while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++edits>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}
 return edits+(a.length-i)+(b.length-j)<=1;
}

function referenceIndex(pack){
 let index=indexes.get(pack);if(index)return index;
 index={aliases:Object.entries(pack.aliases||{}).map(([key,value])=>[normalize(key),normalize(value).split(' ')]),rows:pack.entries.map(entry=>{
  const title=normalize(entry.title),section=normalize(entry.section),path=normalize(entry.path);
  return {entry,title,section,titlePath:title+' '+section+' '+path,body:normalize(entry.body),words:(title+' '+section).split(' ')};
 })};indexes.set(pack,index);return index;
}
export function searchReferences(packs,query,{collection='',limit=60}={}) {
 const q=normalize(query).slice(0,200),tokens=q.split(' ').filter(Boolean),found=[];
 for(const pack of packs){if(collection&&pack.id!==collection)continue;
  const index=referenceIndex(pack),aliases=index.aliases.filter(([key])=>key===q).flatMap(([,words])=>words);
  for(const {entry,title,section,titlePath,body,words} of index.rows){
   let score=0;
   if(!q)score=1;
   else{
    if(title===q)score+=1000;else if(title.startsWith(q))score+=700;
    if(section===q)score+=900;else if(section.startsWith(q))score+=600;
    if(tokens.every(t=>titlePath.includes(t)))score+=350;
    if(aliases.length&&aliases.every(t=>titlePath.includes(t)||body.includes(t)))score+=300;
    if(aliases.some(t=>titlePath.includes(t)))score+=180;
    if(body.includes(q))score+=100;
    if(tokens.every(t=>body.includes(t)))score+=50;
    if(!score&&tokens.length<=4&&tokens.every(t=>t.length>=4&&words.some(word=>nearWord(t,word))))score=5;
   }
   if(score)found.push({entry,pack,score});
  }
 }
 return found.sort((a,b)=>b.score-a.score||a.entry.title.localeCompare(b.entry.title)||a.entry.path.localeCompare(b.entry.path)||a.entry.start-b.entry.start).slice(0,limit).map(({entry,pack,score})=>({...entry,packId:pack.id,version:pack.version,score}));
}
