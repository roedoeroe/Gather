// UI navigation only: changing views never changes the filing destination.
const sections=['research','captures','case','reference','settings'];
let active='research';const scrollPositions=new Map();
const panel=new URLSearchParams(location.search).has('panel');
export function selectSection(next,{focus=false}={}){
  if(panel)return;
  if(!sections.includes(next))next='research';
  const previous=active;if(document.body.dataset.section)scrollPositions.set(previous,window.scrollY);active=next;
  for(const name of sections){const tab=document.getElementById('tab-'+name),view=document.getElementById('view-'+name);view.hidden=name!==next;tab.setAttribute('aria-selected',String(name===next));tab.tabIndex=name===next?0:-1;}
  document.body.dataset.section=next;
  if(previous!==next){const message=document.getElementById('message');if(!message.classList.contains('error'))message.hidden=true;for(const status of document.querySelectorAll('#workspaceStatus .workspace-status'))status.textContent='';}
  const url=new URL(location.href);url.hash=next==='research'?'':next;history.replaceState(null,'',url);
  if(previous!==next)window.scrollTo(0,scrollPositions.get(next)||0);
  document.dispatchEvent(new CustomEvent('gather:view-changed',{detail:next}));
  if(focus)document.getElementById('tab-'+next).focus();
}
export function setCaseAvailable(available){document.body.classList.toggle('has-case',available);}
export function initNavigation(){
  if(panel){document.getElementById('view-research').removeAttribute('role');document.getElementById('view-research').removeAttribute('aria-labelledby');document.getElementById('view-research').removeAttribute('tabindex');return;}
  const nav=document.getElementById('workspaceNav');
  nav.addEventListener('click',event=>{const tab=event.target.closest('[data-section]');if(tab)selectSection(tab.dataset.section);});
  nav.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=[...nav.querySelectorAll('[data-section]')].filter(t=>!t.hidden),index=tabs.indexOf(document.activeElement);if(index<0)return;event.preventDefault();const n=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectSection(tabs[n].dataset.section,{focus:true});});
  document.addEventListener('gather:navigate',event=>selectSection(event.detail));
  window.addEventListener('hashchange',()=>selectSection(location.hash.slice(1)));
}
