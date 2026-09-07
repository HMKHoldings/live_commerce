import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  UserRound,
  Heart,
  ShoppingCart,
  Menu,
  ChevronRight,
  MessageCircle,
  Play,
  X,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import "./styles.css";
import "./mascot.css";
import "./lower-sections.css";
import "./store-footer.css";
import "./hero-banner.css";
import HeroBanner from "./HeroBanner.jsx";
import LiveVideo from "./LiveVideo.jsx";
import StoreFooter from "./StoreFooter.jsx";
import LowerSections from "./LowerSections.jsx";
import { groupDeals, bestProducts, reviews } from "./marketData.js";

const photo = (id, w = 650) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const products = [
  {
    id: 1,
    name: "[키친홈] IH 인덕션 프라이팬 세트",
    desc: "요리하는 즐거움, 키친홈",
    price: 89000,
    image: photo("photo-1556911220-bff31c812dba"),
    platform: "YouTube",
    views: "12.4만",
    likes: 1234,
    comments: 365,
    category: "생활",
  },
  {
    id: 2,
    name: "[브라이트] 비타C 세럼",
    desc: "환해지는 피부의 시작",
    price: 29900,
    image: photo("photo-1608571423902-eed4a5ad8108"),
    platform: "TikTok",
    views: "8.7만",
    likes: 2156,
    comments: 492,
    category: "뷰티",
  },
  {
    id: 3,
    name: "[한우명가] 1++ 한우 선물세트",
    desc: "특별한 날, 특별한 한우",
    price: 159000,
    image: photo("photo-1607623814075-e51df1bdc82f"),
    platform: "네이버 쇼핑라이브",
    views: "6.1만",
    likes: 892,
    comments: 240,
    category: "식품",
  },
  {
    id: 4,
    name: "[홈데이] 호텔식 차렵이불",
    desc: "포근한 오늘, 더 좋은 내일",
    price: 49900,
    image: photo("photo-1631049307264-da0ec9d70304"),
    platform: "Instagram",
    views: "4.5만",
    likes: 1021,
    comments: 318,
    category: "생활",
  },
  {
    id: 5,
    name: "[오렌지키친] 에어프라이어",
    desc: "더 맛있는 일상의 시작",
    price: 79000,
    image: photo("photo-1585515320310-259814833e62"),
    platform: "TikTok",
    views: "9.8만",
    likes: 3412,
    comments: 520,
    category: "생활",
  },
  {
    id: 6,
    name: "GAP 인증 설향 딸기 1kg",
    desc: "달콤한 제철 딸기",
    price: 17900,
    image: photo("photo-1464965911861-746a04b4bca6"),
    rating: "4.8",
    reviews: "999+",
    category: "식품",
  },
  {
    id: 7,
    name: "무농약 샐러드 채소 1kg",
    desc: "신선함이 가득한 한 끼",
    price: 12900,
    image: photo("photo-1540420773420-3366772f4999"),
    rating: "4.7",
    reviews: "532",
    category: "식품",
  },
  {
    id: 8,
    name: "오렌지 스페셜티 원두 200g",
    desc: "깊고 부드러운 맛",
    price: 15900,
    image: photo("photo-1447933601403-0c6688de566e"),
    rating: "4.9",
    reviews: "386",
    category: "식품",
  },
  {
    id: 9,
    name: "프리미엄 호텔 타월 10P",
    desc: "매일이 호텔처럼",
    price: 28900,
    image: photo("photo-1600369672770-985fd30004eb"),
    rating: "4.8",
    reviews: "621",
    category: "생활",
  },
  {
    id: 10,
    name: "하루 한줌 견과세트 30봉",
    desc: "건강한 습관",
    price: 23900,
    image: photo("photo-1599599810769-bcde5a160d32"),
    rating: "4.8",
    reviews: "479",
    category: "식품",
  },
];
const inventory = [...new Map([...products, ...groupDeals, ...bestProducts].map((p) => [p.id, p])).values()];
const won = (n) => n.toLocaleString("ko-KR") + "원";
function Orange({ small = false }) {
  return (
    <img
      className={"orange-mascot" + (small ? " small" : "")}
      src="/logo/orange_logo.png"
      alt=""
      width="64"
      height="64"
    />
  );
}
function Brand() {
  return (
    <a className="brand" href="./" aria-label="오렌지스토어 홈">
      <Orange />
      <span>
        <small>좋은 상품이 모이는 곳</small>
        <strong>오렌지스토어</strong>
      </span>
    </a>
  );
}
const socialPlatforms = {
  YouTube: { className: "youtube", icon: "/png/youtube.png" },
  TikTok: { className: "tiktok", icon: "/png/tiktok.png" },
  Instagram: { className: "instagram", icon: "/png/instagram.png" },
  "네이버 쇼핑라이브": { className: "naver", icon: "/png/naver.png" },
};

