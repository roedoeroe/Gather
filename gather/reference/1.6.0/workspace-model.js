import {normalizeProfile, isCopyableId, idCheck} from './core.js';
export const SCHEMA = 1;
export const WORKSPACE_KEY = 'gather.workspace.v1';
export const MAX_BYTES = 4 * 1024 * 1024;
export const REVIEWS = ['unreviewed','reviewed','follow-up','excluded'];
export const PROVIDERS = {google:'Google',bing:'Bing',instagram:'Instagram · Google',facebook:'Facebook · Google',tiktok:'TikTok · Google',threads:'Threads · Google',youtube:'YouTube',x:'X search'};
const uid = () => crypto.randomUUID();
const fail = message => { throw new Error(message); };
export function text(value,max=500,required=false) {
  if(typeof value!=='string'||value.length>max||(required&&!value.trim())) fail('Enter valid text'+(required?' (required)':'')+' under '+max+' characters.');
  return value.trim();
}
export function webUrl(value) {
  const raw=text(value,4096,true); let url;
  try {url=new URL(raw);}catch{fail('Enter a complete http or https URL.');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)fail('Use an http or https URL without embedded credentials.');
  return url.href;
}
export function emptyState() {return {schemaVersion:SCHEMA,revision:0,activeScanId:null,projects:[],scans:[],entities:[],items:[],tasks:[],searches:[],activity:[]};}
export function context(state,scanId) {
  if(scanId===null)return {scanId:null,projectId:null};
  const scan=state.scans.find(s=>s.id===scanId);if(!scan)fail('That scan is no longer available. Choose a destination.');
  return {scanId:scan.id,projectId:scan.projectId};
}
export function destinationLabel(state,scanId) {
  if(scanId===null)return 'Inbox';
  const s=state.scans.find(x=>x.id===scanId),p=state.projects.find(x=>x.id===s?.projectId);
  return s&&p?p.name+' / '+s.name:'Unavailable scan';
}
export function searchUrl(provider,query) {
  const q=text(query,2000,true);if(!Object.hasOwn(PROVIDERS,provider))fail('Choose a search provider.');
  if(provider==='youtube')return 'https://www.youtube.com/results?search_query='+encodeURIComponent(q);
  if(provider==='x')return 'https://x.com/search?q='+encodeURIComponent(q)+'&src=typed_query';
  const site={instagram:'instagram.com',facebook:'facebook.com',tiktok:'tiktok.com',threads:'threads.com'}[provider];
  return (provider==='bing'?'https://www.bing.com/search?q=':'https://www.google.com/search?q=')+encodeURIComponent((site?'site:'+site+' ':'')+q);
}
function entityFor(s,scope,entry) {
  // An account ID identifies a platform account, never a person. Unresolved IDs do not merge.
  if(!isCopyableId(entry))return null;
  let entity=s.entities.find(e=>e.projectId===scope.projectId&&e.platform===entry.platform&&e.accountId===entry.id);
  if(!entity){entity={id:uid(),projectId:scope.projectId,platform:entry.platform,accountId:entry.id};s.entities.push(entity);}
  return entity.id;
}
function cleanEntry(entry) {
  if(!entry||typeof entry!=='object')fail('No account result to save.');
  const p=normalizeProfile(entry.url);
  if(entry.platform!==p.platform)fail('Account platform differs from its URL.');
  const originalUrl=text(entry.originalUrl||entry.url,2048,true);
  if(normalizeProfile(originalUrl).key!==p.key)fail('Original URL differs from this account.');
  const id=entry.id??'';
  if(typeof id!=='string'||(id&&!(p.platform==='youtube'?/^UC[\w-]{22}$/ : /^[1-9]\d{0,29}$/).test(id)))fail('Account IDs must be exact strings.');
  if(!['resolved','ready','error','stopped'].includes(entry.status))fail('Wait for this lookup to finish before saving.');
  const clean={...p,id,status:entry.status,originalUrl,displayName:text(entry.displayName||'',500),suppliedName:text(entry.suppliedName||'',500),method:text(entry.method||'',500),message:text(entry.message||'',2000),verifiedAt:Number.isFinite(entry.verifiedAt)&&entry.verifiedAt>0?entry.verifiedAt:null,verificationSource:['live','source','url'].includes(entry.verificationSource)?entry.verificationSource:'',providedIds:[],reviewedId:text(entry.reviewedId||'',30),notes:[]};
  if(!Array.isArray(entry.providedIds||[])||!Array.isArray(entry.notes||[]))fail('Invalid account notes or supplied IDs.');
  clean.providedIds=(entry.providedIds||[]).map(v=>text(v,30,true));
  clean.notes=(entry.notes||[]).map(v=>text(v,500));
  // Retain checked page status evidence and original analyst annotation without conflating them.
  clean.nameChecked=entry.nameChecked===true;clean.nameWarning=text(entry.nameWarning||'',500);
  clean.profileStatus=entry.profileStatus?structuredClone(entry.profileStatus):null;
  clean.usePageStatus=entry.usePageStatus!==false;
  return clean;
}
function addActivity(s,kind,scope,label,at,refId=null){s.activity.push({id:uid(),kind,scanId:scope.scanId,projectId:scope.projectId,label,at,refId});}
export function reduceWorkspace(previous,action,at=Date.now()) {
  const s=structuredClone(previous);let result={};
  const scope=()=>context(s,action.scanId);
  const row=(key)=>s[key].find(x=>x.id===action.id)||fail('This item is no longer available.');
  switch(action.type){
    case 'project.create': {
      const p={id:uid(),name:text(action.name,100,true),createdAt:at};s.projects.push(p);
      const scan={id:uid(),projectId:p.id,name:text(action.scanName||'First scan',100,true),createdAt:at};s.scans.push(scan);s.activeScanId=scan.id;result={id:p.id,scanId:scan.id};
      addActivity(s,'project.created',context(s,scan.id),'Created '+p.name,at,p.id);break;
    }
    case 'scan.create': {
      if(!s.projects.some(p=>p.id===action.projectId))fail('Choose a project.');
      const scan={id:uid(),projectId:action.projectId,name:text(action.name,100,true),createdAt:at};s.scans.push(scan);s.activeScanId=scan.id;result={id:scan.id};addActivity(s,'scan.created',context(s,scan.id),'Created '+scan.name,at,scan.id);break;
    }
    case 'context.rename': {
      const c=scope();if(!c.scanId)fail('Inbox cannot be renamed.');
      const project=s.projects.find(p=>p.id===c.projectId),scan=s.scans.find(x=>x.id===c.scanId);
      project.name=text(action.projectName,100,true);scan.name=text(action.scanName,100,true);
      addActivity(s,'context.renamed',c,'Renamed '+project.name+' / '+scan.name,at,scan.id);break;
    }
    case 'context.select': context(s,action.scanId);s.activeScanId=action.scanId;break;
    case 'item.save': {
      const c=scope();let item={id:uid(),...c,capturedContext:{...c},createdAt:at,kind:action.kind,review:'unreviewed',included:true,annotation:''};
      if(action.kind==='account'){
        const entry=cleanEntry(action.entry);
        // Saving the very same checked observation twice is idempotent; a new check creates history.
        const fingerprint=JSON.stringify(entry);
        const existing=s.items.find(x=>x.scanId===c.scanId&&x.kind==='account'&&JSON.stringify(x.entry)===fingerprint);
        if(existing){result={id:existing.id,duplicate:true};break;}
        item.entry=entry;item.url=entry.url;item.title=entry.displayName||entry.suppliedName||entry.handle||entry.id||'Account';item.entityId=entityFor(s,c,entry);item.extraction=idCheck(entry).label||(entry.verifiedAt?'Matches this account/page':entry.id?'ID from URL · page not checked':'Unresolved');
      }else if(action.kind==='source'){
        item.url=webUrl(action.url);item.title=text(action.title||item.url,500,true);item.excerpt=text(action.excerpt||'',20000);item.originUrl=action.originUrl?webUrl(action.originUrl):item.url;
      }else if(action.kind==='note'){item.title=text(action.title||'Note',500,true);item.body=text(action.body,20000,true);}
      else fail('Unsupported saved item.');
      s.items.push(item);result={id:item.id};addActivity(s,'item.saved',c,'Saved '+item.kind+': '+item.title,at,item.id);break;
    }
    case 'item.review': {const item=row('items');if(!REVIEWS.includes(action.review))fail('Choose a review state.');item.review=action.review;addActivity(s,'item.reviewed',item,'Review: '+action.review,at,item.id);break;}
    case 'item.include': {const item=row('items');if(typeof action.included!=='boolean')fail('Invalid inclusion.');item.included=action.included;addActivity(s,'item.inclusion',item,action.included?'Included in report':'Left out of report',at,item.id);break;}
    case 'item.annotate': {const item=row('items');item.annotation=text(action.annotation,20000);addActivity(s,'item.annotated',item,'Edited analyst note',at,item.id);break;}
    case 'item.move': {const item=row('items'),c=scope();Object.assign(item,c);if(item.kind==='account')item.entityId=entityFor(s,c,item.entry);addActivity(s,'item.moved',c,'Moved '+item.title,at,item.id);break;}
    case 'task.create': {const c=scope(),task={id:uid(),...c,title:text(action.title,500,true),status:'open',createdAt:at};s.tasks.push(task);result={id:task.id};addActivity(s,'task.created',c,task.title,at,task.id);break;}
    case 'task.status': {const task=row('tasks');if(!['open','done','dismissed'].includes(action.status))fail('Choose a task status.');task.status=action.status;addActivity(s,'task.updated',task,task.title+': '+task.status,at,task.id);break;}
    case 'search.prepare': {const c=scope(),search={id:uid(),...c,provider:action.provider,query:text(action.query,2000,true),url:searchUrl(action.provider,action.query),status:'prepared',createdAt:at};s.searches.push(search);result={id:search.id,url:search.url};addActivity(s,'search.prepared',c,search.query,at,search.id);break;}
    case 'search.status': {const search=row('searches');if(!['opened','reviewed','failed'].includes(action.status))fail('Invalid search status.');if(action.status==='reviewed'&&!['opened','reviewed'].includes(search.status))fail('Open the search before marking it reviewed.');search.status=action.status;search.updatedAt=at;addActivity(s,'search.'+action.status,search,search.query,at,search.id);break;}
    default: fail('Unknown workspace action.');
  }
  // Activity stores only context IDs, not copies of mutable records or page contents.
  s.revision++;
  checkSize(s);
  return {state:s,result};
}
function checkSize(value){if(new TextEncoder().encode(JSON.stringify(value)).length>MAX_BYTES)fail('Workspace is at its 4 MB limit. Back up your work; no data was removed.');}
export function validateWorkspace(value) {
  checkSize(value);
  if(!value||value.schemaVersion!==SCHEMA)fail('Unsupported workspace schema.');
  const s=structuredClone(value),ids=new Set();
  for(const name of ['projects','scans','entities','items','tasks','searches','activity']){
    if(!Array.isArray(s[name])||s[name].length>20000)fail('Invalid '+name+' in backup.');
    for(const x of s[name]){if(!x||typeof x.id!=='string'||!/^[\w-]{1,100}$/.test(x.id)||ids.has(x.id))fail('Invalid or repeated record ID.');ids.add(x.id);}
  }
  const projectIds=new Set(s.projects.map(p=>p.id));
  for(const p of s.projects)text(p.name,100,true);
  for(const scan of s.scans){text(scan.name,100,true);if(!projectIds.has(scan.projectId))fail('Scan has no project.');}
  const verifyScope=x=>{const c=context(s,x.scanId);if(c.projectId!==x.projectId)fail('Record crosses project boundaries.');};
  for(const entity of s.entities){if(entity.projectId!==null&&!projectIds.has(entity.projectId))fail('Account has no project.');if(typeof entity.accountId!=='string'||!(entity.platform==='youtube'?/^UC[\w-]{22}$/ : /^[1-9]\d{0,29}$/).test(entity.accountId))fail('Invalid account ID.');}
  for(const item of s.items){
    verifyScope(item);verifyScope(item.capturedContext);text(item.title,500,true);text(item.annotation,20000);
    if(!REVIEWS.includes(item.review)||typeof item.included!=='boolean')fail('Invalid review state.');
    if(item.kind==='source'){webUrl(item.url);webUrl(item.originUrl);text(item.excerpt,20000);}
    else if(item.kind==='note')text(item.body,20000,true);
    else if(item.kind==='account'){
      cleanEntry(item.entry);webUrl(item.url);text(item.extraction,500);
      if(item.entityId){const e=s.entities.find(e=>e.id===item.entityId);if(!e||e.projectId!==item.projectId||e.platform!==item.entry.platform||e.accountId!==item.entry.id||!isCopyableId(item.entry))fail('Invalid account observation link.');}
    }else fail('Invalid item kind.');
  }
  for(const task of s.tasks){verifyScope(task);text(task.title,500,true);if(!['open','done','dismissed'].includes(task.status))fail('Invalid task state.');}
  for(const search of s.searches){verifyScope(search);if(search.url!==searchUrl(search.provider,search.query)||!['prepared','opened','reviewed','failed'].includes(search.status))fail('Invalid search.');}
  for(const a of s.activity){verifyScope(a);text(a.label,1000);text(a.kind,100,true);}
  for(const key of ['projects','scans','items','tasks','searches'])for(const x of s[key])if(!Number.isFinite(x.createdAt)||x.createdAt<=0)fail('Invalid record date.');
  for(const a of s.activity)if(!Number.isFinite(a.at)||a.at<=0)fail('Invalid activity date.');
  if(!Number.isInteger(s.revision)||s.revision<0)fail('Invalid workspace revision.');context(s,s.activeScanId);return s;
}
export function mergeWorkspace(current,incoming) {
  const other=validateWorkspace(incoming);if(!current.projects.length&&!current.items.length&&!current.tasks.length&&!current.searches.length&&!current.activity.length)return other;
  const result=structuredClone(current),map=new Map();
  for(const key of ['projects','scans','entities','items','tasks','searches','activity'])for(const row of other[key])map.set(row.id,uid());
  const rewrite=x=>{for(const key of ['id','projectId','scanId','entityId','refId'])if(typeof x[key]==='string'&&map.has(x[key]))x[key]=map.get(x[key]);if(x.capturedContext)rewrite(x.capturedContext);};
  for(const key of ['projects','scans','entities','items','tasks','searches','activity']){for(const row of other[key])rewrite(row);result[key].push(...other[key]);}
  result.revision++;return validateWorkspace(result);
}
export function report(state,scanId) {
  context(state,scanId);
  return {format:'gather-report',schemaVersion:SCHEMA,exportedAt:Date.now(),destination:destinationLabel(state,scanId),scope:context(state,scanId),items:state.items.filter(x=>x.scanId===scanId&&x.included&&x.review!=='excluded'),tasks:state.tasks.filter(x=>x.scanId===scanId),searches:state.searches.filter(x=>x.scanId===scanId),notice:'Account matches describe page data, not who operates the account. Saved links and excerpts are not archived pages. Unreviewed included items remain labeled.'};
}
export function reportMarkdown(data){
  const escape=value=>String(value??'').replace(/[\\`*_{}[\]<>#|]/g,'\\$&');
  const time=value=>value?new Date(value).toISOString():'Not checked';
  const lines=['# Gather · '+escape(data.destination),'','Exported: '+time(data.exportedAt),'',data.notice,'','## Included findings',''];
  for(const item of data.items){
    lines.push('### '+escape(item.title),'','Type: '+item.kind+' · Review: '+item.review,'Saved: '+time(item.createdAt),'');
    if(item.url)lines.push('Source URL: '+escape(item.url),'');
    if(item.entry){const e=item.entry;lines.push('Platform: '+e.platform,'Account ID: '+(e.id||'Unresolved'),'Check: '+escape(item.extraction),'Checked: '+time(e.verifiedAt),'Method: '+escape(e.method||'Unavailable'),'');if(e.providedIds?.length)lines.push('Originally supplied IDs: '+e.providedIds.join(', '),'');if(e.notes?.length)lines.push('Original account notes: '+escape(e.notes.join(' ')),'');}
    if(item.excerpt)lines.push('Selected excerpt:','',escape(item.excerpt),'');
    if(item.originUrl&&item.originUrl!==item.url)lines.push('Excerpt selected on: '+escape(item.originUrl),'');
    if(item.body)lines.push(escape(item.body),'');
    if(item.annotation)lines.push('Analyst note: '+escape(item.annotation),'');
  }
  lines.push('## Next actions','');for(const t of data.tasks)lines.push('- '+escape(t.title)+' — '+t.status);
  lines.push('','## Search log','');for(const s of data.searches)lines.push('- '+escape(PROVIDERS[s.provider]+': '+s.query)+' — '+s.status+' · '+time(s.createdAt),'  URL: '+escape(s.url));
  return lines.join('\n')+'\n';
}
