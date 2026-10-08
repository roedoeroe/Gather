// Pure validation shared by pages and the service worker. Keeping this outside
// workspace-store avoids a circular dependency in the worker's static graph.
import {validateWorkspace,WORKSPACE_KEY} from './workspace-model.js';
import {restoreBatch} from './batches.js';

export function validateBackup(value){
  if(new TextEncoder().encode(JSON.stringify(value)).length>32*1024*1024)throw new Error('Backup exceeds 32 MB.');
  if(value?.format!=='gather-backup'||value.schemaVersion!==1||!value.legacy||Array.isArray(value.legacy)||typeof value.legacy!=='object')throw new Error('Choose a Gather backup, not a report.');
  validateWorkspace(value.workspace);
  for(const [key,v] of Object.entries(value.legacy)){
    if(!key.startsWith('gather.')||key===WORKSPACE_KEY||key.length>150)throw new Error('Invalid backup storage key.');
    if(key.startsWith('gather.batch.')&&!restoreBatch(v))throw new Error('Backup contains an invalid batch.');
  }
  return value;
}
