import React, { useEffect, useRef, useState } from "react";

export default function DealProgress({ value, max, name }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="deal-progress"
      role="progressbar"
      aria-label={`${name} 공동구매 참여 현황`}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <span style={{ width: visible ? `${percent}%` : "0%" }} />
    </div>
  );
}
