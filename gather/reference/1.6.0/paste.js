import {normalizeProfile, parseInput} from './core.js';

// Clipboard HTML stays in a detached, inert template. Only text and account
// addresses leave it; scripts, styles, images and event handlers are discarded.
export function recoverPastedLinks(html, plain = '') {
  if (!html || html.length > 2000000) return null;
  const template = document.createElement('template');
  template.innerHTML = html;
  const present = new Set(parseInput(plain).entries.map(e => e.key));
  const pieces = [], stack = [{node: template.content, end: false}];
  let recovered = false, visited = 0;
  const blocks = new Set(['P','DIV','LI','TR','BR','HR','H1','H2','H3','H4','SECTION','ARTICLE','BLOCKQUOTE']);
  while (stack.length) {
    if (++visited > 40000) return null;
    const {node, end} = stack.pop();
    if (end) { pieces.push('\n'); continue; }
    if (node.nodeType === Node.TEXT_NODE) { pieces.push(node.textContent); continue; }
    if (![Node.ELEMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE].includes(node.nodeType)) continue;
    if (['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','HEAD','IFRAME','OBJECT'].includes(node.nodeName)) continue;
    if (node.nodeName === 'A') {
      const href = node.getAttribute('href') || '';
      try {
        const profile = normalizeProfile(href);
        if (!present.has(profile.key)) recovered = true;
        pieces.push(' '+href+' '); continue;
      } catch {
        // An unrelated link also ends ID association; do not lend its text or
        // numeric label to the preceding supported account.
        pieces.push(' Link: '+node.textContent+' '); continue;
      }
    }
    if (blocks.has(node.nodeName)) { pieces.push('\n'); stack.push({node,end:true}); }
    if (['TD','TH'].includes(node.nodeName)) pieces.push('\t');
    const children = [...node.childNodes];
    for (let i=children.length-1;i>=0;i--) stack.push({node:children[i],end:false});
  }
  return recovered ? pieces.join('').replace(/\n{3,}/g,'\n\n').trim() : null;
}
