import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, setCsrf } from "../api/storeApi";
import {
  Home,
  Radio,
  ClipboardList,
  Coins,
  Package,
  MessageSquare,
  UserRound,
  HelpCircle,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  CalendarDays,
  Users,
  TrendingUp,
  Plus,
  X,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Send,
  Monitor,
  Car,
  FileText,
  Zap,
  Camera,
} from "lucide-react";
import "./styles.css";
import PerformanceTrend from "./PerformanceTrend";
import { getUpcomingLives } from "./upcomingLives.mjs";
const base = import.meta.env.BASE_URL,
  img = (n) => base + "images/" + n;
const nav = [
  [Home, "대시보드"],
  [Radio, "라이브 신청"],
  [ClipboardList, "신청 내역"],
  [Coins, "정산 내역"],
  [Package, "내 상품"],
  [MessageSquare, "메시지"],
  [UserRound, "내 정보"],
  [HelpCircle, "가이드"],
];
const seed = [
  ["오렌지 골드앰플 세럼", "serum.jpg", "뷰티", 32000, 320],
  ["오렌지 수분 크림", "collagen.jpg", "뷰티", 28000, 154],
  ["오렌지 톤업 선크림", "pink-skincare.png", "뷰티", 22000, 87],
  ["프리미엄 디퓨저", "lifestyle-tea.jpg", "리빙", 34000, 0],
  ["하루견과 프리미엄 믹스", "nuts.jpg", "식품", 15000, 450],
  ["프리미엄 프라이팬", "pans.webp", "리빙", 49000, 67],
].map(([name, image, category, price, stock], i) => ({
  id: "ORG00" + (i + 1),
  name,
  image,
  category,
  price,
  stock,
}));
const initialLives = [
  "가을 스킨케어 특집 라이브",
  "오렌지 수분 크림 브랜드데이",
  "오렌지 홈케어 세트 라이브",
].map((title, i) => ({
  id: "LC-202610-" + (i + 1),
  title,
  date: ["2026-10-22", "2026-10-25", "2026-10-28"][i],
  time: ["20:00", "19:00", "21:00"][i],
  studio: i === 1 ? "A" : "B",
  channels: [["YouTube", "Instagram", "TikTok"][i]],
  products: [seed[i].id],
  status: i === 0 ? "승인 완료" : "승인 대기",
  image: seed[i].image,
  notes: "",
}));
const money = (n) => Number(n).toLocaleString("ko-KR"),
  toggle = (a, v) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);
