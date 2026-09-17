import React,{useMemo,useState} from 'react';
import {Boxes,Layers3,PackageSearch,Search,Tag} from 'lucide-react';
import {assetPath} from '../utils/assetPath';
import './brand-manager.css';

const money=value=>`${Number(value||0).toLocaleString('ko-KR')}원`;
const brandOf=product=>String(product.brandName||'').trim()||'브랜드 미지정';

export default function BrandManager({products,loaded,onEdit,onBrandChange}){
 const [query,setQuery]=useState(''),[selected,setSelected]=useState(''),[busy,setBusy]=useState(false);
 const brands=useMemo(()=>Object.values(products.reduce((result,product)=>{const name=brandOf(product);const current=result[name]||(result[name]={name,products:[],categories:new Set(),stock:0,totalPrice:0});current.products.push(product);if(product.category)current.categories.add(product.category);current.stock+=Number(product.stock||0);current.totalPrice+=Number(product.price||0);return result;},{})).sort((a,b)=>a.name==='브랜드 미지정'?1:b.name==='브랜드 미지정'?-1:b.products.length-a.products.length),[products]);
 const visible=brands.filter(brand=>!query.trim()||brand.name.toLowerCase().includes(query.trim().toLowerCase())||[...brand.categories].some(category=>category.toLowerCase().includes(query.trim().toLowerCase())));
 const current=(selected&&brands.find(brand=>brand.name===selected))||visible[0];
 const assigned=products.filter(product=>brandOf(product)!=='브랜드 미지정').length;
 const renameBrand=async()=>{if(!current||current.name==='브랜드 미지정'||busy)return;const next=prompt('변경할 브랜드 이름을 입력하세요.',current.name)?.trim();if(!next||next===current.name)return;setBusy(true);try{await onBrandChange(current.products,next);setSelected(next);}finally{setBusy(false);}};
 const deleteBrand=async()=>{if(!current||current.name==='브랜드 미지정'||busy)return;if(!confirm(`“${current.name}” 브랜드를 삭제하시겠습니까?\n연결된 상품은 삭제되지 않고 브랜드 미지정 상태로 변경됩니다.`))return;setBusy(true);try{await onBrandChange(current.products,'');setSelected('브랜드 미지정');}finally{setBusy(false);}};
 if(!loaded)return <div className="brand-manager-loading">브랜드 정보를 불러오는 중…</div>;
 return <section className="brand-manager">
  <div className="brand-summary">
   <article><span className="orange"><Tag size={21}/></span><div><small>등록 브랜드</small><strong>{brands.filter(brand=>brand.name!=='브랜드 미지정').length}개</strong></div></article>
   <article><span className="green"><Boxes size={21}/></span><div><small>브랜드 지정 상품</small><strong>{assigned}개</strong></div></article>
   <article><span className="blue"><Layers3 size={21}/></span><div><small>브랜드 미지정</small><strong>{products.length-assigned}개</strong></div></article>
  </div>
  <div className="brand-layout">
   <aside className="brand-list-card"><header><div><h2>브랜드 목록</h2><p>상품에 입력된 브랜드를 기준으로 자동 집계됩니다.</p></div><b>{visible.length}개</b></header><label className="brand-search"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="브랜드 또는 카테고리 검색"/></label><div className="brand-list">{visible.map(brand=><button type="button" className={(current?.name===brand.name?'active ':'')+(brand.name==='브랜드 미지정'?'unassigned':'')} key={brand.name} onClick={()=>setSelected(brand.name)}><span><i>{brand.name.slice(0,1)}</i><span><strong>{brand.name}</strong><small>{[...brand.categories].slice(0,2).join(' · ')||'카테고리 없음'}</small></span></span><b>{brand.products.length}개</b></button>)}{!visible.length&&<div className="brand-empty"><Tag size={24}/><span>검색 결과가 없습니다.</span></div>}</div></aside>
   <article className="brand-detail-card">{current?<><header><div><span>{current.name.slice(0,1)}</span><div><small>BRAND OVERVIEW</small><h2>{current.name}</h2><p>{current.name==='브랜드 미지정'?'아래 상품을 수정해 브랜드 이름을 입력하세요.':'연결된 상품과 재고 현황입니다.'}</p>{current.name!=='브랜드 미지정'&&<div className="brand-actions"><button type="button" disabled={busy} onClick={renameBrand}>브랜드명 변경</button><button type="button" className="danger" disabled={busy} onClick={deleteBrand}>브랜드 삭제</button></div>}</div></div><dl><div><dt>상품</dt><dd>{current.products.length}개</dd></div><div><dt>카테고리</dt><dd>{current.categories.size}개</dd></div><div><dt>총 재고</dt><dd>{current.stock.toLocaleString()}개</dd></div><div><dt>평균 판매가</dt><dd>{money(Math.round(current.totalPrice/current.products.length))}</dd></div></dl></header><div className="brand-products"><div className="brand-products-heading"><h3>연결 상품</h3><span>상품 수정 화면에서 브랜드 이름을 변경할 수 있습니다.</span></div>{current.products.map(product=><button type="button" key={product.id} onClick={()=>onEdit(product)}>{product.image?<img src={assetPath(product.image)} alt=""/>:<span className="brand-product-image"><PackageSearch size={18}/></span>}<span><strong>{product.name}</strong><small>#{product.id} · {product.category||'미분류'}</small></span><b>{money(product.price)}</b><em>{Number(product.stock||0)}개</em><i>수정</i></button>)}</div></>:<div className="brand-empty large"><Tag size={34}/><b>등록된 상품이 없습니다.</b><span>상품을 먼저 등록한 뒤 브랜드 이름을 지정하세요.</span></div>}</article>
  </div>
 </section>;
}
