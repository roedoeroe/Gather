// Local product guidance only. No case reads, remote requests or saved searches.
const topics = [
  {id:'start',title:'Start with the page you are viewing',tags:'quick start install beginner how to use',steps:[
    'Open a profile on Instagram, Facebook, Threads, TikTok or YouTube, then click Gather in your browser toolbar.',
    'Gather starts a current-page lookup automatically when there is no pasted draft. Find IDs on this page starts it manually; Retry this page runs another check.',
    'Use Copy IDs or the Copy button beside an ID. Saving a result is a separate, deliberate action.',
    'For screenshots, choose the destination shown beside Case/SOC, then Select area, Full page or Visible area. Inbox works without creating a case.'
  ]},
  {id:'accounts',title:'What is an account ID? Which platforms work?',tags:'identifier username platform instagram facebook threads tiktok youtube x',paragraphs:[
    'An account ID is the platform’s identifier for an account or channel. It is different from a display name or username. An ID does not confirm who operates an account or whether two accounts belong to one person.',
    'Gather extracts IDs from Instagram, Facebook, Threads, TikTok and YouTube. X is available for launching searches, but has no ID extractor.',
    'Open Paste profile links for one link or a list. Open account tools provides mixed batches of up to 100 accounts. IDs remain exact text, including long numbers.'
  ]},
  {id:'copy',title:'Copy IDs, account details and annotations',tags:'clipboard auto-copy poss priv empty batch recent history names',paragraphs:[
    'IDs only copies checked identifiers. Account details includes links and available names; Display names can be switched off. Auto-copy IDs and screenshot auto-copy are separate remembered choices.',
    'POSS is your annotation. PRIV and EMPTY appear only when the platform exposes clear account-bound evidence. Missing data does not establish that an account is private, empty or gone. Review conflicting supplied IDs before accepting a correction.',
    'The five most recent lookup batches stay in this browser. Clear recent lookups removes that history; deliberately saved findings and captures remain. Copied text or images can remain in your operating system’s clipboard history.'
  ]},
  {id:'lookup-trouble',title:'Why did an ID take a moment—or fail?',tags:'instagram retry first click loading error missing sign in restricted private unavailable',paragraphs:[
    'An available ID returns immediately. If Instagram metadata has not arrived yet, Gather checks briefly for up to about two seconds, then tries its bounded source and public-profile fallbacks. This remains one action; it is not a permanent background scan.',
    'A site may require sign-in, show a security check, limit requests, change its markup or provide conflicting data. Gather reports the problem rather than guessing. Private profiles can still expose an ID; an ID never grants access to private posts.',
    'Keep the intended profile open while checking. If it fails, read the error, complete any site sign-in or security check yourself, and use Retry this page. A genuine network interruption may require a later retry. Unsupported posts, feeds and other pages are not profile lookups.'
  ]},
  {id:'web-search',title:'Search the web without saving a search log',tags:'query dork google bing youtube x history searching',paragraphs:[
    'Workspace → Research → Search the web opens your query in the selected service in a new tab. Gather launches the search; it does not passively crawl the web.',
    'Gather does not keep automatic search queries, drafts or search history. Your browser and the provider may keep their own history. Findings, notes and plans you explicitly save are separate.'
  ]},
  {id:'reverse-image',title:'Reverse-image search',tags:'google lens lenso bing yandex baidu sogou tineye shutterstock upload photo image provider',paragraphs:[
    'In Research, choose Reverse image, select a provider and open it. Gather opens the provider’s website; it does not upload an image for you.',
    'Choose what to submit on that site. The provider receives whatever you upload or paste there, under its own terms. Availability, sign-in requirements and paid features can vary. Shutterstock opens its stock-image site; look for its image-search control if available.'
  ]},
  {id:'screenshots',title:'Take a screenshot without opening the side panel',tags:'visible full page select area copy crosshair dotted scroll selection capture',paragraphs:[
    'Visible area captures the current view. Full page scrolls and stitches a bounded page capture. Select area shows dotted crosshair guides: drag a rectangle and release to capture. Scroll while dragging to extend it; Escape cancels and restores the page position.',
    'For Select area & copy, use Select area with Auto-copy screenshots enabled under Page options. There is one selection button. Copy image remains available afterward if automatic copying is off or blocked.',
    'The displayed destination is frozen when capture starts. Switching cases afterward cannot move that capture. Full-page limits, dynamic feeds, sticky content and nested scrolling can prevent a complete image; check the saved completion status.'
  ]},
  {id:'find-capture',title:'Where did my screenshot go?',tags:'history saved images missing filter download exported folder',paragraphs:[
    'Use History in the popup or Workspace → Captures. Choose the correct case or All captures, and clear filters if an image seems missing. Open a capture to inspect, copy, edit or save it.',
    'Saved in Gather and Exported to folder are separate states. A failed folder export keeps the local image and offers Retry. Optional automatic folder export uses subfolders in your browser’s Downloads directory.',
    'Save image offers PNG or JPEG. Print opens the browser’s print workflow, where Save as PDF may be available. Gather does not control your operating system’s save or print dialogs.'
  ]},
  {id:'edit',title:'Edit an image; preserve the original',tags:'crop arrow red circle black redact redaction undo caption save copy unsaved original',paragraphs:[
    'Open a capture and choose Edit image. Crop uses draggable edges/corners or exact coordinates; Apply commits the crop and Cancel abandons it. Add red arrows, red circles or opaque black redaction rectangles. Undo removes the last edit. Captions are optional.',
    'Save stores a flattened edited image; Save & Copy also copies it. The original remains distinct. Closing with unsaved edits asks you to confirm before discarding them.',
    'Gather does not automatically identify sensitive information for redaction. You choose what to cover and review the final image. Blacking out a derivative does not delete the original: private backups can contain original, unredacted pixels.'
  ]},
  {id:'cases',title:'Do I need a Case? What are Inbox, SOC and scan?',tags:'organization subject project destination rename resume optional unassigned',paragraphs:[
    'No case is needed for quick lookup or capture. Inbox holds deliberately saved work before you organize it.',
    'New case asks for a case label and optional SOCs. SOC is a configurable subject label, not an identity conclusion. Subjects have stable records; matching names never merge people or accounts automatically.',
    'Choose Case/SOC before saving or capturing; Unassigned is available. New cases get an internal scan automatically. Existing cases can contain multiple scans, which remain distinct. Rename or manage subjects in Case; browsing a capture filter does not change the saving destination.'
  ]},
  {id:'workspace',title:'Find your way around the Workspace',tags:'research findings tasks changes settings filters review export',paragraphs:[
    'Research contains search launching, deliberately saved findings, tasks and changes. Captures holds screenshots and image exports. Case manages the selected case and subjects. Settings contains Data & Privacy, backups and capture export preferences.',
    'Use filters to narrow a list and clear them to see everything in the selected scan. Reports contain the items you explicitly include. Review findings and images before sharing.'
  ]},
  {id:'privacy',title:'Does Gather upload my cases?',tags:'local cloud analytics school student names network private data identity threat affiliation',paragraphs:[
    'Gather has no case-data server, cloud sync or analytics. Saved cases, observations, notes and images stay in this browser profile on this computer.',
    'Profile lookups contact the selected platform. Web and reverse-image searches open external services. Those deliberate requests are different from case-data synchronization. Copying and exporting create copies outside Gather.',
    'Gather does not decide identity, intent, threat level, affiliation or whether accounts share an owner. Follow your organization’s review and sharing rules; Gather does not establish legal compliance, organizational approval or encryption.'
  ]},
  {id:'delete',title:'What does Delete Case or Clear history remove?',tags:'delete deletion red clear history storage remove captures',paragraphs:[
    'Settings → Data & Privacy has red Delete case and Clear recent history controls. Case deletion removes that case’s local findings, subjects and capture originals/derivatives after confirmation. Other cases remain. Clear recent history removes recent account lookups, not deliberately saved case findings.',
    'Capture history supports individual and selected-capture deletion. Deleted local work cannot be recovered without an appropriate backup. This is logical deletion, not a guarantee of forensic erasure.',
    'Already downloaded files, private backups, clipboard contents and browser/provider history remain outside Gather’s deletion. Manage those separately using your approved process.'
  ]},
  {id:'backup',title:'Back up and restore local work',tags:'restore import backup originals unredacted sensitive unencrypted',paragraphs:[
    'Settings → Backup & restore lets you back up all work or deliberately restore a Gather backup. Image backups include the original images and their relationships to cases and subjects.',
    'Backups are unencrypted and may contain sensitive, unredacted material. Anyone with the file can read it. Keep backups in an approved private location. Inspect restored work before deleting any existing copy.'
  ]},
  {id:'update',title:'Install or update without losing your work',tags:'edge extensions version reload install upgrade rollback chrome',steps:[
    'For a new installation, extract the extension ZIP into a permanent folder. Open edge://extensions, enable Developer mode and choose Load unpacked. Select account-id-tool, then pin Gather. Your organization must permit unpacked extensions.',
    'For an update, finish captures and close Gather windows. Keep the same installed folder and preserve a private backup if needed.',
    'Replace all extension files in that same folder with the new version. Open edge://extensions and click Reload for Gather; confirm the version.',
    'Do not uninstall or clear extension storage merely to update. Keep the previous package and matching backup for rollback testing in a separate browser profile.'
  ]}
];
const host=document.getElementById('answers'),search=document.getElementById('helpSearch');
const cards=topics.map(topic=>{
  const card=document.createElement('article');card.id=topic.id;card.tabIndex=-1;
  const heading=document.createElement('h2');heading.textContent=topic.title;card.append(heading);
  for(const text of topic.paragraphs||[]){const p=document.createElement('p');p.textContent=text;card.append(p);}
  if(topic.steps){const list=document.createElement('ol');for(const text of topic.steps){const li=document.createElement('li');li.textContent=text;list.append(li);}card.append(list);}
  host.append(card);return {card,text:[topic.title,topic.tags,...topic.paragraphs||[],...topic.steps||[]].join(' ').toLowerCase()};
});
function filter(){const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;for(const item of cards){item.card.hidden=!terms.every(term=>item.text.includes(term));if(!item.card.hidden)count++;}document.getElementById('helpStatus').textContent=terms.length?count+' matching answer'+(count===1?'':'s'):'';document.getElementById('noAnswers').hidden=count!==0;document.getElementById('clearSearch').hidden=!terms.length;}
search.addEventListener('input',filter);document.getElementById('clearSearch').onclick=()=>{search.value='';filter();search.focus();};search.addEventListener('keydown',event=>{if(event.key==='Escape'){search.value='';filter();}});
document.querySelector('nav').addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;search.value='';filter();document.querySelector(link.hash)?.focus({preventScroll:true});});
try{const manifest=globalThis.chrome?.runtime?.getManifest?.()||await(await fetch('manifest.json')).json();document.getElementById('version').textContent='Help · '+(manifest.version_name||manifest.version);}catch{document.getElementById('version').textContent='Help';}
if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView();else search.focus();
