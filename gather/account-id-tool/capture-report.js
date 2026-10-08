import {listCaptures} from './capture-store.js';
import {captureExportRecord,preferredCaptureAsset} from './capture-files.js';
export async function scanCaptureReport(scanId){return (await listCaptures({scanId})).filter(c=>c.savedState==='saved'&&c.included!==false&&c.review!=='excluded').map(c=>({...captureExportRecord(c,preferredCaptureAsset(c)),review:c.review||'unreviewed',included:true}));}
export function captureReportMarkdown(captures){
  const escape=v=>String(v??'').replace(/[\\`*_{}[\]<>#|]/g,'\\$&');
  return '\n## Included captures\n\n'+captures.map(c=>['### '+escape(c.source.title||c.source.url),'','Capture: '+c.captureId+' · '+c.mode+' · '+c.status+' · Review: '+c.review,'Source: '+escape(c.source.url),'Captured: '+c.startedAt+' to '+c.endedAt+' ('+escape(c.timezone)+')','Destination at capture: '+escape([c.context.projectName,c.context.scanName,c.context.subjectName].join(' / ')),'Export image SHA-256: '+c.exportedAsset.sha256,...(c.exportedAsset.annotation?['Caption: '+escape(c.exportedAsset.annotation)]:[]),...(c.limitations||[]).map(l=>'Limitation: '+escape(l)),''].join('\n')).join('\n')+'\nImages are exported separately with Export this scan’s captures. This report contains metadata, not original image bytes. Hashes do not establish authenticity or identity.\n';
}
