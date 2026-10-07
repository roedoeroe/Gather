export function historyScope(value){return ['scan','case','all','subject'].includes(value)?value:'scan';}
export function filterCaptureHistory(records,{scope='scan',scanId=null,projectId=null,subjectId=null,caseFilter='all',scanFilter='all',status='all',query='',label=()=>''}={}){
  const text=query.trim().toLocaleLowerCase();
  return records.filter(r=>{
    if(scope==='scan'&&r.scanId!==scanId)return false;
    if(['case','subject'].includes(scope)&&r.projectId!==projectId)return false;
    if(scope==='subject'&&r.subjectId!==subjectId)return false;
    if(scope==='all'&&caseFilter!=='all'&&r.projectId!==(caseFilter==='inbox'?null:caseFilter))return false;
    if(scope!=='scan'&&scanFilter!=='all'&&r.scanId!==(scanFilter==='inbox'?null:scanFilter))return false;
    if(status==='saved'&&r.savedState!=='saved')return false;
    if(status==='attention'&&r.status==='complete'&&r.export?.status!=='failed')return false;
    return !text||[r.source.title,r.source.url,r.mode,r.status,label(r)].join(' ').toLocaleLowerCase().includes(text);
  }).sort((a,b)=>b.startedAt-a.startedAt||a.id.localeCompare(b.id));
}
export function captureHistoryGroups(records){
  const groups=new Map();for(const record of records){const key=JSON.stringify([record.projectId,record.scanId]);if(!groups.has(key))groups.set(key,{key,projectId:record.projectId,scanId:record.scanId,records:[]});groups.get(key).records.push(record);}return [...groups.values()];
}
