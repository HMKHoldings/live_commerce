import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {resolve} from 'node:path';
import {openDatabase} from '../models/database.mjs';
import {createApplication} from '../app.mjs';

async function fixture(t, mailer) {
  const db=openDatabase(':memory:');
  const sent=[];
  const server=createApplication(db,{uploads:mkdtempSync(resolve('.tmp/recovery-test-')),origins:['http://localhost:5173'],recoveryMailer:mailer===undefined?async message=>sent.push(message):mailer});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  t.after(async()=>{await new Promise(done=>server.close(done));db.close();});
  const request=async(path,body,session={},method='POST',origin='http://localhost:5173')=>{
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/customer/${path}`,{method,headers:{Origin:origin,'Content-Type':'application/json',Cookie:session.cookie||'','X-CSRF-Token':session.csrf||''},body:body?JSON.stringify(body):undefined});
    return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
  };
  const input={username:'recovery_user',name:'Customer',email:'customer@example.test',password:'original-password-123',consents:{terms:true,privacy:true,age:true}};
  const signup=await request('signup',input);assert.equal(signup.status,200);
  return {db,sent,request,input,session:{cookie:signup.cookie,csrf:signup.data.csrf}};
}

test('email recovery returns IDs only after proof and resets password once, revoking sessions',async t=>{
  const {db,sent,request,input,session}=await fixture(t);
  const found=await request('recovery/request',{purpose:'id',email:input.email.toUpperCase()});
  assert.equal(found.status,200);assert.equal(sent.length,1);assert.match(sent[0].code,/^\d{6}$/);
  assert.equal(found.data.code,undefined);assert.equal(found.data.usernames,undefined);
  assert.notEqual(db.prepare('SELECT code_hash FROM customer_recovery WHERE id=?').get(found.data.challenge).code_hash,sent[0].code);
  const verified=await request('recovery/complete',{challenge:found.data.challenge,code:sent[0].code});
  assert.deepEqual(verified.data.usernames,[input.username]);
  assert.equal((await request('recovery/complete',{challenge:found.data.challenge,code:sent[0].code})).status,400);
  const reset=await request('recovery/request',{purpose:'password',username:input.username,email:input.email});
  const payload={challenge:reset.data.challenge,code:sent[1].code,password:'replacement-password-123'};
  const concurrent=await Promise.all([request('recovery/complete',payload),request('recovery/complete',payload)]);
  assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,400]);
  assert.equal((await request('me',undefined,session,'GET')).status,401);
  assert.equal((await request('login',{username:input.username,password:input.password})).status,401);
  assert.equal((await request('login',{username:input.username,password:payload.password})).status,200);
  assert.equal((await request('recovery/complete',payload)).status,400);
});

test('wrong codes are bounded, expired codes fail, and reset requires a strong new password',async t=>{
  const {db,sent,request,input}=await fixture(t);
  const body={purpose:'password',username:input.username,email:input.email};
  const first=await request('recovery/request',body);
  const wrong=sent[0].code==='000000'?'111111':'000000';
  for(let i=0;i<5;i++)assert.equal((await request('recovery/complete',{challenge:first.data.challenge,code:wrong,password:'replacement-password-123'})).status,400);
  assert.equal((await request('recovery/complete',{challenge:first.data.challenge,code:sent[0].code,password:'replacement-password-123'})).status,400);
  const second=await request('recovery/request',body);
  db.prepare('UPDATE customer_recovery SET expires=? WHERE id=?').run(Date.now()-1,second.data.challenge);
  assert.equal((await request('recovery/complete',{challenge:second.data.challenge,code:sent[1].code,password:'replacement-password-123'})).status,400);
  const third=await request('recovery/request',body);
  assert.equal((await request('recovery/complete',{challenge:third.data.challenge,code:sent[2].code,password:'short'})).status,400);
  assert.equal((await request('login',{username:input.username,password:input.password})).status,200);
  assert.equal((await request('recovery/request',body)).status,429);
});

test('unknown or mismatched accounts disclose no account information and no code',async t=>{
  const {sent,request,input}=await fixture(t);
  const unknown=await request('recovery/request',{purpose:'id',email:'absent@example.test'});
  const known=await request('recovery/request',{purpose:'id',email:input.email});
  assert.equal(unknown.status,known.status);assert.equal(unknown.data.message,known.data.message);
  assert.deepEqual(Object.keys(unknown.data),Object.keys(known.data));assert.equal(sent.length,1);
  assert.equal((await request('recovery/complete',{challenge:unknown.data.challenge,code:sent[0].code})).status,400);
  const mismatch=await request('recovery/request',{purpose:'password',username:input.username,email:'different@example.test'});
  assert.equal(mismatch.status,200);assert.equal(sent.length,1);
  assert.equal((await request('recovery/request',{purpose:'id',email:input.email},{},'POST','https://untrusted.example')).status,403);
  assert.equal((await request('recovery/request',{purpose:'id',email:'invalid'})).status,400);
  assert.equal((await request('recovery/request',undefined,{},'GET')).status,405);
});

test('missing mail configuration fails clearly without creating tokens',async t=>{
  const {db,request,input}=await fixture(t,null);
  assert.equal((await request('recovery/request',{purpose:'id',email:input.email})).status,503);
  assert.equal(db.prepare('SELECT count(*) AS n FROM customer_recovery').get().n,0);
});
