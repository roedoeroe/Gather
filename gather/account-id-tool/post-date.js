import {normalizeLookup,jsonObjects,walk,pageAccessIssue,isFacebookContentRecord} from './core.js';

// Dates belong to a specific post, never to the first timestamp on a page.
export function parsePostTimestamp(value) {
  if(typeof value==='number')value=String(value);
  if(typeof value!=='string'||value.length>120)return null;
  const raw=value.trim();let milliseconds,precision='second';
  if(/^\d{10}(?:\d{3})?$/.test(raw))milliseconds=Number(raw)*(raw.length===10?1000:1);
  else if(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(raw)){
    const date=raw.slice(0,10),[y,m,d]=date.split('-').map(Number);
    if(y<2000||y>new Date().getUTCFullYear()+1||m<1||m>12||d<1||d>new Date(Date.UTC(y,m,0)).getUTCDate())return null;
    const clock=raw.slice(11).match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
    if(clock&&(Number(clock[1])>23||Number(clock[2])>59||Number(clock[3]||0)>59))return null;
    if(raw.length===10)return {value:raw,precision:'date',timezone:'not supplied',raw};
    // A wall-clock time without an offset is not an absolute instant.
    if(!/(Z|[+-]\d{2}:\d{2})$/.test(raw))return null;
    if(!/:\d{2}:\d{2}/.test(raw))precision='minute';
    milliseconds=Date.parse(raw);
  }else if(/^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{2}:\d{2}:\d{2} [+-]\d{4} \d{4}$/.test(raw))milliseconds=Date.parse(raw);
  else return null;
  if(!Number.isFinite(milliseconds)||milliseconds<Date.UTC(2000,0,1)||milliseconds>Date.now()+86400000)return null;
  return {value:new Date(milliseconds).toISOString(),precision,timezone:'UTC',raw};
}
export function extractPostDate(html,lookup,pageUrl=lookup.url,times=[]) {
  if(typeof html!=='string'||html.length>15000000)return {error:'This page exceeds Gather’s reading limit.'};
  let current;try{current=normalizeLookup(pageUrl);}catch{return {error:'Open an individual supported post to get its date.'};}
  if(!lookup.content||current.key!==lookup.key)return {error:'The post changed. Open the intended post and try again.'};
  const roots=jsonObjects(html),access=pageAccessIssue(html,pageUrl,roots);if(access)return {error:access};
  const candidates=[];
  const matches=url=>{try{const link=new URL(url,pageUrl);if(['comment_id','reply_comment_id','reply_id','lc'].some(k=>link.searchParams.has(k)))return false;return normalizeLookup(link.href).key===lookup.key;}catch{return false;}};
  const add=(value,method)=>{const date=parsePostTimestamp(value);if(date)candidates.push({...date,method});};
  const id=lookup.content.id,platform=lookup.platform;
  walk(roots,obj=>{
    if(platform==='instagram'&&(obj.shortcode===id||obj.code===id))for(const k of ['taken_at_timestamp','taken_at'])add(obj[k],'Instagram · '+k);
    if(platform==='threads'&&(obj.code===id||obj.shortcode===id))add(obj.taken_at,'Threads · taken_at');
    if(platform==='tiktok'&&String(obj.id)===id&&obj.author)for(const k of ['createTime','create_time'])add(obj[k],'TikTok · '+k);
    if(platform==='facebook'&&isFacebookContentRecord(obj,id))for(const k of ['creation_time','created_time','publish_time'])add(obj[k],'Facebook · '+k);
    if(platform==='x'&&(String(obj.rest_id||obj.id_str)===id||String(obj.legacy?.id_str)===id)&&(obj.core?.user_results||obj.user))add(obj.legacy?.created_at||obj.created_at,'X · created_at');
    if(platform==='youtube'&&obj.videoDetails?.videoId===id){const data=obj.microformat?.playerMicroformatRenderer;if(data)add(data.publishDate,'YouTube · publishDate');}
    const type=Array.isArray(obj['@type'])?obj['@type']:[obj['@type']];
    if(type.some(t=>['SocialMediaPosting','BlogPosting','VideoObject','Article'].includes(t))&&[obj.url,obj['@id'],typeof obj.mainEntityOfPage==='string'?obj.mainEntityOfPage:obj.mainEntityOfPage?.['@id']].some(v=>typeof v==='string'&&matches(v)))add(obj.datePublished,'Post-linked structured data · datePublished');
  });
  for(const time of times.slice(0,100))if(typeof time?.url==='string'&&matches(time.url))add(time.value,'Post permalink · '+(time.kind==='epoch'?'timestamp':'time datetime'));
  if(!candidates.length)return {error:'No exact publication date was exposed for this post. Relative labels such as “1w” are not precise enough.'};
  const exact=candidates.filter(c=>c.precision!=='date'),chosen=exact[0]||candidates[0];
  // Minute values may corroborate seconds without inventing seconds themselves.
  const conflict=candidates.some(c=>{
    if(c.precision==='date'||chosen.precision==='date')return c.value.slice(0,10)!==chosen.value.slice(0,10);
    const unit=c.precision==='minute'||chosen.precision==='minute'?60000:1000;
    return Math.floor(Date.parse(c.value)/unit)!==Math.floor(Date.parse(chosen.value)/unit);
  });
  if(conflict)return {error:'Conflicting publication dates were found for this post. Gather did not choose one.'};
  const best=exact.find(c=>c.precision==='second')||chosen;
  return {...best,postUrl:lookup.url,platform,checkedAt:Date.now()};
}
