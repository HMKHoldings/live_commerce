import React, { Children, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import "./promo-carousel.css";

export default function PromoCarousel({ children }) {
  const slides = Children.toArray(children);
  const [motion, setMotion] = useState({
    position: slides.length,
    moving: false,
    animate: true,
  });
  const index = motion.position % slides.length;
  const [columns, setColumns] = useState(() =>
    window.innerWidth > 1100 ? 3 : window.innerWidth > 640 ? 2 : 1,
  );
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const root = useRef(null);
  const touch = useRef(null);
  const suppressClick = useRef(false);
  const move = (direction) =>
    setMotion((current) =>
      current.moving
        ? current
        : {
            position: current.position + direction,
            moving: true,
            animate: true,
          },
    );

  useEffect(() => {
    const resize = () =>
      setColumns(
        window.innerWidth > 1100 ? 3 : window.innerWidth > 640 ? 2 : 1,
      );
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!motion.moving) return;
    const timer = setTimeout(
      () =>
        setMotion((current) => ({
          position:
            (((current.position % slides.length) + slides.length) %
              slides.length) +
            slides.length,
          moving: false,
          animate: false,
        })),
      480,
    );
    return () => clearTimeout(timer);
  }, [motion.moving, slides.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(root.current);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || !visible || hidden) return;
    const timer = window.setInterval(
      () =>
        setMotion((current) =>
          current.moving
            ? current
            : { position: current.position + 1, moving: true, animate: true },
        ),
      4000,
    );
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, visible, hidden, slides.length]);

  return (
    <section
      ref={root}
      className="promo-carousel"
      aria-label="오렌지스토어 혜택"
      aria-roledescription="캐러셀"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div
        className="promo-carousel-stage"
        onTouchStart={(event) => {
          touch.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
          suppressClick.current = false;
        }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
            suppressClick.current = true;
            move(dx < 0 ? 1 : -1);
          }
          touch.current = null;
        }}
        onTouchCancel={() => {
          touch.current = null;
        }}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div
          className="promo-carousel-track"
          style={{
            "--columns": columns,
            transform: `translateX(calc(${-motion.position} * ((100% + 12px) / ${columns})))`,
            transition: motion.animate ? undefined : "none",
          }}
        >
          {[0, 1, 2, 3].flatMap((copy) =>
            slides.map((slide, offset) => {
              const position = copy * slides.length + offset;
              const shown =
                position >= motion.position &&
                position < motion.position + columns;
              return (
                <div
                  key={`${copy}-${slide.key}`}
                  className={`promo-carousel-slide${shown ? " is-active" : ""}`}
                  role="group"
                  aria-roledescription="슬라이드"
                  aria-label={`${offset + 1} / ${slides.length}`}
                  aria-hidden={!shown}
                  inert={!shown}
                >
                  {slide}
                </div>
              );
            }),
          )}
        </div>
      </div>
      <div className="promo-carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="이전 혜택">
          <ChevronLeft size={17} />
        </button>
        <div className="promo-carousel-dots">
          {slides.map((slide, position) => (
            <button
              type="button"
              key={slide.key}
              aria-label={`혜택 ${position + 1} 보기`}
              aria-current={position === index ? "true" : undefined}
              onClick={() => {
                if (position !== index)
                  move((position - index + slides.length) % slides.length);
              }}
            />
          ))}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="다음 혜택">
          <ChevronRight size={17} />
        </button>
        <span className="promo-carousel-count">
          {index + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "혜택 자동 재생" : "혜택 자동 재생 정지"}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </section>
  );
}
