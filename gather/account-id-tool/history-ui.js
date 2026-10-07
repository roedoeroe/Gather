import {request} from './workspace-client.js';
export async function clearHistoryDialog(){
  const summary=await request('workspace.historySummary'),d=document.createElement('dialog');
  d.setAttribute('aria-labelledby','clear-history-title');
  d.innerHTML='<h2 id="clear-history-title">Clear recent lookup history?</h2><p class="scope"></p><p>This clears recent account batches, unsubmitted lookup drafts and their copies in imported settings archives. Running lookups stop. Saved cases, findings, subjects, coverage and images stay in Gather.</p><p>Browser history, clipboard contents, downloaded files and external sites are not cleared.</p><p role="alert"></p><div class="dialog-actions"><button type="button">Cancel</button><button type="button" class="danger">Clear recent lookup history</button></div>';
  d.querySelector('.scope').textContent=summary.batches+' recent lookup batches saved in this browser.';
  const [cancel,clear]=d.querySelectorAll('button');cancel.onclick=()=>d.close();
  clear.onclick=async()=>{clear.disabled=true;try{await request('workspace.clearLookups');d.close();}catch(e){d.querySelector('[role="alert"]').textContent=e.message;}finally{clear.disabled=false;}};
  d.onclose=()=>d.remove();document.body.append(d);d.showModal();cancel.focus();
}