function Platform({ name }) {
  const platform = socialPlatforms[name];

  return (
    <span className={"platform " + (platform?.className || "")}>
      {platform && (
        <img
          className="platform-icon"
          src={platform.icon}
          width="28"
          height="28"
          alt=""
          aria-hidden="true"
          draggable="false"
        />
      )}
      <span>{name}</span>
    </span>
  );
}
function App() {
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [liked, setLiked] = useState([]),
    [cart, setCart] = useState({}),
    [panel, setPanel] = useState(null),
    [selected, setSelected] = useState(null),
    [menu, setMenu] = useState(false),
    [category, setCategory] = useState("전체"),
    [active, setActive] = useState("쇼핑"),
    [toast, setToast] = useState(""),
    [joinedDeals, setJoinedDeals] = useState([]),
    [collection, setCollection] = useState(null),
    [selectedReview, setSelectedReview] = useState(null);
  const notify = (s) => {
    setToast(s);
    window.setTimeout(() => setToast(""), 2600);
  };
  const toggle = (id) =>
    setLiked((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const add = (p) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    notify("장바구니에 상품을 담았어요");
  };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const joinDeal = (deal) => {
    if (joinedDeals.includes(deal.id)) return;
    setJoinedDeals((ids) => [...ids, deal.id]);
    setCart((current) => ({ ...current, [deal.id]: (current[deal.id] || 0) + 1 }));
    notify("공동구매 상품을 장바구니에 담았어요");
  };
  const browseCollection = (nextCollection) => {
    setCollection(nextCollection);
    setPanel("collection");
  };
  const openReview = (review) => {
    setSelectedReview(review);
    setPanel("reviews");
  };
  const filter = (p) =>
    (category === "전체" || p.category === category) &&
    (!search ||
      (p.name + " " + p.desc + " " + (p.platform || ""))
        .toLowerCase()
        .includes(search.toLowerCase()));
  const browseBannerCategory = (nextCategory) => {
    setCategory(nextCategory);
    setSearch("");
    setQuery("");
    setActive("쇼핑");
    requestAnimationFrame(() => {
      document.getElementById("live").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
  };
  const navigate = (name) => {
    setActive(name);
    setSearch("");
    setQuery("");
    setCategory("전체");
    document
      .getElementById(name === "베스트" ? "best" : name === "공동구매" ? "group-buy" : name === "공유창고" ? "collections" : "live")
      .scrollIntoView({ behavior: "smooth" });
  };
  const card = (p, live) => (
    <article className="product" key={p.id}>
      {live ? (
        <LiveVideo product={p} Platform={Platform} onOpen={() => setSelected(p)} />
      ) : (
        <button className="product-image short" onClick={() => setSelected(p)} aria-label={p.name + " 자세히 보기"}>
          <img src={p.image} alt={p.name} loading="lazy" />
        </button>
      )}
      {!live && (
        <button
          className={"image-heart " + (liked.includes(p.id) ? "saved" : "")}
          onClick={() => toggle(p.id)}
          aria-label="찜하기"
        >
          <Heart
            fill={liked.includes(p.id) ? "currentColor" : "none"}
            size={24}
          />
        </button>
      )}
      <button className="product-name" onClick={() => setSelected(p)}>
        {p.name}
      </button>
      <p>{p.desc}</p>
      <strong className="price">{won(p.price)}</strong>
      {live ? (
        <div className="engagement">
          <button
            onClick={() => toggle(p.id)}
            className={liked.includes(p.id) ? "saved" : ""}
          >
            <Heart
              size={17}
              fill={liked.includes(p.id) ? "currentColor" : "none"}
            />
            {(p.likes + (liked.includes(p.id) ? 1 : 0)).toLocaleString()}
          </button>
          <span>
            <MessageCircle size={16} />
            {p.comments}
          </span>
        </div>
      ) : (
        <div className="rating">
          <span className="star">★</span>
          <b>{p.rating}</b>
          <span>({p.reviews})</span>
          <em>무료배송</em>
        </div>
      )}
    </article>
  );
  return (
    <>
      <header>
        <div className="header-main wrap">
          <Brand />
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(query);
              document
                .getElementById("live")
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="찾고 싶은 상품을 검색해보세요!"
              aria-label="상품 검색"
            />
            <button aria-label="검색">
              <Search size={25} />
            </button>
          </form>
          <div className="header-actions">
            <button onClick={() => setPanel("login")}>
              <UserRound />
              <span>로그인</span>
            </button>
            <button onClick={() => setPanel("favorites")}>
              <Heart />
              <span>찜한상품</span>
              {liked.length > 0 && <i>{liked.length}</i>}
            </button>
            <button onClick={() => setPanel("cart")}>
              <ShoppingCart />
              <span>장바구니</span>
              <i>{count}</i>
            </button>
          </div>
        </div>
        <nav>
          <div className="nav-inner wrap">
            <button
              className="menu-button"
              onClick={() => setMenu(!menu)}
              aria-label="카테고리 메뉴"
              aria-expanded={menu}
            >
              <Menu />
            </button>
            <div className="nav-primary">
              {[
                "쇼핑",
                "공동구매",
                "SNS 라이브",
                "베스트",
                "신상품",
                "공유창고",
                "고객센터",
              ].map((n) => (
                <button
                  key={n}
                  className={[active === n ? "active" : "", n === "공유창고" ? "nav-service" : "", n === "신상품" ? "nav-shopping-end" : ""].filter(Boolean).join(" ")}
                  onClick={() =>
                    n === "고객센터" ? setPanel("help") : navigate(n)
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="nav-secondary">
              {["오늘의 특가", "브랜드관", "기획전"].map((n) => (
                <button key={n} onClick={() => navigate(n)}>
                  {n}
                </button>
              ))}
            </div>
            {menu && (
              <div className="category-menu">
                <strong>카테고리</strong>
                {["전체", "식품", "생활", "뷰티"].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setMenu(false);
                    }}
                  >
                    {c}
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </header>
      <main>
        <HeroBanner
          Orange={Orange}
          Platform={Platform}
          onShop={browseBannerCategory}
        />
        <div className="catalog wrap">
          {(search || category !== "전체") && (
            <div className="filter-status">
              <span>
                {search ? `“${search}” 검색 결과` : category + " 상품"}
              </span>
              <button
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setCategory("전체");
                }}
              >
                전체 보기 <X size={15} />
              </button>
            </div>
          )}
          <section id="live">
            <div className="section-heading">
              <h2>
                {active === "쇼핑"
                  ? "SNS 라이브 연동 상품"
                  : active === "베스트"
                    ? "SNS 라이브 연동 상품"
                    : active}
              </h2>
              <p>
                지금 SNS에서 화제인 그 상품! 오렌지스토어에서 바로 만나보세요.
              </p>
              <button
                onClick={() => {
                  setPanel("all");
                }}
              >
                더보기 <ChevronRight size={15} />
              </button>
            </div>
            <div className="product-grid">
              {products
                .filter((p) => p.platform && filter(p))
                .map((p) => card(p, true))}
            </div>
            {!products.some((p) => p.platform && filter(p)) && (
              <p className="empty">조건에 맞는 라이브 상품이 없습니다.</p>
            )}
          </section>
          <section id="popular">
            <div className="section-heading">
              <h2>지금 인기 상품</h2>
              <p>지금 가장 사랑받는 상품들을 만나보세요.</p>
              <button onClick={() => setPanel("all")}>
                더보기 <ChevronRight size={15} />
              </button>
            </div>
            <div className="product-grid">
              {products
                .filter((p) => !p.platform && filter(p))
                .map((p) => card(p, false))}
            </div>
            {!products.some((p) => !p.platform && filter(p)) && (
              <p className="empty">조건에 맞는 인기 상품이 없습니다.</p>
            )}
          </section>
          <LowerSections
            liked={liked}
            onToggleLike={toggle}
            onSelectProduct={setSelected}
            onJoinDeal={joinDeal}
            joinedDeals={joinedDeals}
            onBrowse={browseCollection}
            onOpenReviews={() => openReview(null)}
            onOpenReview={openReview}
            filter={filter}
          />

        </div>
      </main>
      <StoreFooter
        brand={<Brand />}
        onOpenLogin={() => setPanel("login")}
        onBrowseProducts={() => setPanel("all")}
      />
      {(panel || selected) && (
        <div
          className="overlay"
          onClick={() => {
            setPanel(null);
            setSelected(null);
          }}
        >
          <section
            className={"modal " + (selected ? "detail" : "")}
            role="dialog"
            aria-modal="true"
            aria-label={selected ? selected.name : "오렌지스토어"}
          >
            <button
              className="close"
              onClick={() => {
                setPanel(null);
                setSelected(null);
              }}
              aria-label="닫기"
            >
              <X />
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              {selected ? (
                <>
                  <img
                    className="detail-image"
                    src={selected.image}
                    alt={selected.name}
                  />
                  <div className="detail-body">
                    <span className="eyebrow">
                      ORANGE STORE · {selected.category}
                    </span>
                    <h2>{selected.name}</h2>
                    <p>{selected.desc}</p>
                    <strong className="price">{won(selected.price)}</strong>
                    <p className="delivery">
                      무료배송 · 좋은 상품을 정성껏 보내드려요.
                    </p>
                    <div className="detail-actions">
                      <button className="primary" onClick={() => add(selected)}>
                        <ShoppingCart size={19} />
                        장바구니 담기
                      </button>
                      <button
                        className="secondary"
                        onClick={() => toggle(selected.id)}
                      >
                        <Heart
                          size={21}
                          fill={
                            liked.includes(selected.id) ? "#ff6a19" : "none"
                          }
                        />
                      </button>
                    </div>
                  </div>
                </>
              ) : panel === "login" ? (
                <>
                  <Orange />
                  <h2>오렌지스토어에 오신 것을 환영해요</h2>
                  <p>좋은 상품과 새로운 일상을 만나보세요.</p>
                  <form
                    className="login-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      notify(
                        "현재 데모 화면입니다. 계정 로그인은 준비 중이에요.",
                      );
                    }}
                  >
                    <label>
                      이메일
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        required
                      />
                    </label>
                    <label>
                      비밀번호
                      <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        minLength={6}
                        required
                      />
                    </label>
                    <button className="primary">로그인</button>
                    <small>데모 스토어 · 실제 계정에 연결되지 않습니다.</small>
                  </form>
                </>
              ) : panel === "reviews" ? (
                <>
                  <h2>이달의 베스트 리뷰</h2>
                  <p>고객님들의 생생한 상품 이야기</p>
                  <div className="lower-modal-reviews">
                    {(selectedReview ? [selectedReview] : reviews).map((review) => (
                      <article className="lower-modal-review" key={review.id}>
                        <img src={review.image} alt={review.productName} />
                        <div>
                          <h3>{review.title}</h3>
                          <span className="lower-review-stars" aria-label={review.rating + "점"}>★★★★★</span>
                          <p>{review.body}</p>
                          <small>{review.author} · {review.productName}</small>
                          <button className="text-action" onClick={() => setSelected(inventory.find((p) => p.id === review.productId))}>
                            상품 보러가기 →
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : panel === "help" ? (
                <>
                  <h2>무엇을 도와드릴까요?</h2>
                  <p>오렌지스토어 고객센터</p>
                  <div className="help-box">
                    <b>주문 및 배송 안내</b>
                    <p>상품 상세 페이지에서 배송 정보를 확인할 수 있어요.</p>
                    <b>교환 및 반품 안내</b>
                    <p>
                      현재는 데모 스토어로, 실제 주문과 결제는 지원하지
                      않습니다.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2>
                    {panel === "cart"
                      ? `장바구니 (${count})`
                      : panel === "favorites"
                        ? `찜한상품 (${liked.length})`
                        : panel === "collection" ? collection.title : "전체 상품"}
                  </h2>
                  <div className="list-products">
                    {(panel === "collection" ? collection.products : inventory)
                      .filter((p) =>
                        panel === "cart"
                          ? cart[p.id]
                          : panel === "favorites"
                            ? liked.includes(p.id)
                            : true,
                      )
                      .map((p) => (
                        <div className="list-product" key={p.id}>
                          <img src={p.image} alt={p.name} />
                          <div>
                            <b>{p.name}</b>
                            <strong>{won(p.price)}</strong>
                            {panel === "cart" ? (
                              <div className="quantity">
                                <button
                                  aria-label="수량 감소"
                                  onClick={() =>
                                    setCart((c) => ({
                                      ...c,
                                      [p.id]: Math.max(0, c[p.id] - 1),
                                    }))
                                  }
                                >
                                  <Minus size={14} />
                                </button>
                                {cart[p.id]}
                                <button
                                  aria-label="수량 증가"
                                  onClick={() =>
                                    setCart((c) => ({
                                      ...c,
                                      [p.id]: c[p.id] + 1,
                                    }))
                                  }
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="text-action"
                                onClick={() => add(p)}
                              >
                                장바구니 담기 +
                              </button>
                            )}
                          </div>
                          {(panel === "cart" || panel === "favorites") && <button
                            aria-label="삭제"
                            onClick={() =>
                              panel === "cart"
                                ? setCart((c) => ({ ...c, [p.id]: 0 }))
                                : toggle(p.id)
                            }
                          >
                            <X size={17} />
                          </button>}
                        </div>
                      ))}
                  </div>
                  {((panel === "cart" && !count) ||
                    (panel === "favorites" && !liked.length)) && (
                    <div className="empty">
                      <ShoppingCart size={35} />
                      <p>
                        {panel === "cart"
                          ? "장바구니가 비어 있어요."
                          : "마음에 드는 상품에 하트를 눌러주세요."}
                      </p>
                      <button
                        className="primary"
                        onClick={() => setPanel(null)}
                      >
                        쇼핑 계속하기
                      </button>
                    </div>
                  )}
                  {panel === "cart" && count > 0 && (
                    <div className="cart-total">
                      <span>총 상품금액</span>
                      <strong>
                        {won(
                          inventory.reduce(
                            (sum, p) => sum + p.price * (cart[p.id] || 0),
                            0,
                          ),
                        )}
                      </strong>
                      <p>데모 스토어로 실제 결제는 진행되지 않습니다.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
