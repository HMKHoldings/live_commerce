import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight,BarChart3,Camera,Coins,Eye,EyeOff,Globe2,LockKeyhole,Mail,Megaphone,PackageCheck,UserRound,Video} from 'lucide-react';
import './styles.css';

const benefits=[
  [Video,'라이브 커머스 진행','간편하게 라이브를 시작하세요'],
  [BarChart3,'실시간 매출 확인','성과를 바로 확인할 수 있어요'],
  [Coins,'투명한 정산 시스템','신뢰할 수 있는 정산을 제공합니다'],
];
const features=[
  [Camera,'라이브 신청','원하는 일정에 라이브를 진행하세요'],
  [PackageCheck,'상품 연동','추천 상품을 등록하고 손쉽게 연동하세요'],
  [BarChart3,'매출 통계','실시간으로 성과를 확인하세요'],
  [Coins,'정산 내역','투명하고 빠른 정산을 제공합니다'],
  [Megaphone,'공지사항','새로운 소식과 이벤트를 확인하세요'],
  [UserRound,'프로필 관리','나만의 프로필을 완성하세요'],
];
function CreatorLogin(){
  const [mode,setMode]=useState('email');
  const [show,setShow]=useState(false);
  const [notice,setNotice]=useState('');
  const submit=event=>{event.preventDefault();location.assign(import.meta.env.BASE_URL+'creator-dashboard.html');};
  return <main className="creator-page">
    <section className="creator-story">
      <header className="creator-brand"><img src={`${import.meta.env.BASE_URL}logo/orange_logo.png`} alt="오렌지 라이브커머스"/><a href="./login.html">일반 로그인 <ArrowRight size={17}/></a></header>
      <div className="creator-story-copy"><h1>함께 성장하는<br/><em>크리에이터</em> 플랫폼</h1><p>좋은 상품을 더 많은 사람들에게,<br/>당신의 라이브로 연결하세요.</p></div>
      <div className="creator-benefits">{benefits.map(([Icon,title,text])=><div key={title}><span><Icon size={25}/></span><p><b>{title}</b><small>{text}</small></p></div>)}</div>
      <p className="creator-tagline">Good Products<br/>Brighter Tomorrow</p>
      <p className="creator-story-foot">사람과 브랜드를 잇는<br/>라이브 커머스, 오렌지 마켓</p>
    </section>
    <section className="creator-auth-wrap">
      <div className="creator-locale"><Globe2 size={18}/> 한국어⌄</div>
      <section className="creator-auth-card">
        <span className="creator-camera"><Video size={30}/></span><h2>크리에이터 로그인</h2><p>오렌지 마켓 크리에이터 센터에 오신 것을 환영합니다.<br/>당신의 콘텐츠가 더 큰 가치를 만듭니다.</p>
        <div className="creator-tabs"><button className={mode==='email'?'active':''} onClick={()=>setMode('email')}>이메일로 로그인</button><button className={mode==='phone'?'active':''} onClick={()=>setMode('phone')}>휴대폰 번호로 로그인</button></div>
        <form onSubmit={submit}>
          <label><span>{mode==='email'?<Mail size={19}/>:<UserRound size={19}/>}</span><input type={mode==='email'?'email':'tel'} placeholder={mode==='email'?'이메일 주소':'휴대폰 번호'} required/></label>
          <label><span><LockKeyhole size={19}/></span><input type={show?'text':'password'} placeholder="비밀번호" required/><button type="button" aria-label="비밀번호 보기" onClick={()=>setShow(value=>!value)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></label>
          <div className="creator-options"><label><input type="checkbox"/> 로그인 상태 유지</label><button type="button" onClick={()=>setNotice('비밀번호 찾기 기능은 준비 중입니다.')}>비밀번호 찾기</button></div>
          {notice&&<p className="creator-notice" role="status">{notice}</p>}<button className="creator-submit">로그인</button>
        </form>
        <div className="creator-divider"><span/>또는<span/></div>
        <button className="creator-social" onClick={()=>setNotice('Google 로그인은 준비 중입니다.')}><b className="google">G</b>Google로 계속하기</button>
        <button className="creator-social" onClick={()=>setNotice('카카오 로그인은 준비 중입니다.')}><b className="kakao">K</b>카카오로 계속하기</button>
        <p className="creator-apply-copy">아직 크리에이터가 아니신가요?</p><button className="creator-apply" onClick={()=>setNotice('크리에이터 신청 기능은 준비 중입니다.')}>크리에이터 신청하기</button>
        <a className="creator-member-link" href="./login.html">일반 회원으로 로그인하기 <ArrowRight size={16}/></a>
      </section>
    </section>
    <aside className="creator-info">
      <section className="creator-info-intro"><h2>당신의 이야기가<br/>더 많은 사람들에게 닿을 수 있도록</h2><p>오렌지 마켓이 함께합니다.</p><div className="creator-avatars"><span>O</span><span>R</span><span>A</span><span>N</span><i>＋</i></div><em>Create<br/>Share<br/>Grow</em></section>
      <div className="creator-feature-grid">{features.map(([Icon,title,text])=><article key={title}><span><Icon size={24}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className="creator-info-banner"><span>🌱</span><p>좋은 브랜드와 좋은 크리에이터가<br/><b>더 나은 내일을 만듭니다.</b><small>ORANGE MARKET</small></p></div>
    </aside>
  </main>;
}
createRoot(document.getElementById('root')).render(<CreatorLogin/>);