// A small static vocabulary. It never reads history, stores text or uses the network.
export const SEARCH_DOMAINS=Object.freeze(['instagram.com','facebook.com','tiktok.com','youtube.com','threads.net','threads.com','x.com','twitter.com']);
export const SEARCH_CAPABILITIES=Object.freeze({
 google:['site:','filetype:','intitle:','inurl:','OR'],bing:['site:','filetype:','intitle:','OR'],
 instagram:['site:','filetype:','intitle:','inurl:','OR'],facebook:['site:','filetype:','intitle:','inurl:','OR'],
 tiktok:['site:','filetype:','intitle:','inurl:','OR'],threads:['site:','filetype:','intitle:','inurl:','OR'],youtube:[],x:[]
});
export function searchCompletions(value,position,provider='google') {
 if(typeof value!=='string'||value.length>2000||position!==value.length||((value.match(/(?<!\\)"/g)||[]).length%2))return [];
 const capabilities=SEARCH_CAPABILITIES[provider]||[],match=value.match(/(?:^|\s)([^\s]*)$/),token=match?.[1]||'';
 if(!token)return [];
 let choices,prefix=token,start=value.length-token.length;
 if(token.startsWith('site:')&&capabilities.includes('site:')){prefix=token.slice(5);start+=5;choices=SEARCH_DOMAINS;}
 else choices=capabilities;
 if(prefix.length<2)return [];
 return choices.filter(word=>word.toLowerCase().startsWith(prefix.toLowerCase())&&word!==prefix).map(word=>({start,end:value.length,text:word,suffix:word.slice(prefix.length)}));
}
