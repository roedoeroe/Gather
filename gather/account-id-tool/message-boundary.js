// Validate serialization before operation-specific validators run. This does not
// grant access: background.js still checks extension ID and exact page URL first.
export function validateMessage(message) {
  if(!message||typeof message!=='object'||Array.isArray(message)||typeof message.type!=='string'||message.type.length>80)throw new Error('Invalid Gather message.');
  const seen=new Set(),stack=[[message,0]];let size=0,nodes=0;
  while(stack.length){
    const [value,depth]=stack.pop();
    if(++nodes>600000||depth>64)throw new Error('Gather message is too complex.');
    if(typeof value==='string'){size+=value.length;if(value.length>16000000)throw new Error('Gather message field is too large.');}
    else if(value&&typeof value==='object'){
      if(seen.has(value)||(!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value))))throw new Error('Invalid Gather message data.');
      seen.add(value);
      for(const [key,child] of Object.entries(value)){
        if(['__proto__','prototype','constructor'].includes(key))throw new Error('Unsafe Gather message field.');
        size+=key.length;stack.push([child,depth+1]);
      }
    }else if(value!==null&&value!==undefined&&typeof value!=='boolean'&&!(typeof value==='number'&&Number.isFinite(value)))throw new Error('Invalid Gather message value.');
    if(size>36*1024*1024)throw new Error('Gather message is too large.');
  }
  return message;
}

export function restrictStorageAccess(storage=globalThis.chrome?.storage) {
  return Promise.all(['local','session'].map(async area=>{
    if(typeof storage?.[area]?.setAccessLevel!=='function')throw new Error('Gather could not protect local storage. Reload the extension in a supported browser.');
    await storage[area].setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  })).catch(()=>{throw new Error('Gather could not protect local storage. Reload the extension in a supported browser.');});
}
