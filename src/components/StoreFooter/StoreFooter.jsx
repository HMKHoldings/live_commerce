import { api } from "../../api/storeApi";
import { useStore } from "../../context/StoreContext";
import { assetPath } from "../../utils/assetPath";
import PromoCarousel from "../PromoCarousel/PromoCarousel.jsx";
import "./styles.css";
import React, { useEffect, useRef, useState } from "react";
import { BadgeHelp, ChevronRight, Gift, MessageCircle, Truck, X } from "lucide-react";

const notices = [
  {
    title: "[이벤트] 5월 가정의 달 특별 할인 이벤트 안내",
    date: "2024.05.01",
    body: "소중한 가족에게 마음을 전하는 선물을 만나보세요. 식품부터 생활용품까지, 오렌지스토어의 다양한 상품을 한자리에서 둘러볼 수 있어요.",
  },
  {
    title: "[안내] 일부 지역 배송 지연 안내",
    date: "2024.04.28",
    body: "배송 일정은 지역과 상품에 따라 달라질 수 있습니다. 실제 서비스에서는 주문 내역에서 상품별 배송 현황과 배송 예정일을 확인할 수 있어요.",
  },
  {
    title: "[당첨자 발표] 4월 리뷰 이벤트 당첨자 안내",
    date: "2024.04.25",
    body: "소중한 구매 후기를 남겨주신 모든 분께 감사드립니다. 실제 서비스에서는 당첨자에게 개별 안내를 보내드려요. 현재 화면의 리뷰와 이벤트는 디자인 미리보기용 예시입니다.",
  },
];

const socialChannels = [
  { name: "YouTube", image: assetPath("/png/youtube.png") },
  { name: "Instagram", image: assetPath("/png/instagram.png") },
  { name: "TikTok", image: assetPath("/png/tiktok.png") },
  { name: "Naver", image: assetPath("/png/naver.png") },
];

const information = {
  about: {
    title: "회사소개",
    body: "오렌지스토어는 식품, 생활용품, 뷰티 상품과 SNS 쇼핑 콘텐츠를 한곳에서 만나볼 수 있는 쇼핑몰입니다. 현재는 서비스 화면을 체험하는 데모 스토어입니다.",
  },
  terms: {
    title: "이용약관 안내",
    body: "오렌지스토어은 쇼핑몰 화면을 체험하는 데모입니다. 회원가입, 주문, 결제는 실제로 처리되지 않습니다. 정식 서비스의 이용약관은 운영 시 별도로 안내될 예정입니다.",
  },
  privacy: {
    title: "개인정보처리방침 안내",
    body: "이 페이지의 문의 양식은 화면에서만 동작하며 입력한 내용을 서버로 전송하지 않습니다. 실제 개인정보 수집과 회원 관리 기능은 연결되어 있지 않습니다. 정식 개인정보처리방침은 서비스 운영 시 안내될 예정입니다.",
  },
  seller: {
    title: "입점 문의",
    body: "좋은 상품을 함께 소개할 파트너를 기다립니다. 현재는 쇼핑몰 데모로, 실제 입점 신청 창구는 아직 연결되지 않았습니다.",
  },
  partnership: {
    title: "제휴 문의",
    body: "브랜드와 크리에이터의 다양한 협업을 준비하고 있습니다. 현재 화면은 데모이며 실제 제휴 문의 창구는 아직 연결되지 않았습니다.",
  },
  contact: {
    title: "고객센터 안내",
    body: "상담 시간은 평일 09:00–18:00, 주말과 공휴일은 휴무입니다. 화면에 표시된 전화번호와 사업자 정보는 디자인 확인용 예시이며 실제 상담 서비스는 연결되지 않았습니다.",
  },
};

