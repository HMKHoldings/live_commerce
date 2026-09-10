import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  BadgeHelp, ChevronDown, ChevronRight, CircleUserRound, Coins,
  KeyRound, MessageCircle, PackageCheck, Phone, RotateCcw, Search,
  ShoppingCart, TicketPercent, Truck,
} from "lucide-react";
import {App} from "../main";
import {StoreProvider, useStore} from "../context/StoreContext";
import {api, API_ENABLED} from "../api/storeApi";
import "./styles.css";

const faqs = [
  ["배송", "배송은 얼마나 걸리나요?", "결제 완료 후 보통 2~3영업일 이내 출고됩니다. 상품과 지역에 따라 배송 일정이 달라질 수 있습니다."],
  ["혜택", "적립금은 얼마까지 쓸 수 있나요?", "적립금 정책은 정식 결제 서비스 오픈과 함께 안내될 예정입니다."],
  ["주문", "주문이 취소되었어요.", "재고 부족, 결제 확인 실패 또는 고객 요청으로 취소될 수 있습니다. 주문번호와 함께 문의해주세요."],
  ["결제", "결제할 때 카드와 현금결제를 혼합하여 사용할 수 있나요?", "현재 데모 스토어에서는 실제 결제가 진행되지 않습니다. 정식 서비스의 결제 정책은 추후 안내됩니다."],
  ["배송", "도서산간지역 배송 가능한가요?", "상품별 배송 가능 지역이 다를 수 있습니다. 주문 전 상품 상세 배송 안내를 확인해주세요."],
  ["배송", "예약배송 신청할 수 있나요?", "예약배송이 가능한 상품은 상품 상세 페이지에 별도로 표시됩니다."],
  ["배송", "예약배송 신청했는데 바로 출고된 건가요?", "예약배송 상품은 안내된 출고 예정일에 맞춰 발송됩니다."],
  ["배송", "상품배송이 늦게 오는데 괜찮은가요?", "배송조회에서 현재 상태를 확인해주세요. 장기간 이동이 없다면 1:1 문의를 남겨주세요."],
  ["상품", "보관은 어떻게 하나요?", "상품 상세 페이지에 표시된 보관 방법을 따라주세요. 신선식품은 수령 후 바로 냉장 또는 냉동 보관해주세요."],
  ["상품", "품절되어 답변받는데 언제 받을 수 있나요?", "재입고 일정은 상품과 공급 상황에 따라 달라집니다. 확인 후 문의 답변으로 안내드립니다."],
];

