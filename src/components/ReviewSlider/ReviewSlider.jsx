import React, { Children, cloneElement, useEffect, useRef } from "react";
import "./styles.css";

export default function ReviewSlider({ children }) {
  const viewport = useRef(null);
  const count = Children.count(children);

  useEffect(() => {
    const element = viewport.current;
    const measure = () => {
      const width = element.clientWidth;
      const gap = width <= 600 ? 12 : 20;
      const cardWidth = Math.min(320, width * 0.9);
      element.style.setProperty("--review-width", `${cardWidth}px`);
      element.style.setProperty("--review-gap", `${gap}px`);
      element.style.setProperty("--review-duration", `${count * (cardWidth + gap) / 28}s`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [count]);

  return (
    <div className="review-slider" ref={viewport} role="region" aria-label="베스트 리뷰">
      <div className="review-slider-track">
        <div className="review-slider-group">{children}</div>
        <div className="review-slider-group review-slider-copy" aria-hidden="true">
          {Children.map(children, child => cloneElement(child, { tabIndex: -1 }))}
        </div>
      </div>
    </div>
  );
}