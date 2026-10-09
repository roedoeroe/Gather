import {CAPTURE_LIMITS,CaptureStopped,browserCaptureAdapter,cropImage,exactSelectionBounds} from './capture-engine.js';

// A selected document region uses only the top-level page. It does not turn a
// nested feed into an archive, nor use timing/URL guesses to identify the tab.
export function regionPlan(metrics,rect,scale=metrics.devicePixelRatio||1,limits=CAPTURE_LIMITS){
  if(![rect.x,rect.y,rect.width,rect.height,scale].every(Number.isFinite)||rect.width<1||rect.height<1||scale<=0||rect.x<metrics.scrollX||rect.x+rect.width>metrics.scrollX+metrics.width+1e-7||rect.y<0||rect.y>=metrics.totalHeight)throw new Error('The selected page region is unavailable. Start a new selection.');
  const originY=Math.min(rect.y,Math.max(0,metrics.totalHeight-metrics.height));
  const width=Math.ceil(metrics.width*scale),maxCssHeight=Math.min(limits.maxHeight,Math.floor(limits.maxPixels/width/scale),metrics.height*limits.maxTiles);
  const bottom=Math.min(rect.y+rect.height,metrics.totalHeight,originY+maxCssHeight);
  if(bottom<=rect.y)throw new Error('The selected region exceeds the image size limit. Select a smaller area.');
  const positions=[];let y=originY;
  while(positions.length<limits.maxTiles){const position=Math.min(y,Math.max(0,metrics.totalHeight-metrics.height));if(positions.at(-1)!==position)positions.push(position);if(y+metrics.height>=bottom)break;y+=metrics.height;}
  return {width,height:Math.ceil((bottom-originY)*scale),scale,originY,originX:metrics.scrollX,positions,bottom,rect:{...rect,height:bottom-rect.y},bounded:bottom<rect.y+rect.height};
}
export async function acquireRegionCapture({source,selection,signal,onProgress=()=>{},adapter,limits={},token=crypto.randomUUID()}){
  const api=adapter||browserCaptureAdapter(source),bounds={...CAPTURE_LIMITS,...limits},started=api.now(),tiles=[],limitations=[];
  let initialized=false,metrics,plan,lastShot=-Infinity,lastMetrics;
  const guard=async()=>{if(signal?.aborted)throw new CaptureStopped();if(api.now()-started>bounds.maxDurationMs)throw new Error('The capture reached its time limit.');await api.assertSource();};
  const finish=async(status)=>{
    const availableBottom=Math.min(plan.bottom,tiles.at(-1).coordinates.y+metrics.height),height=Math.ceil((availableBottom-plan.originY)*plan.scale);
    if(availableBottom<=selection.documentRect.y)throw new Error('No selected pixels could be captured.');
    const stitched=await api.compose(tiles,{...plan,height});
    const rect={x:Math.floor((plan.rect.x-plan.originX)*plan.scale),y:Math.floor((plan.rect.y-plan.originY)*plan.scale),width:Math.ceil((plan.rect.x+plan.rect.width-plan.originX)*plan.scale)-Math.floor((plan.rect.x-plan.originX)*plan.scale),height:Math.ceil((availableBottom-plan.originY)*plan.scale)-Math.floor((plan.rect.y-plan.originY)*plan.scale)};
    const verified=exactSelectionBounds(rect,plan.width,height);
    const selected=await (api.crop||cropImage)(stitched,verified);
    if(selected.bounds.width!==verified.width||selected.bounds.height!==verified.height)throw new Error('The stored selection would omit selected pixels. Capture a smaller area and retry.');
    return {assets:[{blob:selected.blob,role:'derivative',kind:'selection',dimensions:{width:selected.bounds.width,height:selected.bounds.height},crop:selected.bounds},...tiles],dimensions:{width:selected.bounds.width,height:selected.bounds.height},crop:selected.bounds,scale:plan.scale,status,coordinates:{scrollX:metrics.scrollX,scrollY:metrics.scrollY,viewportWidth:metrics.width,viewportHeight:metrics.height,requestedDocumentRect:selection.documentRect,capturedDocumentRect:{...plan.rect,height:availableBottom-plan.rect.y},initialPageHeight:metrics.totalHeight,tiles:tiles.map(t=>t.coordinates)},technical:{selectionMethod:'page',scrollingSelection:true,selectionViewport:selection.viewport},limitations};
  };
  try{
    await guard();metrics=await api.page('init',token);initialized=true;
    const v=selection.viewport;
    if(metrics.visualScale!==1||['width','height','devicePixelRatio','scrollX','scrollY'].some(k=>metrics[k]!==v[k]))throw new CaptureStopped('The page resized, moved, or changed zoom after selection. Start again.');
    if(metrics.nestedScrollers)limitations.push('Only top-level scrolling was captured. Scrolling elements include only their visible content.');
    if(metrics.stickyElements)limitations.push('Fixed/sticky elements are present in the first tile and hidden in later tiles.');
    if(metrics.elementScanBounded)limitations.push('Fixed-element inspection was limited to 12,000 elements.');
    limitations.push('Scrolling selection stitches rendered pixels over time. Dynamic content, lazy loading and animation can create seams. Original tiles are retained privately.');
    plan=regionPlan(metrics,selection.documentRect,metrics.devicePixelRatio,bounds);
    for(let index=0;index<plan.positions.length;index++){
      await guard();onProgress('Capturing selected section '+(index+1)+' of '+plan.positions.length+'…');
      await api.page('scroll',token,{y:plan.positions[index],x:plan.originX,hideSticky:index>0});await api.sleep(bounds.settleMs,signal);
      const wait=bounds.intervalMs-(api.now()-lastShot);if(wait>0)await api.sleep(wait,signal);await guard();
      const before=await api.page('state',token),blob=await api.screenshot();lastShot=api.now();await guard();
      const after=await api.page('state',token),dimensions=await api.dimensions(blob),scale=dimensions.width/after.width;
      if(['width','height','devicePixelRatio','visualScale'].some(k=>before[k]!==after[k]||after[k]!==metrics[k])||Math.abs(before.scrollY-after.scrollY)>1||after.scrollX!==metrics.scrollX||Math.abs(after.scrollY-plan.positions[index])>2||Math.abs(dimensions.height/after.height-scale)*Math.min(after.width,after.height)>2)throw new CaptureStopped('The source moved or changed zoom during capture.');
      if(!tiles.length)plan=regionPlan(metrics,selection.documentRect,scale,bounds);
      else if(Math.abs(scale-plan.scale)>0.01)throw new CaptureStopped('The screenshot scale changed during capture.');
      lastMetrics=after;tiles.push({blob,role:'tile',index,dimensions,coordinates:{x:after.scrollX,y:after.scrollY,width:after.width,height:after.height}});
    }
    if(plan.bounded)limitations.push('The selection reached an image, page-height or tile limit. Only the reported selected extent was saved.');
    if(lastMetrics.totalHeight!==metrics.totalHeight||selection.pageHeight!==metrics.totalHeight)limitations.push('The page height changed while selecting/capturing. The measured page extent was used.');
    return await finish(plan.bounded||lastMetrics.totalHeight!==metrics.totalHeight||selection.pageHeight!==metrics.totalHeight?'partial':'complete');
  }catch(error){
    if(signal?.aborted||error instanceof CaptureStopped||!tiles.length||!plan)throw error;
    limitations.push('Partial selection: '+error.message);return await finish('partial');
  }finally{if(initialized){try{await api.page('restore',token);}catch{/* The original document may have navigated. */}}api.dispose?.();}
}