export default function StoreFooter({ brand, onOpenLogin, onBrowseProducts, showExtras = true }) {
  const { notices, settings, promos, policies, connected } = useStore();
  const information = Object.fromEntries(policies.map(p => [p.id, p]));
  const [panel, setPanel] = useState(null);
  const [inquiryError, setInquiryError] = useState("");
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [inquiryComplete, setInquiryComplete] = useState(false);
  const dialogRef = useRef(null);
  const close = () => setPanel(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel]);

  const openPanel = (next) => {
    setInquiryComplete(false);
    setPanel(next);
  };

  const browse = () => {
    close();
    onBrowseProducts?.();
  };

  const title = panel?.type === "notice"
    ? panel.notice.title
    : panel?.type === "information"
      ? (information[panel.key]?.title || "안내")
      : panel?.type === "social"
        ? `${panel.name} 채널 안내`
        : {
            notices: "공지사항",
            kakao: "카카오톡 채널 안내",
            sustainable: "함께 만드는 지속 가능한 소비",
            inquiry: "1:1 문의",
            faq: "자주 묻는 질문",
            tracking: "배송 조회",
          }[panel?.type] || "오렌지스토어 안내";

  return (
    <>
      {showExtras && <div className="store-bottom wrap">
        {promos.length > 0 && <PromoCarousel key={promos.map(p=>p.id).join(',')}>
          {promos.map(p => <button key={p.id} type="button" className={"store-promo store-" + p.theme} onClick={() => p.action === 'login' ? onOpenLogin() : openPanel({type:p.action || 'sustainable'})}>
            <span className="store-promo-copy"><strong>{p.title}</strong><span>{p.description}</span><span className="store-promo-cta">{p.cta}<ChevronRight /></span></span>
            {p.image ? <img className="managed-promo-image" src={assetPath(p.image)} alt="" /> : p.theme === 'coupon' ? <span className="store-coupon-art"><strong>10,000원</strong><small>WELCOME</small></span> : p.theme === 'kakao' ? <span className="store-kakao-icon"><img src={assetPath('/png/kakao-channel.png')} alt="" /></span> : <span className="store-leaves"><i/><i/><i/></span>}
          </button>)}
        </PromoCarousel>}        <section className="store-service" aria-label="공지사항 및 고객센터">
          <div className="store-notices">
            <div className="store-heading">
              <h2>공지사항</h2>
              <button type="button" onClick={() => openPanel({ type: "notices" })}>더보기 <ChevronRight aria-hidden="true" /></button>
            </div>
            <ul className="store-notice-list">
              {notices.map((notice) => (
                <li key={notice.date}>
                  <button type="button" onClick={() => openPanel({ type: "notice", notice })}>
                    <span>{notice.title}</span>
                    <time dateTime={notice.date.replaceAll(".", "-")}>{notice.date}</time>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="store-contact">
            <h2>고객센터</h2>
            <strong>{settings.phone}</strong>
            <p>{settings.hours}<br />(주말 · 공휴일 휴무)</p>
          </div>

          <div className="store-help-links">
            <button type="button" onClick={() => openPanel({ type: "inquiry" })}><MessageCircle aria-hidden="true" /><span>1:1 문의</span></button>
            <button type="button" onClick={() => openPanel({ type: "faq" })}><BadgeHelp aria-hidden="true" /><span>자주 묻는 질문</span></button>
            <button type="button" onClick={() => openPanel({ type: "tracking" })}><Truck aria-hidden="true" /><span>배송조회</span></button>
          </div>
        </section>
      </div>}
      <nav className="store-footer-bar" aria-label="회사 및 이용 안내">
        <div className="wrap store-footer-bar-inner">
          {[["about", "회사소개"], ["partnership", "제휴문의"], ["seller", "입점신청"], ["terms", "이용약관"], ["privacy", "개인정보처리방침"], ["contact", "고객센터"]].map(([key, label]) => (
            <button key={key} type="button" onClick={() => openPanel({ type: "information", key })}>{label}</button>
          ))}
        </div>
      </nav>
      <footer className="store-footer">
        <div className="wrap store-footer-inner">
          <div className="store-footer-brand">{brand}</div>
          <div className="store-company">

            <p>{settings.company} · {settings.companyInfo}</p>
            <p>{settings.address} · 대표전화 {settings.phone}</p>
            <small>{settings.copyright}</small>
          </div>
          <div className="store-social">
            <div className="store-social-links" aria-label="소셜 미디어 채널">
              {socialChannels.map((channel) => (
                <button type="button" key={channel.name} aria-label={`${channel.name} 채널 안내`} onClick={() => settings[channel.name.toLowerCase()] ? window.open(settings[channel.name.toLowerCase()], "_blank", "noopener,noreferrer") : openPanel({ type: "social", name: channel.name })}>
                  <img src={channel.image} alt="" width="26" height="26" loading="lazy" />
                </button>
              ))}
            </div>
            <p>일상이 더 특별해지는<br /><strong>오렌지스토어</strong></p>
          </div>
        </div>
      </footer>

      <dialog ref={dialogRef} className="store-dialog" aria-labelledby="store-dialog-title" onCancel={close} onClose={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <button type="button" className="store-dialog-close" onClick={close} aria-label="닫기"><X aria-hidden="true" /></button>
        <div className="store-dialog-body">
          <h2 id="store-dialog-title">{title}</h2>

          {panel?.type === "notices" && <ul className="store-dialog-list">{notices.map((notice) => <li key={notice.date}><button type="button" onClick={() => openPanel({ type: "notice", notice })}><span>{notice.title}</span><time dateTime={notice.date.replaceAll(".", "-")}>{notice.date}</time><ChevronRight aria-hidden="true" /></button></li>)}</ul>}

          {panel?.type === "notice" && <><p className="store-dialog-note">{panel.notice.date} · 데모 공지</p><p>{panel.notice.body}</p></>}

          {panel?.type === "kakao" && <><p>오렌지스토어의 카카오톡 채널을 준비하고 있어요. 공식 채널이 연결되면 새로운 소식과 혜택을 안내해 드릴게요.</p><p className="store-dialog-note">현재는 데모 화면으로 채널 추가가 진행되지 않습니다.</p></>}

          {panel?.type === "sustainable" && <><p>우리의 작은 선택이 내일을 바꿔요. 일상에서 함께 실천해 보세요.</p><ul className="store-dialog-list"><li>필요한 만큼 구매해 음식물 쓰레기를 줄여요.</li><li>일회용품 대신 오래 쓸 수 있는 생활용품을 골라요.</li><li>포장재는 소재별로 분리해 배출해요.</li></ul><button type="button" className="store-dialog-action" onClick={browse}>상품 둘러보기 <ChevronRight aria-hidden="true" /></button></>}

          {panel?.type === "inquiry" && <><p className="store-dialog-note">입력한 이메일과 문의 내용은 관리자에게 전달됩니다.</p><form className="store-inquiry-form" onSubmit={async (event) => { event.preventDefault(); if(inquiryBusy)return; const form=event.currentTarget; const data=new FormData(form); setInquiryBusy(true); setInquiryError(''); try { if(!connected)throw Error('문의 서버에 연결할 수 없습니다.'); await api('/contact',{method:'POST',body:{email:data.get('email'),body:data.get('message')}});setInquiryComplete(true);form.reset(); } catch(error){setInquiryError(error.message);} finally{setInquiryBusy(false);} }}><label>이메일<input type="email" name="email" autoComplete="email" placeholder="example@email.com" required /></label><label>문의 내용<textarea name="message" placeholder="궁금한 내용을 입력해 주세요." rows="4" required /></label><button type="submit" className="store-dialog-action">{inquiryBusy ? "접수 중…" : "문의 접수"}</button>{inquiryError && <p role="alert">{inquiryError}</p>}{inquiryComplete && <p className="store-form-success" role="status">문의가 접수되었습니다.</p>}</form></>}

          {panel?.type === "faq" && <div className="store-faq"><details open><summary>실제로 상품을 주문할 수 있나요?</summary><p>현재는 데모 쇼핑몰입니다. 상품 탐색과 장바구니를 체험할 수 있으며, 실제 결제와 주문은 진행되지 않습니다.</p></details><details><summary>배송 현황은 어디서 확인하나요?</summary><p>정식 서비스에서는 배송조회에서 확인할 수 있어요. 현재는 실제 주문과 배송 정보가 연결되지 않았습니다.</p></details><details><summary>신규 회원 쿠폰은 어떻게 받나요?</summary><p>신규 회원 배너에서 로그인 화면을 열어볼 수 있어요. 현재는 데모로 실제 회원가입과 쿠폰 발급은 진행되지 않습니다.</p></details><details><summary>고객센터 운영 시간이 궁금해요.</summary><p>평일 09:00–18:00로 안내하고 있으며 주말과 공휴일은 휴무입니다. 현재 실제 상담 서비스는 연결되지 않았습니다.</p></details></div>}

          {panel?.type === "tracking" && <><p>조회할 배송 내역이 없습니다.</p><p className="store-dialog-note">현재는 데모 쇼핑몰로 실제 주문이 생성되지 않으며, 배송 정보도 연결되지 않았습니다.</p><button type="button" className="store-dialog-action" onClick={browse}>상품 둘러보기 <ChevronRight aria-hidden="true" /></button></>}

          {panel?.type === "information" && <p>{(information[panel.key]?.body || "안내 내용이 준비 중입니다.")}</p>}

          {panel?.type === "social" && <><p>오렌지스토어 {panel.name} 채널은 준비 중입니다. 공식 계정이 연결되면 라이브 소식과 추천 상품을 만나볼 수 있어요.</p><p className="store-dialog-note">현재 연결된 공식 채널이 없습니다.</p></>}
        </div>
      </dialog>
    </>
  );
}
