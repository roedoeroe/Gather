// One local viewer for saved captures and the workspace inspector. No image mutation.
export function captureViewer(alt){
  const element=document.createElement('div');element.className='capture-viewer';
  const controls=document.createElement('div');controls.className='viewer-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Image size');
  const viewport=document.createElement('div');viewport.className='image-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Screenshot preview — scroll to read');
  const image=document.createElement('img');image.alt=alt;viewport.append(image);
  const buttons=[];
  for(const [value,label] of [['width','Fit width'],['image','Fit image']]){
    const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(value==='width'));
    b.onclick=()=>{element.dataset.fit=value;for(const entry of buttons)entry.button.setAttribute('aria-pressed',String(entry.value===value));};buttons.push({value,button:b});controls.append(b);
  }
  element.dataset.fit='width';element.append(controls,viewport);return {element,image,viewport};
}
