// Screenshot acquisition stays in a visible extension document. No worker timers or
// persistent host access are needed, and the frozen source window is always checked.
export const CAPTURE_LIMITS = Object.freeze({maxTiles:24,maxPixels:48_000_000,maxHeight:24000,maxDurationMs:60000,intervalMs:650,settleMs:220});

export class CaptureStopped extends Error {
  constructor(message='Capture cancelled.') { super(message);this.name='CaptureStopped'; }
}
function checkSignal(signal){if(signal?.aborted)throw new CaptureStopped();}
export function selectionBounds(rect,width,height){
  if(![rect.x,rect.y,rect.width,rect.height,width,height].every(Number.isFinite))throw new Error('Enter finite pixel coordinates.');
  const x=Math.max(0,Math.min(width,Math.floor(Math.min(rect.x,rect.x+rect.width))));
  const y=Math.max(0,Math.min(height,Math.floor(Math.min(rect.y,rect.y+rect.height))));
  const right=Math.max(x,Math.min(width,Math.ceil(Math.max(rect.x,rect.x+rect.width))));
  const bottom=Math.max(y,Math.min(height,Math.ceil(Math.max(rect.y,rect.y+rect.height))));
  if(right-x<1||bottom-y<1)throw new Error('Select a rectangle with a positive width and height.');
  return {x,y,width:right-x,height:bottom-y};
}
export function fullPagePlan(metrics,limits=CAPTURE_LIMITS){
  const scale=Math.max(0.1,metrics.scale||metrics.devicePixelRatio||1);
  const width=Math.ceil(metrics.width*scale);
  const capacity=Math.floor(limits.maxPixels/width/scale);
  const height=Math.min(metrics.totalHeight,limits.maxHeight,capacity,metrics.height*limits.maxTiles);
  if(height<1||width*scale>limits.maxPixels)throw new Error('The page exceeds the safe image size limit. Reduce browser zoom or window size.');
  const positions=[];
  for(let y=0;positions.length<limits.maxTiles;){positions.push(Math.min(y,Math.max(0,metrics.totalHeight-metrics.height)));if(y+metrics.height>=height)break;y+=metrics.height;}
  return {width,height:Math.ceil(height*scale),cssHeight:height,positions:[...new Set(positions)],bounded:height<metrics.totalHeight,scale};
}

// This function must remain self contained: Chrome serializes it into the selected
// tab's isolated world. A watchdog restores temporary styles if the controller closes.
export function pageCaptureOperation(operation,token,args={}){
  const key='__gatherCaptureSessions';
  const sessions=globalThis[key]||(globalThis[key]=Object.create(null));
  const measure=()=>({url:location.href,title:document.title,width:innerWidth,height:innerHeight,devicePixelRatio,scrollX,scrollY,totalHeight:Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0,innerHeight),totalWidth:Math.max(document.documentElement.scrollWidth,document.body?.scrollWidth||0,innerWidth),visualScale:visualViewport?.scale||1});
  if(operation==='measure')return measure();
  const restore=session=>{
    clearTimeout(session.timer);
    for(const [element,property,value,priority] of session.styles){if(value)element.style.setProperty(property,value,priority);else element.style.removeProperty(property);}
    scrollTo({left:session.x,top:session.y,behavior:'instant'});
    removeEventListener('pagehide',session.onHide);delete sessions[token];
  };
  if(operation==='init'){
    if(sessions[token])restore(sessions[token]);
    const session={x:scrollX,y:scrollY,styles:[],hidden:false,started:performance.now()};
    const change=(element,property,value)=>{session.styles.push([element,property,element.style.getPropertyValue(property),element.style.getPropertyPriority(property)]);element.style.setProperty(property,value,'important');};
    for(const element of [document.documentElement,document.body].filter(Boolean)){
      change(element,'scroll-behavior','auto');change(element,'scroll-snap-type','none');change(element,'overflow-anchor','none');
    }
    const elements=[...document.querySelectorAll('body *')].slice(0,12000);
    session.sticky=elements.filter(element=>['fixed','sticky'].includes(getComputedStyle(element).position));
    session.nested=elements.filter(element=>{const style=getComputedStyle(element),rect=element.getBoundingClientRect();return rect.width>0&&rect.height>0&&element.scrollHeight>element.clientHeight+4&&['auto','scroll'].includes(style.overflowY);}).length;
    session.onHide=()=>restore(session);addEventListener('pagehide',session.onHide,{once:true});sessions[token]=session;
    session.timer=setTimeout(()=>restore(session),15000);
    return {...measure(),nestedScrollers:session.nested,stickyElements:session.sticky.length,elementScanBounded:document.querySelectorAll('body *').length>12000};
  }
  const session=sessions[token];
  if(!session){if(operation==='restore')return {restored:false};throw new Error('The source document changed or capture restoration timed out.');}
  clearTimeout(session.timer);
  if(operation==='restore'){restore(session);return {restored:true};}
  session.timer=setTimeout(()=>restore(session),15000);
  if(operation==='scroll'){
    if(args.hideSticky&&!session.hidden){for(const element of session.sticky){session.styles.push([element,'visibility',element.style.getPropertyValue('visibility'),element.style.getPropertyPriority('visibility')]);element.style.setProperty('visibility','hidden','important');}session.hidden=true;}
    scrollTo({left:args.x??0,top:args.y,behavior:'instant'});
  }
  return measure();
}

