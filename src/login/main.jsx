import AccountRecovery from "./AccountRecovery";
import {App} from '../main';
import {StoreProvider} from '../context/StoreContext';
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Eye, EyeOff} from 'lucide-react';
import {api, API_ENABLED, setCsrf} from '../api/storeApi';
import './styles.css';

function remembered(){try{return localStorage.getItem('orange-remembered-username')||'';}catch{return '';}}
function Login(){
 const [username,setUsername]=useState(remembered);
 const [remember,setRemember]=useState(()=>Boolean(remembered()));
 const [show,setShow]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [help,setHelp]=useState('');
 async function submit(event){
  event.preventDefault();if(busy)return;
  setError('');setHelp('');
  if(!API_ENABLED){setError('로그인 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');return;}
  const password=new FormData(event.currentTarget).get('password');
  setBusy(true);
  try{
   const session=await api('/customer/login',{method:'POST',body:{username:username.trim(),password}});
   setCsrf(session.csrf);
   try{if(remember)localStorage.setItem('orange-remembered-username',username.trim());else localStorage.removeItem('orange-remembered-username');}catch{}
   window.location.assign(import.meta.env.BASE_URL+'mypage.html');
  }catch(failure){setError(failure.status===401?'아이디 또는 비밀번호를 확인해주세요.':failure.status===429?'로그인 시도가 많습니다. 잠시 후 다시 시도해주세요.':'로그인할 수 없습니다. 서버 연결을 확인하고 다시 시도해주세요.');setBusy(false);}
 }
 if(help)return <AccountRecovery key={help} mode={help} onMode={setHelp} onBack={()=>{setHelp("");setError("");}} onChooseUsername={value=>{setUsername(value);setHelp("");setError("");}}/>;
 return <main className="login-page"><h1>로그인</h1><form onSubmit={submit} aria-busy={busy}>
  <label className="login-field"><span className="sr-only">아이디</span><input name="username" placeholder="아이디" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} autoFocus required disabled={busy}/></label>
  <label className="login-field login-password"><span className="sr-only">비밀번호</span><input name="password" type={show?'text':'password'} placeholder="비밀번호" autoComplete="current-password" required disabled={busy}/><button type="button" aria-label={show?'비밀번호 숨기기':'비밀번호 보기'} aria-pressed={show} onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></label>
  {error&&<p role="alert" className="login-error">{error}</p>}
  <button className="login-submit" disabled={busy}>{busy?'로그인 중…':'로그인'}</button>
  <label className="login-remember"><input type="checkbox" checked={remember} onChange={e=>{setRemember(e.target.checked);if(!e.target.checked)try{localStorage.removeItem('orange-remembered-username');}catch{}}}/>아이디저장</label>
 </form><nav className="login-links" aria-label="계정 도움말"><a href={import.meta.env.BASE_URL+'signup.html'}>회원가입</a><button onClick={()=>setHelp('id')}>아이디찾기</button><button onClick={()=>setHelp('password')}>비밀번호찾기</button></nav></main>;
}
createRoot(document.getElementById('root')).render(<StoreProvider><App><Login/></App></StoreProvider>);
