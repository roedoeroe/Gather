import assert from 'node:assert/strict';
import path from 'node:path';

// Real extension UI, storage, clipboard and image data. External pages are the
// parent harness's fictional fixtures; this is not live provider acceptance.
export async function r10Journey({context,api,base,ids,saveImage,group,out}) {
  await api.bringToFront();
  await api.getByRole('button',{name:'New case',exact:true}).click();
  await api.getByLabel('Case name',{exact:true}).fill('CASE-28175-R10');
  await api.getByRole('button',{name:'Create case',exact:true}).click();
  await api.getByRole('heading',{name:'CASE-28175-R10',exact:true}).waitFor();
  const add=api.locator('#addSubject');await add.waitFor({state:'visible'});await api.waitForFunction(()=>document.querySelector('[aria-label="Browse captures"]').value==='case');
  const snapshot=()=>api.evaluate(async()=>{const state=(await chrome.runtime.sendMessage({type:'workspace.state'})).state,store=await import('./capture-store.js'),scan=state.scans.find(s=>s.id===state.activeScanId);return {scan:scan.id,project:scan.projectId,subjects:await store.listSubjects(scan.projectId),selected:await store.selectedSubject(scan.id)};});
  const initial=await snapshot();assert.equal(initial.subjects.length,1);
  await add.click();let dialog=api.getByRole('dialog',{name:'Add SOC',exact:true});
  assert.equal(await dialog.getByLabel('Name',{exact:true}).inputValue(),'');
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal((await snapshot()).subjects.length,1);
  await add.focus();await add.press('Enter');dialog=api.getByRole('dialog',{name:'Add SOC',exact:true});
  await dialog.getByLabel('Name',{exact:true}).fill('   ');await dialog.getByRole('button',{name:'Save',exact:true}).click();
  await dialog.getByText('Enter a subject name.',{exact:true}).waitFor();assert.equal((await snapshot()).subjects.length,1);
  await dialog.getByLabel('Name',{exact:true}).fill('Alex Example');await dialog.getByLabel('Name',{exact:true}).press('Enter');
  await dialog.waitFor({state:'hidden'});await api.waitForFunction(()=>document.querySelector('#captureSubject').selectedOptions[0]?.textContent.includes('Alex Example'));
  const first=await snapshot();assert.equal(first.subjects.length,2);assert.notEqual(first.selected,initial.selected);assert.equal(await api.evaluate(()=>document.activeElement.id),'addSubject');
  await add.click();dialog=api.getByRole('dialog',{name:'Add SOC',exact:true});assert.equal(await dialog.getByLabel('Name',{exact:true}).inputValue(),'');
  await dialog.getByLabel('Name',{exact:true}).fill('Alex Example');await dialog.getByLabel('Name',{exact:true}).press('Enter');await dialog.waitFor({state:'hidden'});
  await api.waitForFunction(async()=>{const s=await import('./capture-store.js');return (await s.listSubjects()).filter(x=>x.name==='Alex Example').length>=2;});
  const second=await snapshot();assert.equal(second.subjects.length,3);assert.notEqual(second.selected,first.selected);
  group('Prominent Add SOC supports keyboard creation, cancel, blank rejection, distinct same-name IDs and predictable selection without reload.');

  await api.getByRole('tab',{name:'Captures',exact:true}).click();
  await api.locator('#captureSubject').selectOption(first.selected);
  const image=await saveImage('https://www.instagram.com/fixture.webp');await image.page.close();
  assert.equal(image.record.projectId,first.project);assert.equal(image.record.subjectId,first.selected);
  const card=api.locator('[data-capture-id="'+image.record.id+'"]');await card.waitFor();
  const filters=api.getByRole('navigation',{name:'Capture SOC filter'});
  await filters.locator('[data-focus-key="'+second.selected+'"]').click();await card.waitFor({state:'hidden'});
  assert.equal((await snapshot()).selected,first.selected,'Browsing never changes filing');
  await filters.locator('[data-focus-key="'+first.selected+'"]').click();await card.waitFor();
  await filters.locator('[data-focus-key="all"]').click();await card.waitFor();
  const shown=await api.locator('[data-capture-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.captureId));assert.deepEqual(shown,[image.record.id]);
  await api.getByRole('tab',{name:'Case',exact:true}).click();await api.getByRole('button',{name:'Rename subject',exact:true}).click();dialog=api.getByRole('dialog',{name:'Rename SOC',exact:true});await dialog.getByLabel('Name',{exact:true}).fill('Alex Example renamed');await dialog.getByRole('button',{name:'Save',exact:true}).click();await dialog.waitFor({state:'hidden'});
  await api.getByRole('tab',{name:'Captures',exact:true}).click();await card.getByText('Alex Example renamed',{exact:true}).waitFor();
  const stored=await api.evaluate(async id=>(await import('./capture-store.js')).getCapture(id),image.record.id);assert.equal(stored.subjectId,first.selected);assert.equal(stored.assets[0].sha256,image.record.assets[0].sha256);
  await api.screenshot({path:path.join(out,'r10-case-captures.png')});
  group('Source images appear immediately in All Captures and the correct SOC, never cross cases; rename retains history and exact original hash.');

  for(const width of [400,640,1280]){await api.setViewportSize({width,height:900});await add.waitFor({state:'visible'});assert.ok(await api.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  const panel=await context.newPage();await panel.goto(base+'/workspace.html?panel=1');await panel.locator('.layout:not([inert])').waitFor();await panel.setViewportSize({width:400,height:850});await panel.locator('#addSubject').waitFor({state:'visible'});await panel.locator('#addSubject').click();await panel.getByRole('dialog',{name:'Add SOC',exact:true}).getByRole('button',{name:'Cancel',exact:true}).click();assert.ok(await panel.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await panel.screenshot({path:path.join(out,'r10-panel-add-soc.png')});await panel.close();
  // The dialog freezes its case even if another surface changes global selection.
  await add.click();dialog=api.getByRole('dialog',{name:'Add SOC',exact:true});await dialog.getByLabel('Name',{exact:true}).fill('Frozen SOC');
  await api.evaluate(scanId=>chrome.runtime.sendMessage({type:'workspace.action',action:{type:'context.select',scanId}}),ids.otherScan);
  await dialog.getByRole('button',{name:'Save',exact:true}).click();await dialog.waitFor({state:'hidden'});
  const frozen=await api.evaluate(async project=>(await import('./capture-store.js')).listSubjects(project),first.project);assert.ok(frozen.some(s=>s.name==='Frozen SOC'));assert.equal((await snapshot()).scan,ids.otherScan);
  await api.evaluate(scanId=>chrome.runtime.sendMessage({type:'workspace.action',action:{type:'context.select',scanId}}),ids.scan);
  group('Add SOC stays reachable at narrow widths and in panel content; a pending dialog cannot file into a newly selected case.');

  const reverse=await context.newPage();await reverse.goto(base+'/image-search.html');await reverse.bringToFront();
  const zone=reverse.getByRole('group',{name:'Paste or drop an image',exact:true}),search=reverse.getByRole('button',{name:'Copy & open search ↗',exact:true});assert.ok(await search.isDisabled());
  const prepareClipboard=async(color,width)=>reverse.evaluate(async({color,width})=>{const c=document.createElement('canvas');c.width=width;c.height=37;c.getContext('2d').fillStyle=color;c.getContext('2d').fillRect(0,0,width,37);const blob=await new Promise(r=>c.toBlob(r));await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);},{color,width});
  await prepareClipboard('#ff0000',81);await reverse.getByRole('button',{name:'Paste image',exact:true}).click();await zone.press('Control+v');await reverse.getByText(/Pasted image · 81 × 37/).waitFor();assert.ok(await search.isEnabled());
  for(const provider of ['google','tineye','yandex']){await reverse.getByLabel('Reverse image provider').selectOption(provider);await reverse.getByText(/Pasted image · 81 × 37/).waitFor();}
  await prepareClipboard('#0000ff',123);await zone.press('Control+v');await reverse.getByText(/Pasted image · 123 × 37/).waitFor();
  const opened=context.waitForEvent('page');await search.click();const provider=await opened;await provider.waitForURL('https://yandex.com/images/');await provider.close();await reverse.bringToFront();
  // A real clipboard paste into an independent temporary image target verifies
  // Search copied image B, rather than comparing only Gather's preview text.
  await reverse.evaluate(()=>{const target=document.createElement('div');target.id='clipboardProbe';target.tabIndex=0;target.addEventListener('paste',async event=>{event.stopPropagation();event.preventDefault();const file=[...event.clipboardData.items].find(i=>i.type==='image/png').getAsFile();const image=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);window.clipboardResult={width:image.width,height:image.height,pixel:[...ctx.getImageData(0,0,1,1).data]};image.close();});document.body.append(target);});
  await reverse.locator('#clipboardProbe').focus();await reverse.keyboard.press('Control+v');await reverse.waitForFunction(()=>window.clipboardResult);assert.deepEqual(await reverse.evaluate(()=>clipboardResult),{width:123,height:37,pixel:[0,0,255,255]});
  await reverse.screenshot({path:path.join(out,'r10-reverse-paste.png')});
  group('Native Ctrl+V accepts image bytes without clipboardRead; changing providers preserves A and replacing with B copies B’s actual pixels.');

  await reverse.bringToFront();await reverse.evaluate(()=>navigator.clipboard.writeText('Fictional non-image clipboard text'));await zone.press('Control+v');await reverse.getByText(/clipboard has no image/).waitFor();assert.ok(await search.isDisabled());
  await prepareClipboard('#ff0000',81);await zone.press('Control+v');await reverse.getByText(/Pasted image · 81 × 37/).waitFor();
  await reverse.locator('input[type=file]').setInputFiles({name:'invalid.png',mimeType:'image/png',buffer:Buffer.from('not image bytes')});await reverse.getByText(/Unsupported.*image/).waitFor();assert.ok(await search.isDisabled());
  await prepareClipboard('#0000ff',123);await zone.press('Control+v');await reverse.getByText(/Pasted image · 123 × 37/).waitFor();
  await reverse.locator('input[type=file]').evaluate(input=>{input.value='';input.dispatchEvent(new Event('change'));});await reverse.getByText(/Pasted image · 123 × 37/).waitFor();assert.ok(await search.isEnabled());
  // Two real file-change events in one turn exercise asynchronous replacement:
  // only the later image may become selectable, even if A finishes decoding last.
  await reverse.evaluate(async()=>{
    const image=async(width,color)=>{const c=document.createElement('canvas');c.width=width;c.height=37;c.getContext('2d').fillStyle=color;c.getContext('2d').fillRect(0,0,width,37);return new File([await new Promise(r=>c.toBlob(r))],width+'.png',{type:'image/png'});};
    const a=await image(81,'red'),b=await image(123,'blue'),input=document.querySelector('input[type=file]');
    for(const f of [a,b]){const data=new DataTransfer();data.items.add(f);input.files=data.files;input.dispatchEvent(new Event('change'));}
  });
  await reverse.getByText(/123.png · 123 × 37/).waitFor();assert.ok(await search.isEnabled());
  // Text inputs must retain normal paste behavior rather than selecting an image.
  await reverse.evaluate(()=>{const input=document.createElement('input');input.id='textPasteProbe';document.querySelector('#reverseImage').append(input);});
  await reverse.evaluate(()=>navigator.clipboard.writeText('normal text'));await reverse.locator('#textPasteProbe').focus();await reverse.keyboard.press('Control+v');assert.equal(await reverse.locator('#textPasteProbe').inputValue(),'normal text');assert.ok(await search.isEnabled());
  await reverse.getByRole('button',{name:'Remove',exact:true}).click();assert.ok(await search.isDisabled());await reverse.close();
  group('Reverse Image rejects non-image paste and invalid replacement without stale Search, keeps selection on picker cancel and leaves text-field paste alone.');
}
