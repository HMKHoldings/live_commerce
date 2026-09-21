import React from "react";
import { createRoot } from "react-dom/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { App } from "../main";
import { StoreProvider, useStore } from "../context/StoreContext";
import "./styles.css";

const pageUrl = (notice) => {
  const id = notice.id || notice.date || notice.title;
  return `${import.meta.env.BASE_URL}notices.html?id=${encodeURIComponent(id)}`;
};

function NoticesPage() {
  const { notices = [] } = useStore();
  const selectedId = new URLSearchParams(location.search).get("id");
  const selected = selectedId ? notices.find((notice) => String(notice.id || notice.date || notice.title) === selectedId) : null;
  return <main className="notice-page wrap">
    <nav className="notice-breadcrumb" aria-label="현재 위치"><a href={import.meta.env.BASE_URL}>홈</a><ChevronRight aria-hidden="true" /><a href={`${import.meta.env.BASE_URL}notices.html`}>공지사항</a></nav>
    <header className="notice-page-heading"><p>ORANGE STORE NEWS</p><h1>공지사항</h1><span>오렌지스토어의 새로운 소식과 안내를 확인해 주세요.</span></header>
    {selected ? <article className="notice-detail">
      <header><h2>{selected.title}</h2><time dateTime={selected.date?.replaceAll(".", "-")}>{selected.date}</time></header>
      <div className="notice-detail-body">{selected.body}</div>
      <a className="notice-list-link" href={`${import.meta.env.BASE_URL}notices.html`}><ChevronLeft aria-hidden="true" /> 목록으로</a>
    </article> : <section className="notice-list" aria-label="공지사항 목록">
      <div className="notice-list-head"><span>제목</span><span>등록일</span></div>
      {notices.map((notice) => <a key={notice.id || notice.date || notice.title} href={pageUrl(notice)}><span>{notice.title}</span><time dateTime={notice.date?.replaceAll(".", "-")}>{notice.date}</time><ChevronRight aria-hidden="true" /></a>)}
      {!notices.length && <p className="notice-empty">등록된 공지사항이 없습니다.</p>}
    </section>}
  </main>;
}
createRoot(document.getElementById("root")).render(<StoreProvider><App><NoticesPage /></App></StoreProvider>);
