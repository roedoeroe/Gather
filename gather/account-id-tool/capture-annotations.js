// Draw only analyst-selected operations into a new image. Originals are never mutated.
export function drawAnnotation(ctx,op){
  if(op.type==='redact'){ctx.fillStyle='#000';ctx.fillRect(op.x,op.y,op.width,op.height);return;}
  ctx.save();ctx.strokeStyle=ctx.fillStyle='#d71920';ctx.lineWidth=op.stroke;ctx.lineCap='round';ctx.lineJoin='round';
  if(op.type==='circle'){ctx.beginPath();ctx.ellipse(op.x+op.width/2,op.y+op.height/2,op.width/2,op.height/2,0,0,Math.PI*2);ctx.stroke();}
  if(op.type==='arrow'){
    const dx=op.endX-op.x,dy=op.endY-op.y,angle=Math.atan2(dy,dx),head=Math.min(Math.hypot(dx,dy)*0.4,Math.max(12,op.stroke*4));
    ctx.beginPath();ctx.moveTo(op.x,op.y);ctx.lineTo(op.endX,op.endY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(op.endX,op.endY);ctx.lineTo(op.endX-head*Math.cos(angle-Math.PI/6),op.endY-head*Math.sin(angle-Math.PI/6));ctx.lineTo(op.endX-head*Math.cos(angle+Math.PI/6),op.endY-head*Math.sin(angle+Math.PI/6));ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
export function renderEdits(canvas,bitmap,operations){
  canvas.width=bitmap.width;canvas.height=bitmap.height;let ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('The browser could not prepare this image.');ctx.drawImage(bitmap,0,0);
  for(const op of operations){
    if(op.type!=='crop'){drawAnnotation(ctx,op);continue;}
    const copy=document.createElement('canvas');copy.width=op.width;copy.height=op.height;
    copy.getContext('2d').drawImage(canvas,op.x,op.y,op.width,op.height,0,0,op.width,op.height);
    canvas.width=op.width;canvas.height=op.height;ctx=canvas.getContext('2d');ctx.drawImage(copy,0,0);
  }
}