export function browserCaptureAdapter(source,browser=globalThis.chrome){
  let interruption=null,documentId=source.documentId||null;
  const interrupt=message=>{interruption=new CaptureStopped(message);};
  const activated=info=>{if(info.windowId===source.windowId&&info.tabId!==source.tabId)interrupt('The source tab changed. No image of the other tab was retained.');};
  const removed=tabId=>{if(tabId===source.tabId)interrupt('The source tab was closed.');};
  const updated=(tabId,change)=>{if(tabId===source.tabId&&(change.url||change.status==='loading'))interrupt('The source page navigated during capture.');};
  browser.tabs.onActivated.addListener(activated);browser.tabs.onRemoved.addListener(removed);browser.tabs.onUpdated.addListener(updated);
  return {
    now:()=>Date.now(),
    async sleep(ms,signal){checkSignal(signal);await new Promise((resolve,reject)=>{const timer=setTimeout(done,ms);function done(){signal?.removeEventListener('abort',abort);resolve();}function abort(){clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new CaptureStopped());}signal?.addEventListener('abort',abort,{once:true});});},
    async assertSource(){if(interruption)throw interruption;const [tab,active]=await Promise.all([browser.tabs.get(source.tabId),browser.tabs.query({windowId:source.windowId,active:true})]);if(interruption)throw interruption;if(!tab.active||active[0]?.id!==source.tabId||tab.windowId!==source.windowId)throw new CaptureStopped('Return to the source tab and start a new capture.');if(tab.url!==source.url)throw new CaptureStopped('The source page changed. Start a new capture from that page.');return tab;},
    async page(operation,token,args){const results=await browser.scripting.executeScript({target:{tabId:source.tabId},func:pageCaptureOperation,args:[operation,token,args||{}]});const result=results[0];if(!result||result.result?.url&&result.result.url!==source.url)throw new CaptureStopped('The source page navigated during capture.');if(documentId&&result.documentId!==documentId)throw new CaptureStopped('The source document changed during capture.');documentId=result.documentId;return result.result;},
    async screenshot(){
      // The session timestamp also paces separate visible captures, not just tiles.
      const key='gather.lastScreenshotAt',last=(await browser.storage.session.get(key))[key]||0;
      const wait=650-(Date.now()-last);if(wait>0)await this.sleep(wait);
      await this.assertSource();await browser.storage.session.set({[key]:Date.now()});
      const dataUrl=await browser.tabs.captureVisibleTab(source.windowId,{format:'png'});if(interruption)throw interruption;const response=await fetch(dataUrl);return response.blob();
    },
    async dimensions(blob){const bitmap=await createImageBitmap(blob);const value={width:bitmap.width,height:bitmap.height};bitmap.close();return value;},
    compose:composeTiles,
    dispose(){browser.tabs.onActivated.removeListener(activated);browser.tabs.onRemoved.removeListener(removed);browser.tabs.onUpdated.removeListener(updated);},
  };
}

