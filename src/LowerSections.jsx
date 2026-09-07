import ReviewSlider from "./ReviewSlider";
import React, { useEffect, useState } from "react";
import DealProgress from "./DealProgress";
import "./deal-animation.css";
import { Check, ChevronRight, Heart, Clock3 } from "lucide-react";
import { bestProducts, collections, groupDeals, reviews } from "./marketData";

const won = (value) => `${value.toLocaleString("ko-KR")}원`;

function SectionHeading({ id, title, description, onMore }) {
  return (
    <div className="section-heading">
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
      {onMore && (
        <button type="button" onClick={onMore} aria-label={`${title} 더보기`}>
          더보기 <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

export default function LowerSections({
  liked,
  onToggleLike,
  onSelectProduct,
  onJoinDeal,
  joinedDeals,
  onBrowse,
  onOpenReviews,
  onOpenReview,
  filter,
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const visibleDeals = groupDeals.filter(filter);
  const visibleBest = bestProducts.filter(filter);

  return (
    <>
      <section id="group-buy" aria-labelledby="group-buy-heading">
        <SectionHeading
          id="group-buy-heading"
          title="진행 중인 공동구매"
          description="함께 구매할수록 더 합리적인 가격!"
          onMore={() => onBrowse({ title: "진행 중인 공동구매", products: groupDeals })}
        />
        <div className="lower-deal-grid">
          {visibleDeals.map((deal) => {
            const remaining = Math.max(0, Math.ceil((Date.parse(deal.endsAt) - now) / 1000));
            const expired = remaining === 0;
            const days = Math.floor(remaining / 86400);
            const time = [Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60]
              .map((part) => String(part).padStart(2, "0")).join(":");
            const joined = joinedDeals.includes(deal.id);
            const participants = deal.participants + Number(joined);
            return (
              <article className="lower-deal-card" key={deal.id}>
                <button
                  type="button"
                  className="lower-deal-image"
                  onClick={() => onSelectProduct(deal)}
                  aria-label={`${deal.name} 자세히 보기`}
                >
                  <img src={deal.image} alt={deal.name} loading="lazy" />
                  <span className="lower-deal-badge">공동구매</span>
                  <span className="lower-deal-days">{expired ? "마감" : `${Math.ceil(remaining / 86400)}일 남음`}</span>
                </button>
                <div className="lower-deal-body">
                  <button
                    type="button"
                    className="product-name"
                    onClick={() => onSelectProduct(deal)}
                  >
                    {deal.name}
                  </button>
                  <p>{deal.desc}</p>
                  <div className="lower-deal-price">
                    <strong className="price">{won(deal.price)}</strong>
                    <del>{won(deal.originalPrice)}</del>
                    <span>{deal.discount}%</span>
                  </div>
                  <div className={`deal-countdown${remaining < 86400 ? " urgent" : ""}`} role="timer" aria-live="off" aria-label={`${deal.name} 남은 시간`}>
                    <Clock3 size={15} aria-hidden="true" />
                    {expired ? "공동구매가 종료되었습니다" : `${days > 0 ? `${days}일 ` : ""}${time} 남음`}
                  </div>
                  <DealProgress value={participants} max={deal.target} name={deal.name} />
                  <div className="lower-deal-count" aria-live="polite">
                    <strong>{participants.toLocaleString("ko-KR")}명 참여중</strong>
                    <span>{deal.target.toLocaleString("ko-KR")}명</span>
                  </div>
                  <button
                    type="button"
                    className={`lower-join${joined ? " lower-joined" : ""}`}
                    onClick={() => { if (Date.now() < Date.parse(deal.endsAt)) onJoinDeal(deal); }}
                    disabled={joined || expired}
                    aria-label={`${deal.name} ${expired ? "마감" : joined ? "참여 완료" : "공동구매 참여하기"}`}
                  >
                    {joined && <Check size={17} />}
                    {expired ? "마감" : joined ? "참여 완료" : "참여하기"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {visibleDeals.length === 0 && (
          <p className="empty">조건에 맞는 공동구매 상품이 없습니다.</p>
        )}
      </section>

      <section id="collections" aria-labelledby="collections-heading">
        <SectionHeading
          id="collections-heading"
          title="함께 보면 좋은 상품"
          description="이런 상품도 함께 살펴보세요!"
        />
        <div className="lower-collection-grid">
          {collections.map((collection) => (
            <button
              type="button"
              key={collection.id}
              className={`lower-collection ${collection.id}`}
              onClick={() => onBrowse({ title: collection.title, products: collection.products })}
              aria-label={`${collection.title} 바로가기`}
            >
              <img src={collection.image} alt="" loading="lazy" />
              <span className="lower-collection-copy">
                <strong>{collection.title}</strong>
                <span>{collection.desc}</span>
                <span className="lower-collection-cta">
                  {collection.cta} <ChevronRight size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section id="reviews" aria-labelledby="reviews-heading">
        <SectionHeading
          id="reviews-heading"
          title="이달의 베스트 리뷰"
          description="실제 구매 고객님들의 생생한 후기를 확인하세요."
          onMore={onOpenReviews}
        />
        <ReviewSlider>
          {reviews.map((review) => (
            <button
              type="button"
              className="lower-review-card"
              key={review.id}
              onClick={() => onOpenReview(review)}
              aria-label={`${review.productName} 리뷰: ${review.title}`}
            >
              <img src={review.image} alt="" loading="lazy" />
              <span className="lower-review-copy">
                <strong>“{review.title}”</strong>
                <span className="lower-review-stars" aria-label={`별점 5점 만점에 ${review.rating}점`}>
                  {"★".repeat(review.rating)}
                </span>
                <span className="lower-review-product">{review.productName}</span>
                <span className="lower-review-author">{review.author}</span>
              </span>
              <ChevronRight className="lower-review-arrow" size={13} aria-hidden="true" />
            </button>
          ))}
        </ReviewSlider>
      </section>

      <section id="best" aria-labelledby="best-heading">
        <SectionHeading
          id="best-heading"
          title="베스트 상품"
          description="지금 가장 많이 사랑받는 상품들"
          onMore={() => onBrowse({ title: "베스트 상품", products: bestProducts })}
        />
        <div className="product-grid">
          {visibleBest.map((product) => {
            const saved = liked.includes(product.id);
            return (
              <article className="product" key={product.id}>
                <button
                  type="button"
                  className="product-image short"
                  onClick={() => onSelectProduct(product)}
                  aria-label={`${product.name} 자세히 보기`}
                >
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <span className="lower-rank" aria-label={`${product.rank}위`}>{product.rank}</span>
                </button>
                <button
                  type="button"
                  className={`image-heart${saved ? " saved" : ""}`}
                  onClick={() => onToggleLike(product.id)}
                  aria-pressed={saved}
                  aria-label={`${product.name} ${saved ? "찜 취소" : "찜하기"}`}
                >
                  <Heart fill={saved ? "currentColor" : "none"} size={24} />
                </button>
                <button
                  type="button"
                  className="product-name"
                  onClick={() => onSelectProduct(product)}
                >
                  {product.name}
                </button>
                <p>{product.desc}</p>
                <strong className="price">{won(product.price)}</strong>
                <div className="rating">
                  <span className="star" aria-hidden="true">★</span>
                  <b aria-label={`별점 ${product.rating}점`}>{product.rating}</b>
                  <span>({product.reviews})</span>
                </div>
              </article>
            );
          })}
        </div>
        {visibleBest.length === 0 && (
          <p className="empty">조건에 맞는 베스트 상품이 없습니다.</p>
        )}
      </section>
    </>
  );
}

