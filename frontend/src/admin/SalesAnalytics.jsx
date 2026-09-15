import React,{useMemo,useState} from 'react';
import {BarChart3,Download,Package,Receipt,ShoppingCart,TrendingUp,WalletCards} from 'lucide-react';
import SalesTrendChart from './SalesTrendChart';
import './sales-analytics.css';

const money=value=>Number(value||0).toLocaleString('ko-KR')+'원';
const statusLabels={new:'신규 주문',processing:'배송 준비',shipped:'배송 중',completed:'배송 완료',cancelled:'취소/반품'};
const statusColors={new:'#ff641c',processing:'#f2a11b',shipped:'#348de4',completed:'#31a864',cancelled:'#9ca5a0'};
const dateKey=value=>new Date(value).toLocaleDateString('en-CA');
const compactDate=value=>{const date=new Date(value);return `${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;};
const csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';

export default function SalesAnalytics({orders,loaded}){
 const [period,setPeriod]=useState(30);
 const now=new Date(),cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-period+1);cutoff.setHours(0,0,0,0);
 const scoped=useMemo(()=>orders.filter(order=>new Date(order.createdAt)>=cutoff),[orders,period]);
 const valid=scoped.filter(order=>order.status!=='cancelled');
 const total=valid.reduce((sum,order)=>sum+Number(order.total||0),0);
 const completed=valid.filter(order=>order.status==='completed').reduce((sum,order)=>sum+Number(order.total||0),0);
 const unpaid=valid.filter(order=>order.paymentStatus!=='paid').length;
 const average=valid.length?Math.round(total/valid.length):0;
 const timeline=Array.from({length:period},(_,index)=>{const date=new Date(now);date.setDate(date.getDate()-period+1+index);const key=dateKey(date);return{label:compactDate(date),value:valid.filter(order=>dateKey(order.createdAt)===key).reduce((sum,order)=>sum+Number(order.total||0),0)};});
 const statuses=Object.keys(statusLabels).map(status=>({status,count:scoped.filter(order=>order.status===status).length}));
 let statusCursor=0;const statusGradient=statuses.map(item=>{const start=statusCursor;statusCursor+=scoped.length?item.count/scoped.length*100:0;return `${statusColors[item.status]} ${start}% ${statusCursor}%`;}).join(',');
 const topProducts=Object.values(valid.flatMap(order=>order.items||[]).reduce((acc,line)=>{const key=String(line.productId||line.name);acc[key]??={id:key,name:line.name||'상품명 없음',quantity:0,total:0};acc[key].quantity+=Number(line.quantity||0);acc[key].total+=Number(line.price||0)*Number(line.quantity||0);return acc;},{})).sort((a,b)=>b.quantity-a.quantity).slice(0,5);
 const maxProduct=Math.max(...topProducts.map(item=>item.quantity),1);
 const recent=scoped.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,6);
 const exportCsv=()=>{const rows=[['주문번호','주문자','주문금액','주문상태','결제상태','주문일'],...scoped.map(order=>[order.id,order.customer?.name,order.total,statusLabels[order.status]||order.status,order.paymentStatus,new Date(order.createdAt).toLocaleString('ko-KR')])],blob=new Blob(['\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`orange-sales-${dateKey(now)}.csv`;a.click();URL.revokeObjectURL(url);};

 if(!loaded)return <div className="sales-analytics-loading">매출 데이터를 불러오는 중…</div>;
 return <section className="sales-analytics-page">
  <div className="sales-report-hero">
   <div className="sales-report-top"><div className="sales-report-title"><span><BarChart3 size={19}/></span><div><small>SALES PERFORMANCE</small><h2>주문 매출 리포트</h2></div></div><div className="sales-period-tabs">{[[7,'7일'],[30,'30일'],[90,'3개월'],[365,'1년']].map(([days,label])=><button className={period===days?'active':''} key={days} onClick={()=>setPeriod(days)}>{label}</button>)}</div><button className="sales-export" onClick={exportCsv} disabled={!scoped.length}><Download size={16}/> 리포트 다운로드</button></div>
   <div className="sales-report-body"><div className="sales-report-total"><span>선택 기간 주문금액</span><strong>{money(total)}</strong><p>{compactDate(cutoff)} – {compactDate(now)} · 취소 주문 제외</p></div><div className="sales-report-metrics"><div><ShoppingCart size={18}/><span>유효 주문<b>{valid.length.toLocaleString()}건</b></span></div><div><Receipt size={18}/><span>평균 주문금액<b>{money(average)}</b></span></div><div><TrendingUp size={18}/><span>배송완료 금액<b>{money(completed)}</b></span></div><div><WalletCards size={18}/><span>미결제 요청<b>{unpaid.toLocaleString()}건</b></span></div></div></div>
  </div>
  <div className="sales-report-guide"><i/> 이 화면은 <b>주문 생성일</b>을 기준으로 집계되며, 실제 결제 연동 전에는 주문금액 통계로 표시됩니다.</div>
  <div className="sales-analytics-main"><article className="sales-analytics-card sales-chart-card"><header><div><h2>기간별 주문금액 추이</h2><p>{compactDate(cutoff)} – {compactDate(now)}</p></div></header><SalesTrendChart timeline={timeline}/></article><article className="sales-analytics-card status-summary"><header><div><h2>주문 상태 분포</h2><p>선택 기간 전체 주문 기준</p></div><b>{scoped.length}건</b></header><div className="sales-status-visual"><div className="sales-status-donut" style={{background:scoped.length?`conic-gradient(${statusGradient})`:'#edf1ef'}}><div><strong>{scoped.length}</strong><small>전체 주문</small></div></div></div><div className="sales-status-list">{statuses.map(item=>{const ratio=scoped.length?Math.round(item.count/scoped.length*100):0;return <div key={item.status}><span><i style={{background:statusColors[item.status]}}/>{statusLabels[item.status]}</span><b>{item.count}건</b><em>{ratio}%</em><div><i style={{width:`${ratio}%`,background:statusColors[item.status]}}/></div></div>;})}</div></article></div>
  <div className="sales-analytics-lower"><article className="sales-analytics-card top-products"><header><div><h2>인기 판매 상품</h2><p>선택 기간 판매 수량 순위</p></div><Package size={19}/></header>{topProducts.map((item,index)=><div className="sales-product-row" key={item.id}><b>{index+1}</b><span><strong>{item.name}</strong><small>{item.quantity}개 · {money(item.total)}</small><i><em style={{width:`${item.quantity/maxProduct*100}%`}}/></i></span></div>)}{!topProducts.length&&<p className="sales-empty">집계할 상품이 없습니다.</p>}</article><article className="sales-analytics-card recent-sales"><header><div><h2>최근 주문</h2><p>선택 기간 최신 주문 6건</p></div></header><div className="sales-table-wrap"><table><thead><tr><th>주문번호</th><th>주문자</th><th>상품</th><th>주문금액</th><th>상태</th><th>결제</th></tr></thead><tbody>{recent.map(order=><tr key={order.id}><td><code>#{String(order.id).slice(0,8)}</code></td><td>{order.customer?.name||'-'}</td><td>{order.items?.[0]?.name||'-'}{order.items?.length>1&&<small> 외 {order.items.length-1}건</small>}</td><td><b>{money(order.total)}</b></td><td><span className={`sales-order-status ${order.status}`}>{statusLabels[order.status]||order.status}</span></td><td><span className={`sales-payment ${order.paymentStatus}`}>{order.paymentStatus==='paid'?'결제완료':'미결제'}</span></td></tr>)}</tbody></table>{!recent.length&&<p className="sales-empty">선택 기간의 주문이 없습니다.</p>}</div></article></div>
 </section>;
}