function CustomerCenter(){
  const {settings, notices=[]} = useStore();
  const [category,setCategory]=useState("전체");
  const [query,setQuery]=useState("");
  const [search,setSearch]=useState("");
  const [open,setOpen]=useState(null);
  const [inquiry,setInquiry]=useState(false);
  const [message,setMessage]=useState("");
  const visible=useMemo(()=>faqs.filter(([group,title,answer])=>(category==="전체"||group===category)&&`${title} ${answer}`.toLowerCase().includes(search.toLowerCase())),[category,search]);
  const scrollFaq=()=>document.getElementById("faq-list")?.scrollIntoView({behavior:"smooth"});
  return <main className="cs-page wrap">
    <p className="cs-breadcrumb"><a href={import.meta.env.BASE_URL}>홈</a> &gt; CS CENTER</p>
    <div className="cs-layout">
      <aside className="cs-sidebar">
        <div className="cs-side-title"><strong>고객센터</strong><small>CUSTOMER SUPPORT</small></div>
        <button onClick={()=>setInquiry(true)}>1:1 문의</button>
        <button onClick={()=>{setCategory("전체");scrollFaq();}}>FAQ</button>
        <button onClick={()=>document.getElementById("cs-notices")?.scrollIntoView({behavior:"smooth"})}>공지사항</button>
        <div className="cs-phone"><span>고객센터 안내 <Phone size={20}/></span><strong>{settings.phone}</strong><p>{settings.hours}<br/>주말·공휴일은 휴무입니다.</p><button onClick={()=>setInquiry(true)}>1:1 문의하기</button></div>
      </aside>
      <div className="cs-content">
        <section className="cs-intro">
          <div><h1>오렌지스토어<br/>고객센터입니다.</h1><p>궁금하신 사항을 문의해주시면 정성껏 답변드리겠습니다.</p></div>
          <div className="cs-desk-art"><img src={`${import.meta.env.BASE_URL}images/customer-support-illustration.png`} alt="헤드셋을 착용하고 상담하는 고객센터 직원" /></div>
          <section className="cs-notice-card" id="cs-notices"><header><strong>공지사항</strong><button>+ 더보기</button></header>{notices.slice(0,3).map(n=><button key={n.id||n.title}><span>{n.title}</span><time>{n.date}</time></button>)}{!notices.length&&<p>등록된 공지사항이 없습니다.</p>}</section>
        </section>
        <section className="cs-quick"><h2>주요서비스 바로가기</h2><div>{[
          [Truck,"주문/배송조회",()=>setCategory("배송")], [RotateCcw,"취소/교환/반품",()=>setCategory("주문")],
          [TicketPercent,"나의쿠폰",()=>setMessage("쿠폰 서비스는 준비 중입니다.")], [Coins,"나의포인트",()=>setMessage("포인트 서비스는 준비 중입니다.")],
          [CircleUserRound,"회원정보수정",()=>location.assign(import.meta.env.BASE_URL+"login.html")], [KeyRound,"아이디/비밀번호 찾기",()=>location.assign(import.meta.env.BASE_URL+"login.html")]
        ].map(([Icon,label,action])=><button key={label} onClick={()=>{action();scrollFaq();}}><Icon/><span>{label}</span></button>)}</div></section>
        {message&&<p className="cs-message" role="status">{message}<button onClick={()=>setMessage("")}>×</button></p>}
        <section className="cs-faq">
          <form onSubmit={e=>{e.preventDefault();setSearch(query.trim());}}><strong>FAQ 자주묻는 질문</strong><label><span className="sr-only">FAQ 검색</span><input value={query} onChange={e=>setQuery(e.target.value)}/><button><Search size={17}/>검색</button></label></form>
          <div className="cs-filters">{["전체","배송","주문","결제","상품","혜택"].map(item=><button className={category===item?"active":""} key={item} onClick={()=>{setCategory(item);setOpen(null);}}>{item}</button>)}</div>
          <div className="cs-faq-list" id="faq-list">{visible.map(([group,title,answer],index)=>{const id=`${group}-${title}`;const expanded=open===id;return <article key={id}><button aria-expanded={expanded} onClick={()=>setOpen(expanded?null:id)}><span className="cs-question-icon"><BadgeHelp size={18} aria-hidden="true" /></span><span>{title}</span><ChevronDown className={expanded?"open":""}/></button>{expanded&&<div><b>A</b><p>{answer}</p></div>}</article>})}{!visible.length&&<p className="cs-empty">검색 결과가 없습니다.</p>}</div>
        </section>
      </div>
    </div>
    {inquiry&&<div className="cs-dialog-backdrop" onClick={()=>setInquiry(false)}><section role="dialog" aria-modal="true" aria-labelledby="inquiry-title" onClick={e=>e.stopPropagation()}><button className="cs-close" aria-label="닫기" onClick={()=>setInquiry(false)}>×</button><MessageCircle/><h2 id="inquiry-title">1:1 문의</h2><p>답변받을 이메일과 문의 내용을 입력해주세요.</p><form onSubmit={async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));try{if(!API_ENABLED)throw new Error();await api("/contact",{method:"POST",body:data});setInquiry(false);setMessage("문의가 접수되었습니다. 확인 후 답변드리겠습니다.");}catch{setMessage("문의 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");}}}><label>이메일<input name="email" type="email" required/></label><label>문의 내용<textarea name="body" rows="6" required maxLength="2000"/></label><button className="cs-submit">문의 접수</button></form></section></div>}
  </main>;
}

createRoot(document.getElementById("root")).render(<StoreProvider><App><CustomerCenter/></App></StoreProvider>);
