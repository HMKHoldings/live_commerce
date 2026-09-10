import {api, setCsrf} from '../api/storeApi';
﻿import {App} from '../main';
import {StoreProvider} from '../context/StoreContext';
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Pencil, UserRound, ChevronRight} from 'lucide-react';
import './styles.css';

function Signup(){
 const [consents,setConsents]=useState({terms:false,privacy:false,age:false});
 const [expanded,setExpanded]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const all=Object.values(consents).every(Boolean);
 async function submit(event){
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  if(data.get('password')!==data.get('confirmation')){setError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');event.currentTarget.elements.confirmation.focus();return;}
  if(!all){setError('필수 항목에 모두 동의해주세요.');return;}
  if(busy)return;
  setBusy(true);setError('');
  try {const result=await api('/customer/signup',{method:'POST',body:{username:data.get('username'),name:data.get('name'),email:data.get('email'),password:data.get('password'),consents}});setCsrf(result.csrf);window.location.assign(import.meta.env.BASE_URL+'mypage.html');}
  catch(e){setError(e.message);setBusy(false);}
 }
 return <main className="signup-page">
  <ol className="signup-steps" aria-label="회원가입 단계"><li aria-current="step"><span className="step-icon"><Pencil/></span><span>STEP 01<strong>회원정보입력</strong></span><ChevronRight className="step-arrow"/></li><li><span className="step-icon"><UserRound/></span><span>STEP 02<strong>가입완료</strong></span></li></ol>
  <form onSubmit={submit}>
   <header className="signup-heading"><h1>회원가입</h1><span>* 필수입력</span></header>
   <div className="signup-fields">
<label><span className="sr-only">이메일 *</span><input name="email" type="email" autoComplete="email" placeholder="이메일 입력 *" required maxLength={254}/></label>
    <label><span className="sr-only">아이디 *</span><input name="username" autoComplete="username" placeholder="아이디 입력 *" pattern="[A-Za-z0-9_]{4,30}" title="영문, 숫자, 밑줄 4~30자" required maxLength={30}/></label>
    <label className="signup-password"><span className="sr-only">비밀번호 *</span><input name="password" type="password" autoComplete="new-password" placeholder="비밀번호 입력 (12자 이상) *" minLength={12} maxLength={128} required aria-describedby="password-help"/><small id="password-help">12자 이상 입력해주세요. 영문, 숫자, 특수문자를 함께 사용하면 더 안전합니다.</small></label>
    <label><span className="sr-only">비밀번호 재입력 *</span><input name="confirmation" type="password" autoComplete="new-password" placeholder="비밀번호 재입력 *" required minLength={12} maxLength={128}/></label>
    <label><span className="sr-only">이름 *</span><input name="name" autoComplete="name" placeholder="이름 입력 *" required maxLength={60}/></label>
   </div>
   <p className="signup-notice">※ 동의 시 이용약관, 개인정보 수집 및 이용에 동의함을 알려드립니다.</p>
   <section className="signup-consents" aria-label="필수 동의 사항">
    <label className="signup-all"><input type="checkbox" checked={all} onChange={e=>setConsents({terms:e.target.checked,privacy:e.target.checked,age:e.target.checked})}/>내용 확인 및 전체 동의</label>
    {[["terms","서비스 이용약관 동의"],["privacy","개인정보 수집 및 이용 동의"],["age","만 14세 이상입니다."]].map(([key,label])=><React.Fragment key={key}><div className="signup-consent-row"><label><input type="checkbox" checked={consents[key]} onChange={e=>setConsents({...consents,[key]:e.target.checked})}/><span>{label} <em>(필수)</em></span></label>{key!=='age'&&<button type="button" aria-expanded={expanded===key} aria-controls={`policy-${key}`} onClick={()=>setExpanded(expanded===key?'':key)}>내용보기</button>}</div>{expanded===key&&<div className="signup-policy" id={`policy-${key}`}><strong>{label}</strong><p>{key==='terms'?'서비스 이용약관은 정식 회원가입 서비스 개시 전 안내될 예정입니다.':'개인정보 수집 항목, 이용 목적 및 보유 기간은 정식 회원가입 서비스 개시 전 안내될 예정입니다.'}</p><p>가입 시 아이디, 이름, 이메일과 해시 처리된 비밀번호가 계정 관리 목적으로 서버에 저장됩니다.</p></div>}</React.Fragment>)}
   </section>
   {error&&<p className="signup-error" role="alert">{error}</p>}
   <div className="signup-actions"><button type="submit" disabled={busy}>{busy?"가입 중…":"회원가입"}</button><a href={import.meta.env.BASE_URL}>취소</a></div>
  </form>
 </main>;
}
createRoot(document.getElementById('root')).render(<StoreProvider><App><Signup/></App></StoreProvider>);
