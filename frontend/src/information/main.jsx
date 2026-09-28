import React from "react";
import {createRoot} from "react-dom/client";
import {ChevronRight, Building2, Handshake, Store, FileText, ShieldCheck, Headphones} from "lucide-react";
import {App} from "../main";
import {StoreProvider,useStore} from "../context/StoreContext";
import "./styles.css";

const pages={
  "about.html":{id:"about",label:"회사소개",Icon:Building2},
  "partnership.html":{id:"partnership",label:"제휴문의",Icon:Handshake},
  "seller.html":{id:"seller",label:"입점신청",Icon:Store},
  "terms.html":{id:"terms",label:"이용약관",Icon:FileText},
  "privacy.html":{id:"privacy",label:"개인정보처리방침",Icon:ShieldCheck},
};
const links=[...Object.entries(pages),["customer-center.html",{label:"고객센터",Icon:Headphones}]];
function InformationPage(){
  const {policies=[]}=useStore();
  const file=location.pathname.split("/").pop()||"about.html";
  const page=pages[file]||pages["about.html"];
  const policy=policies.find(item=>item.id===page.id);
  const Icon=page.Icon;
  return <main className="info-page wrap">
    <nav className="info-breadcrumb" aria-label="현재 위치"><a href={import.meta.env.BASE_URL}>홈</a><ChevronRight size={13}/><span>{page.label}</span></nav>
    <div className="info-layout">
      <aside><h2>회사 및 정책 안내</h2>{links.map(([href,item])=><a key={href} className={href===file?"active":""} href={`${import.meta.env.BASE_URL}${href}`}><item.Icon size={18}/>{item.label}</a>)}</aside>
      <article className="info-content"><header><span><Icon size={25}/></span><div><small>ORANGE STORE</small><h1>{policy?.title||page.label}</h1></div></header><div className="info-body">{(policy?.body||"안내 내용이 준비 중입니다.").split("\n").map((line,index)=><p key={index}>{line}</p>)}</div></article>
    </div>
  </main>;
}
createRoot(document.getElementById("root")).render(<StoreProvider><App><InformationPage/></App></StoreProvider>);