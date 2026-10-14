import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// Real extension storage, rendered history and local search; only fictional data.
export async function polishJourney({api,group,out}) {
  const seeded=await api.evaluate(async()=>{
    const reply=await chrome.runtime.sendMessage({type:'workspace.action',action:{type:'project.create',name:'History performance fixture',scanName:'October review'}});
    if(reply.error)throw Error(reply.error);
    const {id:projectId,scanId}=reply.result,store=await import('./capture-store.js');
    const state=(await chrome.runtime.sendMessage({type:'workspace.state'})).state;
    const destination=await store.resolveCaptureDestination(state,scanId,null);
    const canvas=document.createElement('canvas');canvas.width=32;canvas.height=24;
    canvas.getContext('2d').fillRect(0,0,32,24);const blob=await new Promise(resolve=>canvas.toBlob(resolve));
    const started=performance.now();
    for(let index=0;index<100;index++){
      const record=await store.beginCapture({context:destination,source:{url:'https://example.test/history/'+index,title:'Fictional history '+String(index).padStart(3,'0')},mode:'visible'});
      await store.completeCapture(record.id,{assets:[{blob,role:'original'}],dimensions:{width:32,height:24},scale:1,status:'complete'});
    }
    // Track URLs created by this view, never intercept or change stored bytes.
    const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL),live=new Set();
    URL.createObjectURL=value=>{const url=create(value);live.add(url);return url;};
    URL.revokeObjectURL=url=>{live.delete(url);revoke(url);};
    globalThis.__polishLiveURLs=live;
    return {projectId,scanId,seedMs:performance.now()-started};
  });
  await api.getByRole('tab',{name:'Captures',exact:true}).click();
  await api.getByLabel('Browse captures',{exact:true}).selectOption('case');
  const ready=()=>api.waitForFunction(()=>document.querySelectorAll('.capture-card').length===12&&!document.querySelector('.capture-groups').hasAttribute('aria-busy')&&document.querySelector('.capture-library-heading').textContent.includes('100 captures')&&globalThis.__polishLiveURLs.size===12);
  await ready();assert.equal(await api.locator('.capture-group-title').count(),0);
  assert.match(await api.locator('.capture-group').getAttribute('aria-label'),/History performance fixture/);
  assert.equal(await api.evaluate(()=>__polishLiveURLs.size),12);
  await api.getByRole('button',{name:'Show more captures',exact:true}).click();
  await api.waitForFunction(()=>document.querySelectorAll('.capture-card').length===24&&!document.querySelector('.capture-groups').hasAttribute('aria-busy'));
  assert.equal(await api.evaluate(()=>__polishLiveURLs.size),24,'Replaced thumbnails must release their previous object URLs');
  await api.getByLabel('Find captures',{exact:true}).fill('Fictional history 099');
  await api.waitForFunction(()=>document.querySelectorAll('.capture-card').length===1&&!document.querySelector('.capture-groups').hasAttribute('aria-busy'));
  assert.equal(await api.evaluate(()=>__polishLiveURLs.size),1);
  await api.getByLabel('Find captures',{exact:true}).fill('');await ready();
  const renders=[];
  for(let index=0;index<10;index++){
    await api.getByRole('tab',{name:'Research',exact:true}).click();
    assert.equal(await api.evaluate(()=>__polishLiveURLs.size),0,'Leaving history releases every thumbnail URL');
    const start=performance.now();await api.getByRole('tab',{name:'Captures',exact:true}).click();await ready();renders.push(performance.now()-start);
    assert.equal(await api.evaluate(()=>__polishLiveURLs.size),12);
  }
  await api.screenshot({path:path.join(out,'polish-history.png')});
  await api.getByLabel('Browse captures',{exact:true}).selectOption('all');
  await api.locator('.capture-group-title').first().waitFor();
  assert.match((await api.locator('.capture-group-title').allTextContents()).join(' '),/History performance fixture/);
  await api.getByRole('tab',{name:'Research',exact:true}).click();
  assert.equal(await api.evaluate(()=>__polishLiveURLs.size),0);
  group('100 real stored captures paginate, filter and release thumbnail URLs across ten view changes; the current scan has no repeated group heading, while All cases retains it.');
  const reference=await api.evaluate(async()=>{
    const {buildReferencePack,searchReferences}=await import('./reference-model.js');
    const start=performance.now(),pack=buildReferencePack({collection:'Fictional performance library',version:'1',files:Array.from({length:1000},(_,i)=>({path:'Part '+i+'.md',text:'# Fictional part '+i+'\n'+('Invented approved-language fixture. ').repeat(280)+'\nSnapchat username missing information.'}))});
    const importMs=performance.now()-start,first=performance.now();searchReferences([pack],'snap username');const indexMs=performance.now()-first;
    const samples=[];let matches=0;
    for(let i=0;i<50;i++){const start=performance.now();matches+=searchReferences([pack],['snap username','part 100','missing information','fictional part'][i%4]).length;samples.push(performance.now()-start);}
    samples.sort((a,b)=>a-b);return {files:pack.files.length,bytes:pack.bytes,importMs,indexMs,warmP50Ms:samples[24],warmP95Ms:samples[47],matches};
  });
  assert.ok(reference.matches>0);assert.equal(reference.files,1000);
  const sorted=[...renders].sort((a,b)=>a-b);
  await fs.writeFile(path.join(out,'polish-performance.json'),JSON.stringify({environment:'Installed Linux Edge; synthetic corpus; browser-model search timing, not work-app or Windows latency',seedMs:seeded.seedMs,history:{records:100,cycles:10,renderMs:renders,p95Ms:sorted[9],retainedThumbnailURLs:0},reference},null,2));
  group('Local Reference lookup measured with 1,000 fictional Markdown files and 50 warm searches; no network dependency or saved search queries.');
}
