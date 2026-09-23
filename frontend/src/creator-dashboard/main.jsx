import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Bell,CalendarDays,ChevronDown,ClipboardList,Coins,HelpCircle,Home,LogOut,Menu,MessageSquare,Package,Radio,TrendingUp,UserRound,Users,X} from 'lucide-react';
import './styles.css';
const nav=[[Home,'대시보드'],[Radio,'라이브 신청'],[ClipboardList,'신청 내역'],[Coins,'정산 내역'],[Package,'내 상품'],[MessageSquare,'메시지'],[UserRound,'내 정보'],[HelpCircle,'가이드']];
const products=[['/images/serum.jpg','오렌지 골드앰플 세럼','32,000원'],['/images/collagen.jpg','오렌지 수분 크림','28,000원'],['/images/pink-skincare.png','오렌지 톤업 선크림','22,000원']];
function CreatorDashboard(){
 const [active,setActive]=useState('라이브 신청'),[studio,setStudio]=useState('A'),[menu,setMenu]=useState(false),[submitted,setSubmitted]=useState(false),[channels,setChannels]=useState(['YouTube','TikTok']);
 const toggle=name=>setChannels(current=>current.includes(name)?current.filter(item=>item!==name):[...current,name]);
 return <div className="cd-shell">
  <header className="cd-top"><button className="cd-menu" onClick={()=>setMenu(v=>!v)}><Menu/></button><img src={`${import.meta.env.BASE_URL}logo/orange_logo.png`} alt="오렌지 라이브커머스"/><div><button className="cd-bell"><Bell/><b>3</b></button><span className="cd-avatar">S</span><strong>뷰티 인플루언서 소피아</strong><ChevronDown size={17}/></div></header>
  <aside className={menu?'open':''}><button className="cd-close" onClick={()=>setMenu(false)}><X/></button>{nav.map(([Icon,label])=><button className={active===label?'active':''} key={label} onClick={()=>{setActive(label);setMenu(false)}}><Icon size={20}/>{label}</button>)}<a href="./creator-login.html"><LogOut size={19}/>로그아웃</a></aside>
  <main><header className="cd-title"><div><h1>호스트 / 인플루언서 관리 <span>라이브 신청</span></h1><p>라이브 방송을 신청하고 오렌지 스튜디오와 함께 특별한 콘텐츠를 만들어보세요.</p></div></header>
   <section className="cd-stats">{[[CalendarDays,'이번 달 라이브','3건','신청 2건 / 완료 1건'],[Users,'누적 시청자','128,450명','전월 대비 ▲ 12.5%'],[Coins,'누적 매출','₩ 45,680,000','전월 대비 ▲ 18.3%'],[TrendingUp,'평균 시청 유지율','63.2%','전월 대비 ▲ 5.4%']].map(([Icon,label,value,note])=><article key={label}><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div><i><Icon/></i></article>)}</section>
   <form className="cd-form" onSubmit={e=>{e.preventDefault();setSubmitted(true)}}><h2>라이브 신청서</h2>{submitted&&<p className="cd-success">라이브 신청이 접수되었습니다.</p>}
    <div className="cd-first-row"><fieldset><legend>1. 스튜디오 선택</legend><div className="cd-studios">{['A','B'].map((item,index)=><button type="button" className={studio===item?'selected':''} onClick={()=>setStudio(item)} key={item}><b>Studio {item}</b><small>오렌지 스튜디오</small><img src={`${import.meta.env.BASE_URL}images/creator-studio.png`} style={{objectPosition:index?'70% center':'35% center'}} alt={`Studio ${item}`}/>{studio===item&&<em>✓</em>}</button>)}</div></fieldset>
    <fieldset><legend>2. 방송 일시 선택</legend><input type="date" defaultValue="2026-10-15" required/><div className="cd-time"><select defaultValue="19:00"><option>18:00</option><option>19:00</option><option>20:00</option></select><b>~</b><select defaultValue="20:00"><option>20:00</option><option>21:00</option><option>22:00</option></select></div></fieldset></div>
    <fieldset><legend>3. 상품 선택</legend><div className="cd-products">{products.map(([image,name,price])=><div key={name}><img src={import.meta.env.BASE_URL+image.slice(1)} alt=""/><span><b>{name}</b><small>{price}</small></span><button type="button"><X size={18}/></button></div>)}</div></fieldset>
    <div className="cd-second-row"><fieldset><legend>4. SNS 채널 선택 <small>(복수 선택 가능)</small></legend><div className="cd-channels">{['YouTube','TikTok','Naver 쇼핑라이브'].map(name=><label key={name}><input type="checkbox" checked={channels.includes(name)} onChange={()=>toggle(name)}/><span>{name==='YouTube'?'▶':name==='TikTok'?'♪':'N'}</span>{name}</label>)}</div></fieldset><fieldset><legend>5. 계정 선택</legend><div className="cd-accounts"><label><input type="radio" name="account" defaultChecked/> 오렌지 공식 계정으로 진행 <small>(@orange_official)</small></label><label><input type="radio" name="account"/> 인플루언서 개인 계정으로 진행 <small>(@sophia_beauty)</small></label></div></fieldset></div>
    <fieldset><legend>6. 요청 사항 <small>(선택)</small></legend><textarea maxLength="500" placeholder="요청사항을 입력해주세요. (예: 제품 중점 소개 포인트, 특이사항 등)"/></fieldset><footer><button type="button">임시 저장</button><button className="primary">신청하기</button></footer>
   </form>
  </main>
 </div>;
}
createRoot(document.getElementById('root')).render(<CreatorDashboard/>);