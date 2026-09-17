import React,{useEffect,useMemo,useState} from 'react';
import {CheckCircle2,Clock3,PackageCheck,Search,ShoppingCart,Truck} from 'lucide-react';
import './order-list.css';

const PAGE_SIZE=10;
const statusLabels={new:'신규 주문',processing:'상품 준비중',shipped:'배송중',completed:'배송 완료',cancelled:'취소/반품'};
const paymentLabels={paid:'결제완료',unpaid:'미결제',refunded:'환불완료'};
const money=value=>`${Number(value||0).toLocaleString('ko-KR')}원`;
const dateText=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?'-':date.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});};

export default function OrderList({orders,loaded,onEdit}){
 const [query,setQuery]=useState(''),[status,setStatus]=useState(''),[payment,setPayment]=useState(''),[sort,setSort]=useState('newest'),[page,setPage]=useState(0);
 const filtered=useMemo(()=>{const needle=query.trim().toLowerCase();return orders.filter(order=>(!status||order.status===status)&&(!payment||order.paymentStatus===payment)&&(!needle||[order.id,order.customer?.name,order.customer?.email,order.customer?.phone,...(order.items||[]).map(item=>item.name)].some(value=>String(value||'').toLowerCase().includes(needle)))).sort((a,b)=>sort==='oldest'?String(a.createdAt||'').localeCompare(String(b.createdAt||'')):sort==='amount'?Number(b.total||0)-Number(a.total||0):String(b.createdAt||'').localeCompare(String(a.createdAt||'')));},[orders,query,status,payment,sort]);
 useEffect(()=>setPage(0),[query,status,payment,sort]);
 const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 const pageRows=filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 const revenue=orders.filter(order=>order.status!=='cancelled').reduce((sum,order)=>sum+Number(order.total||0),0);
 const count=value=>orders.filter(order=>order.status===value).length;
 if(!loaded)return <div className="order-list-loading">주문 내역을 불러오는 중…</div>;
 return <section className="order-list-page">
  <div className="order-list-stats">
   <article><span className="orange"><ShoppingCart size={21}/></span><div><small>전체 주문</small><strong>{orders.length}건</strong><p>{money(revenue)} 주문금액</p></div></article>
   <article><span className="yellow"><Clock3 size={21}/></span><div><small>처리 대기</small><strong>{count('new')+count('processing')}건</strong><p>확인이 필요한 주문</p></div></article>
   <article><span className="blue"><Truck size={21}/></span><div><small>배송중</small><strong>{count('shipped')}건</strong><p>배송 추적 대상</p></div></article>
   <article><span className="green"><CheckCircle2 size={21}/></span><div><small>완료</small><strong>{count('completed')}건</strong><p>배송 완료 주문</p></div></article>
  </div>
  <article className="order-list-card">
   <header><div><PackageCheck size={20}/><div><h2>주문 통합 관리</h2><p>고객 주문, 결제와 배송 상태를 한곳에서 확인하세요.</p></div></div><b>총 {filtered.length}건</b></header>
   <div className="order-list-filters"><label><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="주문번호, 고객명, 연락처, 상품명 검색"/></label><select value={status} onChange={event=>setStatus(event.target.value)}><option value="">전체 주문 상태</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><select value={payment} onChange={event=>setPayment(event.target.value)}><option value="">전체 결제 상태</option><option value="paid">결제완료</option><option value="unpaid">미결제</option><option value="refunded">환불완료</option></select><select value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">최신 주문순</option><option value="oldest">오래된 주문순</option><option value="amount">주문금액 높은순</option></select></div>
   <div className="order-list-table"><table><thead><tr><th>주문번호 / 일시</th><th>주문자</th><th>주문 상품</th><th>주문금액</th><th>결제</th><th>주문 상태</th><th>관리</th></tr></thead><tbody>{pageRows.map(order=><tr key={order.id}><td><code>#{String(order.id).slice(0,8)}</code><small>{dateText(order.createdAt)}</small></td><td><b>{order.customer?.name||'비회원'}</b><small>{order.customer?.phone||order.customer?.email||'-'}</small></td><td><div className="order-items"><strong>{order.items?.[0]?.name||'상품 정보 없음'}</strong><small>{order.items?.length>1?`외 ${order.items.length-1}건 · `:''}총 {(order.items||[]).reduce((sum,item)=>sum+Number(item.quantity||1),0)}개</small></div></td><td><b className="order-total">{money(order.total)}</b></td><td><span className={`order-payment ${order.paymentStatus||'unpaid'}`}>{paymentLabels[order.paymentStatus]||order.paymentStatus||'미결제'}</span></td><td><span className={`order-state ${order.status||'new'}`}>{statusLabels[order.status]||order.status||'신규 주문'}</span>{order.tracking&&<small>송장 {order.tracking}</small>}</td><td><button className="order-manage" type="button" onClick={()=>onEdit(order)}>상세 / 상태 변경</button></td></tr>)}</tbody></table>{!pageRows.length&&<div className="order-list-empty"><ShoppingCart size={30}/><b>조건에 맞는 주문이 없습니다.</b><span>검색어나 상태 필터를 변경해 보세요.</span></div>}</div>
   <div className="admin-pagination"><span>{filtered.length}건 중 {filtered.length?`${page*PAGE_SIZE+1}–${Math.min((page+1)*PAGE_SIZE,filtered.length)}`:'0'}건 표시</span><button disabled={!page} onClick={()=>setPage(value=>value-1)}>이전</button><b>{page+1} / {pageCount}</b><button disabled={page+1>=pageCount} onClick={()=>setPage(value=>value+1)}>다음</button></div>
  </article>
 </section>;
}
