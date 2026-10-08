// Retain keyboard position when a live storage update rebuilds a local list.
// Never steal focus from a dialog or from a user who moved elsewhere meanwhile.
export function retainFocus(root){
  const current=document.activeElement;
  if(!root?.contains(current))return ()=>{};
  const row=current.closest('[data-focus-key]'),key=row?.dataset.focusKey;
  const selector='button,input,select,textarea,summary,a[href]';
  const index=[...(row||root).querySelectorAll(selector)].indexOf(current);
  const label=current.getAttribute('aria-label'),text=current.textContent,type=current.tagName;
  return ()=>{
    if(current.isConnected||document.activeElement!==document.body)return;
    const parent=key?[...root.querySelectorAll('[data-focus-key]')].find(r=>r.dataset.focusKey===key):root;
    if(!parent)return;
    const candidates=[...parent.querySelectorAll(selector)];
    const next=label?candidates.find(e=>e.getAttribute('aria-label')===label):candidates[index];
    if(next?.tagName===type&&(label||key||next.textContent===text))next.focus({preventScroll:true});
  };
}
