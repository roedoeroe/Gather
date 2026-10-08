import test from 'node:test';import assert from 'node:assert/strict';import {resizeCrop} from '../account-id-tool/capture-crop.js';
const image={x:0,y:0,width:600,height:400};
test('crop handles adjust edges and corners in image pixels without changing the opposite edge',()=>{
 assert.deepEqual(resizeCrop(image,'nw',80,40,600,400),{x:80,y:40,width:520,height:360});
 assert.deepEqual(resizeCrop(image,'se',-200,-100,600,400),{x:0,y:0,width:400,height:300});
 assert.deepEqual(resizeCrop({x:80,y:40,width:300,height:200},'n',99,25,600,400),{x:80,y:65,width:300,height:175});
});
test('crop cannot invert, leave the image or shrink below one pixel; moving preserves size',()=>{
 assert.deepEqual(resizeCrop(image,'e',-900,0,600,400),{x:0,y:0,width:1,height:400});
 assert.deepEqual(resizeCrop(image,'nw',-900,-999,600,400),image);
 assert.deepEqual(resizeCrop({x:40,y:30,width:300,height:200},'move',900,-900,600,400),{x:300,y:0,width:300,height:200});
 assert.throws(()=>resizeCrop(image,'unknown',0,0,600,400));
});
