// Original bytes are retrieved only after an explicit image context-menu action.
// No guessed CDN variants, page scanning, credentials, or screenshot fallback.
export const SOURCE_IMAGE_LIMIT = 64 * 1024 * 1024;
export const SOURCE_IMAGE_TYPES = Object.freeze(['image/png','image/jpeg','image/webp','image/avif','image/gif']);
export function sourceImageURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('This image has no retrievable source URL. Use Select area to capture it instead.'); }
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.href.length > 4096)
    throw new Error('This image uses an unsupported or temporary source. Use Select area instead.');
  return url.href;
}
export function sourceImageType(bytes) {
  const ascii=(start,end)=>String.fromCharCode(...bytes.slice(start,end));
  if(bytes[0]===137&&ascii(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)return 'image/png';
  if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
  if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return 'image/webp';
  if(['GIF87a','GIF89a'].includes(ascii(0,6)))return 'image/gif';
  if(ascii(4,8)==='ftyp'&&['avif','avis'].includes(ascii(8,12)))return 'image/avif';
  throw new Error('Unsupported source image format. PNG, JPEG, WebP, AVIF and GIF are supported.');
}
export async function retrieveSourceImage(value,{signal,fetchImage=fetch,decode=createImageBitmap,timeout=15000}={}) {
  const url=sourceImageURL(value),controller=new AbortController();
  const abort=()=>controller.abort();
  signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,timeout);
  let reader,bitmap;
  try {
    if(signal?.aborted)abort();
    const response=await fetchImage(url,{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error',signal:controller.signal});
    if(!response.ok)throw new Error(response.status===403||response.status===401?'Image access was denied or its link expired. Reopen the image and try again.':response.status===404||response.status===410?'The source image is no longer available.':'The image server returned HTTP '+response.status+'.');
    if(Number(response.headers.get('content-length'))>SOURCE_IMAGE_LIMIT)throw new Error('The source image exceeds the 64 MiB limit.');
    if(!response.body)throw new Error('The image server returned no image bytes.');
    reader=response.body.getReader();const chunks=[];let size=0;
    for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>SOURCE_IMAGE_LIMIT)throw new Error('The source image exceeds the 64 MiB limit.');chunks.push(value);}
    if(controller.signal.aborted)throw new DOMException('Stopped','AbortError');
    const raw=new Blob(chunks),mime=sourceImageType(new Uint8Array(await raw.slice(0,32).arrayBuffer()));
    const declared=response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if(declared?.startsWith('image/')&&declared!==mime&&declared!=='image/jpg')throw new Error('The image bytes do not match the server’s image format.');
    const blob=new Blob(chunks,{type:mime});
    try {bitmap=await decode(blob);} catch {throw new Error('The browser could not decode this source image.');}
    if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>48000000)throw new Error('The source image exceeds the 48 million pixel limit.');
    if(controller.signal.aborted)throw new DOMException('Stopped','AbortError');
    const pathname=new URL(url).pathname;let filename='';try{filename=decodeURIComponent(pathname.split('/').at(-1)).slice(0,200);}catch{}
    return {blob,dimensions:{width:bitmap.width,height:bitmap.height},imageUrl:url,filename,mime};
  } catch(error) {
    if(controller.signal.aborted)throw new Error(signal?.aborted?'Source image save cancelled.':'The source image took too long to arrive. Try again.');
    if(error instanceof TypeError)throw new Error('The browser could not retrieve this image. The server may block access or redirects. Open the image itself, then try again; Gather has not substituted a screenshot.');
    throw error;
  } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);await reader?.cancel().catch(()=>{});reader?.releaseLock();bitmap?.close();}
}
