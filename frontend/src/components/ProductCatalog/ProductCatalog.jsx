import React, { useEffect, useState } from "react";
import { ChevronLeft, Clock3, Play, Star } from "lucide-react";
import DealProgress from "../Deals/DealProgress";
import "../Deals/animation.css";
import "./styles.css";

export default function ProductCatalog({ collection, onSelect, onBack, joinedDeals = [] }) {
  const [category, setCategory] = useState("전체");
  const [now, setNow] = useState(Date.now);
  const ranked = collection.kind === "best";
  const arrivals = collection.kind === "new";
  const deals = collection.kind === "group-deals";
  const categorized = ranked || arrivals;

  useEffect(() => {
    if (!deals) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deals]);

  const categories = [
    ["전체", []],
    ["패션", ["패션", "의류", "fashion"]],
    ["뷰티", ["뷰티", "beauty"]],
    ["식품", ["식품", "food"]],
    ["생활", ["생활", "living"]],
  ];
  const accepted = categories.find(([label]) => label === category)?.[1] || [];
  const visibleProducts = collection.products.filter(
    (product) =>
      (!deals || Date.parse(product.endsAt) > now) &&
      (!categorized || category === "전체" || accepted.includes(String(product.category).toLowerCase())),
  );

  return (
    <main className={"product-catalog wrap" + (categorized ? " best-catalog" : "") + (deals ? " deal-catalog" : "")}>
      <button className="catalog-back" onClick={onBack}><ChevronLeft size={18} /> 돌아가기</button>
      <div className="catalog-heading">
        <h1>{collection.title}</h1>
        {!arrivals && <p>{ranked ? "오렌지스토어의 베스트 상품을 만나보세요." : collection.description || "다양한 상품과 특별한 혜택을 만나보세요."}</p>}
      </div>
      {categorized && (
        <div className="best-category-tabs" aria-label={collection.title + " 카테고리"}>
          {categories.map(([label]) => (
            <button key={label} type="button" aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>
          ))}
        </div>
      )}
      <div className="catalog-product-grid">
        {visibleProducts.map((product, index) => {
          const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
          const remaining = deals ? Math.max(0, Math.ceil((Date.parse(product.endsAt) - now) / 1000)) : 0;
          const days = Math.floor(remaining / 86400);
          const time = [Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60]
            .map((part) => String(part).padStart(2, "0")).join(":");
          const participants = Number(product.participants || 0) + Number(joinedDeals.includes(product.id));
          const target = Math.max(1, Number(product.target || 1));
          const percent = Math.min(100, Math.round((participants / target) * 100));

          return (
            <article className="catalog-product-card" key={product.id}>
              {categorized && <span className="best-product-rank" aria-label={(ranked ? collection.products.indexOf(product) + 1 : index + 1) + "번"}>{ranked ? collection.products.indexOf(product) + 1 : index + 1}</span>}
              <button className="catalog-product-image" onClick={() => onSelect(product)} aria-label={product.name + " 상세보기"}>
                <img src={product.image} alt={product.name} loading="lazy" />
                {product.platform && <span className="catalog-live-badge">라이브 상품 <span><Play size={20} fill="currentColor" /></span></span>}
                {deals && <span className="catalog-deal-badge">공동구매</span>}
              </button>
              <button className="catalog-product-name" onClick={() => onSelect(product)}>{product.name}</button>
              <div className="catalog-product-price">
                {discount > 0 && <span>{discount}%</span>}
                <strong>{product.price.toLocaleString("ko-KR")}<small>원</small></strong>
                {product.originalPrice > product.price && <del>{Number(product.originalPrice).toLocaleString("ko-KR")}</del>}
              </div>
              {deals ? (
                <div className="catalog-deal-status">
                  <div className="catalog-deal-time"><Clock3 size={15} aria-hidden="true" /><strong>{(days > 0 ? days + "일 " : "") + time + " 남음"}</strong></div>
                  <DealProgress value={participants} max={target} name={product.name} />
                  <div className="catalog-deal-numbers">
                    <span><strong>{participants.toLocaleString("ko-KR")}명</strong> 참여</span>
                    <b>{percent}% 달성</b>
                  </div>
                  <small>목표 {target.toLocaleString("ko-KR")}명</small>
                </div>
              ) : (
                <div className="catalog-product-rating"><Star size={17} fill="currentColor" /><span>{product.rating ?? 0}</span><span className="catalog-review-label">Review</span><span>{product.reviews ?? 0}</span></div>
              )}
            </article>
          );
        })}
      </div>
      {!visibleProducts.length && <p className="empty">{deals ? "현재 진행 중인 공동구매가 없습니다." : ranked ? "이 카테고리에 등록된 베스트 상품이 없습니다." : "등록된 상품이 없습니다."}</p>}
    </main>
  );
}