async function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The browser could not encode the image.')),'image/png'));}
export async function cropImage(blob,rect){
  const bitmap=await createImageBitmap(blob),bounds=selectionBounds(rect,bitmap.width,bitmap.height);
  const canvas=document.createElement('canvas');canvas.width=bounds.width;canvas.height=bounds.height;
  canvas.getContext('2d').drawImage(bitmap,bounds.x,bounds.y,bounds.width,bounds.height,0,0,bounds.width,bounds.height);bitmap.close();
  return {blob:await canvasBlob(canvas),bounds};
}
export async function composeTiles(tiles,{width,height,scale,originY=0}){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');if(!context)throw new Error('The browser cannot allocate the stitched image.');
  let coveredHeight=0;
  for(const tile of tiles){
    const bitmap=await createImageBitmap(tile.blob),tileY=Math.round((tile.coordinates.y-originY)*scale);
    // The final scroll is often clamped, overlapping the previous viewport.
    // Keep earlier pixels (including the first header) and append only new rows.
    const destinationY=Math.max(tileY,coveredHeight),sourceY=destinationY-tileY;
    const cropHeight=Math.min(bitmap.height-sourceY,height-destinationY);
    if(cropHeight>0){context.drawImage(bitmap,0,sourceY,Math.min(width,bitmap.width),cropHeight,0,destinationY,Math.min(width,bitmap.width),cropHeight);coveredHeight=destinationY+cropHeight;}
    bitmap.close();
  }
  return canvasBlob(canvas);
}

