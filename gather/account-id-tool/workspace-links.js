// Explicit navigation to a saved destination. Only record IDs go into the URL.
export function workspaceLink(scanId,section='captures',captureId=null){
  const url=new URL(chrome.runtime.getURL('workspace.html'));
  url.searchParams.set('scan',scanId??'inbox');
  if(captureId)url.searchParams.set('capture',captureId);
  url.hash=section;
  return url.href;
}
export function captureHistoryLink(scanId){if(scanId!==undefined){const url=new URL(workspaceLink(scanId));url.searchParams.set('captureScope',scanId?'case':'scan');return url.href;}return chrome.runtime.getURL('workspace.html?captureScope=all#captures');}
