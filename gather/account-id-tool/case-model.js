// Reviewed, deterministic research context. No inference of identity or threat.
export const RESEARCH_VERSION=1;
export const SEED_KINDS=['subject','peer','family','school','organization','username','url','term','date','age','grade','reference','private','unknown'];
export const COVERAGE_STATES=['Not searched','Search launched','Searched — no reliable match','Candidate','Confirmed','Private / inaccessible','Gone','Technical / unknown','N/A'];
export const FAMILIES=['google','instagram','facebook','threads','tiktok','youtube','x'];
const uid=()=>crypto.randomUUID(), fail=m=>{throw new Error(m);};
const text=(s,max=2000)=>{if(typeof s!=='string'||!s.trim()||s.length>max)fail('Enter a valid reviewed value.');return s.trim();};
const id=s=>typeof s==='string'&&/^[\w-]{1,100}$/.test(s);
export const emptyResearch=()=>({version:RESEARCH_VERSION,seeds:[],queue:[],coverage:[],associations:[]});
const ALIASES={subject:'subject',subjects:'subject',soc:'subject',peer:'peer',peers:'peer',family:'family',parent:'family',school:'school',schools:'school',district:'organization',organization:'organization',username:'username',usernames:'username',handle:'username',url:'url',profile:'url',terms:'term',incident:'term',keywords:'term',date:'date',age:'age',grade:'grade',case:'reference',reference:'reference',email:'private',phone:'private',contact:'private',submitted:'private',submitter:'private'};
export function parseIntake(raw){
  if(typeof raw!=='string'||raw.length>100000)fail('Paste at most 100 KB.');
  const fields=[];
  const add=(kind,value,label,extra={})=>{value=value.trim();if(value)fields.push({id:uid(),kind,value:value.slice(0,2000),label,keep:!['private','unknown'].includes(kind),provenance:'provided',reason:kind==='private'?'Contact / administrative field; excluded by default':kind==='unknown'?'Unrecognized line; review before retaining':'Explicit '+label+' label',...extra});};
  for(const line of raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,200)){
    const match=line.match(/^([\p{L} /_-]{2,35})\s*[:=]\s*(.+)$/u);
    const label=match?.[1].trim()||'Unlabeled',value=match?.[2]||line;
    let kind=ALIASES[label.toLowerCase()]||'unknown';
    if(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)||/(?:\+?\d[\d ()-]{7,}\d)/.test(value)&&kind==='unknown')kind='private';
    if(kind==='unknown'&&/^https?:\/\/\S+$/.test(value))kind='url';
    for(const part of (['subject','peer','family','school','username','term'].includes(kind)?value.split(/\s*;\s*/):[value])){
      if(['subject','peer','family'].includes(kind)){
        const details=part.match(/^(.+?)\s*\((\d{1,2})(?:\s*,?\s*(?:grade|gr\.?)[ :]*(\d{1,2}))?\)$/i);
        add(kind,details?.[1]||part,label,{roleType:label.toLowerCase()==='soc'?'SOC':kind.toUpperCase()});
        if(details){add('age',details[2],'age');if(details[3])add('grade',details[3],'grade');}
      }else add(kind,part,label);
    }
  }
  return fields;
}
export function normalizedSeed(value){return value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en');}
export function prepareFilingCase(previous,input,at=Date.now()){
  if(!Array.isArray(input.subjects)||input.subjects.length>50)fail('Add up to 50 SOCs to a case.');
  const state=structuredClone(previous),projectId=uid(),scanId=uid();
  state.projects.push({id:projectId,name:text(input.name,100),mode:'local',workflow:'filing',createdAt:at});
  state.scans.push({id:scanId,projectId,name:'Captures',createdAt:at});state.activeScanId=scanId;
  const subjects=input.subjects.map((name,index)=>{const roleId='SOC-'+String(index+1).padStart(2,'0');return {id:uid(),projectId,name:text(name,100),roleId,roleType:'SOC',mode:'local',createdAt:at,accountObservationIds:[]};});
  state.revision++;return {state,subjects,settings:[{key:'project-label:'+projectId,value:'SOC'},...(subjects.length?[{key:'subject:'+scanId,value:subjects[0].id}]:[])],session:{names:{},values:{}},result:{id:projectId,scanId}};
}
export function prepareCase(previous,input,at=Date.now()){
  if(input.workflow==='filing')return prepareFilingCase(previous,input,at);
  if(!['ephemeral','local'].includes(input.mode))fail('Choose a case retention mode.');
  if(!Array.isArray(input.fields)||input.fields.length>300)fail('Review the extracted fields.');
  const state=structuredClone(previous),projectId=uid(),scanId=uid(),counts={},subjects=[],names={},values={};
  state.research??=emptyResearch();
  state.projects.push({id:projectId,name:text(input.name,100),mode:input.mode,createdAt:at});
  state.scans.push({id:scanId,projectId,name:text(input.scanName||'Initial scan',100),createdAt:at});state.activeScanId=scanId;
  const seen=new Set();let firstSubject=null;
  for(const field of input.fields){
    if(field.keep!==true)continue;if(!SEED_KINDS.includes(field.kind))fail('Choose a supported seed type.');
    const value=text(field.value),key=field.kind+':'+normalizedSeed(value);if(seen.has(key)&&!['subject','peer','family'].includes(field.kind))continue;seen.add(key);
    let subjectId=null,roleId=null;
    if(['subject','peer','family'].includes(field.kind)){
      if(value.length>100)fail('Keep each friendly subject name under 100 characters.');
      const roleType=field.roleType==='SOC'?'SOC':field.kind.toUpperCase();roleId=roleType+'-'+String(counts[roleType]=(counts[roleType]||0)+1).padStart(2,'0');subjectId=uid();firstSubject??=subjectId;
      subjects.push({id:subjectId,projectId,name:input.mode==='local'?value:roleId,roleId,roleType,mode:input.mode,createdAt:at,accountObservationIds:[]});names[subjectId]=value;
    }
    const seedId=uid(),token='{'+(roleId||'SEED-'+seedId)+'}';values[seedId]=value;
    const seed={id:seedId,projectId,subjectId,roleId,kind:field.kind,value:input.mode==='local'?value:null,token,provenance:'provided',approvedAt:at};state.research.seeds.push(seed);
    if(!['private','unknown','reference','age','grade','date'].includes(field.kind)){
      for(const provider of ['google',...(subjectId?['instagram','facebook','tiktok','youtube']:[])]){
        state.research.queue.push({id:uid(),projectId,scanId,subjectId,seedIds:[seedId],provider,tokenizedQuery:'"'+token+'"',status:'ready',createdAt:at});
      }
    }
  }
  if(!state.research.seeds.some(s=>s.projectId===projectId))fail('Approve at least one research field.');
  state.revision++;
  return {state,subjects,settings:firstSubject?[{key:'subject:'+scanId,value:firstSubject}]:[],session:{names,values},result:{id:projectId,scanId}};
}
export function resolveQuery(state,row,session={}){
  const seeds=state.research?.seeds||[];let query=row.tokenizedQuery;
  for(const seedId of row.seedIds){const seed=seeds.find(s=>s.id===seedId&&s.projectId===row.projectId);if(!seed)fail('Search seed is unavailable.');const value=session.values?.[seed.id]||seed.value;if(!value)fail('Session seed values were released. Re-enter approved values to resume this search.');query=query.split(seed.token).join(value);}
  if(/\{(?:SEED-|SOC-|SUBJECT-|PEER-|FAMILY-)/.test(query))fail('A search token has no approved value.');return text(query,2000);
}
export function reduceResearch(state,action,at){
  state.research??=emptyResearch();const r=state.research;
  if(action.type==='research.manual'){
    const scan=state.scans.find(s=>s.id===action.scanId);if(!scan||![...FAMILIES,'bing'].includes(action.provider))fail('Choose a current scan and provider.');
    const seedId=uid(),token='{SEED-'+seedId+'}',seed={id:seedId,projectId:scan.projectId,subjectId:null,roleId:null,kind:'term',value:null,token,provenance:'analyst-confirmed',approvedAt:at},row={id:uid(),projectId:scan.projectId,scanId:scan.id,subjectId:null,seedIds:[seedId],provider:action.provider,tokenizedQuery:token,status:'ready',createdAt:at};r.seeds.push(seed);r.queue.push(row);return {id:row.id,seedId,projectId:scan.projectId};
  }
  if(action.type==='research.queue'){
    const row=r.queue.find(q=>q.id===action.id);if(!row)fail('Search queue item unavailable.');
    if(action.query!==undefined)row.tokenizedQuery=text(action.query,2000);
    if(action.provider!==undefined){if(!FAMILIES.includes(action.provider)&&action.provider!=='bing')fail('Invalid search provider.');row.provider=action.provider;}
    if(action.status!==undefined){if(!['ready','launched','has-findings','reviewed','skipped','blocked'].includes(action.status))fail('Invalid queue state.');row.status=action.status;}
    if(action.searchId){const search=state.searches.find(s=>s.id===action.searchId&&s.scanId===row.scanId);if(!search)fail('Search origin is unavailable.');row.searchId=search.id;}
    row.updatedAt=at;return {id:row.id};
  }
  if(action.type==='research.coverage'){
    const scan=state.scans.find(s=>s.id===action.scanId);if(!scan||!COVERAGE_STATES.includes(action.status)||!FAMILIES.includes(action.family))fail('Invalid coverage check.');
    const subjectId=action.subjectId||null;if(subjectId&&!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(subjectId))fail('Choose a subject in this project.');
    let row=r.coverage.find(c=>c.scanId===scan.id&&c.subjectId===subjectId&&c.family===action.family);
    if(!row){row={id:uid(),scanId:scan.id,projectId:scan.projectId,subjectId,family:action.family};r.coverage.push(row);}
    Object.assign(row,{status:action.status,checkedAt:at,note:typeof action.note==='string'?action.note.slice(0,1000):''});return {id:row.id};
  }
  if(action.type==='research.associate'){
    const item=state.items.find(i=>i.id===action.itemId);if(!item||!id(action.subjectId)||!['candidate','confirmed','rejected'].includes(action.status))fail('Choose a finding, role and association state.');
    if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(action.subjectId))fail('Choose a role in this project.');
    let row=r.associations.find(a=>a.itemId===item.id&&a.subjectId===action.subjectId);
    if(!row){row={id:uid(),projectId:item.projectId,itemId:item.id,subjectId:action.subjectId};r.associations.push(row);}
    Object.assign(row,{status:action.status,reason:typeof action.reason==='string'?action.reason.slice(0,2000):'',decidedAt:at});return {id:row.id};
  }
  fail('Unknown research action.');
}
export function validateResearch(state){
  const r=state.research;if(!r)return;if(r.version!==RESEARCH_VERSION)fail('Unsupported research schema.');
  const ids=new Set(['projects','scans','items','entities','tasks','searches','activity'].flatMap(key=>state[key].map(row=>row.id)));for(const key of ['seeds','queue','coverage','associations']){if(!Array.isArray(r[key])||r[key].length>20000)fail('Invalid research records.');for(const row of r[key]){if(!id(row.id)||ids.has(row.id)||!state.projects.some(p=>p.id===row.projectId))fail('Invalid research reference.');ids.add(row.id);if(row.scanId&&!state.scans.some(s=>s.id===row.scanId&&s.projectId===row.projectId))fail('Invalid research scan.');}}
  for(const p of state.projects)if(p.mode!==undefined&&!['ephemeral','local'].includes(p.mode))fail('Invalid case mode.');
  for(const seed of r.seeds){if(!SEED_KINDS.includes(seed.kind)||typeof seed.token!=='string'||seed.token.length>150||seed.value!==null&&(typeof seed.value!=='string'||seed.value.length>2000))fail('Invalid seed.');if(state.projects.find(p=>p.id===seed.projectId).mode==='ephemeral'&&seed.value!==null)fail('Ephemeral seed values cannot be durable.');}
  for(const q of r.queue){if(![...FAMILIES,'bing'].includes(q.provider)||!Array.isArray(q.seedIds)||!q.seedIds.length||q.seedIds.length>20||new Set(q.seedIds).size!==q.seedIds.length||q.seedIds.some(id=>!r.seeds.some(s=>s.id===id&&s.projectId===q.projectId))||!['ready','launched','has-findings','reviewed','skipped','blocked'].includes(q.status)||typeof q.tokenizedQuery!=='string'||q.tokenizedQuery.length>2000)fail('Invalid queued search.');if(q.searchId&&!state.searches.some(s=>s.id===q.searchId&&s.scanId===q.scanId))fail('Invalid queue origin.');}
  for(const c of r.coverage)if(!COVERAGE_STATES.includes(c.status)||!FAMILIES.includes(c.family))fail('Invalid coverage state.');
  for(const a of r.associations)if(!state.items.some(i=>i.id===a.itemId&&i.projectId===a.projectId)||!['candidate','confirmed','rejected'].includes(a.status))fail('Invalid association.');
}
export function remapResearch(research,map){if(!research)return;for(const key of ['seeds','queue','coverage','associations'])for(const row of research[key]){for(const field of ['id','projectId','scanId','subjectId','itemId','searchId'])if(map.has(row[field]))row[field]=map.get(row[field]);if(row.seedIds)row.seedIds=row.seedIds.map(id=>map.get(id)||id);}}
