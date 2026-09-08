import React,{useState,useEffect} from 'react';
import {UserRound} from 'lucide-react';
import {api,setCsrf} from './storeApi';
import './account-menu.css';
export default function AccountMenu(){
 const [open,setOpen]=useState(false),[user,setUser]=useState(null),[error,setError]=useState('');
 useEffect(()=>{const refresh=()=>api('/customer/me').then(s=>{setUser(s.user);setCsrf(s.csrf);}).catch(()=>setUser(null));refresh();window.addEventListener('customer-updated',refresh);return()=>window.removeEventListener('customer-updated',refresh);},[]);
 const go=page=>location.assign(import.meta.env.BASE_URL+page+'.html');
 return <div className="account-menu" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}><button className="account-trigger" aria-label="계정 메뉴" aria-expanded={open} aria-controls="account-options" onClick={()=>setOpen(v=>!v)}><UserRound/><span>{user?'마이페이지':'로그인'}</span></button>{open&&<div className="account-dropdown" id="account-options"><div>{user?<><button onClick={()=>go('mypage')}>{user.name}님 · 마이페이지</button><button onClick={async()=>{try{await api('/customer/logout',{method:'POST'});location.assign(import.meta.env.BASE_URL);}catch(e){setError(e.message);}}}>로그아웃</button></>:<><button onClick={()=>go('login')}>로그인</button><button onClick={()=>go('signup')}>회원가입</button></>}{error&&<p role="alert">{error}</p>}</div></div>}</div>;
}
