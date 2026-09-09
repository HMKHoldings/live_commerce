import Dashboard from './Dashboard';
import {LayoutDashboard,Package,ShoppingBag,MessageCircle,Gift,FileText,Settings,Menu,Search,ExternalLink,LogOut} from 'lucide-react';
import React,{useEffect,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {api,setCsrf} from '../api/storeApi';
import {assetPath} from '../utils/assetPath';
import {modules,labels,defaults,numeric,media,large} from './schema';
import './styles.css';

function Admin(){
  const loadId=useRef(0);
  const [menuOpen,setMenuOpen]=useState(false);
  const navigate=key=>{if(editor&&!confirm('저장하지 않은 편집을 닫을까요?'))return;setSection(key);setMenuOpen(false);};
  const [loadedSection,setLoadedSection]=useState("");
  const [user,setUser]=useState(null),[checking,setChecking]=useState(true),[section,setSection]=useState('dashboard');
  const [rows,setRows]=useState([]),[search,setSearch]=useState(''),[filter,setFilter]=useState(''),[page,setPage]=useState(0);
  const [editor,setEditor]=useState(null),[isNew,setIsNew]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[stats,setStats]=useState({});
  const announce=text=>{setMessage(text);try{localStorage.setItem('orange-content-updated',String(Date.now()));}catch{}};
  useEffect(()=>{api('/auth/me').then(data=>{setCsrf(data.csrf);setUser(data);}).catch(e=>{if(e.status!==401)setError(e.message);}).finally(()=>setChecking(false));},[]);
  const load=async()=>{
    const request=++loadId.current;
    setLoadedSection('');
    setError('');
    try{
      if(section==='dashboard'){
        const [products,orders,reviews,questions,activity]=await Promise.all(['products','orders','reviews','questions','audit'].map(key=>api('/admin/'+key)));
        if(request!==loadId.current)return;
        setStats({products,orders,reviews,questions,activity});setRows(orders);
      }else {const items=await api(`/admin/${section}`);if(request!==loadId.current)return;setRows(items);}
      setLoadedSection(section);
    }catch(e){setError(e.message);if(e.status===401)setUser(null);}
  };
  useEffect(()=>{if(user){setEditor(null);setSearch('');setFilter('');setPage(0);load();}},[section,user]);
  const login=async event=>{event.preventDefault();setBusy(true);setError('');try{const data=Object.fromEntries(new FormData(event.currentTarget));const session=await api('/auth/login',{method:'POST',body:data});setCsrf(session.csrf);setUser(session);}catch(e){setError(e.message);}finally{setBusy(false);}};
  const save=async event=>{
    event.preventDefault();setBusy(true);setError('');
    try{await api(`/admin/${section}${isNew?'':`/${editor.id}`}`,{method:isNew?'POST':'PUT',body:editor});setEditor(null);announce('저장되었습니다. 스토어에 자동 반영됩니다.');await load();}catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const remove=async record=>{
    if(!confirm(`“${record.name||record.title||record.id}” 항목을 삭제하시겠습니까?`))return;
    try{await api(`/admin/${section}/${record.id}`,{method:'DELETE',body:{version:record._version}});announce('삭제되었습니다.');load();}catch(e){setError(e.message);}
  };
  const upload=async(field,file)=>{
    if(!file)return;setBusy(true);setError('');try{const result=await api('/admin/upload',{method:'POST',body:file,raw:true});setEditor(old=>({...old,[field]:result.url}));announce('파일 업로드 완료. 저장을 눌러 적용하세요.');}catch(e){setError(e.message);}finally{setBusy(false);}
  };
  if(checking)return <div className="admin-loading">관리자 세션 확인 중…</div>;
  if(!user)return <main className="admin-login"><div className="admin-login-intro"><span className="admin-brand">● ORANGE STORE</span><h1>스토어의 모든 것을<br/>한곳에서 관리하세요.</h1><p>상품부터 배너, 주문과 고객 문의까지.<br/>오렌지스토어 관리자 센터</p></div><form onSubmit={login}><span className="admin-kicker">ADMIN ACCESS</span><h2>관리자 로그인</h2><p>등록된 관리자 계정으로 로그인해주세요.</p>{error&&<p role="alert" className="admin-error">{error}</p>}<label>아이디<input name="username" autoComplete="username" required autoFocus/></label><label>비밀번호<input type="password" name="password" autoComplete="current-password" required/></label><button className="admin-primary" disabled={busy}>{busy?'로그인 중…':'로그인'}</button><small>최초 계정은 서버에서 admin:create 명령으로 생성합니다.</small><a href="./">스토어 돌아가기 ↗</a></form></main>;
  const visible=(loadedSection===section?rows:[]).filter(row=>(!filter||row.status===filter)&&JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  const title=modules.find(([key])=>key===section)?.[1];
  return <div className={'admin-shell '+(menuOpen?'menu-open':'')}><aside className="admin-sidebar"><a className="admin-brand" href="./"><img src={assetPath('/logo/orange_logo.png')} alt=""/><span>오렌지스토어<small>ADMIN CENTER</small></span></a><nav><button className={section==='dashboard'?'active':''} onClick={()=>navigate('dashboard')}><LayoutDashboard size={18}/>대시보드</button>{[
 [Package,'상품 관리',[['products','상품 목록 / 재고 / SNS'],['categories','카테고리 관리']]],
 [ShoppingBag,'주문 관리',[['orders','전체 주문 / 배송 관리']]],
 [MessageCircle,'고객 관리',[['questions','문의 관리'],['reviews','리뷰 관리']]],
 [Gift,'프로모션 관리',[['promos','프로모션 배너'],['collections','추천 컬렉션']]],
 [FileText,'콘텐츠 관리',[['banners','메인 배너'],['notices','공지사항'],['policies','회사 / 정책 안내']]],
 [Settings,'설정',[['settings','사이트 설정'],['audit','활동 기록']]]
 ].map(([Icon,label,links])=><div className="admin-nav-group" key={label}><div><Icon size={17}/>{label}</div>{links.map(([key,text])=><button key={key} className={section===key?'active':''} onClick={()=>navigate(key)}>{text}</button>)}</div>)}</nav><a href="./" target="_blank" rel="noreferrer"><ExternalLink size={15}/>스토어 미리보기</a></aside><div className="admin-workspace"><header><button className="admin-menu-toggle" aria-label="메뉴 열기 / 닫기" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><Menu size={21}/></button><form className="admin-global-search" onSubmit={e=>{e.preventDefault();const query=new FormData(e.currentTarget).get('query');navigate('products');setTimeout(()=>setSearch(query),0);}}><Search size={17}/><input name="query" aria-label="상품 검색" placeholder="상품명, 상품 ID를 검색하세요..."/><button type="submit">검색</button></form><div className="admin-account"><span className="admin-avatar">{user.username.slice(0,1).toUpperCase()}</span><span><b>{user.username}</b><small>관리자</small></span><button aria-label="로그아웃" onClick={async()=>{try{await api('/auth/logout',{method:'POST'});setCsrf('');setUser(null);}catch(e){setError(e.message);}}}><LogOut size={17}/></button></div></header><main><div className="admin-page-heading"><div><span className="admin-kicker">ORANGE STORE ADMIN</span><h1>{section==='dashboard'?'안녕하세요, 관리자님!':title}</h1><p>{section==='dashboard'?'오렌지스토어의 오늘 현황을 한눈에 확인해보세요.':'내용을 수정하고 저장하면 연결된 스토어에 반영됩니다.'}</p></div><button onClick={load} disabled={busy}>새로고침</button></div>{error&&<div className="admin-error" role="alert">{error}</div>}{message&&<div className="admin-success" role="status">{message}<button aria-label="알림 닫기" onClick={()=>setMessage('')}>×</button></div>}
    {section==='dashboard'&&(loadedSection===section?<Dashboard data={stats} navigate={navigate}/>:<p className="admin-loading">현황을 불러오는 중…</p>)}
    {section!=='dashboard'&&<section className="admin-table-panel"><div className="admin-toolbar"><input aria-label="검색" placeholder="상품명, 제목, ID 검색" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/><select aria-label="상태 필터" value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}><option value="">전체 상태</option>{[...new Set(rows.map(r=>r.status).filter(Boolean))].map(status=><option key={status}>{status}</option>)}</select>{defaults[section]&&<button className="admin-primary" onClick={()=>{setIsNew(true);setEditor({...defaults[section],id:''});setError('');}}>+ 새 항목</button>}</div><div className="admin-table-scroll"><table><thead><tr><th>항목</th><th>ID</th><th>상태 / 요약</th><th>관리</th></tr></thead><tbody>{visible.slice(page*20,(page+1)*20).map(row=><tr key={row.id}><td><div className="admin-record-title">{row.image&&<img src={assetPath(row.image)} alt=""/>}<span>{row.name||row.title||row.brandName||row.customer?.name||row.action||row.id}{row.price!==undefined&&<small>{Number(row.price).toLocaleString()}원 · 재고 {row.stock}</small>}</span></div></td><td><code>{row.id}</code></td><td><span className={`admin-status ${row.status}`}>{row.status||row.resource||'설정'}</span>{row.total!==undefined&&<small>{row.total.toLocaleString()}원 · {row.paymentStatus}</small>}</td><td>{!['dashboard','audit'].includes(section)?<div className="admin-row-actions"><button onClick={()=>{setIsNew(false);setEditor(structuredClone(row));setError('');}}>수정</button>{!['settings','orders'].includes(section)&&<button className="admin-danger" onClick={()=>remove(row)}>삭제</button>}</div>:<span>{row.created||row.createdAt}</span>}</td></tr>)}</tbody></table>{!visible.length&&<p className="admin-empty">{loadedSection===section ? "등록된 항목이 없습니다." : "불러오는 중…"}</p>}</div><div className="admin-pagination"><span>{visible.length}개 항목</span><button disabled={!page} onClick={()=>setPage(p=>p-1)}>이전</button><span>{page+1}</span><button disabled={(page+1)*20>=visible.length} onClick={()=>setPage(p=>p+1)}>다음</button></div></section>}
    {editor&&<div className="admin-editor-backdrop"><section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className="admin-editor-heading"><div><small>{title}</small><h2 id="editor-title">{isNew?'새 항목 만들기':'내용 수정'}</h2></div><button aria-label="편집 닫기" onClick={()=>{if(confirm('편집을 닫을까요?'))setEditor(null);}}>×</button></div>{error&&<p className="admin-error" role="alert">{error}</p>}<form onSubmit={save}><div className="admin-fields">{Object.entries({...defaults[section],...editor}).filter(([key])=>key!=='_version').map(([key,value])=>{
      const update=next=>setEditor(old=>({...old,[key]:next}));
      const readOnly=(key==='id'&&!isNew)||(section==='orders'&&!['status','tracking'].includes(key));
      if(typeof value==='boolean')return <label className="admin-checkbox" key={key}><input type="checkbox" checked={value} onChange={e=>update(e.target.checked)}/>{labels[key]||key}</label>;
      if(key==='status')return <label key={key}>{labels[key]}<select value={value} onChange={e=>update(e.target.value)}>{(section==='orders'?['new','processing','shipped','completed','cancelled']:['reviews','questions'].includes(section)?['pending','approved','rejected']:['draft','published','hidden']).map(v=><option key={v}>{v}</option>)}</select></label>;
      if(Array.isArray(value)&&['products','items'].includes(key)&&section!=='orders')return <label className="admin-wide" key={key}>{labels[key]}<textarea value={value.join(key==='products'?', ':'\n')} onChange={e=>update(e.target.value.split(key==='products'?',':'\n').map(v=>v.trim()).filter(Boolean))}/></label>;
      if(value&&typeof value==='object')return <label className="admin-wide" key={key}>{labels[key]||key}<pre>{JSON.stringify(value,null,2)}</pre></label>;
      return <label className={large.has(key)||media.has(key)?'admin-wide':''} key={key}>{labels[key]||key}{large.has(key)?<textarea value={value??''} readOnly={readOnly} onChange={e=>update(e.target.value)} rows={key==='body'?5:2}/>:<input type={numeric.has(key)?'number':'text'} step={key==='rating'?'0.1':'1'} min={numeric.has(key)?0:undefined} value={value??''} readOnly={readOnly} placeholder={key==='id'&&isNew?'비워두면 자동 생성':''} onChange={e=>update(numeric.has(key)?Number(e.target.value):e.target.value)}/>} {media.has(key)&&<div className="admin-media-field">{value&&(key==='videoUrl'?<video src={assetPath(value)} controls muted/>:<img src={assetPath(value)} alt="미리보기"/>)}<input aria-label={`${labels[key]} 업로드`} type="file" accept={key==='videoUrl'?'video/mp4':'image/png,image/jpeg,image/webp'} onChange={e=>upload(key,e.target.files[0])}/><small>최대 50MB · PNG, JPG, WebP, MP4</small></div>}</label>;
    })}</div>{section==='orders'&&<label>배송 추적 정보<input value={editor.tracking||''} onChange={e=>setEditor(old=>({...old,tracking:e.target.value}))}/></label>}<div className="admin-editor-footer"><span>저장 후 자동 반영 · 변경 충돌 감지</span><button className="admin-primary" disabled={busy}>{busy?'처리 중…':'저장하기'}</button></div></form></section></div>}
  </main><footer className="admin-bottom-bar"><span>오렌지스토어 관리자센터</span><span>콘텐츠 · 상품 · 주문 관리</span></footer></div></div>;
}
createRoot(document.getElementById('root')).render(<Admin/>);

import './dashboard.css';
