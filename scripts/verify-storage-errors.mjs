import assert from 'node:assert/strict';import{kvCommand,learningStorageError}from'../api/_platinum-progress-store.js';
for(const k of['KV_REST_API_URL','UPSTASH_REDIS_REST_URL','aleph_KV_REST_API_URL'])assert(!process.env[k],'No real storage allowed');
process.env.KV_REST_API_URL='https://synthetic.invalid';process.env.KV_REST_API_TOKEN='synthetic-token';const saved=globalThis.fetch;
try{
 for(const[status,body,code]of[[401,'invalid token synthetic-secret','LEARNING_STORAGE_ACCESS'],[403,'forbidden synthetic-secret','LEARNING_STORAGE_ACCESS'],[429,'too many requests','LEARNING_STORAGE_RATE_LIMIT'],[400,'max daily request limit exceeded','LEARNING_STORAGE_QUOTA'],[200,JSON.stringify({error:'quota exceeded'}),'LEARNING_STORAGE_QUOTA']]){globalThis.fetch=async()=>new Response(body,{status});await assert.rejects(kvCommand(['GET','synthetic-key']),e=>e.status===503&&e.code===code&&!e.message.includes('synthetic-secret'));}
 globalThis.fetch=async()=>new Response(JSON.stringify({result:'synthetic-record'}),{status:200});assert.equal(await kvCommand(['GET','synthetic-key']),'synthetic-record');assert.equal(learningStorageError('unknown',500).code,'LEARNING_STORAGE_UNAVAILABLE');
 console.log('PASS: rejected storage credentials, rate limits, usage limits and HTTP-200 provider errors remain explicit failures; no upstream secrets exposed and successful reads unchanged. Mock transport only.');
}finally{globalThis.fetch=saved;delete process.env.KV_REST_API_URL;delete process.env.KV_REST_API_TOKEN;}
