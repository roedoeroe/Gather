import {validateWorkspace} from './workspace-model.js';
export function projectScope(state,projectId){
  if(!state.projects.some(p=>p.id===projectId))throw new Error('Project is unavailable.');
  if(state.items.some(i=>i.projectId!==projectId&&i.capturedContext.projectId===projectId))throw new Error('Findings created here were moved to another project. Move them back or keep this project locally before closing.');
  const scoped=structuredClone(state);for(const key of ['projects','scans','items','entities','tasks','searches','activity'])scoped[key]=scoped[key].filter(r=>key==='projects'?r.id===projectId:r.projectId===projectId);
  // Undo history can refer to another scan after deliberate moves; it is not part of a project archive.
  scoped.activity=scoped.activity.map(({change,...row})=>row);
  for(const item of scoped.items)if(item.capturedContext.projectId!==projectId)throw new Error('This project contains a finding originating elsewhere. Keep it locally or export an all-work backup before reorganizing.');
  if(scoped.research)for(const key of ['seeds','queue','coverage','associations'])scoped.research[key]=scoped.research[key].filter(r=>r.projectId===projectId);
  scoped.activeScanId=scoped.scans[0]?.id||null;validateWorkspace(scoped);return scoped;
}
export function withoutProject(state,projectId){
  projectScope(state,projectId);const next=structuredClone(state);
  for(const key of ['projects','scans','items','entities','tasks','searches','activity'])next[key]=next[key].filter(r=>key==='projects'?r.id!==projectId:r.projectId!==projectId);
  if(next.research)for(const key of ['seeds','queue','coverage','associations'])next.research[key]=next.research[key].filter(r=>r.projectId!==projectId);
  if(!next.scans.some(s=>s.id===next.activeScanId))next.activeScanId=null;next.revision++;return validateWorkspace(next);
}
export function projectSignature(bundle,projectId){const captures=bundle.captures.filter(c=>c.projectId===projectId),ids=new Set(captures.map(c=>c.id));return JSON.stringify({captures,subjects:bundle.subjects.filter(s=>s.projectId===projectId),assets:bundle.assets.filter(a=>ids.has(a.captureId)).map(({blob,...a})=>a)});}
