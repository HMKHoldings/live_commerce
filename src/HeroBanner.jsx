import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    theme: "orange",
    category: "전체",
    label: "SNS 라이브 쇼핑",
    eyebrow: <>SNS에서 만난 그 <em>상품,</em></>,
    title: <><span>좋아하는 <em>SNS 라이브</em>를 보고,</span><br /><span><em>오렌지 마켓</em>에서 바로 쇼핑하세요!</span></>,
    description: "SNS 속 핫한 상품을, 오렌지 마켓에서 더 편하고 안전하게 만나보세요.",
    cta: "지금 쇼핑하기",
  },
  {
    theme: "fresh",
    category: "식품",
    label: "제철 식품",
    eyebrow: "FRESH PICKS · 오늘의 신선함",
    title: <>제철의 맛을 <em>가득 담아,</em><br /><em>신선한 일상</em>을 만나보세요!</>,
    description: "싱싱한 채소부터 달콤한 제철 과일까지, 우리 집 식탁을 더 맛있게.",
    cta: "제철 식품 둘러보기",
    image: "/images/fresh-produce.jpg",
    imageAlt: "싱싱한 제철 채소와 과일",
    inset: "/images/strawberries.jpg",
    insetAlt: "빨갛게 익은 신선한 딸기",
    artEyebrow: "FRESH & DELICIOUS",
    artTitle: "오늘 식탁에 신선함 한 스푼",
  },
  {
    theme: "living",
    category: "생활",
    label: "라이프스타일",
    eyebrow: "LIFE & HOME · 나를 위한 공간",
    title: <>매일 머무는 공간에<br /><em>기분 좋은 변화</em>를 더해요.</>,
    description: "포근한 침구와 감각적인 생활용품으로, 평범한 하루를 특별하게.",
    cta: "라이프스타일 둘러보기",
    image: "/images/lifestyle-tea.jpg",
    imageAlt: "따뜻한 차를 즐기는 감각적인 티웨어",
    inset: "/images/bedding.jpg",
    insetAlt: "아늑한 침실의 포근한 침구",
    artEyebrow: "A LITTLE EVERYDAY JOY",
    artTitle: "우리 집, 가장 편안한 취향",
  },
  {
    theme: "beauty",
    category: "뷰티",
    label: "뷰티 케어",
    eyebrow: "BEAUTY MOMENT · 오늘 더 빛나는 나",
    title: <>나를 아끼는 작은 습관,<br /><em>매일 더 빛나는</em> 뷰티 케어.</>,
    description: "산뜻한 스킨케어부터 촉촉한 세럼까지, 나에게 꼭 맞는 아름다움.",
    cta: "뷰티 상품 둘러보기",
    image: "/images/pink-skincare.png",
    imageAlt: "핑크빛 배경 위의 스킨케어 제품",
    inset: "/images/serum.jpg",
    insetAlt: "매일의 피부 관리를 위한 세럼",
    artEyebrow: "YOUR DAILY GLOW",
    artTitle: "오늘도 나답게, 아름답게",
  },
];

const total = slides.length;
const carouselSlides = [
  { slide: slides[total - 1], index: total - 1, clone: true, key: "before" },
  ...slides.map((slide, index) => ({ slide, index, clone: false, key: slide.theme })),
  { slide: slides[0], index: 0, clone: true, key: "after" },
];

