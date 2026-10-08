import test from 'node:test';import assert from 'node:assert/strict';
import {readProfileSource} from '../account-id-tool/read-profile-source.js';
globalThis.location={href:'https://www.instagram.com/northbridge/'};
const response=body=>Object.assign(new Response(body),{});
test('source reader sends only a same-origin authenticated GET and returns bounded source',async()=>{
  let seen;globalThis.fetch=async(url,options)=>{seen={url,options};const r=response('<html>Fictional profile</html>');Object.defineProperty(r,'url',{value:url});return r;};
  const result=await readProfileSource();assert.equal(result.html,'<html>Fictional profile</html>');assert.equal(result.url,location.href);assert.equal(seen.options.credentials,'same-origin');assert.equal(seen.options.cache,'no-store');assert.ok(seen.options.signal);assert.equal(seen.options.method,undefined);
});
test('source reader reports HTTP, unavailable stream, large response, network and navigation failures',async()=>{
  globalThis.fetch=async()=>new Response('',{status:403});assert.match((await readProfileSource()).error,/HTTP 403/);
  globalThis.fetch=async()=>({ok:true,body:null});assert.match((await readProfileSource()).error,/no readable source/);
  globalThis.fetch=async()=>response('x'.repeat(15000001));assert.match((await readProfileSource()).error,/limit/);
  globalThis.fetch=async()=>{throw new TypeError('blocked');};assert.match((await readProfileSource()).error,/did not allow/);
  globalThis.fetch=async()=>{throw new DOMException('time','AbortError');};assert.match((await readProfileSource()).error,/timed out/);
  globalThis.fetch=async()=>{location.href='https://www.instagram.com/southridge/';return response('text');};assert.match((await readProfileSource()).error,/changed/);
});
