import React, {useState} from "react";
import { ChevronLeft, Play, Star } from "lucide-react";
import "./product-catalog.css";

export default function ProductCatalog({ collection, onSelect, onBack }) {
  const [category, setCategory] = useState("전체");
  const ranked = collection.kind === "best";
  const categories = [["전체", []], ["패션", ["패션", "의류", "fashion"]], ["뷰티", ["뷰티", "beauty"]], ["식품", ["식품", "food"]], ["생활", ["생활", "living"]]];
  const accepted = categories.find(([label]) => label === category)?.[1] || [];
  const visibleProducts = collection.products.filter(product => !ranked || category === "전체" || accepted.includes(String(product.category).toLowerCase()));
  return <main className={`product-catalog wrap${ranked ? " best-catalog" : ""}`}>
    <button className="catalog-back" onClick={onBack}><ChevronLeft size={18} /> 돌아가기</button>
        <div className="catalog-heading"><h1>{collection.title}</h1><p>{ranked ? "오렌지스토어 베스트 상품을 만나보세요." : collection.description || "다양한 상품과 특별한 혜택을 만나보세요."}</p></div>
    {ranked && <div className="best-category-tabs" aria-label="베스트 상품 카테고리">{categories.map(([label]) => <button key={label} type="button" aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</div>}
    <div className="catalog-product-grid">
      {visibleProducts.map(product => {
        const discount = product.originalPrice > product.price
          ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
        return <article className="catalog-product-card" key={product.id}>
          {ranked && <span className="best-product-rank" aria-label={`${collection.products.indexOf(product) + 1}위`}>{collection.products.indexOf(product) + 1}</span>}
          <button className="catalog-product-image" onClick={() => onSelect(product)} aria-label={`${product.name} 상세보기`}>
            <img src={product.image} alt={product.name} loading="lazy" />
            {product.platform && <span className="catalog-live-badge">라방속 상품 <span><Play size={20} fill="currentColor" /></span></span>}
          </button>
          <button className="catalog-product-name" onClick={() => onSelect(product)}>{product.name}</button>
          <div className="catalog-product-price">
            {discount > 0 && <span>{discount}%</span>}
            <strong>{product.price.toLocaleString("ko-KR")}<small>원</small></strong>
            {product.originalPrice > product.price && <del>{Number(product.originalPrice).toLocaleString("ko-KR")}</del>}
          </div>
          <div className="catalog-product-rating"><Star size={17} fill="currentColor" /><span>{product.rating ?? 0}</span><span className="catalog-review-label">Review</span><span>{product.reviews ?? 0}</span></div>
        </article>;
      })}
    </div>
    {!visibleProducts.length && <p className="empty">{ranked ? "이 카테고리에 등록된 베스트 상품이 없습니다." : "등록된 상품이 없습니다."}</p>}
  </main>;
}