export default function HeroBanner({ Orange, Platform, onShop }) {
  const [position, setPosition] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(reducedMotion);
  const [hovered, setHovered] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [navigation, setNavigation] = useState(0);
  const carouselRef = useRef(null);
  const positionRef = useRef(1);
  const movingRef = useRef(false);
  const transitionTimer = useRef(null);
  const jumpFrames = useRef([]);
  const touchStart = useRef(null);
  const active = (position - 1 + total) % total;
  const playing = !paused && !hovered && !focusPaused && !hidden;

  const finishTransition = useCallback(() => {
    if (!movingRef.current) return;
    window.clearTimeout(transitionTimer.current);
    const current = positionRef.current;
    if (current === 0 || current === total + 1) {
      // The identical end slide lets the track jump back without a visible rewind.
      const next = current === 0 ? total : 1;
      setAnimate(false);
      positionRef.current = next;
      setPosition(next);
      jumpFrames.current = [requestAnimationFrame(() => {
        jumpFrames.current.push(requestAnimationFrame(() => {
          setAnimate(true);
          movingRef.current = false;
          jumpFrames.current = [];
        }));
      })];
    } else {
      movingRef.current = false;
    }
  }, []);

  const goTo = useCallback((next, manual = true) => {
    if (manual) setNavigation((value) => value + 1);
    if (movingRef.current || next === positionRef.current) return;

    if (reducedMotion) {
      const normalized = ((next - 1 + total) % total) + 1;
      positionRef.current = normalized;
      setPosition(normalized);
      return;
    }

    movingRef.current = true;
    positionRef.current = next;
    setPosition(next);
    // Also recover if a browser cancels transitionend after switching tabs.
    window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(finishTransition, 1100);
  }, [finishTransition, reducedMotion]);

  const step = useCallback((direction, manual = true) => {
    goTo(positionRef.current + direction, manual);
  }, [goTo]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = (event) => {
      setReducedMotion(event.matches);
      if (event.matches) setPaused(true);
    };
    const updateVisibility = () => setHidden(document.hidden);
    const pauseOnPointerEnter = (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") setHovered(true);
    };
    const resumeOnPointerLeave = () => setHovered(false);
    // Listen on the region itself: replacing a hovered Play/Pause SVG can
    // detach the target React uses to synthesize its pointer-leave event.
    carousel.addEventListener("pointerenter", pauseOnPointerEnter);
    carousel.addEventListener("pointerleave", resumeOnPointerLeave);
    carousel.addEventListener("pointercancel", resumeOnPointerLeave);
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      carousel.removeEventListener("pointerenter", pauseOnPointerEnter);
      carousel.removeEventListener("pointerleave", resumeOnPointerLeave);
      carousel.removeEventListener("pointercancel", resumeOnPointerLeave);
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      window.clearTimeout(transitionTimer.current);
      jumpFrames.current.forEach(cancelAnimationFrame);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => step(1, false), 5000);
    return () => window.clearTimeout(timer);
  }, [playing, position, navigation, step]);

  const handleKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (event.target.closest(".banner-slide")) {
      event.currentTarget.focus({ preventScroll: true });
    }
    step(event.key === "ArrowLeft" ? -1 : 1);
  };

  const togglePlayback = () => {
    if (paused) {
      setPaused(false);
      // A keyboard user can press Play without first moving focus out of it.
      setFocusPaused(false);
      setNavigation((value) => value + 1);
    } else {
      setPaused(true);
    }
  };

  return (
    <section
      className="banner-carousel"
      ref={carouselRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="오렌지 마켓 추천 배너"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches.length === 1
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : null;
      }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        if (!touchStart.current || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          event.preventDefault();
          step(dx < 0 ? 1 : -1);
        }
      }}
    >
      <div
        className="banner-track"
        style={{
          transform: `translate3d(-${position * 100}%, 0, 0)`,
          ...(!animate || reducedMotion ? { transition: "none" } : {}),
        }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === "transform") finishTransition();
        }}
      >
        {carouselSlides.map(({ slide, index, clone, key }, trackIndex) => {
          const visible = !clone && trackIndex === position;
          const Heading = index === 0 && !clone ? "h1" : "h2";
          return (
            <article
              className={`banner-slide banner-${slide.theme}`}
              key={key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${total}: ${slide.label}`}
              aria-hidden={!visible}
              inert={!visible}
            >
              <div className="banner-slide-inner wrap">
                <div className="banner-copy">
                  <p className="banner-eyebrow">{slide.eyebrow}</p>
                  <Heading className="banner-title">{slide.title}</Heading>
                  {slide.theme === "orange" && (
                    <div className="banner-platforms">
                      {["TikTok", "YouTube", "네이버 쇼핑라이브", "Instagram"].map((name) => (
                        <Platform key={name} name={name} />
                      ))}
                    </div>
                  )}
                  <p className="banner-description">{slide.description}</p>
                  <button className="banner-cta" type="button" onClick={() => onShop(slide.category)}>
                    {slide.cta}<ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
                <div className="banner-art">
                  {slide.theme === "orange" ? (
                    <>
                      <img className="banner-photo" src="/images/oranges.jpg" alt="싱싱한 오렌지" draggable="false" />
                      <div className="banner-bag" aria-hidden="true">
                        <span className="banner-bag-handle" />
                        <Orange small />
                        <b>오렌지 마켓</b>
                      </div>
                      <div className="banner-phone">
                        <span className="banner-phone-notch" />
                        <div className="banner-phone-screen">
                          <span lang="en">Good<br />Products<br />Better<br />Life</span>
                          <button type="button" onClick={() => onShop("전체")}>
                            지금 쇼핑하기<ChevronRight size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <p className="banner-art-note">좋은 상품은<br />언제나 여기,<br />오렌지 마켓!</p>
                    </>
                  ) : (
                    <>
                      <img className="banner-feature-image" src={slide.image} alt={slide.imageAlt} draggable="false" />
                      <img className="banner-inset-image" src={slide.inset} alt={slide.insetAlt} draggable="false" />
                      <div className="banner-art-label">
                        <small>{slide.artEyebrow}</small>
                        <strong>{slide.artTitle}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <button className="banner-arrow prev" type="button" onClick={() => step(-1)} aria-label="이전 배너">
        <ChevronLeft aria-hidden="true" />
      </button>
      <button className="banner-arrow next" type="button" onClick={() => step(1)} aria-label="다음 배너">
        <ChevronRight aria-hidden="true" />
      </button>
      <div className="banner-controls">
        <div className="banner-dots" role="group" aria-label="배너 선택">
          {slides.map((slide, index) => (
            <button
              key={slide.theme}
              className={active === index ? "current" : ""}
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label={`${index + 1}번째 배너: ${slide.label}`}
              aria-current={active === index ? "true" : undefined}
            />
          ))}
        </div>
        <span className="banner-count" aria-live={playing ? "off" : "polite"} aria-atomic="true">
          <strong>{String(active + 1).padStart(2, "0")}</strong> / {String(total).padStart(2, "0")}
        </span>
        <button
          className="banner-playback"
          type="button"
          onClick={togglePlayback}
          aria-label={paused ? "배너 자동 재생" : "배너 자동 재생 일시 정지"}
        >
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