export async function acquireCapture({source,mode='visible',signal,onProgress=()=>{},adapter,limits={},token=globalThis.crypto.randomUUID()}){
  const api=adapter||browserCaptureAdapter(source),bounds={...CAPTURE_LIMITS,...limits};
  const started=api.now(),tiles=[],limitations=[];let initialized=false,metrics,plan,lastShot=-Infinity,lastMetrics;
  const guard=async()=>{checkSignal(signal);if(api.now()-started>bounds.maxDurationMs)throw new Error('The capture reached its time limit.');await api.assertSource();};
  const shot=async()=>{await guard();const remaining=bounds.intervalMs-(api.now()-lastShot);if(remaining>0)await api.sleep(remaining,signal);await guard();const before=await api.page(mode==='full-page'?'state':'measure',token);const blob=await api.screenshot();lastShot=api.now();await guard();const after=await api.page(mode==='full-page'?'state':'measure',token);if(before.width!==after.width||before.height!==after.height||before.devicePixelRatio!==after.devicePixelRatio||before.visualScale!==after.visualScale||Math.abs(before.scrollY-after.scrollY)>1||Math.abs(before.scrollX-after.scrollX)>1)throw new CaptureStopped('The page moved, resized, or changed zoom during capture.');lastMetrics=after;return {blob,metrics:after,dimensions:await api.dimensions(blob)};};
  try{
    await guard();
    if(mode!=='full-page'){
      onProgress('Capturing the visible page…');const image=await shot();
      const scale=image.dimensions.width/image.metrics.width;
      return {assets:[{blob:image.blob,role:'original',dimensions:image.dimensions}],status:'complete',dimensions:image.dimensions,scale,coordinates:{scrollX:image.metrics.scrollX,scrollY:image.metrics.scrollY,viewportWidth:image.metrics.width,viewportHeight:image.metrics.height,visualScale:image.metrics.visualScale,devicePixelRatio:image.metrics.devicePixelRatio},limitations:['A screenshot records rendered pixels at this moment; it is not a complete page archive.']};
    }
    metrics=await api.page('init',token);initialized=true;
    if(metrics.visualScale!==1)throw new Error('Full-page capture does not support pinch zoom. Reset pinch zoom, then capture again.');
    if(metrics.nestedScrollers)limitations.push(`${metrics.nestedScrollers} scrolling element(s): only their visible content is included; nested scrolling capture is not supported.`);
    if(metrics.stickyElements)limitations.push('Fixed and sticky elements appear in the first tile and are hidden in subsequent tiles to avoid repetition.');
    if(metrics.elementScanBounded)limitations.push('Fixed-element inspection was limited to 12,000 elements.');
    limitations.push('Full page means the initial top-level page extent. Animations, video, lazy loading, and content changes can create seams; original tiles are retained.');
    plan=fullPagePlan(metrics,bounds);
    for(let index=0;index<plan.positions.length;index++){
      await guard();onProgress(`Capturing page section ${index+1} of ${plan.positions.length}…`);
      await api.page('scroll',token,{y:plan.positions[index],hideSticky:index>0});await api.sleep(bounds.settleMs,signal);
      const image=await shot();const scale=image.dimensions.width/image.metrics.width;
      if(index===0){plan=fullPagePlan({...metrics,scale},bounds);}
      if(image.metrics.width!==metrics.width||image.metrics.height!==metrics.height||Math.abs(scale-plan.scale)>0.01)throw new CaptureStopped('The page dimensions or zoom changed during capture.');
      if(Math.abs(image.metrics.scrollY-plan.positions[index])>2)throw new Error('The page prevented scrolling to the required position.');
      tiles.push({blob:image.blob,role:'tile',dimensions:image.dimensions,coordinates:{x:image.metrics.scrollX,y:image.metrics.scrollY,width:image.metrics.width,height:image.metrics.height},index});
    }
    if(plan.bounded)limitations.push('The capture stopped at the configured image, tile, or page-height limit.');
    if(lastMetrics.totalHeight!==metrics.totalHeight)limitations.push('The page height changed while scrolling (for example, lazy loading or an infinite feed); the initial page extent was used.');
    if(metrics.totalWidth>metrics.width)limitations.push('Horizontal overflow extends beyond the captured viewport width.');
    const partial=plan.bounded||lastMetrics.totalHeight!==metrics.totalHeight||metrics.totalWidth>metrics.width;
    const original=await api.compose(tiles,plan);
    return {assets:[{blob:original,role:'derivative',kind:'stitched',dimensions:{width:plan.width,height:plan.height}},...tiles],status:partial?'partial':'complete',dimensions:{width:plan.width,height:plan.height},scale:plan.scale,coordinates:{scrollX:metrics.scrollX,scrollY:metrics.scrollY,viewportWidth:metrics.width,viewportHeight:metrics.height,initialPageHeight:metrics.totalHeight,capturedHeight:plan.cssHeight,tiles:tiles.map(tile=>tile.coordinates)},limitations};
  }catch(error){
    if(signal?.aborted||!tiles.length)throw error;
    // Retain already validated source tiles when navigation, resize, or a bound
    // interrupts later work. Never retain a screenshot that failed its post-check.
    limitations.push(`Partial capture: ${error.message}`);
    const height=Math.min(plan.height,Math.ceil((tiles.at(-1).coordinates.y+metrics.height)*plan.scale));
    let assets=[...tiles];
    try{assets.unshift({blob:await api.compose(tiles,{...plan,height}),role:'derivative',kind:'stitched',dimensions:{width:plan.width,height}});}catch(stitchError){limitations.push(`Stitching unavailable: ${stitchError.message}. Original tiles are saved.`);}
    return {assets,status:'partial',dimensions:{width:plan.width,height},scale:plan.scale,coordinates:{tiles:tiles.map(tile=>tile.coordinates)},limitations};
  }finally{
    if(initialized){try{await api.page('restore',token);}catch{/* A navigated document has no remaining temporary changes. */}}
    api.dispose?.();
  }
}
