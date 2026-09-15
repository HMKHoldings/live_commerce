import React,{useMemo,useState} from 'react';
import {Sparkles,TrendingUp} from 'lucide-react';
import './sales-trend-chart.css';

const BASELINE=178;
const formatMoney=value=>Number(value||0).toLocaleString('ko-KR')+'원';
const compactMoney=value=>value>=100000000?(value/100000000).toFixed(value%100000000?1:0)+'억':value>=10000?(value/10000).toFixed(value%10000?1:0)+'만':Number(value||0).toLocaleString('ko-KR');

function smoothPath(points){
 if(!points.length)return '';
 return points.slice(1).reduce((path,point,index)=>{const previous=points[index],middle=(previous.x+point.x)/2;return `${path} C ${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`;},`M ${points[0].x},${points[0].y}`);
}

export default function SalesTrendChart({timeline}){
 const [active,setActive]=useState(null);
 const rawMax=Math.max(...timeline.map(item=>item.value),0);
 const magnitude=rawMax?10**Math.floor(Math.log10(rawMax)):1;
 const max=rawMax?Math.ceil((rawMax*1.16)/magnitude)*magnitude:1;
 const points=useMemo(()=>timeline.map((item,index)=>({item,index,x:timeline.length===1?367:54+(index*626)/(timeline.length-1),y:BASELINE-(item.value/max)*126})),[timeline,max]);
 const line=smoothPath(points),area=`${line} L ${points.at(-1)?.x||680},${BASELINE} L ${points[0]?.x||54},${BASELINE} Z`;
 const total=timeline.reduce((sum,item)=>sum+item.value,0),peak=Math.max(...timeline.map(item=>item.value),0),average=Math.round(total/Math.max(1,timeline.length));
 const selected=active===null?null:points[active];
 const step=Math.max(1,Math.ceil(timeline.length/8));
 const peakIndexes=timeline.map((item,index)=>item.value>0?index:-1).filter(index=>index>=0);
 return <div className="sales-trend-shell">
  <div className="sales-chart-head"><div><small>선택 기간 매출</small><strong>{formatMoney(total)}</strong></div><div className="sales-chart-chip"><TrendingUp size={14}/><span>일 평균 {formatMoney(average)}</span></div><div className="chart-legend"><i/> 매출액 <em><Sparkles size={11}/> LIVE</em></div></div>
  <svg className="sales-chart modern" viewBox="0 0 730 225" role="img" aria-label="기간별 매출 추이">
   <defs><linearGradient id="sales-fill-modern" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6b22" stopOpacity=".08"/><stop offset="1" stopColor="#ff6b22" stopOpacity="0"/></linearGradient></defs>
   <g className="sales-grid-vertical">{Array.from({length:15},(_,index)=>{const x=54+(index*626)/14;return <line key={index} x1={x} y1="52" x2={x} y2={BASELINE}/>;})}</g>
   {[0,.33,.66,1].map((ratio,index)=>{const y=52+ratio*126,value=Math.round(max*(1-ratio));return <g className="sales-grid" key={index}><line x1="54" y1={y} x2="680" y2={y}/><text x="46" y={y+3} textAnchor="end">{compactMoney(value)}</text></g>;})}
   <path className="sales-line" d={line}/>
   {selected&&<g className="sales-tooltip" pointerEvents="none"><line x1={selected.x} y1="45" x2={selected.x} y2={BASELINE}/><rect x={Math.min(625,Math.max(10,selected.x-48))} y={Math.max(7,selected.y-52)} width="96" height="38" rx="9"/><text x={Math.min(673,Math.max(58,selected.x))} y={Math.max(22,selected.y-37)} textAnchor="middle">{selected.item.label}</text><text className="value" x={Math.min(673,Math.max(58,selected.x))} y={Math.max(36,selected.y-23)} textAnchor="middle">{formatMoney(selected.item.value)}</text></g>}
   {points.map(({item,index,x,y})=>{const nearPeak=peakIndexes.some(peakIndex=>Math.abs(peakIndex-index)<2);const sampled=index===0||index===points.length-1||item.value>0||(index%step===0&&!nearPeak&&points.length-1-index>=step);return <g className={'sales-point '+(sampled?'sampled ':'')+(active===index?'active':'')} key={index} tabIndex="0" role="button" aria-label={`${item.label} 매출 ${formatMoney(item.value)}`} onMouseEnter={()=>setActive(index)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(index)} onBlur={()=>setActive(null)} onClick={()=>setActive(index)}><circle className="hit" cx={x} cy={y} r="15"/><circle className="halo" cx={x} cy={y} r="8"/><circle className="dot" cx={x} cy={y} r="4.5"/>{sampled&&<text className="date" x={x} y="208" textAnchor="middle">{item.label}</text>}</g>})}
   {!peak&&<text className="sales-empty-label" x="367" y="112" textAnchor="middle">아직 매출 데이터가 없습니다</text>}
  </svg>
 </div>;
}
