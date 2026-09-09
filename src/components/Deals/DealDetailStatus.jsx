import React, { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import DealProgress from "./DealProgress";
import "./animation.css";
import "./status.css";

export default function DealDetailStatus({ deal, joined }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const participants = deal.participants + Number(Boolean(joined));
  const percent = Math.min(100, (participants / deal.target) * 100);
  const remaining = Math.max(
    0,
    Math.ceil((Date.parse(deal.endsAt) - now) / 1000),
  );
  const days = Math.floor(remaining / 86400);
  const time = [
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return (
    <section className="pd-deal-status" aria-label="공동구매 참여 현황">
      <div
        className="pd-deal-clock"
        role="timer"
        aria-live="off"
        aria-label="공동구매 남은 시간"
      >
        <Clock3 size={15} aria-hidden="true" />
        <strong>{remaining ? `${days}일 ${time} 남음` : "마감"}</strong>
      </div>
      <DealProgress value={participants} max={deal.target} name={deal.name} />
      <div className="pd-deal-count">
        <strong>
          {participants.toLocaleString("ko-KR")}명 참여중{" "}
          <span>· {Number(percent.toFixed(1))}% 달성</span>
        </strong>
        <span>{deal.target.toLocaleString("ko-KR")}명</span>
      </div>
      {joined && <p className="pd-deal-joined">참여 완료</p>}
    </section>
  );
}
