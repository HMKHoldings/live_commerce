import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../models/database.mjs';
import {createApplication} from '../app.mjs';
import {mkdtempSync} from 'node:fs';
import {resolve} from 'node:path';
test('customer signup, session isolation, profile, favorites, orders and logout',async()=>{
 const db=openDatabase(':memory:');const server=createApplication(db,{uploads:mkdtempSync(resolve('.tmp/customer-test-')),origins:['http://localhost:5173']});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/api`;
 const request=async(path,method='GET',body,session={})=>{const response=await fetch(base+path,{method,headers:{Origin:'http://localhost:5173','Content-Type':'application/json',Cookie:session.cookie||'','X-CSRF-Token':session.csrf||''},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};};
 try{
  const input={username:'shopper_one',password:'test-password-12345',name:'Shopper',email:'shopper@example.test',consents:{terms:true,privacy:true,age:true}};
  assert.equal((await request('/customer/me')).status,401);
  assert.equal((await request('/customer/signup','POST',{...input,consents:{}})).status,400);
  const signup=await request('/customer/signup','POST',input);assert.equal(signup.status,200);const a={cookie:signup.cookie,csrf:signup.data.csrf};
  assert.equal((await request('/admin/products','GET',undefined,a)).status,401);
  assert.equal((await request('/customer/signup','POST',input)).status,409);
  assert.equal((await request('/customer/login','POST',{username:input.username,password:'wrong'})).status,401);
  const me=await request('/customer/me','GET',undefined,a);assert.equal(me.data.user.name,'Shopper');assert.equal(me.data.orders.length,0);assert.equal(me.data.user.hash,undefined);
  assert.equal((await request('/customer/profile','PUT',{name:'Updated',phone:'01012345678'},{cookie:a.cookie})).status,403);
  assert.equal((await request('/customer/profile','PUT',{name:'Updated',phone:'01012345678'},a)).status,200);
  assert.equal((await request('/customer/addresses','POST',{name:'Updated',phone:'01012345678',address:'Test address'},a)).status,200);
  const products=(await request('/content')).data.products;const p=products.find(p=>p.stock>0);
  assert.equal((await request('/customer/favorites','PUT',{ids:[p.id]},a)).status,200);
  const review=await request('/reviews','POST',{productId:p.id,title:'Useful product',body:'This product worked well.',rating:5},a);assert.equal(review.status,201);
  const ownReviews=(await request('/customer/me','GET',undefined,a)).data.reviews;assert.equal(ownReviews.length,1);assert.equal(ownReviews[0].userId,me.data.user.id);assert.equal(ownReviews[0].author,'Updated');assert.equal(ownReviews[0].productName,p.name);
  const order=await request('/orders','POST',{requestId:'customer-order-test-123',customer:{name:'Updated',phone:'01012345678',address:'Test address'},items:[{productId:p.id,quantity:1}]},a);assert.equal(order.status,201);
  const own=await request('/customer/me','GET',undefined,a);assert.equal(own.data.orders.length,1);assert.equal(own.data.addresses.length,1);assert.deepEqual(own.data.favorites,[String(p.id)]);
  const second=await request('/customer/signup','POST',{...input,username:'shopper_two'});const b={cookie:second.cookie,csrf:second.data.csrf};const other=await request('/customer/me','GET',undefined,b);assert.equal(other.data.orders.length,0);assert.equal(other.data.addresses.length,0);assert.equal(other.data.favorites.length,0);assert.equal(other.data.reviews.length,0);
  assert.equal((await request('/customer/inquiries','POST',{title:'Shipping question',body:'When will it ship?'},a)).status,200);
  assert.equal((await request('/customer/me','GET',undefined,a)).data.inquiries.length,1);assert.equal((await request('/customer/me','GET',undefined,b)).data.inquiries.length,0);
  assert.equal((await request('/customer/password','PUT',{current:'wrong',password:'new-password-12345'},a)).status,400);
  assert.equal((await request('/customer/password','PUT',{current:input.password,password:'new-password-12345'},a)).status,200);
  assert.equal((await request('/customer/login','POST',{username:input.username,password:'new-password-12345'})).status,200);
  assert.equal((await request('/customer/logout','POST',{},a)).status,200);assert.equal((await request('/customer/me','GET',undefined,a)).status,401);
 }finally{await new Promise(r=>server.close(r));db.close();}
});
