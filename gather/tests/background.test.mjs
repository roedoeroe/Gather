import test from 'node:test';import assert from 'node:assert/strict';
function event(){return {listeners:[],addListener(fn){this.listeners.push(fn);}};}
const local={},session={},onChanged=event();
const area=(db,which)=>({async get(key){return key===null?structuredClone(db):{[key]:structuredClone(db[key])};},async set(values){const changes={};for(const [key,value] of Object.entries(values)){changes[key]={oldValue:db[key],newValue:value};db[key]=structuredClone(value);}for(const fn of onChanged.listeners)fn(changes,which);},async setAccessLevel(){}});
const onMessage=event(),onInstalled=event(),onClicked=event();
globalThis.chrome={runtime:{id:'test-extension',getURL:f=>'chrome-extension://test-extension/'+f,onMessage,onInstalled},storage:{local:area(local,'local'),session:area(session,'session'),onChanged},windows:{onRemoved:event()},tabs:{onRemoved:event(),remove:async()=>{},get:async id=>({id,url:'https://example.test',title:'Example'}),create:async()=>({id:1})},contextMenus:{onClicked,update:async()=>{},removeAll:fn=>fn(),create:(_,fn)=>fn?.()},action:{setBadgeText:async()=>{}},sidePanel:{open:async()=>{}}};
await import('../account-id-tool/background.js');
const listener=onMessage.listeners[0];
const sender=page=>({id:'test-extension',url:chrome.runtime.getURL(page)});
function send(message,from){return new Promise((resolve,reject)=>{const handled=listener(message,from,resolve);if(handled!==true)resolve(null);});}
test('popup, full tool and side panel can reach workspace service',async()=>{for(const page of ['popup.html','index.html','workspace.html?panel=1']){const r=await send({type:'workspace.state'},sender(page));assert.equal(r.state.schemaVersion,1);}});
test('web pages and other extension senders cannot mutate workspace',async()=>{for(const from of [{id:'other',url:chrome.runtime.getURL('workspace.html')},{id:'test-extension',url:'https://example.test'}])assert.equal(await send({type:'workspace.action',action:{type:'project.create',name:'Bad'}},from),null);assert.equal(local['gather.workspace.v1'],undefined);});
test('authorized message returns action result and errors as structured responses',async()=>{const r=await send({type:'workspace.action',action:{type:'project.create',name:'Northbridge',scanName:'Intake'}},sender('workspace.html'));assert.equal(r.state.projects[0].name,'Northbridge');const bad=await send({type:'workspace.action',action:{type:'item.save',kind:'source',scanId:null,url:'javascript:alert(1)'}},sender('popup.html'));assert.ok(bad.error);});
test('explicit context-menu event saves selection and source to active scan',async()=>{const scanId=local['gather.workspace.v1'].activeScanId;onClicked.listeners[0]({menuItemId:'gather-save',pageUrl:'https://example.test/source',selectionText:'Synthetic selected excerpt'},{id:44,windowId:1,title:'Northbridge report'});for(let i=0;i<20&&!local['gather.workspace.v1'].items.length;i++)await new Promise(r=>setImmediate(r));const item=local['gather.workspace.v1'].items[0];assert.equal(item.excerpt,'Synthetic selected excerpt');assert.equal(item.scanId,scanId);assert.equal(item.originUrl,'https://example.test/source');});
test('trusted page messages cannot bypass the payload boundary or preference allowlist',async()=>{
 for(const message of [{type:1},{type:'savePreferences',patch:{rawIntake:'Not a preference'}},JSON.parse('{"type":"workspace.action","action":{"__proto__":{}}}')])assert.ok((await send(message,sender('popup.html'))).error);
 assert.equal(local['gather.prefs'],undefined);
 assert.ok((await send({type:'workspace.action',action:{type:'project.create',name:'Denied'}},sender('evidence.html'))).error);
});
test('worker startup storage restriction failure blocks access before routing any action',async()=>{
 const saved=chrome.storage.session.setAccessLevel;chrome.storage.session.setAccessLevel=async()=>{throw new Error('Storage denied');};
 await import('../account-id-tool/background.js?storage-denied-fixture');
 const denied=onMessage.listeners.at(-1),before=structuredClone(local);
 const result=await new Promise(resolve=>denied({type:'workspace.action',action:{type:'project.create',name:'Must not persist'}},sender('workspace.html'),resolve));
 assert.match(result.error,/could not protect local storage/);assert.deepEqual(local,before);chrome.storage.session.setAccessLevel=saved;
});
