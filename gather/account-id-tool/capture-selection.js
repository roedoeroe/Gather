import {CaptureStopped,selectionBounds,browserCaptureAdapter} from './capture-engine.js';

// Serialized into the invoked page's isolated world. Nothing runs passively.
export function pageSelectionOperation(operation,token,options={}){
  const sessions=globalThis.__gatherSelectionSessions ||= new Map();
  if(operation==='cancel'){sessions.get(token)?.stop(options.message||'Selection cancelled.');return true;}
  if(operation!=='start')throw new Error('Unknown selection operation.');
  for(const session of sessions.values())session.stop('A new selection was started.');
  return new Promise(resolve=>{
    const previousFocus=document.activeElement;
    const measure=()=>({url:location.href,width:innerWidth,height:innerHeight,scrollX,scrollY,devicePixelRatio,visualScale:visualViewport?.scale||1});
    const viewport=measure();
    if(viewport.visualScale!==1){resolve({ok:false,message:'Reset pinch zoom before selecting an area.'});return;}
    const host=document.createElement('div');host.id='gather-selection-overlay';
    for(const [key,value]of [['all','initial'],['position','fixed'],['inset','0'],['z-index','2147483647']])host.style.setProperty(key,value,'important');
    const root=host.attachShadow({mode:'closed'}),sheet=new CSSStyleSheet();
    sheet.replaceSync(`
      :host{all:initial}*{box-sizing:border-box}dialog{all:initial;position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;border:0;padding:0;background:transparent;overflow:hidden;cursor:crosshair;font:14px system-ui,sans-serif;color:#172e26}dialog::backdrop{background:transparent}
      .surface{position:absolute;inset:0;background:#0005;touch-action:none;user-select:none}.rect{position:absolute;border:2px solid #fff;outline:1px solid #17684b;box-shadow:0 0 0 100vmax #0006;pointer-events:none;display:none}
      .tools{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:min(580px,calc(100vw - 24px));padding:12px 16px;border-radius:12px;background:#fff;box-shadow:0 8px 32px #0005;cursor:default;line-height:1.5}.row{display:flex;align-items:center;justify-content:space-between;gap:12px}.hint{font-size:12px;color:#50655c;margin:5px 0 0;overflow-wrap:anywhere}button,input{font:inherit}button{padding:7px 12px;border:1px solid #bfcfc6;border-radius:7px;background:#fff;color:#172e26;cursor:pointer}button:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid #7aaf93;outline-offset:2px}.primary{background:#17684b;color:white;border-color:#17684b}details{margin-top:8px}summary{cursor:pointer;font-size:12px}form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}label{font-size:12px}input{display:block;width:100%;margin-top:4px;padding:6px;border:1px solid #bfcfc6;border-radius:5px}form button{grid-column:1/-1}.error{color:#a4231c;font-size:12px}
    `);root.adoptedStyleSheets=[sheet];
    const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
    const dialog=node('dialog'),surface=node('div',null,'surface'),outline=node('div',null,'rect'),tools=node('section',null,'tools'),row=node('div',null,'row'),cancel=node('button','Cancel'),details=node('details'),form=node('form'),error=node('p',null,'error');
    cancel.type='button';dialog.setAttribute('aria-label','Select a screenshot area');row.append(node('strong','Drag to capture'),cancel);
    tools.append(row,node('p','Saved to '+(options.destination||'Gather')+' · Esc cancels','hint'));
    details.append(node('summary','Precise selection · keyboard'));
    const fields={};for(const [key,label,value]of [['x','Left',0],['y','Top',0],['width','Width',Math.min(400,viewport.width)],['height','Height',Math.min(300,viewport.height)]]){
      const field=node('label',label),input=node('input');input.type='number';input.value=value;input.min=['width','height'].includes(key)?1:0;input.max=['x','width'].includes(key)?viewport.width:viewport.height;input.required=true;field.append(input);fields[key]=input;form.append(field);
    }
    const confirm=node('button','Capture selection','primary');confirm.type='submit';form.append(confirm,error);details.append(form);tools.append(details);surface.append(outline);dialog.append(surface,tools);root.append(dialog);document.documentElement.append(host);
    let done=false,drag=null,timer;
    const cleanup=()=>{clearTimeout(timer);sessions.delete(token);for(const [target,event,listener]of listeners)target.removeEventListener(event,listener,true);try{dialog.close();}catch{}host.remove();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});};
    const finish=(result)=>{if(done)return;done=true;cleanup();if(result.ok){const flush=setTimeout(()=>resolve(result),250);requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(flush);resolve(result);}));}else resolve(result);};
    const stop=message=>finish({ok:false,message});sessions.set(token,{stop});
    const listeners=[];const listen=(target,event,fn)=>{target.addEventListener(event,fn,true);listeners.push([target,event,fn]);};
    const unchanged=()=>{const now=measure();return Object.keys(viewport).every(k=>now[k]===viewport[k]);};
    const selected=rect=>{if(!unchanged()){stop('The page moved, resized, or changed zoom. Start selection again.');return;}finish({ok:true,rect,viewport});};
    const bounds=rect=>{let{x,y,width,height}=rect;if(width<0){x+=width;width=-width;}if(height<0){y+=height;height=-height;}x=Math.max(0,Math.min(viewport.width,x));y=Math.max(0,Math.min(viewport.height,y));width=Math.min(width,viewport.width-x);height=Math.min(height,viewport.height-y);if(![x,y,width,height].every(Number.isFinite)||width<1||height<1)throw new Error('Select an area at least 1 pixel wide and high.');return{x,y,width,height};};
    const paint=rect=>{surface.style.background='transparent';Object.assign(outline.style,{display:'block',left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px'});};
    surface.onpointerdown=event=>{if(event.button!==0||drag)return;event.preventDefault();drag={x:event.clientX,y:event.clientY,id:event.pointerId};surface.setPointerCapture(event.pointerId);};
    surface.onpointermove=event=>{if(!drag||event.pointerId!==drag.id)return;try{paint(bounds({x:drag.x,y:drag.y,width:event.clientX-drag.x,height:event.clientY-drag.y}));}catch{}};
    surface.onpointerup=event=>{if(!drag||event.pointerId!==drag.id)return;const start=drag;drag=null;try{selected(bounds({x:start.x,y:start.y,width:event.clientX-start.x,height:event.clientY-start.y}));}catch(e){error.textContent=e.message;details.open=true;}};
    surface.onpointercancel=()=>{drag=null;stop('Selection was interrupted. Start again.');};
    form.onsubmit=event=>{event.preventDefault();try{selected(bounds(Object.fromEntries(Object.entries(fields).map(([k,input])=>[k,Number(input.value)]))));}catch(e){error.textContent=e.message;}};
    for(const input of Object.values(fields))input.oninput=()=>{try{paint(bounds(Object.fromEntries(Object.entries(fields).map(([k,i])=>[k,Number(i.value)]))));error.textContent='';}catch(e){error.textContent=e.message;}};
    cancel.onclick=()=>stop('Selection cancelled.');dialog.oncancel=event=>{event.preventDefault();stop('Selection cancelled.');};
    listen(window,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();stop('Selection cancelled.');}else if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)&&!root.activeElement?.matches('input,button,summary'))event.preventDefault();});
    listen(window,'wheel',event=>event.preventDefault());listen(window,'resize',()=>stop('The page resized. Start selection again.'));listen(window,'scroll',()=>{if(!unchanged())stop('The page moved. Start selection again.');});listen(window,'pagehide',()=>stop('The source page navigated.'));listen(document,'visibilitychange',()=>{if(document.hidden)stop('The source tab changed. Start selection again.');});
    timer=setTimeout(()=>stop('Selection expired. Start a new capture.'),180000);
    try{dialog.showModal();cancel.focus({preventScroll:true});}catch(e){stop('Page selection is unavailable: '+e.message);}
  });
}

