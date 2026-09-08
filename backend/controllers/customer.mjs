import {randomBytes, scrypt, timingSafeEqual, createHash, randomUUID} from 'node:crypto';
import {promisify} from 'node:util';
import {httpError} from '../utils/http.mjs';
const derive=promisify(scrypt);
const hash=v=>createHash('sha256').update(v).digest('hex');
export function customerSession(req,db) {
 const token=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('orange_customer='))?.slice(16);
 return token ? db.prepare('SELECT s.*,u.username,u.name,u.email,u.phone,u.data FROM customer_sessions s JOIN customers u ON u.id=s.user_id WHERE s.token=? AND s.expires>?').get(hash(token),Date.now()):null;
}
export async function customerController({req,res,path,send,json,db,limited,production,list,get}) {
 const action=path.slice('/api/customer/'.length);
 const issue=user=>{
  const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');
  db.prepare('DELETE FROM customer_sessions WHERE expires<?').run(Date.now());
  db.prepare('INSERT INTO customer_sessions VALUES(?,?,?,?)').run(hash(token),user.id,csrf,Date.now()+8*3600000);
  res.setHeader('Set-Cookie',`orange_customer=${token}; HttpOnly; Path=/; SameSite=${production?'None':'Lax'}; Max-Age=28800${production?'; Secure':''}`);
  return send(200,{csrf,user:{id:user.id,name:user.name,username:user.username}});
 };
 if(['signup','login'].includes(action)&&req.method==='POST') {
  limited(`customer-auth:${req.socket.remoteAddress}`,12);
  const input=await json();
  if(!input||typeof input.username!=='string'||! /^[A-Za-z0-9_]{4,30}$/.test(input.username)||typeof input.password!=='string'||input.password.length>128)throw httpError(400,'아이디와 비밀번호를 확인해주세요.');
  const existing=db.prepare('SELECT * FROM customers WHERE username=? COLLATE NOCASE').get(input.username);
  if(action==='login'){
   const check=await derive(input.password,existing?.salt||'invalid-customer',64);
   if(!existing||!timingSafeEqual(check,Buffer.from(existing.hash,'hex')))throw httpError(401,'아이디 또는 비밀번호를 확인해주세요.');
   return issue(existing);
  }
  if(input.password.length<12||typeof input.name!=='string'||!input.name.trim()||input.name.length>60||typeof input.email!=='string'||input.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)||!input.consents?.terms||!input.consents?.privacy||!input.consents?.age)throw httpError(400,'필수 회원정보와 동의 항목을 확인해주세요.');
  if(existing)throw httpError(409,'이미 사용 중인 아이디입니다.');
  const salt=randomBytes(24).toString('hex'),passwordHash=(await derive(input.password,salt,64)).toString('hex');
  try{const result=db.prepare('INSERT INTO customers(username,name,email,salt,hash,data) VALUES(?,?,?,?,?,?)').run(input.username,input.name.trim(),input.email.trim(),salt,passwordHash,JSON.stringify({favorites:[],addresses:[],inquiries:[],consentedAt:new Date().toISOString()}));return issue({id:Number(result.lastInsertRowid),username:input.username,name:input.name.trim()});}catch(e){if(String(e.message).includes('UNIQUE'))throw httpError(409,'이미 사용 중인 아이디입니다.');throw e;}
 }
 const session=customerSession(req,db);
 if(!session)throw httpError(401,'로그인이 필요합니다.');
 if(req.method!=='GET'&&req.headers['x-csrf-token']!==session.csrf)throw httpError(403,'Invalid session token');
 const data=JSON.parse(session.data);
 const save=()=>db.prepare('UPDATE customers SET data=? WHERE id=?').run(JSON.stringify(data),session.user_id);
 if(action==='me'&&req.method==='GET')return send(200,{csrf:session.csrf,user:{id:session.user_id,username:session.username,name:session.name,email:session.email,phone:session.phone},favorites:data.favorites||[],addresses:data.addresses||[],inquiries:list('questions').filter(q=>q.userId===session.user_id),orders:list('orders').filter(o=>o.userId===session.user_id),reviews:list('reviews').filter(r=>r.userId===session.user_id),coupons:[],points:0});
 if(action==='logout'&&req.method==='POST'){db.prepare('DELETE FROM customer_sessions WHERE token=?').run(session.token);res.setHeader('Set-Cookie',`orange_customer=; HttpOnly; Path=/; Max-Age=0; SameSite=${production?'None':'Lax'}${production?'; Secure':''}`);return send(200,{ok:true});}
 if(action==='profile'&&req.method==='PUT'){
  const v=await json();if(typeof v.name!=='string'||!v.name.trim()||v.name.length>60||typeof v.phone!=='string'||v.phone.length>50)throw httpError(400,'회원정보를 확인해주세요.');
  db.prepare('UPDATE customers SET name=?,phone=? WHERE id=?').run(v.name.trim(),v.phone,session.user_id);return send(200,{ok:true});
 }
 if(action==='password'&&req.method==='PUT'){
  const v=await json();if(typeof v.current!=='string'||v.current.length>128||typeof v.password!=='string'||v.password.length<12||v.password.length>128)throw httpError(400,'비밀번호는 12~128자로 입력해주세요.');
  const user=db.prepare('SELECT * FROM customers WHERE id=?').get(session.user_id);
  if(!timingSafeEqual(await derive(v.current,user.salt,64),Buffer.from(user.hash,'hex')))throw httpError(400,'현재 비밀번호가 일치하지 않습니다.');
  const salt=randomBytes(24).toString('hex');db.prepare('UPDATE customers SET salt=?,hash=? WHERE id=?').run(salt,(await derive(v.password,salt,64)).toString('hex'),session.user_id);
  db.prepare('DELETE FROM customer_sessions WHERE user_id=? AND token<>?').run(session.user_id,session.token);return send(200,{ok:true});
 }
 if(action==='favorites'&&req.method==='PUT'){
  const v=await json();if(!Array.isArray(v.ids)||v.ids.length>500||v.ids.some(id=>!['number','string'].includes(typeof id)||!get('products',String(id))))throw httpError(400,'상품을 확인해주세요.');data.favorites=[...new Set(v.ids.map(String))];save();return send(200,{ok:true});
 }
 if(action==='addresses'&&req.method==='POST'){
  const v=await json();if(!['name','phone','address'].every(k=>typeof v[k]==='string'&&v[k].trim()&&v[k].length<300))throw httpError(400,'배송지 정보를 확인해주세요.');
  data.addresses ||= [];if(data.addresses.length>=20)throw httpError(400,'배송지는 최대 20개까지 등록할 수 있습니다.');data.addresses.push({id:randomUUID(),name:v.name,phone:v.phone,address:v.address});save();return send(200,{ok:true});
 }
 if(action==='addresses'&&req.method==='DELETE'){const v=await json();data.addresses=(data.addresses||[]).filter(a=>a.id!==v.id);save();return send(200,{ok:true});}
 if(action==='inquiries'&&req.method==='POST'){
  const v=await json();if(typeof v.title!=='string'||!v.title.trim()||v.title.length>150||typeof v.body!=='string'||!v.body.trim()||v.body.length>2000)throw httpError(400,'문의 내용을 확인해주세요.');
  const inquiry={id:randomUUID(),userId:session.user_id,title:v.title,body:v.body,status:'pending',date:new Date().toISOString().slice(0,10),email:session.email};
  db.prepare('INSERT INTO records(resource,id,data) VALUES(?,?,?)').run('questions',inquiry.id,JSON.stringify(inquiry));return send(200,{ok:true});
 }
 throw httpError(404,'Not found');
}
