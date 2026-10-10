import {searchCompletions} from './search-completion.js';
export function attachSearchCompletion(input,provider) {
 if(!input||!provider)return;
 const wrapper=document.createElement('div');wrapper.className='search-completion';input.before(wrapper);wrapper.append(input);
 const ghost=document.createElement('div'),typed=document.createElement('span'),suffix=document.createElement('span');
 ghost.className='search-ghost';ghost.setAttribute('aria-hidden','true');typed.className='ghost-typed';ghost.append(typed,suffix);wrapper.prepend(ghost);
 const hint=document.createElement('span');hint.className='sr-only';hint.id=input.id+'-completion-hint';hint.setAttribute('role','status');input.setAttribute('aria-describedby',hint.id);wrapper.append(hint);
 let choices=[],index=0,dismissed=null;
 function hide(){choices=[];ghost.hidden=true;hint.textContent='';}
 function render(){
  try{
   if(document.activeElement!==input||input.disabled||input.selectionStart!==input.selectionEnd||dismissed===input.value){hide();return;}
   choices=searchCompletions(input.value,input.selectionStart,provider.value);index=Math.min(index,Math.max(0,choices.length-1));
   if(!choices.length){hide();return;}
   const choice=choices[index],style=getComputedStyle(input);ghost.style.font=style.font;ghost.style.padding=style.padding;ghost.style.letterSpacing=style.letterSpacing;
   typed.textContent=input.value;suffix.textContent=choice.suffix;ghost.hidden=false;ghost.scrollLeft=input.scrollLeft;
   hint.textContent='Suggestion: '+choice.text+'. Tab or Enter accepts. Escape dismisses.';
  }catch{hide();}
 }
 input.addEventListener('input',event=>{index=0;dismissed=event.inputType==='insertFromPaste'?input.value:null;render();});
 input.addEventListener('paste',()=>{hide();});
 input.addEventListener('focus',render);input.addEventListener('blur',hide);input.addEventListener('click',()=>{dismissed=null;render();});input.addEventListener('scroll',()=>{ghost.scrollLeft=input.scrollLeft;});
 provider.addEventListener('change',()=>{dismissed=null;render();});
 input.addEventListener('keydown',event=>{
  if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
  if(['ArrowLeft','ArrowRight','Home','End','Escape'].includes(event.key)){dismissed=input.value;hide();return;}
  if(!choices.length)return;
  if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();index=(index+(event.key==='ArrowDown'?1:-1)+choices.length)%choices.length;render();return;}
  if(event.key==='Tab'||event.key==='Enter'){
   event.preventDefault();event.stopPropagation();const choice=choices[index];
   input.setRangeText(choice.text,choice.start,choice.end,'end');dismissed=input.value;hide();input.dispatchEvent(new Event('input',{bubbles:true}));
  }
 });
 return {clear:()=>{dismissed=null;hide();}};
}
