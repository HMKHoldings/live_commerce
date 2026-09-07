import StoreLogin from "./StoreLogin";
import CheckoutForm from "./CheckoutForm";
import { StoreProvider, useStore } from "./StoreContext";
import { assetPath } from "./assetPath";
import ProductDetail from "./ProductDetail";
import "./sns-live.css";
import MegaMenu from "./MegaMenu";
import React, { useEffect, useState } from "react";
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

const won = (n) => n.toLocaleString("ko-KR") + "원";
function Orange({ small = false }) {
  const { settings } = useStore();
  return (
    <img
      className={"orange-mascot" + (small ? " small" : "")}
      src={settings.logo}
      alt=""
      width="64"
      height="64"
    />
  );
}
function Brand() {
  const { settings } = useStore();
  return (
    <a className="brand" href="./" aria-label="오렌지스토어 홈">
      <Orange />
      <span>
        <small>{settings.tagline}</small>
        <strong>{settings.brandName}</strong>
      </span>
    </a>
  );
}
const socialPlatforms = {
  YouTube: { className: "youtube", icon: assetPath("/png/youtube.png") },
  TikTok: { className: "tiktok", icon: assetPath("/png/tiktok.png") },
  Instagram: { className: "instagram", icon: assetPath("/png/instagram.png") },
  "네이버 쇼핑라이브": {
    className: "naver",
    icon: assetPath("/png/naver.png"),
  },
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
  const {
    products,
    inventory,
    groupDeals,
    bestProducts,
    reviews,
    settings,
    connected,
    refresh,
  } = useStore();
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [liked, setLiked] = useState([]),
    [cart, setCart] = useState({}),
    [panel, setPanel] = useState(null),
    [selected, setSelectedState] = useState(
      () =>
        inventory.find(
          (p) =>
            String(p.id) ===
            new URLSearchParams(location.search).get("product"),
        ) || null,
    ),
    [menu, setMenu] = useState(false),
    [livePlatform, setLivePlatform] = useState("전체"),
    [category, setCategory] = useState("전체"),
    [active, setActive] = useState("쇼핑"),
    [toast, setToast] = useState(""),
    [joinedDeals, setJoinedDeals] = useState([]),
    [collection, setCollection] = useState(null),
    [selectedReview, setSelectedReview] = useState(null);
  const setSelected = (product) => {
    const url = new URL(location.href);
    if (product) url.searchParams.set("product", product.id);
    else url.searchParams.delete("product");
    if (url.href !== location.href) history.pushState(null, "", url);
    setSelectedState(product || null);
    setPanel(null);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const sync = () => {
      setSelectedState(
        inventory.find(
          (p) =>
            String(p.id) ===
            new URLSearchParams(location.search).get("product"),
        ) || null,
      );
      setPanel(null);
      setMenu(false);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("product");
    const current = inventory.find((p) => String(p.id) === id);
    setSelectedState((previous) => current || (id ? null : previous));
  }, [inventory]);
  const notify = (s) => {
    setToast(s);
    window.setTimeout(() => setToast(""), 2600);
  };
  const toggle = (id) =>
    setLiked((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const add = (p, quantity = 1) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + quantity }));
    notify("장바구니에 상품을 담았어요");
  };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const joinDeal = (deal) => {
    if (joinedDeals.includes(deal.id)) return;
    setJoinedDeals((ids) => [...ids, deal.id]);
    setCart((current) => ({
      ...current,
      [deal.id]: (current[deal.id] || 0) + 1,
    }));
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
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  };
  const navigate = (name) => {
    if (selected) setSelected(null);
    setActive(name);
    setMenu(false);
    setLivePlatform("전체");
    setSearch("");
    setQuery("");
    setCategory("전체");
    requestAnimationFrame(() => {
      document
        .getElementById(
          name === "베스트"
            ? "best"
            : name === "공동구매"
              ? "group-buy"
              : name === "공유창고"
                ? "collections"
                : "live",
        )
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
    });
  };
  const card = (p, live) => (
    <article className="product" key={p.id}>
      {live ? (
        <LiveVideo
          product={p}
          Platform={Platform}
          onOpen={() => setSelected(p)}
        />
      ) : (
        <button
          className="product-image short"
          onClick={() => setSelected(p)}
          aria-label={p.name + " 자세히 보기"}
        >
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
              if (selected) setSelected(null);
              setSearch(query);
              requestAnimationFrame(() =>
                document
                  .getElementById("live")
                  ?.scrollIntoView({ behavior: "smooth" }),
              );
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
              aria-controls="header-categories"
            >
              {menu ? <X /> : <Menu />}
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
                  className={[
                    active === n ? "active" : "",
                    n === "공유창고" ? "nav-service" : "",
                    n === "신상품" ? "nav-shopping-end" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
              <MegaMenu
                onClose={() => setMenu(false)}
                onCategory={(nextCategory) => {
                  setMenu(false);
                  browseCollection({
                    title: `${nextCategory} 전체 상품`,
                    products: inventory.filter(
                      (p) => p.category === nextCategory,
                    ),
                  });
                }}
                onCollection={(label, nextCategory) => {
                  const aliases = {
                    스킨케어: ["세럼", "앰플"],
                    농산물: ["감귤", "딸기", "채소"],
                    축산: ["한우", "삼겹살"],
                    "과일/견과": ["감귤", "딸기", "견과"],
                    주방용품: ["프라이팬"],
                    "주방용품/식기": ["프라이팬"],
                    "주방/생활가전": ["에어프라이어"],
                    "침구/커튼/수예소품": ["이불", "타월"],
                    "욕실/세탁용품": ["타월", "화장지"],
                    건강식품: ["콜라겐"],
                  };
                  const terms = aliases[label] || label.split("/");
                  setMenu(false);
                  browseCollection({
                    title: label,
                    products: inventory.filter(
                      (p) =>
                        p.category === nextCategory &&
                        terms.some((term) =>
                          `${p.name} ${p.desc}`.includes(term),
                        ),
                    ),
                  });
                }}
              />
            )}
          </div>
        </nav>
      </header>
      {selected ? (
        <ProductDetail
          key={selected.id}
          product={selected}
          products={inventory}
          reviews={reviews}
          liked={liked.includes(selected.id)}
          joined={joinedDeals.includes(selected.id)}
          onLike={toggle}
          onSelect={setSelected}
          onBack={() => setSelected(null)}
          onAdd={add}
          onBuy={(product, quantity) => {
            add(product, quantity);
            setPanel("cart");
          }}
          notify={notify}
        />
      ) : (
        <main>
          {active !== "SNS 라이브" && (
            <HeroBanner
              Orange={Orange}
              Platform={Platform}
              onShop={browseBannerCategory}
            />
          )}
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
            <section
              id="live"
              className={active === "SNS 라이브" ? "sns-live-page" : undefined}
            >
              <div className="section-heading">
                <h2>
                  {active === "쇼핑"
                    ? "SNS 라이브 연동 상품"
                    : active === "베스트"
                      ? "SNS 라이브 연동 상품"
                      : active}
                </h2>
                <p>
                  {active === "SNS 라이브"
                    ? "다양한 채널의 쇼핑 영상을 한곳에서 만나보세요."
                    : "지금 SNS에서 화제인 그 상품! 오렌지스토어에서 바로 만나보세요."}
                </p>
                {active !== "SNS 라이브" && (
                  <button onClick={() => navigate("SNS 라이브")}>
                    더보기 <ChevronRight size={15} />
                  </button>
                )}
              </div>
              {active === "SNS 라이브" && (
                <div className="sns-live-tools">
                  <div className="sns-platforms" aria-label="영상 채널 선택">
                    {[
                      "전체",
                      "YouTube",
                      "TikTok",
                      "네이버 쇼핑라이브",
                      "Instagram",
                    ].map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        aria-pressed={livePlatform === channel}
                        onClick={() => setLivePlatform(channel)}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                  <p className="sns-demo-note">
                    현재 샘플 영상입니다. 실시간 방송 연동은 준비 중입니다.
                  </p>
                </div>
              )}
              <div className="product-grid">
                {products
                  .filter(
                    (p) =>
                      p.platform &&
                      filter(p) &&
                      (active !== "SNS 라이브" ||
                        livePlatform === "전체" ||
                        p.platform === livePlatform),
                  )
                  .map((p) => card(p, true))}
              </div>
              {!products.some(
                (p) =>
                  p.platform &&
                  filter(p) &&
                  (active !== "SNS 라이브" ||
                    livePlatform === "전체" ||
                    p.platform === livePlatform),
              ) && <p className="empty">조건에 맞는 라이브 상품이 없습니다.</p>}
            </section>
            {active !== "SNS 라이브" && (
              <>
                <section id="popular" hidden={settings.showPopular === false}>
                  <div className="section-heading">
                    <h2>지금 인기 상품</h2>
                    <p>지금 가장 사랑받는 상품들을 만나보세요.</p>
                    <button onClick={() => setPanel("all")}>
                      더보기 <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="product-grid">
                    {products
                      .filter(
                        (p) =>
                          !p.platform &&
                          filter(p) &&
                          (active !== "SNS 라이브" ||
                            livePlatform === "전체" ||
                            p.platform === livePlatform),
                      )
                      .map((p) => card(p, false))}
                  </div>
                  {!products.some(
                    (p) =>
                      !p.platform &&
                      filter(p) &&
                      (active !== "SNS 라이브" ||
                        livePlatform === "전체" ||
                        p.platform === livePlatform),
                  ) && (
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
              </>
            )}
          </div>
        </main>
      )}
      <StoreFooter
        brand={<Brand />}
        onOpenLogin={() => setPanel("login")}
        onBrowseProducts={() => setPanel("all")}
      />
      {panel && (
        <div
          className="overlay"
          onClick={() => {
            setPanel(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="오렌지스토어"
          >
            <button
              className="close"
              onClick={() => {
                setPanel(null);
              }}
              aria-label="닫기"
            >
              <X />
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              {panel === "login" ? (
                <>
                  <Orange />
                  <h2>오렌지스토어에 오신 것을 환영해요</h2>
                  <p>좋은 상품과 새로운 일상을 만나보세요.</p>
                  <StoreLogin />
                </>
              ) : panel === "reviews" ? (
                <>
                  <h2>이달의 베스트 리뷰</h2>
                  <p>고객님들의 생생한 상품 이야기</p>
                  <div className="lower-modal-reviews">
                    {(selectedReview ? [selectedReview] : reviews).map(
                      (review) => (
                        <article className="lower-modal-review" key={review.id}>
                          <img src={review.image} alt={review.productName} />
                          <div>
                            <h3>{review.title}</h3>
                            <span
                              className="lower-review-stars"
                              aria-label={review.rating + "점"}
                            >
                              ★★★★★
                            </span>
                            <p>{review.body}</p>
                            <small>
                              {review.author} · {review.productName}
                            </small>
                            <button
                              className="text-action"
                              onClick={() =>
                                setSelected(
                                  inventory.find(
                                    (p) => p.id === review.productId,
                                  ),
                                )
                              }
                            >
                              상품 보러가기 →
                            </button>
                          </div>
                        </article>
                      ),
                    )}
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
                        : panel === "collection"
                          ? collection.title
                          : "전체 상품"}
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
                          <button
                            className="list-product-photo"
                            onClick={() => setSelected(p)}
                            aria-label={p.name + " 상세보기"}
                          >
                            <img src={p.image} alt="" />
                          </button>
                          <div>
                            <button
                              className="list-product-title"
                              onClick={() => setSelected(p)}
                            >
                              {p.name}
                            </button>
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
                          {(panel === "cart" || panel === "favorites") && (
                            <button
                              aria-label="삭제"
                              onClick={() =>
                                panel === "cart"
                                  ? setCart((c) => ({ ...c, [p.id]: 0 }))
                                  : toggle(p.id)
                              }
                            >
                              <X size={17} />
                            </button>
                          )}
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
                      <CheckoutForm
                        cart={cart}
                        onComplete={() => {
                          notify("주문이 접수되었습니다");
                        }}
                      />
                      <span>총 상품금액</span>
                      <strong>
                        {won(
                          inventory.reduce(
                            (sum, p) => sum + p.price * (cart[p.id] || 0),
                            0,
                          ),
                        )}
                      </strong>
                      <p>온라인 결제 없이 주문을 접수할 수 있습니다.</p>
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
createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
