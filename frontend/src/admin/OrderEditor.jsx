import React from 'react';
import {CalendarDays,CreditCard,MapPin,Package,Phone,UserRound,X} from 'lucide-react';
import './order-editor.css';

const statusLabels={new:'신규 주문',processing:'상품 준비중',shipped:'배송중',completed:'배송 완료',cancelled:'취소/반품'};
const paymentLabels={paid:'결제완료',unpaid:'미결제',refunded:'환불완료'};
const money=value=>`${Number(value||0).toLocaleString('ko-KR')}원`;
const dateText=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?'-':date.toLocaleString('ko-KR',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});};

export default function OrderEditor({order,setOrder,busy,error,onSave,onClose}){
 const customer=order.customer||{},items=order.items||[];
 return <div className="admin-editor-backdrop"><section className="admin-editor order-editor" role="dialog" aria-modal="true" aria-labelledby="order-editor-title">
  <header className="order-editor-heading"><div><small>ORDER MANAGEMENT</small><h2 id="order-editor-title">주문 상세 및 상태 변경</h2><p>주문번호 #{String(order.id||'').slice(0,12)}</p></div><button type="button" aria-label="닫기" onClick={onClose}><X size={19}/></button></header>
  {error&&<p className="admin-error" role="alert">{error}</p>}
  <div className="order-editor-summary"><div><span><Package size={19}/></span><small>주문금액</small><strong>{money(order.total)}</strong></div><div><span><CreditCard size={19}/></span><small>결제 상태</small><strong className={`payment-${order.paymentStatus}`}>{paymentLabels[order.paymentStatus]||order.paymentStatus||'미결제'}</strong></div><div><span><CalendarDays size={19}/></span><small>주문 일시</small><strong>{dateText(order.createdAt)}</strong></div></div>
  <section className="order-editor-section"><header><UserRound size={18}/><div><h3>주문자 / 배송 정보</h3><p>고객이 주문 시 입력한 정보입니다.</p></div></header><dl className="order-customer"><div><dt>주문자</dt><dd>{customer.name||'비회원'}</dd></div><div><dt><Phone size={14}/>연락처</dt><dd>{customer.phone||'-'}</dd></div><div className="wide"><dt><MapPin size={14}/>배송지</dt><dd>{customer.address||'-'}</dd></div>{customer.email&&<div className="wide"><dt>이메일</dt><dd>{customer.email}</dd></div>}</dl></section>
  <section className="order-editor-section"><header><Package size={18}/><div><h3>주문 상품</h3><p>총 {items.reduce((sum,item)=>sum+Number(item.quantity||1),0)}개 상품</p></div></header><div className="order-editor-items">{items.map((item,index)=><article key={item.productId||index}><span>{index+1}</span><div><strong>{item.name||'상품명 없음'}</strong><small>상품 ID #{item.productId||item.id||'-'}</small></div><em>{money(item.price)} × {Number(item.quantity||1)}개</em><b>{money(Number(item.price||0)*Number(item.quantity||1))}</b></article>)}{!items.length&&<p>주문 상품 정보가 없습니다.</p>}</div><div className="order-editor-total"><span>최종 주문금액</span><strong>{money(order.total)}</strong></div></section>
  <form onSubmit={onSave}><section className="order-editor-section editable"><header><Package size={18}/><div><h3>처리 상태 관리</h3><p>변경 후 저장하면 고객 주문내역에도 반영됩니다.</p></div></header><div className="order-editor-fields"><label>주문 상태<select value={order.status||'new'} onChange={event=>setOrder(current=>({...current,status:event.target.value}))}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>배송 추적 정보<input value={order.tracking||''} onChange={event=>setOrder(current=>({...current,tracking:event.target.value}))} placeholder="택배사 / 송장번호 입력"/></label></div></section><footer className="order-editor-footer"><span>읽기 전용 주문 정보는 고객 주문 원본을 보호합니다.</span><div><button type="button" onClick={onClose}>취소</button><button className="admin-primary" disabled={busy}>{busy?'저장 중…':'변경사항 저장'}</button></div></footer></form>
 </section></div>;
}
