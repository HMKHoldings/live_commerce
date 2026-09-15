import React,{useEffect,useState} from 'react';
import {Building2,Eye,Headphones,Save,Share2,Store,Upload} from 'lucide-react';
import {assetPath} from '../utils/assetPath';
import './site-settings.css';

const initial={id:'site',brandName:'오렌지 라이브커머스',tagline:'좋은 상품이 모이는 곳',logo:'/logo/orange_logo.png',phone:'',hours:'',company:'',address:'',companyInfo:'',copyright:'',youtube:'',instagram:'',tiktok:'',naver:'',showLive:true,showPopular:true,showGroupDeals:true,showCollections:true,showReviews:true,showBest:true};
const channels=[['youtube','YouTube'],['instagram','Instagram'],['tiktok','TikTok'],['naver','Naver']];
const visibility=[['showLive','라이브커머스'],['showPopular','인기 상품'],['showGroupDeals','공동구매'],['showCollections','추천 컬렉션'],['showReviews','베스트 리뷰'],['showBest','베스트 상품']];

function Group({Icon,title,description,children,className=''}){return <section className={'site-setting-card '+className}><header><span><Icon size={20}/></span><div><h2>{title}</h2><p>{description}</p></div></header><div className="site-setting-fields">{children}</div></section>}
function Field({label,wide=false,children}){return <label className={wide?'wide':''}><span>{label}</span>{children}</label>}

export default function SiteSettings({settings,loaded,busy,onSave,onUpload}){
 const [draft,setDraft]=useState({...initial,...settings}),[dirty,setDirty]=useState(false),[uploading,setUploading]=useState(false);
 useEffect(()=>{setDraft({...initial,...settings});setDirty(false);},[settings?._version,loaded]);
 const update=(key,value)=>{setDraft(old=>({...old,[key]:value}));setDirty(true);};
 const submit=async event=>{event.preventDefault();await onSave(draft);setDirty(false);};
 const upload=async file=>{if(!file)return;setUploading(true);try{const url=await onUpload(file);update('logo',url);}finally{setUploading(false);}};
 if(!loaded)return <div className="site-settings-loading">사이트 설정을 불러오는 중…</div>;
 return <form className="site-settings-page" onSubmit={submit}>
  <div className="site-settings-hero"><div><span className="site-settings-eyebrow">STORE CONFIGURATION</span><h2>스토어 운영 설정</h2><p>브랜드 정보부터 노출 영역과 SNS 채널까지 한곳에서 관리하세요.</p></div><div className="site-settings-status"><i/> 스토어 연결됨</div><button className="admin-primary" disabled={busy||uploading||!dirty}><Save size={17}/>{busy?'저장 중…':'변경사항 저장'}</button></div>
  <div className="site-settings-grid">
   <Group Icon={Store} title="브랜드 기본 정보" description="스토어에서 가장 먼저 보이는 이름과 로고입니다." className="brand-card">
    <div className="site-logo-editor"><div className="site-logo-preview">{draft.logo?<img src={assetPath(draft.logo)} alt="현재 로고"/>:<Store size={28}/>}</div><div><b>스토어 로고</b><small>PNG, JPG, WebP · 최대 50MB</small><label className="site-upload-button"><Upload size={15}/>{uploading?'업로드 중…':'이미지 변경'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={e=>upload(e.target.files[0])}/></label></div></div>
    <Field label="브랜드 이름"><input value={draft.brandName} onChange={e=>update('brandName',e.target.value)} required maxLength={80}/></Field><Field label="브랜드 슬로건"><input value={draft.tagline} onChange={e=>update('tagline',e.target.value)} maxLength={120}/></Field><Field label="로고 경로" wide><input value={draft.logo} onChange={e=>update('logo',e.target.value)} placeholder="/logo/orange_logo.png"/></Field>
   </Group>
   <Group Icon={Headphones} title="고객센터" description="푸터와 고객 안내 영역에 표시됩니다."><Field label="대표 전화번호"><input value={draft.phone} onChange={e=>update('phone',e.target.value)} placeholder="1555-5335"/></Field><Field label="운영시간"><input value={draft.hours} onChange={e=>update('hours',e.target.value)} placeholder="평일 09:00 – 18:00"/></Field><div className="site-setting-note wide"><Headphones size={17}/><span><b>고객 안내 미리보기</b><small>{draft.phone||'전화번호 미등록'} · {draft.hours||'운영시간 미등록'}</small></span></div></Group>
   <Group Icon={Building2} title="사업자 정보" description="스토어 하단 사업자 정보에 사용됩니다." className="company-card"><Field label="회사명"><input value={draft.company} onChange={e=>update('company',e.target.value)}/></Field><Field label="사업장 주소" wide><input value={draft.address} onChange={e=>update('address',e.target.value)}/></Field><Field label="대표자 · 사업자등록 정보" wide><textarea rows="3" value={draft.companyInfo} onChange={e=>update('companyInfo',e.target.value)}/></Field><Field label="저작권 문구" wide><input value={draft.copyright} onChange={e=>update('copyright',e.target.value)}/></Field></Group>
   <Group Icon={Share2} title="SNS 채널" description="입력한 링크가 스토어 푸터의 SNS 버튼에 연결됩니다." className="social-card">{channels.map(([key,label])=><Field label={label} wide key={key}><div className="site-url-field"><span>{label.slice(0,1)}</span><input type="url" value={draft[key]} onChange={e=>update(key,e.target.value)} placeholder={`${label} 채널 URL`}/><i className={draft[key]?'connected':''}>{draft[key]?'연결됨':'미연결'}</i></div></Field>)}</Group>
   <Group Icon={Eye} title="메인 화면 노출" description="고객에게 보여줄 홈 화면 섹션을 선택하세요." className="visibility-card">{visibility.map(([key,label])=><label className="site-toggle" key={key}><span><b>{label}</b><small>{draft[key]?'스토어에 표시 중':'현재 숨김 상태'}</small></span><input type="checkbox" checked={Boolean(draft[key])} onChange={e=>update(key,e.target.checked)}/><i/></label>)}</Group>
  </div>
  <div className="site-settings-savebar"><span>{dirty?'저장하지 않은 변경사항이 있습니다.':'모든 설정이 저장되었습니다.'}</span><button className="admin-primary" disabled={busy||uploading||!dirty}><Save size={16}/>{busy?'저장 중…':'설정 저장'}</button></div>
 </form>;
}
