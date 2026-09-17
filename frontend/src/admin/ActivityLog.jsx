import React,{useEffect,useMemo,useState} from 'react';
import {Activity,Search} from 'lucide-react';
import './activity-log.css';

const PAGE_SIZE=10;
const actionLabels={update:'수정',upload:'업로드',create:'등록',delete:'삭제',login:'로그인',logout:'로그아웃'};
const resourceLabels={settings:'사이트 설정',media:'미디어',products:'상품',orders:'주문',reviews:'리뷰',questions:'문의'};
const formatDate=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?'-':date.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});};

export default function ActivityLog({rows,loaded}){
 const [query,setQuery]=useState(''),[action,setAction]=useState(''),[page,setPage]=useState(0);
 const actions=useMemo(()=>[...new Set(rows.map(row=>row.action).filter(Boolean))],[rows]);
 const filtered=useMemo(()=>{const needle=query.trim().toLowerCase();return rows.filter(row=>(!action||row.action===action)&&(!needle||[row.action,row.resource,row.id,row.user,row.username].some(value=>String(value||'').toLowerCase().includes(needle)))).sort((a,b)=>String(b.createdAt||b.created||'').localeCompare(String(a.createdAt||a.created||'')));},[rows,query,action]);
 useEffect(()=>setPage(0),[query,action]);
 const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 const pageRows=filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 if(!loaded)return <div className="activity-log-loading">활동 기록을 불러오는 중…</div>;
 return <section className="activity-log-card">
  <header><div><span><Activity size={20}/></span><div><h2>관리자 활동 기록</h2><p>콘텐츠 변경과 파일 업로드 내역을 시간순으로 확인하세요.</p></div></div><b>총 {filtered.length.toLocaleString()}건</b></header>
  <div className="activity-log-toolbar"><label><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="작업, 리소스, ID 검색"/></label><select value={action} onChange={event=>setAction(event.target.value)}><option value="">전체 작업</option>{actions.map(value=><option key={value} value={value}>{actionLabels[value]||value}</option>)}</select></div>
  <div className="activity-log-table"><table><thead><tr><th>작업</th><th>대상</th><th>대상 ID</th><th>처리 일시</th></tr></thead><tbody>{pageRows.map(row=><tr key={row.id}><td><span className={`activity-action ${row.action||'default'}`}>{actionLabels[row.action]||row.action||'-'}</span></td><td><b>{resourceLabels[row.resource]||row.resource||'-'}</b></td><td><code>#{row.id}</code></td><td><time dateTime={row.createdAt||row.created}>{formatDate(row.createdAt||row.created)}</time></td></tr>)}</tbody></table>{!pageRows.length&&<div className="activity-log-empty"><Activity size={28}/><b>표시할 활동 기록이 없습니다.</b><span>검색어나 작업 필터를 변경해 보세요.</span></div>}</div>
  <div className="admin-pagination"><span>{filtered.length}건 중 {filtered.length?`${page*PAGE_SIZE+1}–${Math.min((page+1)*PAGE_SIZE,filtered.length)}`:'0'}건 표시</span><button disabled={!page} onClick={()=>setPage(value=>value-1)}>이전</button><b>{page+1} / {pageCount}</b><button disabled={page+1>=pageCount} onClick={()=>setPage(value=>value+1)}>다음</button></div>
 </section>;
}
