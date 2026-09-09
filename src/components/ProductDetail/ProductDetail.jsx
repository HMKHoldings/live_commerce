import { useStore } from "../../context/StoreContext";
import { api } from "../../api/storeApi";
import DealDetailStatus from "../Deals/DealDetailStatus";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Share2, Heart, ShoppingCart, CreditCard, MessageCircle, Minus, Plus, ChevronDown } from "lucide-react";
import { productDetails } from "../../data/productDetails";
import "./styles.css";

const won = value => `${value.toLocaleString("ko-KR")}원`;

export default function ProductDetail({ product, products, reviews, liked, joined, onLike, onSelect, onBack, onAdd, onBuy, notify }) {
  const { connected, refresh, questions: publishedQuestions = [] } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const details = { ...(productDetails[product.id] || {}), ...product };
  const photo = details.image || product.image;
  const [option, setOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [localQuestions, setQuestions] = useState([]);
  const questions = [...publishedQuestions.filter(q => String(q.productId) === String(product.id)), ...localQuestions];
  const [reviewOpen, setReviewOpen] = useState(false);
  const [writtenReviews, setWrittenReviews] = useState([]);
  const select = useRef(null);
  const title = useRef(null);
  const productReviews = [...reviews.filter(review => review.productId === product.id), ...writtenReviews];
  const rating = productReviews.length ? (productReviews.reduce((sum, review) => sum + Number(review.rating), 0) / productReviews.length).toFixed(1) : product.rating;
  const related = [...products.filter(p => p.id !== product.id && p.category === product.category), ...products.filter(p => p.id !== product.id && p.category !== product.category)].slice(0, 6);

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [product.id]);

  const buy = callback => {
    if (!option) { select.current.focus(); select.current.reportValidity(); return; }
    callback(product, quantity);
  };
  const jump = id => document.getElementById(`pd-${id}`)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  const tabs = current => <nav className="pd-tabs" aria-label="상품 상세 메뉴">
    {[["info", "상세정보"], ["questions", `상품문의(${questions.length})`], ["shipping", "배송/교환/반품"], ["reviews", `상품평(${productReviews.length})`]].map(([id, label]) =>
      <button type="button" key={id} aria-current={current === id ? "location" : undefined} onClick={() => jump(id)}>{label}</button>)}
  </nav>;

  return <main className="product-detail wrap">
    <div className="pd-breadcrumb"><button type="button" onClick={onBack}><ArrowLeft size={16} /> 쇼핑으로 돌아가기</button><span>{product.category} / 상품상세</span></div>
    <section className="pd-overview" aria-labelledby="pd-title">
      <div className="pd-gallery"><img src={photo} alt={product.name} /><span>ORANGE STORE</span></div>
      <div className="pd-summary">
        <h1 id="pd-title" ref={title} tabIndex={-1}>{product.name}</h1>
        <div className="pd-rating"><span aria-label={rating ? `${rating}점` : "등록된 평점 없음"}>{rating ? "★★★★★" : "☆☆☆☆☆"}</span><b>{rating ? `${rating}점` : "첫 리뷰를 남겨주세요"}</b>
          <button type="button" aria-label="상품 공유" onClick={async () => {
            try { await navigator.clipboard.writeText(location.href); notify("상품 링크를 복사했어요"); }
            catch { notify("주소창의 상품 링크를 복사해주세요"); }
          }}><Share2 size={20} /></button>
        </div>
        <div className="pd-price">{product.originalPrice && <del>{won(product.originalPrice)}</del>}<strong>{won(product.price)}</strong></div>
        {product.target > 0 && <DealDetailStatus deal={product} joined={joined} />}
        <dl className="pd-facts"><dt>배송비</dt><dd>무료배송 · 데모 기준</dd><dt>상품분류</dt><dd>{product.category}</dd><dt>상품구성</dt><dd>{details.option || product.name}</dd><dt>원산지</dt><dd>{product.origin || "판매자 정보 등록 예정"}</dd><dt>상품코드</dt><dd>OS-{String(product.id).padStart(4, "0")}</dd></dl>
        <label className="pd-option">상품 옵션<select ref={select} required value={option} onChange={event => setOption(event.target.value)}><option value="">==(필수) 옵션을 선택해주세요==</option><option value="default">{details.option || product.name}</option></select></label>
        {option && <div className="pd-selected-option"><span>{details.option || product.name}</span><div className="pd-quantity"><button type="button" aria-label="수량 감소" disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)}><Minus size={15} /></button><output aria-label="수량">{quantity}</output><button type="button" aria-label="수량 증가" disabled={quantity >= 99} onClick={() => setQuantity(q => q + 1)}><Plus size={15} /></button></div></div>}
        <div className="pd-total"><span>총 상품금액</span><strong>{won(option ? product.price * quantity : 0)}</strong></div>
        <div className="pd-actions"><button type="button" aria-label="상품 문의하기" onClick={() => { setQuestionOpen(true); jump("questions"); }}><MessageCircle /></button><button type="button" aria-label="상품 찜하기" aria-pressed={liked} onClick={() => onLike(product.id)}><Heart fill={liked ? "currentColor" : "none"} /></button><button type="button" onClick={() => buy(onAdd)}><ShoppingCart /> 장바구니</button><button type="button" className="pd-buy" onClick={() => buy(onBuy)}><CreditCard /> 구매하기</button></div>
        <p className="pd-demo">데모 스토어 · 실제 결제는 진행되지 않습니다.</p>
      </div>
    </section>

    <section className="pd-related"><h2>함께 사용하면 좋은 상품</h2><div className="pd-related-grid">{related.map(item => <button type="button" key={item.id} onClick={() => onSelect(item)}><img src={productDetails[item.id]?.image || item.image} alt="" loading="lazy" /><span>{item.name}</span>{item.originalPrice && <del>{won(item.originalPrice)}</del>}<strong>{won(item.price)}</strong></button>)}</div></section>

    <section id="pd-info" className="pd-section">{tabs("info")}
      <div className="pd-story"><small>ORANGE STORE · {product.category}</small><h2>{product.name}</h2><p>{product.desc}</p><img src={photo} alt={`${product.name} 상세 이미지`} loading="lazy" /><div className="pd-story-caption"><small>EVERYDAY PICKS</small><h3>{details.option || product.name}</h3><p>{product.desc}</p></div></div>
      <button type="button" className="pd-expand" aria-expanded={expanded} aria-controls="pd-specifications" onClick={() => setExpanded(value => !value)}>상품정보 {expanded ? "접기" : "더보기"} <ChevronDown size={18} /></button>
      <div id="pd-specifications" hidden={!expanded}><dl className="pd-specs"><dt>상품명</dt><dd>{product.name}</dd><dt>구성</dt><dd>{details.option || product.name}</dd><dt>판매가격</dt><dd>{won(product.price)}</dd><dt>제조사 / 원산지</dt><dd>판매자 정보 등록 예정</dd><dt>재질 / 성분 / 보관방법</dt><dd>{product.specifications || "판매자 상세정보 등록 예정"}</dd></dl></div>
      <p className="pd-disclosure">상품 이미지는 예시입니다. 제조사, 원산지, 성분 등 상세 고시는 판매자 확인 후 등록됩니다.</p>
    </section>

    <section id="pd-questions" className="pd-section">{tabs("questions")}<h2 className="pd-sr-only">상품문의</h2>
      <div className="pd-table-scroll"><table className="pd-table"><thead><tr><th>번호</th><th>문의</th><th>작성자</th><th>작성일</th><th>답변</th></tr></thead><tbody>{questions.length ? questions.map((question, index) => <tr key={index}><td>{index + 1}</td><td>{question.body}</td><td>나</td><td>{question.date}</td><td>{question.answer || "대기"}</td></tr>) : <tr><td colSpan={5}>등록된 글이 없습니다.</td></tr>}</tbody></table></div>
      <div className="pd-section-actions"><button type="button" className="pd-buy" onClick={() => setQuestionOpen(value => !value)}>상품문의</button><button type="button" onClick={() => { setQuestionOpen(true); notify(questions.length ? "이 페이지에서 작성한 문의를 표시합니다" : "작성한 문의가 없습니다"); }}>나의글보기</button></div>
      {questionOpen && <form className="pd-form" onSubmit={async event => { event.preventDefault(); const data = new FormData(event.currentTarget); const body = String(data.get("body")).trim(); if (!body || submitting) return;
    if (connected) { setSubmitting(true); try { await api('/questions', { method:'POST', body:{productId:String(product.id),body} }); notify('문의가 접수되었습니다. 관리자 확인 후 게시됩니다.'); setQuestionOpen(false); await refresh(); } catch(error) { notify(error.message); } finally { setSubmitting(false); } return; }
    setQuestions(items => [...items, { body, date: new Date().toLocaleDateString("ko-KR") }]); setQuestionOpen(false); }}><label>상품 문의<textarea name="body" required maxLength={1000} rows={4} /></label><p>{connected ? "문의는 관리자에게 전달되며 확인 후 게시됩니다." : "현재 오프라인 데모입니다. 문의는 전송되지 않습니다."}</p><button className="pd-buy">문의 등록</button></form>}
    </section>

    <section id="pd-shipping" className="pd-section">{tabs("shipping")}<div className="pd-shipping"><h2>배송 / 교환 / 반품 안내</h2><dl className="pd-specs"><dt>배송 안내</dt><dd>{product.shipping || "배송 일정과 추가 지역 배송비는 판매자 등록 후 안내됩니다."}</dd><dt>교환 / 반품</dt><dd>접수 방법, 반품 주소와 비용은 판매자 정책 등록 후 안내됩니다.</dd><dt>문의 안내</dt><dd>상품 관련 문의는 위의 상품문의에서 확인할 수 있습니다.</dd></dl></div></section>

    <section id="pd-reviews" className="pd-section">{tabs("reviews")}<div className="pd-review-summary"><div><h2>상품평</h2><span className="pd-stars">{rating ? "★★★★★" : "☆☆☆☆☆"}</span><p>({productReviews.length}개 리뷰)</p></div><strong>{rating ? `${rating}점` : "—"}</strong><img src={photo} alt="" loading="lazy" /></div>
      <p className="pd-disclosure">등록된 예시 리뷰와 이 페이지에서 작성한 데모 리뷰입니다.</p>
      <div className="pd-review-list">{productReviews.length ? productReviews.map((review, index) => <details key={review.id || index}><summary><span>{index + 1}</span><b>{review.title}</b><span className="pd-stars">{"★".repeat(Number(review.rating))}</span><span>{review.author}</span></summary><p>{review.body}</p></details>) : <p className="pd-empty">등록된 상품평이 없습니다.</p>}</div>
      <div className="pd-section-actions"><button type="button" onClick={() => setReviewOpen(value => !value)}>상품평쓰기</button></div>
      {reviewOpen && <form className="pd-form" onSubmit={async event => { event.preventDefault(); const data = new FormData(event.currentTarget); if (!String(data.get("title")).trim() || !String(data.get("body")).trim()) return; if (connected) { if(submitting) return; setSubmitting(true); try { await api('/reviews', {method:'POST',body:{productId:String(product.id),title:data.get('title'),body:data.get('body'),rating:Number(data.get('rating'))}}); notify('리뷰가 접수되었습니다. 승인 후 게시됩니다.'); setReviewOpen(false); await refresh(); } catch(error) { notify(error.message); } finally {setSubmitting(false);} return; } setWrittenReviews(items => [...items, { title: String(data.get("title")).trim(), body: String(data.get("body")).trim(), rating: Number(data.get("rating")), author: "나 (데모)" }]); setReviewOpen(false); }}><label>평점<select name="rating">{[5,4,3,2,1].map(value => <option key={value} value={value}>{value}점</option>)}</select></label><label>제목<input name="title" required maxLength={100} /></label><label>내용<textarea name="body" required rows={4} maxLength={1000} /></label><p>{connected ? "리뷰는 관리자 검토 후 게시됩니다." : "데모 리뷰는 페이지를 이동하면 초기화됩니다."}</p><button className="pd-buy">상품평 등록</button></form>}
    </section>
  </main>;
}
