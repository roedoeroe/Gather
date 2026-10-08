// Temporary, scoped documentation snapshots. No new case data is stored.
import {accountLine,orderAccounts} from './account-state.js';

const iso=value=>Number.isFinite(value)&&value>0?new Date(value).toISOString():'Not checked';
export function clipboardSnapshot(state,subjects,scope){
  const project=state.projects.find(p=>p.id===scope.projectId);
  const scan=state.scans.find(s=>s.id===scope.scanId&&s.projectId===scope.projectId);
  if(!project||!scan)throw new Error('This case or scan was removed. Close the preview and choose a scan again.');
  const roles=new Map(subjects.filter(s=>s.projectId===project.id).map(s=>[s.id,s]));
  const header=project.name+' / '+scan.name;
  let text,records;
  if(scope.kind==='accounts'){
    const subject=roles.get(scope.subjectId);
    if(!subject)throw new Error('Choose a role in this case before copying its account block.');
    const associations=state.research.associations.filter(a=>a.projectId===project.id&&a.subjectId===subject.id&&['candidate','confirmed'].includes(a.status));
    const items=state.items.filter(i=>i.projectId===project.id&&i.kind==='account'&&associations.some(a=>a.itemId===i.id));
    const byEntry=new Map(items.map(i=>[i.entry,i]));
    records=orderAccounts(items.map(i=>i.entry)).map(entry=>{
      const item=byEntry.get(entry),association=associations.find(a=>a.itemId===item.id);
      const sourceScan=state.scans.find(s=>s.id===item.scanId&&s.projectId===project.id);
      if(!sourceScan)throw new Error('An account observation moved. Reopen the preview.');
      return {item,association,scanName:sourceScan.name};
    });
    const lines=records.map(({item,association,scanName})=>
      (association.status==='confirmed'?'Confirmed':'Candidate')+' · '+accountLine(item.entry)+
      ' · Checked: '+iso(item.entry.verifiedAt)+' · Scan: '+scanName);
    text=header+' · '+subject.roleId+'\nAccount observations across scans · analyst association decisions\n'+
      (lines.join('\n')||'No explicitly associated accounts for this role.');
  }else if(scope.kind==='coverage'){
    records=state.research.coverage.filter(c=>c.projectId===project.id&&c.scanId===scan.id);
    text=header+'\nCoverage recorded for this scan\n'+(records.map(c=>(roles.get(c.subjectId)?.roleId||'Unassigned')+
      ' · '+c.family+' · '+c.status+' · '+iso(c.checkedAt)+(c.note?' · '+c.note:'')).join('\n')||'No coverage checks recorded.');
  }else throw new Error('Choose an account or coverage block.');
  // Include decision/reason and observation changes, not unrelated cases or the
  // global destination. Renames keep IDs and history, but require fresh review.
  return {text,signature:JSON.stringify({scope,text,records})};
}