function useSaved(key, initial) {
  const [v, set] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);
  return [v, set];
}
function download(name, text) {
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function SocialIcon({ name }) {
  const platform = name.split(" ")[0].toLowerCase();
  return (
    <img
      className="social-logo"
      src={`${base}png/${platform}.png`}
      alt={`${name} logo`}
      width={28}
      height={28}
    />
  );
}
function Badge({ children }) {
  return (
    <span
      className={
        "badge " +
        (/완료|판매/.test(children)
          ? "green"
          : /품절|반려/.test(children)
            ? "red"
            : "orange")
      }
    >
      {children}
    </span>
  );
}
function Panel({ title, children, action }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Stats({ items }) {
  return (
    <div className="stats">
      {items.map(([I, t, v, n]) => (
        <article key={t}>
          <div>
            <span>{t}</span>
            <strong>{v}</strong>
            <small>{n}</small>
          </div>
          <i>
            <I size={26} />
          </i>
        </article>
      ))}
    </div>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let stop = false;
    api("/customer/session")
      .then((s) => {
        if (stop) return;
        if (!s.authenticated || s.user?.accountType !== "creator") {
          location.replace(base + "creator-login.html");
          return;
        }
        setCsrf(s.csrf);
        setUser(s.user);
      })
      .catch(
        () =>
          !stop &&
          setError(
            "로그인 상태를 확인할 수 없습니다. 서버 연결을 확인해주세요.",
          ),
      );
    return () => {
      stop = true;
    };
  }, []);
  return user ? (
    <Dashboard user={user} />
  ) : (
    <div className="loading">
      <Radio size={36} />
      <h2>{error || "로그인 확인 중…"}</h2>
      {error && <button onClick={() => location.reload()}>다시 시도</button>}
    </div>
  );
}
function Dashboard({ user }) {
  const [scheduleNow, setScheduleNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setScheduleNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const key = "orange-creator-" + user.id + "-";
  const [products, setProducts] = useSaved(key + "products", seed),
    [lives, setLives] = useSaved(key + "lives", initialLives),
    [messages, setMessages] = useSaved(key + "messages", []),
    [profile, setProfile] = useSaved(key + "profile", {
      name: user.name,
      nickname: user.name,
      email: "",
      phone: "",
      intro:
        "예쁜 일상이 더 특별해지는 순간, 뷰티와 라이프스타일을 소개합니다.",
      bank: "국민은행",
      account: "",
      holder: user.name,
      categories: ["뷰티/화장품"],
      days: ["화", "목", "금"],
      start: "20:00",
      end: "22:00",
      notifications: [true, true, true, false],
    }),
    [draft, setDraft] = useSaved(key + "draft", {
      studio: "B",
      date: "2026-10-22",
      time: "20:00",
      products: seed.slice(0, 3).map((p) => p.id),
      channels: ["YouTube", "TikTok", "Naver 쇼핑라이브"],
      account: "official",
      notes: "",
      title: "",
    });
  const [active, setActive] = useState("대시보드"),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState(null),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("전체"),
    [status, setStatus] = useState("전체"),
    [page, setPage] = useState(1),
    [conversation, setConversation] = useState("김민지 매니저"),
    [text, setText] = useState(""),
    [faq, setFaq] = useState(0),
    [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  const chatScroll = useRef(null);
  useEffect(() => {
    const box = chatScroll.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, conversation, active]);
  const go = (t) => {
      setActive(t);
      setMenu(false);
      setQuery("");
      setCategory("전체");
      setStatus("전체");
      setPage(1);
    },
    change = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const selected = products.filter((p) => draft.products.includes(p.id)),
    filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) &&
        (category === "전체" || category === p.category) &&
        (status === "전체" ||
          (status === "품절" ? p.stock === 0 : p.stock > 0)),
    ),
    filteredLives = lives.filter(
      (l) =>
        l.title.toLowerCase().includes(query.toLowerCase()) &&
        (status === "전체" || l.status === status),
    );
  const upcomingLives = getUpcomingLives(lives, scheduleNow);
  async function logout() {
    setLoggingOut(true);
    try {
      await api("/customer/logout", { method: "POST" });
      setCsrf("");
      location.replace(base + "creator-login.html");
    } catch {
      setToast("로그아웃에 실패했습니다. 다시 시도해주세요.");
      setLoggingOut(false);
    }
  }
  function submit(e) {
    e.preventDefault();
    if (!selected.length || !draft.channels.length) {
      setToast("상품과 SNS 채널을 한 개 이상 선택해주세요.");
      return;
    }
    const now = new Date(),
      today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");
    if (draft.date < today) {
      setToast("오늘 이후의 방송 일정을 선택해주세요.");
      return;
    }
    setLives((v) => [
      {
        ...draft,
        id: "LC-" + Date.now(),
        title: draft.title || selected[0].name + " 라이브",
        status: "승인 대기",
        image: selected[0].image,
      },
      ...v,
    ]);
    setToast("신청이 이 브라우저에 저장되었습니다.");
    go("신청 내역");
  }
  const stats = (
    <Stats
      items={[
        [
          CalendarDays,
          "이번 달 라이브",
          lives.length + "건",
          "전월 대비 ▲ 50.0%",
        ],
        [Users, "누적 시청자", "128,450명", "전월 대비 ▲ 12.5%"],
        [Coins, "누적 매출", "₩ 45,680,000", "전월 대비 ▲ 18.3%"],
        [TrendingUp, "평균 시청 유지율", "63.2%", "전월 대비 ▲ 5.4%"],
      ]}
    />
  );
  const detail = (l) => setModal({ type: "live", live: l });
  const promo = (
    <div className="promo">
      <div>
        <h2>
          <em>오렌지 라이브커머스와</em>
          <br />
          함께 성장하세요!
        </h2>
        <p>
          특별한 라이브 콘텐츠로
          <br />더 많은 팬들과 만날 수 있습니다.
        </p>
        <button className="primary" onClick={() => go("라이브 신청")}>
          라이브 신청하기 <ChevronRight size={16} />
        </button>
      </div>
      <img src={img("creator-login-hero.png")} alt="크리에이터 일러스트" />
    </div>
  );
  return (
    <div className="shell">
      <header className="topbar">
        <button
          className="mobile-menu icon-button"
          aria-label="메뉴"
          onClick={() => setMenu(!menu)}
        >
          <Menu />
        </button>
        <a className="brand" href={base + "creator-dashboard.html"}>
          <img src={img("orange-mascot.png")} alt="" />
          오렌지 라이브커머스
        </a>
        <div className="top-account">
          <button
            className="icon-button bell"
            aria-label="알림"
            onClick={() => go("메시지")}
          >
            <Bell size={21} />
            <b>3</b>
          </button>
          <span className="avatar">{profile.name.slice(0, 1)}</span>
          <button className="account-button" onClick={() => go("내 정보")}>
            {profile.nickname}
            <ChevronDown size={16} />
          </button>
        </div>
      </header>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="메뉴 닫기"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "open" : "")}>
        {nav.map(([I, t]) => (
          <button
            className={"nav-item " + (active === t ? "active" : "")}
            key={t}
            onClick={() => go(t)}
          >
            <I size={20} />
            {t}
          </button>
        ))}
        <button
          className="nav-item logout"
          onClick={logout}
          disabled={loggingOut}
        >
          <LogOut size={20} />
          {loggingOut ? "로그아웃 중…" : "로그아웃"}
        </button>
      </aside>
      <main className={`main ${active === "메시지" ? "main-messages" : active === "대시보드" ? "main-dashboard" : ""}`}>
        <div className="page-heading">
          <h1>
            호스트 / 인플루언서 관리 <span>{active}</span>
          </h1>
          <p>
            라이브 방송을 신청하고 오렌지 스튜디오와 함께 특별한 콘텐츠를
            만들어보세요.
          </p>
        </div>
        <div className="demo-note">
          미리보기 데이터 · 변경 사항은 이 브라우저에 저장됩니다.
        </div>
        {active === "대시보드" && (
          <>
            {stats}
            <div className="dashboard-grid">
              <Panel
                title={
                  <>
                    <CalendarDays />
                    다가오는 라이브 일정
                  </>
                }
                action={
                  <button
                    className="text-button"
                    onClick={() => go("신청 내역")}
                  >
                    전체보기 ›
                  </button>
                }
              >
                {upcomingLives.slice(0, 3).map((l) => (
                  <div className="schedule" key={l.id}>
                    <div className="schedule-date">
                      <b>{l.date.slice(5).replace("-", ".")}</b>
                      <small>{l.time}</small>
                    </div>
                    <img src={img(l.image)} alt="" />
                    <div className="schedule-info">
                      <strong>{l.title}</strong>
                      <p>특별한 라이브 혜택을 만나보세요!</p>
                      <small>
                        ▣ Studio {l.studio}　◷ 1시간　▣ 상품 {l.products.length}
                        개
                      </small>
                    </div>
                    <div className="schedule-action">
                      <Badge>{l.status}</Badge>
                      <button onClick={() => detail(l)}>상세보기</button>
                    </div>
                  </div>
                ))}
                {!upcomingLives.length && (
                  <p className="empty">예정된 라이브가 없습니다.</p>
                )}
                {upcomingLives.length > 3 && (
                  <button className="text-button" onClick={() => go("신청 내역")}>
                    예정된 라이브 {upcomingLives.length - 3}건 더 보기 ›
                  </button>
                )}
              </Panel>
              <Panel
                title={
                  <>
                    <FileText />
                    최근 신청 내역
                  </>
                }
                action={
                  <button
                    className="text-button"
                    onClick={() => go("신청 내역")}
                  >
                    전체보기 ›
                  </button>
                }
              >
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>방송명</th>
                        <th>방송일</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lives.slice(0, 5).map((l) => (
                        <tr key={l.id}>
                          <td>
                            <button className="plain" onClick={() => detail(l)}>
                              <ProductCell p={{ ...l, name: l.title }} />
                            </button>
                          </td>
                          <td>
                            {l.date.slice(5)}
                            <small>{l.time}</small>
                          </td>
                          <td>
                            <Badge>{l.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel
                title={
                  <>
                    <TrendingUp />
                    최근 30일 성과 추이
                  </>
                }
              >
                <PerformanceTrend />
              </Panel>
              <Panel
                title={
                  <>
                    <MessageSquare />
                    최근 메시지 / 알림
                  </>
                }
              >
                {["운영팀 공지", "담당 매니저", "정산 알림", "시청자 문의"].map(
                  (t, i) => (
                    <button
                      className="notice-row"
                      key={t}
                      onClick={() => go("메시지")}
                    >
                      <i>
                        <MessageSquare size={19} />
                      </i>
                      <strong>{t}</strong>
                      <span>
                        {
                          [
                            "프로모션이 시작됩니다.",
                            "라이브 내용을 확인해주세요.",
                            "정산 안내가 업데이트되었습니다.",
                            "재입고 일정이 궁금합니다.",
                          ][i]
                        }
                      </span>
                      <small>{i + 1}시간 전</small>
                    </button>
                  ),
                )}
              </Panel>
              <Panel
                title={
                  <>
                    <Zap />
                    빠른 작업 메뉴
                  </>
                }
              >
                <div className="quick-grid">
                  {[
                    [Radio, "라이브 신청"],
                    [FileText, "신청 내역"],
                    [Package, "내 상품"],
                    [UserRound, "내 정보"],
                  ].map(([I, t]) => (
                    <button key={t} onClick={() => go(t)}>
                      <I />
                      <b>{t}</b>
                      <small>정보를 확인하고 관리하세요.</small>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </Panel>
              {promo}
            </div>
          </>
        )}
        {active === "라이브 신청" && (
          <>
            {stats}
            <Panel title="라이브 신청서">
              <form onSubmit={submit}>
                <div className="success">
                  <CheckCircle2 size={18} />
                  원하는 스튜디오와 일정을 선택하여 라이브를 신청해주세요.
                </div>
                <div className="application-first">
                  <fieldset>
                    <legend>1. 스튜디오 선택</legend>
                    <div className="studios">
                      {["A", "B"].map((s) => (
                        <button
                          type="button"
                          className={
                            "studio " + (draft.studio === s ? "selected" : "")
                          }
                          key={s}
                          onClick={() => change("studio", s)}
                        >
                          <div>
                            <span className="radio-dot" />
                            <div>
                              <b>Studio {s}</b>
                              <small>오렌지 스튜디오</small>
                            </div>
                          </div>
                          <img
                            src={img("creator-studio.png")}
                            alt={"Studio " + s}
                          />
                          <footer>
                            <span>
                              <UserRound size={14} />
                              최대 4인
                            </span>
                            <span>
                              <Monitor size={14} />
                              다양한 세트
                            </span>
                            <span>
                              <Car size={14} />
                              주차 가능
                            </span>
                          </footer>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>2. 방송 일시 선택</legend>
                    <input
                      aria-label="방송 날짜"
                      type="date"
                      required
                      value={draft.date}
                      onChange={(e) => change("date", e.target.value)}
                    />
                    <div className="time-row">
                      <select
                        aria-label="시작 시간"
                        value={draft.time}
                        onChange={(e) => change("time", e.target.value)}
                      >
                        {Array.from(
                          { length: 14 },
                          (_, i) => String(i + 9).padStart(2, "0") + ":00",
                        ).map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <span>~</span>
                      <input
                        aria-label="종료 시간"
                        readOnly
                        value={
                          String(Number(draft.time.slice(0, 2)) + 1).padStart(
                            2,
                            "0",
                          ) + ":00"
                        }
                      />
                    </div>
                    <div className="info">
                      <Clock size={18} />
                      선택한 시간은 1시간 방송으로 예약됩니다.
                      <br />더 긴 방송은 담당자에게 문의해주세요.
                    </div>
                  </fieldset>
                </div>
                <fieldset>
                  <legend>3. 상품 선택</legend>
                  <div className="selected-products">
                    {selected.map((p) => (
                      <div key={p.id}>
                        <img src={img(p.image)} alt="" />
                        <span>
                          <b>{p.name}</b>
                          <small>{money(p.price)}원</small>
                        </span>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={p.name + " 제거"}
                          onClick={() =>
                            change(
                              "products",
                              draft.products.filter((id) => id !== p.id),
                            )
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="dashed"
                      onClick={() => setModal({ type: "picker" })}
                    >
                      <Plus size={20} />
                      상품 추가하기
                    </button>
                  </div>
                </fieldset>
                <div className="two-columns">
                  <fieldset>
                    <legend>4. SNS 채널 선택</legend>
                    <div className="channel-choices">
                      {[
                        "YouTube",
                        "TikTok",
                        "Naver 쇼핑라이브",
                        "Instagram",
                      ].map((c) => (
                        <label key={c}>
                          <input
                            type="checkbox"
                            checked={draft.channels.includes(c)}
                            onChange={() =>
                              change("channels", toggle(draft.channels, c))
                            }
                          />
                          <SocialIcon name={c} />
                          {c}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>5. 계정 선택</legend>
                    <div className="channel-choices">
                      {[
                        ["official", "오렌지 공식 계정으로 진행"],
                        ["personal", "인플루언서 개인 계정으로 진행"],
                      ].map(([v, t]) => (
                        <label key={v}>
                          <input
                            type="radio"
                            name="account"
                            checked={draft.account === v}
                            onChange={() => change("account", v)}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <fieldset>
                  <legend>6. 방송 제목 및 요청 사항</legend>
                  <input
                    placeholder="방송 제목을 입력해주세요"
                    maxLength={100}
                    value={draft.title}
                    onChange={(e) => change("title", e.target.value)}
                  />
                  <textarea
                    placeholder="요청사항을 입력해주세요. (제품 소개 포인트, 특이사항 등)"
                    maxLength={500}
                    value={draft.notes}
                    onChange={(e) => change("notes", e.target.value)}
                  />
                  <small className="counter">{draft.notes.length} / 500</small>
                </fieldset>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setToast("임시 저장되었습니다.")}
                  >
                    임시 저장
                  </button>
                  <button className="primary" type="submit">
                    신청하기
                  </button>
                </div>
              </form>
            </Panel>
          </>
        )}
        {active === "신청 내역" && (
          <>
            <Stats
              items={[
                [
                  FileText,
                  "전체 신청",
                  lives.length + "건",
                  "누적 라이브 방송 수",
                ],
                [
                  Clock,
                  "승인 대기",
                  lives.filter((l) => l.status === "승인 대기").length + "건",
                  "검토 중인 신청 내역",
                ],
                [
                  CheckCircle2,
                  "승인 완료",
                  lives.filter((l) => l.status === "승인 완료").length + "건",
                  "승인된 방송",
                ],
                [X, "반려 / 수정요청", "0건", "수정이 필요한 신청"],
              ]}
            />
            <Panel title="검색 조건">
              <div className="filters">
                <SearchBox
                  query={query}
                  setQuery={(v) => {
                    setQuery(v);
                    setPage(1);
                  }}
                />
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  {["전체", "승인 대기", "승인 완료", "반려", "수정 요청"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
                <button
                  onClick={() => {
                    setQuery("");
                    setStatus("전체");
                    setPage(1);
                  }}
                >
                  검색 초기화
                </button>
              </div>
            </Panel>
            <Panel
              title={
                <>
                  신청 내역 <em>총 {filteredLives.length}건</em>
                </>
              }
            >
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "신청번호",
                        "방송명",
                        "방송일시",
                        "채널",
                        "상품 수",
                        "상태",
                        "작업",
                      ].map((t) => (
                        <th key={t}>{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLives.slice((page - 1) * 8, page * 8).map((l) => (
                      <tr key={l.id}>
                        <td>{l.id}</td>
                        <td>
                          <ProductCell p={{ ...l, name: l.title }} />
                        </td>
                        <td>
                          {l.date}
                          <small>{l.time} · 1시간</small>
                        </td>
                        <td>{l.channels.join(", ")}</td>
                        <td>{l.products.length}개</td>
                        <td>
                          <Badge>{l.status}</Badge>
                        </td>
                        <td>
                          <button onClick={() => detail(l)}>상세보기</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredLives.length && (
                  <p className="empty">조건에 맞는 신청이 없습니다.</p>
                )}
              </div>
              <Pagination
                count={filteredLives.length}
                page={page}
                setPage={setPage}
              />
            </Panel>
          </>
        )}
        {active === "내 상품" && (
          <>
            <Stats
              items={[
                [
                  Package,
                  "전체 등록 상품",
                  products.length + "개",
                  "등록한 상품을 관리하세요",
                ],
                [
                  Radio,
                  "판매 중인 상품",
                  products.filter((p) => p.stock > 0).length + "개",
                  "라이브에 사용할 수 있습니다",
                ],
                [
                  HelpCircle,
                  "품절 상품",
                  products.filter((p) => !p.stock).length + "개",
                  "재고를 확인해주세요",
                ],
                [
                  FileText,
                  "선택한 상품",
                  selected.length + "개",
                  "라이브 신청 상품",
                ],
              ]}
            />
            <div className="filters product-filters">
              <SearchBox
                query={query}
                setQuery={(v) => {
                  setQuery(v);
                  setPage(1);
                }}
              />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                {["전체", "뷰티", "패션", "리빙", "식품"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                {["전체", "판매 중", "품절"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <button
                className="primary"
                onClick={() =>
                  setModal({
                    type: "product",
                    product: {
                      name: "",
                      price: 0,
                      stock: 0,
                      category: "뷰티",
                      image: "pink-skincare.png",
                    },
                  })
                }
              >
                <Plus size={18} />
                상품 등록
              </button>
            </div>
            <div className="tabs">
              {["전체", "뷰티", "패션", "리빙", "식품"].map((c) => (
                <button
                  key={c}
                  className={category === c ? "selected" : ""}
                  onClick={() => {
                    setCategory(c);
                    setPage(1);
                  }}
                >
                  {c} (
                  {
                    products.filter((p) => c === "전체" || p.category === c)
                      .length
                  }
                  )
                </button>
              ))}
            </div>
            <Panel title="상품 목록">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "상품 정보",
                        "카테고리",
                        "브랜드",
                        "판매가",
                        "재고 수량",
                        "노출 상태",
                        "관리",
                      ].map((t) => (
                        <th key={t}>{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice((page - 1) * 8, page * 8).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <ProductCell p={p} />
                        </td>
                        <td>
                          <span className="category-badge">{p.category}</span>
                        </td>
                        <td>오렌지뷰티</td>
                        <td>
                          <b>{money(p.price)}원</b>
                        </td>
                        <td>{p.stock}</td>
                        <td>
                          <Badge>{p.stock ? "판매 중" : "품절"}</Badge>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              onClick={() =>
                                setModal({ type: "product", product: p })
                              }
                            >
                              수정
                            </button>
                            <button
                              onClick={() => {
                                setProducts((v) => [
                                  ...v,
                                  {
                                    ...p,
                                    id: "ORG-" + Date.now(),
                                    name: p.name + " (복사)",
                                  },
                                ]);
                                setToast("상품이 복사되었습니다.");
                              }}
                            >
                              복사
                            </button>
                            <button
                              className="danger"
                              onClick={() =>
                                setModal({ type: "delete", product: p })
                              }
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && <p className="empty">상품이 없습니다.</p>}
              </div>
              <Pagination
                count={filtered.length}
                page={page}
                setPage={setPage}
              />
            </Panel>
          </>
        )}
        {active === "정산 내역" && (
          <>
            <Stats
              items={[
                [
                  Coins,
                  "이번 달 정산 예정",
                  "₩ 8,320,000",
                  "전월 대비 ▲ 12.5%",
                ],
                [Coins, "정산 완료 금액", "₩ 24,560,000", "전월 대비 ▲ 18.3%"],
                [Clock, "정산 대기 금액", "₩ 8,320,000", "전월 대비 ▼ 6.1%"],
                [
                  CalendarDays,
                  "다음 지급 예정일",
                  "2026. 11. 05",
                  "확정된 금액이 지급됩니다.",
                ],
              ]}
            />
            <Panel title="정산 내역 조회">
              <div className="filters">
                <input
                  aria-label="정산 월"
                  type="month"
                  value={query || "2026-10"}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {["전체", "지급 완료", "지급 예정"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setQuery("");
                    setStatus("전체");
                  }}
                >
                  초기화
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "방송일시",
                        "방송명",
                        "주문 매출 (A)",
                        "수수료율",
                        "수수료 금액 (B)",
                        "정산 금액 (A-B)",
                        "지급 상태",
                        "상세보기",
                      ].map((t) => (
                        <th key={t}>{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {initialLives
                      .map((l, i) => ({
                        ...l,
                        amount: 12450000 - i * 1500000,
                        payment: i === 1 ? "지급 예정" : "지급 완료",
                      }))
                      .filter(
                        (l) =>
                          (!query || l.date.startsWith(query)) &&
                          (status === "전체" || status === l.payment),
                      )
                      .map((l) => (
                        <tr key={l.id}>
                          <td>
                            {l.date}
                            <small>{l.time}</small>
                          </td>
                          <td>
                            <ProductCell p={{ ...l, name: l.title }} />
                          </td>
                          <td>₩ {money(l.amount)}</td>
                          <td>20%</td>
                          <td>₩ {money(l.amount * 0.2)}</td>
                          <td>
                            <b>₩ {money(l.amount * 0.8)}</b>
                          </td>
                          <td>
                            <Badge>{l.payment}</Badge>
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                setModal({ type: "settlement", live: l })
                              }
                            >
                              보기
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Panel>
            <div className="two-columns">
              <Panel
                title={
                  <>
                    <Coins />
                    지급 계좌 정보
                  </>
                }
              >
                <div className="info peach">
                  <b>
                    {profile.bank} {profile.account || "계좌를 등록해주세요"}
                  </b>
                  <p>예금주 · {profile.holder}</p>
                  <button onClick={() => go("내 정보")}>계좌 정보 변경</button>
                </div>
              </Panel>
              <Panel
                title={
                  <>
                    <FileText />
                    정산 정책 안내
                  </>
                }
              >
                <div className="policy-grid">
                  {[
                    "구매 확정 기간 후 정산이 진행됩니다.",
                    "수수료는 계약 조건에 따라 달라집니다.",
                    "확정된 지급 일정에 따라 지급됩니다.",
                    "정산과 세금계산서는 운영팀에 문의해주세요.",
                  ].map((t, i) => (
                    <p key={t}>
                      <b>{i + 1}</b>
                      {t}
                    </p>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
        {active === "메시지" && (
          <>
            <div className="message-stats">
              {[
                "전체 메시지",
                "운영팀",
                "담당 매니저",
                "고객 문의",
                "시스템 알림",
              ].map((t, i) => (
                <button
                  key={t}
                  onClick={() =>
                    setConversation(
                      [
                        "김민지 매니저",
                        "오렌지 운영팀",
                        "김민지 매니저",
                        "고객 문의",
                        "시스템 알림",
                      ][i],
                    )
                  }
                >
                  <i>
                    <MessageSquare />
                  </i>
                  <div>
                    <b>{t}</b>
                    <small>대화와 알림을 확인하세요</small>
                  </div>
                  <em>{[24, 7, 5, 8, 4][i]}</em>
                </button>
              ))}
            </div>
            <div className="messenger">
              <Panel title="메시지">
                <SearchBox query={query} setQuery={setQuery} />
                {[
                  "김민지 매니저",
                  "오렌지 운영팀",
                  "고객 문의",
                  "시스템 알림",
                  "박지훈 매니저",
                ]
                  .filter((t) => t.includes(query))
                  .map((t) => (
                    <button
                      className={
                        "conversation " + (conversation === t ? "selected" : "")
                      }
                      key={t}
                      onClick={() => setConversation(t)}
                    >
                      <span className="avatar">{t.slice(0, 1)}</span>
                      <div>
                        <b>{t}</b>
                        <small>라이브 관련 내용을 확인해주세요.</small>
                      </div>
                      <small>10:24</small>
                    </button>
                  ))}
              </Panel>
              <section className="chat-panel">
                <div className="chat-header">
                  <span className="avatar">{conversation.slice(0, 1)}</span>
                  <div>
                    <b>{conversation}</b>
                    <small>오렌지 라이브커머스</small>
                  </div>
                  <Badge>온라인</Badge>
                </div>
                <div className="chat-messages" ref={chatScroll}>
                  <div className="date-pill">2026년 10월 10일</div>
                  <div className="bubble">
                    안녕하세요 {profile.name}님! 😊
                    <br />
                    라이브 방송 관련해서 일정 조율이 필요해 연락드렸어요.
                    <br />
                    혹시 가능한 일정이 있으실까요?
                  </div>
                  <div className="bubble outgoing">
                    안녕하세요! 다음 주 방송이 가능합니다.
                  </div>
                  <div className="bubble">
                    원하는 일정을 알려주시면 확인하겠습니다.
                    <br />
                    방송 준비 자료는 가이드에서 확인해주세요. 😊
                  </div>
                  {messages
                    .filter((m) => m.to === conversation)
                    .map((m) => (
                      <div className="bubble outgoing" key={m.id}>
                        {m.text}
                        <small>{m.time}</small>
                      </div>
                    ))}
                </div>
                <div className="suggestions">
                  {[
                    "👍 확인했습니다!",
                    "일정 조율이 필요해요",
                    "추가 자료 요청드립니다",
                  ].map((t) => (
                    <button key={t} onClick={() => setText(t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <form
                  className="compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!text.trim()) return;
                    setMessages((v) => [
                      ...v,
                      {
                        id: Date.now(),
                        to: conversation,
                        text: text.trim(),
                        time: new Date().toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      },
                    ]);
                    setText("");
                    setToast("메시지가 이 브라우저에 저장되었습니다.");
                  }}
                >
                  <input
                    aria-label="메시지"
                    placeholder="메시지를 입력하세요..."
                    maxLength={2000}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button className="primary" aria-label="메시지 저장">
                    <Send size={21} />
                  </button>
                </form>
              </section>
              <div className="chat-details">
                <Panel title="대화 상대 정보">
                  <span className="avatar large">
                    {conversation.slice(0, 1)}
                  </span>
                  <h3>{conversation}</h3>
                  <p>오렌지 라이브커머스 운영팀</p>
                  <span className="online">● 온라인</span>
                  <p>라이브 기획, 일정 조율, 프로모션을 담당하고 있습니다.</p>
                </Panel>
                <Panel title="관련 라이브 일정">
                  {lives.slice(0, 1).map((l) => (
                    <div key={l.id}>
                      <ProductCell p={{ ...l, name: l.title }} />
                      <button
                        className="outline full"
                        onClick={() => detail(l)}
                      >
                        라이브 상세 보기
                      </button>
                    </div>
                  ))}
                </Panel>
                <Panel title="바로가기">
                  {["라이브 신청", "내 상품", "가이드"].map((t) => (
                    <button className="shortcut" key={t} onClick={() => go(t)}>
                      {t}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </Panel>
              </div>
            </div>
          </>
        )}
        {active === "내 정보" && (
          <>
            <section className="profile-banner panel">
              <div className="profile-photo-editor">
                <div className="profile-photo">
                  <img
                    src={profile.photo || img("creator-login-hero.png")}
                    alt={`${profile.nickname} 프로필`}
                  />
                </div>
                <label
                  className="profile-photo-upload"
                  title="프로필 사진 변경"
                >
                  <Camera size={19} />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="프로필 사진 변경"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      if (
                        !["image/png", "image/jpeg", "image/webp"].includes(
                          file.type,
                        ) ||
                        file.size > 1024 * 1024
                      ) {
                        setToast(
                          "JPG, PNG, WebP 사진을 1MB 이하로 선택해주세요.",
                        );
                        return;
                      }
                      const reader = new FileReader();
                      reader.onerror = () =>
                        setToast("사진을 읽을 수 없습니다. 다시 선택해주세요.");
                      reader.onload = () => {
                        const photo = String(reader.result);
                        const check = new Image();
                        check.onerror = () =>
                          setToast("올바른 이미지 파일을 선택해주세요.");
                        check.onload = () => {
                          setProfile((p) => ({ ...p, photo }));
                          setToast("프로필 사진이 변경되었습니다.");
                        };
                        check.src = photo;
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {profile.photo && (
                  <button
                    type="button"
                    className="profile-photo-reset"
                    onClick={() => setProfile((p) => ({ ...p, photo: "" }))}
                  >
                    기본 사진
                  </button>
                )}
              </div>
              <div>
                <h2>
                  {profile.nickname} <CheckCircle2 size={19} />
                </h2>
                <div className="profile-tags">
                  {profile.categories.map((c) => (
                    <Badge key={c}>{c}</Badge>
                  ))}
                </div>
                <p>{profile.intro}</p>
                <button onClick={() => setModal({ type: "preview" })}>
                  프로필 미리보기
                </button>
              </div>
              <div className="profile-social">
                <div className="rating">
                  <div>
                    <b>★ 4.9</b>
                    <small>평균 평점 · 예시</small>
                  </div>
                  <div>
                    <b>♛ 활동중</b>
                    <small>라이브 활동을 응원합니다</small>
                  </div>
                </div>
              </div>
            </section>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setToast("프로필 설정이 이 브라우저에 저장되었습니다.");
              }}
            >
              <div className="profile-grid">
                <Panel
                  title={
                    <>
                      <UserRound />
                      기본 정보
                    </>
                  }
                >
                  <div className="two-columns">
                    {[
                      ["nickname", "활동명 (닉네임)"],
                      ["name", "이름"],
                      ["email", "이메일"],
                      ["phone", "연락처"],
                    ].map(([k, t]) => (
                      <label className="field" key={k}>
                        {t}
                        <input
                          required={k === "name" || k === "nickname"}
                          type={k === "email" ? "email" : "text"}
                          value={profile[k]}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, [k]: e.target.value }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label className="field">
                    한 줄 소개
                    <textarea
                      maxLength={100}
                      value={profile.intro}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, intro: e.target.value }))
                      }
                    />
                  </label>
                </Panel>
                <Panel
                  title={
                    <>
                      <Coins />
                      정산 계좌 정보
                    </>
                  }
                >
                  <label className="field">
                    은행명
                    <select
                      value={profile.bank}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, bank: e.target.value }))
                      }
                    >
                      {[
                        "국민은행",
                        "우리은행",
                        "신한은행",
                        "하나은행",
                        "카카오뱅크",
                      ].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </label>
                  {[
                    ["account", "계좌번호"],
                    ["holder", "예금주명"],
                  ].map(([k, t]) => (
                    <label className="field" key={k}>
                      {t}
                      <input
                        value={profile[k]}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, [k]: e.target.value }))
                        }
                      />
                    </label>
                  ))}
                  <div className="info">
                    본인 명의의 계좌 정보를 입력해주세요.
                  </div>
                </Panel>
                <Panel
                  title={
                    <>
                      <Users />
                      SNS 계정
                    </>
                  }
                >
                  {["YouTube", "TikTok", "Instagram", "Naver 쇼핑라이브"].map(
                    (s) => (
                      <div className="sns-row" key={s}>
                        <SocialIcon name={s} />
                        <b>{s}</b>
                        <input
                          aria-label={s + " 계정"}
                          placeholder="@계정 이름"
                          value={profile[s] || ""}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, [s]: e.target.value }))
                          }
                        />
                      </div>
                    ),
                  )}
                  <small>
                    SNS 계정 정보를 저장할 수 있습니다.
                  </small>
                </Panel>
                <Panel
                  title={
                    <>
                      <Package />
                      콘텐츠 카테고리
                    </>
                  }
                >
                  <p>주로 다루는 카테고리를 선택해주세요. (최대 3개)</p>
                  <div className="categories">
                    {[
                      "뷰티/화장품",
                      "패션/의류",
                      "식품/건강",
                      "생활용품",
                      "가전/디지털",
                      "홈인테리어",
                      "육아/키즈",
                      "스포츠/레저",
                      "기타",
                    ].map((c) => (
                      <label key={c}>
                        <input
                          type="checkbox"
                          checked={profile.categories.includes(c)}
                          onChange={() => {
                            if (
                              !profile.categories.includes(c) &&
                              profile.categories.length >= 3
                            ) {
                              setToast(
                                "카테고리는 최대 3개까지 선택할 수 있습니다.",
                              );
                              return;
                            }
                            setProfile((p) => ({
                              ...p,
                              categories: toggle(p.categories, c),
                            }));
                          }}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </Panel>
                <Panel
                  title={
                    <>
                      <CalendarDays />
                      방송 선호 시간
                    </>
                  }
                >
                  <p>주로 방송을 진행하는 요일과 시간을 선택해주세요.</p>
                  <div className="days">
                    {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                      <button
                        type="button"
                        key={d}
                        className={profile.days.includes(d) ? "selected" : ""}
                        onClick={() =>
                          setProfile((p) => ({ ...p, days: toggle(p.days, d) }))
                        }
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="time-row">
                    {["start", "end"].map((k) => (
                      <input
                        key={k}
                        aria-label={
                          k === "start" ? "선호 시작 시간" : "선호 종료 시간"
                        }
                        type="time"
                        value={profile[k]}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, [k]: e.target.value }))
                        }
                      />
                    ))}
                  </div>
                  <div className="info">
                    선호 시간은 라이브 매칭 시 참고 자료로 활용됩니다.
                  </div>
                </Panel>
                <Panel
                  title={
                    <>
                      <Bell />
                      알림 설정
                    </>
                  }
                >
                  <div className="notification-settings">
                    {[
                      "라이브 신청 및 승인 알림",
                      "정산 완료 알림",
                      "새로운 메시지 알림",
                      "마케팅 및 이벤트 소식",
                    ].map((t, i) => (
                      <label key={t}>
                        <span>
                          {t}
                          <small>중요한 소식을 받아보세요.</small>
                        </span>
                        <input
                          role="switch"
                          type="checkbox"
                          checked={profile.notifications[i]}
                          onChange={() =>
                            setProfile((p) => ({
                              ...p,
                              notifications: p.notifications.map((v, j) =>
                                j === i ? !v : v,
                              ),
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit">
                      프로필 저장
                    </button>
                  </div>
                </Panel>
              </div>
            </form>
          </>
        )}
        {active === "가이드" && (
          <>
            <div className="guide-search">
              <SearchBox query={query} setQuery={setQuery} />
              <span>인기 검색어</span>
              {["라이브 신청", "정산", "스튜디오", "수수료"].map((t) => (
                <button key={t} onClick={() => setQuery(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="guide-cards">
              {[
                [Zap, "시작하기"],
                [Radio, "라이브 신청"],
                [Monitor, "방송 준비"],
                [Coins, "정산"],
                [FileText, "운영 정책"],
              ].map(([I, t]) => (
                <button
                  key={t}
                  onClick={() => setQuery(t === "시작하기" ? "" : t)}
                >
                  <i>
                    <I />
                  </i>
                  <div>
                    <b>{t}</b>
                    <small>진행 방법과 유용한 안내를 확인하세요.</small>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
            <div className="guide-middle">
              <Panel title="라이브 방송 진행 과정">
                <p>
                  오렌지 라이브커머스와 함께하는 쉽고 빠른 라이브, 이렇게
                  진행돼요!
                </p>
                <div className="steps">
                  {[
                    [FileText, "라이브 신청"],
                    [CheckCircle2, "승인 및 준비"],
                    [Package, "방송 준비"],
                    [Radio, "라이브 진행"],
                    [TrendingUp, "정산 완료"],
                  ].map(([I, t], i) => (
                    <div key={t}>
                      <i>
                        <I />
                      </i>
                      <b>
                        {i + 1}. {t}
                      </b>
                      <p>매니저와 함께 준비하고 진행하세요.</p>
                    </div>
                  ))}
                </div>
              </Panel>
              {promo}
            </div>
            <div className="guide-bottom">
              <Panel title="자주 묻는 질문 (FAQ)">
                {questions
                  .filter(([q, a]) => (q + a).includes(query))
                  .map(([q, a], i) => (
                    <div className="faq" key={q}>
                      <button
                        aria-expanded={faq === i}
                        onClick={() => setFaq(faq === i ? -1 : i)}
                      >
                        <span>Q</span>
                        {q}
                        <ChevronDown size={16} />
                      </button>
                      {faq === i && <p>{a}</p>}
                    </div>
                  ))}
              </Panel>
              <Panel title="가이드 자료실">
                <p>방송 준비에 도움이 되는 자료를 다운로드하세요.</p>
                {[
                  "라이브 방송 기획 체크리스트",
                  "상품 소개 기획안 템플릿",
                  "방송 대본 예시",
                  "썸네일 & 홍보 이미지 가이드",
                  "SNS 홍보 문구 템플릿",
                  "방송 후 분석 리포트 템플릿",
                ].map((t) => (
                  <div className="resource" key={t}>
                    <i>
                      <FileText size={20} />
                    </i>
                    <b>{t}</b>
                    <button
                      className="outline"
                      onClick={() =>
                        download(t + ".txt", t + "\n\n" + guideText)
                      }
                    >
                      <Download size={14} />
                      다운로드
                    </button>
                  </div>
                ))}
              </Panel>
              <div>
                <Panel title="스튜디오 이용 가이드">
                  <img
                    className="studio-guide-image"
                    src={img("creator-studio.png")}
                    alt="오렌지 스튜디오"
                  />
                  <h3>스튜디오 이용 방법</h3>
                  <p>시설, 장비, 예약 방법을 확인하세요.</p>
                  <button
                    className="outline"
                    onClick={() => setModal({ type: "guide" })}
                  >
                    자세히 보기
                  </button>
                </Panel>
                <Panel title="도움이 더 필요하신가요?">
                  <p>궁금한 점을 메시지로 문의해주세요.</p>
                  <button
                    className="primary full"
                    onClick={() => {
                      go("메시지");
                      setConversation("오렌지 운영팀");
                    }}
                  >
                    <MessageSquare size={16} />
                    1:1 문의하기
                  </button>
                  <small>운영시간 평일 09:00 ~ 18:00</small>
                </Panel>
              </div>
            </div>
          </>
        )}
      </main>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
          <button aria-label="알림 닫기" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Modal close={() => setModal(null)}>
          {modal.type === "picker" && (
            <>
              <h2>라이브 상품 선택</h2>
              {products.map((p) => (
                <label className="picker-row" key={p.id}>
                  <input
                    type="checkbox"
                    checked={draft.products.includes(p.id)}
                    onChange={() =>
                      change("products", toggle(draft.products, p.id))
                    }
                  />
                  <img src={img(p.image)} alt="" />
                  <b>{p.name}</b>
                  <span>{money(p.price)}원</span>
                </label>
              ))}
              <button className="primary full" onClick={() => setModal(null)}>
                선택 완료
              </button>
            </>
          )}
          {modal.type === "live" && (
            <>
              <h2>{modal.live.title}</h2>
              <img
                className="detail-image"
                src={img(modal.live.image)}
                alt=""
              />
              <Badge>{modal.live.status}</Badge>
              <p>
                방송 일정: {modal.live.date} {modal.live.time} (1시간)
              </p>
              <p>스튜디오: Studio {modal.live.studio}</p>
              <p>채널: {modal.live.channels.join(", ")}</p>
              <p>
                상품:{" "}
                {modal.live.products
                  .map((id) => products.find((p) => p.id === id)?.name || id)
                  .join(", ")}
              </p>
              <p>요청 사항: {modal.live.notes || "없음"}</p>
              {modal.live.status === "승인 대기" && (
                <button
                  className="danger"
                  onClick={() => setModal({ type: "cancel", live: modal.live })}
                >
                  신청 취소
                </button>
              )}
            </>
          )}
          {modal.type === "cancel" && (
            <>
              <h2>라이브 신청을 취소할까요?</h2>
              <p>{modal.live.title}</p>
              <button
                className="primary"
                onClick={() => {
                  setLives((v) => v.filter((l) => l.id !== modal.live.id));
                  setModal(null);
                  setToast("신청이 취소되었습니다.");
                }}
              >
                취소 확인
              </button>
            </>
          )}
          {modal.type === "delete" && (
            <>
              <h2>상품을 삭제할까요?</h2>
              <p>{modal.product.name}</p>
              <button
                className="primary"
                onClick={() => {
                  setProducts((v) =>
                    v.filter((p) => p.id !== modal.product.id),
                  );
                  change(
                    "products",
                    draft.products.filter((id) => id !== modal.product.id),
                  );
                  setModal(null);
                  setToast("상품이 삭제되었습니다.");
                }}
              >
                삭제 확인
              </button>
            </>
          )}
          {modal.type === "product" && (
            <ProductEditor
              product={modal.product}
              onSave={(p) => {
                setProducts((v) =>
                  p.id
                    ? v.map((item) => (item.id === p.id ? p : item))
                    : [...v, { ...p, id: "ORG-" + Date.now() }],
                );
                setModal(null);
                setToast("상품이 저장되었습니다.");
              }}
            />
          )}
          {modal.type === "settlement" && (
            <>
              <h2>정산 상세 내역</h2>
              <h3>{modal.live.title}</h3>
              <p>주문 매출: ₩ {money(modal.live.amount)}</p>
              <p>수수료 (20%): ₩ {money(modal.live.amount * 0.2)}</p>
              <h3>정산 금액: ₩ {money(modal.live.amount * 0.8)}</h3>
              <button
                onClick={() =>
                  download(
                    "정산내역.txt",
                    modal.live.title +
                      "\n주문 매출: " +
                      modal.live.amount +
                      "\n수수료: " +
                      modal.live.amount * 0.2 +
                      "\n정산 금액: " +
                      modal.live.amount * 0.8,
                  )
                }
              >
                내역 다운로드
              </button>
            </>
          )}
          {modal.type === "preview" && (
            <>
              <div className="profile-photo">
                <img
                  src={profile.photo || img("creator-login-hero.png")}
                  alt={`${profile.nickname} 프로필`}
                />
              </div>
              <h2>{profile.nickname}</h2>
              <p>{profile.intro}</p>
              <div className="profile-tags">
                {profile.categories.map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>
              <p>방송 선호 요일: {profile.days.join(", ")}</p>
            </>
          )}
          {modal.type === "guide" && (
            <>
              <h2>스튜디오 이용 가이드</h2>
              <img
                className="detail-image"
                src={img("creator-studio.png")}
                alt="스튜디오"
              />
              <p>방송 30분 전 도착하여 조명, 음향과 인터넷을 확인해주세요.</p>
              <p>상품과 방송 대본을 준비하고 리허설을 진행해주세요.</p>
              <p>이용 후 장비와 공간을 정리해주세요.</p>
              <button
                onClick={() => download("스튜디오-가이드.txt", guideText)}
              >
                가이드 다운로드
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
function SearchBox({ query, setQuery }) {
  return (
    <div className="search-input">
      <Search size={18} />
      <input
        aria-label="검색"
        placeholder="이름, 상품, 내용으로 검색하세요."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
function ProductCell({ p }) {
  return (
    <div className="product-cell">
      <img src={img(p.image)} alt="" />
      <strong>
        {p.name}
        <small>{p.id}</small>
      </strong>
    </div>
  );
}
function Pagination({ count, page, setPage }) {
  const pages = Math.max(1, Math.ceil(count / 8)),
    current = Math.min(page, pages);
  return (
    <div className="pagination">
      <small>총 {count}개</small>
      <div>
        <button
          aria-label="이전 페이지"
          disabled={current <= 1}
          onClick={() => setPage(current - 1)}
        >
          ‹
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            className={current === i + 1 ? "selected" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          aria-label="다음 페이지"
          disabled={current >= pages}
          onClick={() => setPage(current + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
function Modal({ children, close }) {
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [close]);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="상세 정보"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          autoFocus
          className="modal-close icon-button"
          aria-label="닫기"
          onClick={close}
        >
          <X />
        </button>
        {children}
      </section>
    </div>
  );
}
function ProductEditor({ product, onSave }) {
  const [p, setP] = useState(product);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!p.name.trim()) return;
        onSave({
          ...p,
          name: p.name.trim(),
          price: Number(p.price),
          stock: Number(p.stock),
        });
      }}
    >
      <h2>{p.id ? "상품 수정" : "상품 등록"}</h2>
      {[
        ["name", "상품명", "text"],
        ["price", "판매가", "number"],
        ["stock", "재고 수량", "number"],
      ].map(([k, t, type]) => (
        <label className="field" key={k}>
          {t}
          <input
            type={type}
            min={0}
            required
            maxLength={100}
            value={p[k]}
            onChange={(e) => setP((v) => ({ ...v, [k]: e.target.value }))}
          />
        </label>
      ))}
      <label className="field">
        카테고리
        <select
          value={p.category}
          onChange={(e) => setP((v) => ({ ...v, category: e.target.value }))}
        >
          {["뷰티", "패션", "리빙", "식품"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        상품 이미지
        <select
          value={p.image}
          onChange={(e) => setP((v) => ({ ...v, image: e.target.value }))}
        >
          {seed.map((item) => (
            <option key={item.id} value={item.image}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <button className="primary full" type="submit">
        저장하기
      </button>
    </form>
  );
}
const questions = [
  [
    "라이브 신청은 어떻게 하나요?",
    "라이브 신청 메뉴에서 원하는 일정, 스튜디오, 상품을 선택하여 신청할 수 있습니다. 운영팀 검토 후 승인이 진행됩니다.",
  ],
  [
    "승인은 보통 얼마나 걸리나요?",
    "운영팀이 일정과 상품을 검토합니다. 담당 매니저에게 문의해주세요.",
  ],
  [
    "스튜디오는 어떻게 예약하나요?",
    "라이브 신청 화면에서 스튜디오와 방송 일정을 선택하세요.",
  ],
  ["정산은 언제 이루어지나요?", "구매 확정 기간 후 등록한 계좌로 지급됩니다."],
  [
    "수수료는 얼마인가요?",
    "예시 수수료는 20%입니다. 실제 조건은 운영팀과 확인해주세요.",
  ],
  [
    "모바일에서도 라이브 신청이 가능한가요?",
    "모바일에서도 메뉴를 열어 신청과 상품 관리를 할 수 있습니다.",
  ],
  [
    "방송 준비 및 운영 정책은 어디서 확인하나요?",
    "담당 매니저와 스튜디오 운영팀에 도움을 요청하세요.",
  ],
];
const guideText =
  "오렌지 라이브커머스 방송 준비 가이드\n\n1. 방송 목표와 소개할 상품을 정합니다.\n2. 스튜디오, 일정, SNS 채널을 선택합니다.\n3. 운영팀과 상품 구성을 확인합니다.\n4. 상품 특징, 가격, 혜택과 질문을 준비합니다.\n5. 장비와 인터넷을 확인하고 리허설을 진행합니다.\n6. 시청자 질문에 답하고 상품을 소개합니다.\n7. 방송 후 성과 및 정산 내역을 확인합니다.";
createRoot(document.getElementById("root")).render(<App />);
