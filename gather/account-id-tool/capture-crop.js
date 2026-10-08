// Crop geometry is always in saved image pixels, independent of CSS fit/zoom.
export function resizeCrop(rect,handle,dx,dy,width,height){
  if(![rect.x,rect.y,rect.width,rect.height,dx,dy,width,height].every(Number.isFinite)||width<1||height<1)throw new Error('Invalid crop dimensions.');
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Math.round(n)));
  if(handle==='move')return {...rect,x:clamp(rect.x+dx,0,width-rect.width),y:clamp(rect.y+dy,0,height-rect.height)};
  if(!['n','s','e','w','ne','nw','se','sw'].includes(handle))throw new Error('Choose a crop handle.');
  let left=rect.x,top=rect.y,right=rect.x+rect.width,bottom=rect.y+rect.height;
  if(handle.includes('w'))left=clamp(left+dx,0,right-1);
  if(handle.includes('e'))right=clamp(right+dx,left+1,width);
  if(handle.includes('n'))top=clamp(top+dy,0,bottom-1);
  if(handle.includes('s'))bottom=clamp(bottom+dy,top+1,height);
  return {x:left,y:top,width:right-left,height:bottom-top};
}
