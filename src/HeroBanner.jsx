import { assetPath } from "./assetPath";
import { useStore } from "./StoreContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export default function HeroBanner(props) {
  const { banners } = useStore();
  return banners.length ? <HeroCarousel key={banners.map(b => b.id).join(',')} {...props} slides={banners} /> : null;
}
function HeroCarousel({ Orange, Platform, onShop, slides }) {
const total = slides.length;
const carouselSlides = [
  { slide: slides[total - 1], index: total - 1, clone: true, key: "before" },
  ...slides.map((slide, index) => ({ slide, index, clone: false, key: slide.id || slide.theme })),
  { slide: slides[0], index: 0, clone: true, key: "after" },
];


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
      aria-label="오렌지스토어 추천 배너"
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
                      <img className="banner-photo" src={assetPath("/images/oranges.jpg")} alt="싱싱한 오렌지" draggable="false" />
                      <div className="banner-bag" aria-hidden="true">
                        <span className="banner-bag-handle" />
                        <Orange small />
                        <b>오렌지스토어</b>
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
                      <p className="banner-art-note">좋은 상품은<br />언제나 여기,<br />오렌지스토어!</p>
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