export async function selectPageArea({source,signal,destination,token=crypto.randomUUID()}){
  const api=browserCaptureAdapter(source);let stopping=false;
  const cancel=()=>{if(stopping)return;stopping=true;chrome.scripting.executeScript({target:{tabId:source.tabId},func:pageSelectionOperation,args:['cancel',token]}).catch(()=>{});};
  const activated=info=>{if(info.windowId===source.windowId&&info.tabId!==source.tabId)cancel();};
  const updated=(id,change)=>{if(id===source.tabId&&(change.url||change.status==='loading'))cancel();};
  chrome.tabs.onActivated.addListener(activated);chrome.tabs.onUpdated.addListener(updated);signal?.addEventListener('abort',cancel,{once:true});
  try{
    await api.assertSource();if(signal?.aborted)throw new CaptureStopped();
    const rows=await chrome.scripting.executeScript({target:{tabId:source.tabId},func:pageSelectionOperation,args:['start',token,{destination}]});
    const result=rows[0]?.result;if(signal?.aborted||stopping||!result?.ok)throw new CaptureStopped(result?.message||'Selection was interrupted.');
    await api.assertSource();return {...result,documentId:rows[0].documentId};
  }finally{cancel();api.dispose();chrome.tabs.onActivated.removeListener(activated);chrome.tabs.onUpdated.removeListener(updated);signal?.removeEventListener('abort',cancel);}
}

export function selectionPixels(selection,capture){
  const v=selection.viewport,c=capture.coordinates;
  if(v.width!==c.viewportWidth||v.height!==c.viewportHeight||v.scrollX!==c.scrollX||v.scrollY!==c.scrollY||v.visualScale!==c.visualScale||v.devicePixelRatio!==c.devicePixelRatio)throw new CaptureStopped('The page changed after selection. Start a new capture.');
  const sx=capture.dimensions.width/v.width,sy=capture.dimensions.height/v.height;
  if(Math.abs(sx-sy)>0.02||!Number.isFinite(sx)||sx<=0)throw new Error('The screenshot scale could not be matched to the selection.');
  const r=selection.rect,x=Math.floor(r.x*sx),y=Math.floor(r.y*sy);
  return selectionBounds({x,y,width:Math.ceil((r.x+r.width)*sx)-x,height:Math.ceil((r.y+r.height)*sy)-y},capture.dimensions.width,capture.dimensions.height);
}
