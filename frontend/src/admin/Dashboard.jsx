import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  Eye,
  Gift,
  Image,
  LayoutGrid,
  MessageCircle,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Star,
  TicketPercent,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  Video,
} from "lucide-react";

const money = (value) => Number(value || 0).toLocaleString("ko-KR");
const orderStatuses = {
  new: "결제완료",
  processing: "배송준비",
  shipped: "배송중",
  completed: "배송완료",
  cancelled: "취소/반품",
};
const statusColors = {
  new: "#ff5a18",
  processing: "#f4a000",
  shipped: "#2f91ee",
  completed: "#36b45c",
  cancelled: "#aeb4bb",
};
const dateKey = (value) => new Date(value).toLocaleDateString("en-CA");
const compactDate = (value) => {
  const date = new Date(value);
  return String(date.getMonth() + 1).padStart(2, "0") + "." + String(date.getDate()).padStart(2, "0");
};
const parseViews = (value) => {
  const text = String(value || "0").replaceAll(",", "");
  if (text.includes("만")) return Math.round(parseFloat(text) * 10000);
  return Number.parseInt(text, 10) || 0;
};

function Panel({ title, action, children, className = "" }) {
  return (
    <section className={"admin-dash-panel " + className}>
      <header>
        <h2>{title}</h2>
        {action && <button type="button" onClick={action}>자세히 보기 <ArrowRight size={14} /></button>}
      </header>
      {children}
    </section>
  );
}

export default function Dashboard({ data, navigate }) {
  const [period, setPeriod] = useState(7);
  const { products = [], orders = [], reviews = [], questions = [], notices = [] } = data;
  const now = new Date();
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - period + 1);
  cutoff.setHours(0, 0, 0, 0);
  const periodOrders = activeOrders.filter((order) => new Date(order.createdAt) >= cutoff);
  const totalSales = periodOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const customerCount = new Set(orders.map((order) => order.customer?.email || order.customer?.name).filter(Boolean)).size;
  const pageViews = products.reduce((sum, product) => sum + parseViews(product.views), 0);
  const pending = questions.filter((question) => question.status === "pending").length;
  const liveProducts = products.filter((product) => product.platform && product.status === "published").length;
  const activeDeals = products.filter((product) => product.target > 0 && product.status === "published" && Date.parse(product.endsAt) > Date.now()).length;

  const timeline = Array.from({ length: period }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - period + 1 + index);
    const key = dateKey(date);
    const value = periodOrders
      .filter((order) => dateKey(order.createdAt) === key)
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    return { label: compactDate(date), value };
  });
  const chartMax = Math.max(...timeline.map((item) => item.value), 1);
  const chartPoints = timeline.map((item, index) => {
    const x = 54 + (index * 626) / Math.max(1, period - 1);
    const y = 184 - (item.value / chartMax) * 142;
    return x + "," + y;
  }).join(" ");

  const statusCounts = Object.keys(orderStatuses).map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
  const orderTotal = Math.max(1, statusCounts.reduce((sum, item) => sum + item.count, 0));
  let cursor = 0;
  const donut = statusCounts.map((item) => {
    const start = cursor;
    cursor += (item.count / orderTotal) * 100;
    return statusColors[item.status] + " " + start + "% " + cursor + "%";
  }).join(",");

  const recentOrders = orders.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  const recentQuestions = questions.slice().sort((a, b) => String(b.date || b.created).localeCompare(String(a.date || a.created))).slice(0, 5);
  const recentNotices = notices.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);

  const cards = [
    [BarChart3, "총 매출", money(totalSales) + "원", "기간 내 결제 매출", "orange"],
    [ShoppingCart, "총 주문수", money(periodOrders.length) + "건", "취소 주문 제외", "green"],
    [UserRound, "구매 회원", money(customerCount) + "명", "주문 고객 기준", "blue"],
    [Eye, "상품 조회수", money(pageViews) + "회", "등록 상품 누적", "purple"],
  ];
  const actions = [
    [Package, "상품 등록", "새로운 상품을 등록하세요", "products", "peach"],
    [Video, "라이브 일정 등록", "SNS 라이브 상품을 관리하세요", "products", "mint"],
    [Users, "공동구매 생성", "새로운 공동구매를 시작하세요", "products", "sky"],
    [Image, "배너 관리", "메인 배너를 설정하세요", "banners", "pink"],
  ];
  const shortcuts = [
    [Users, "회원 현황", "orders"],
    [TicketPercent, "쿠폰 관리", "promos"],
    [Star, "리뷰 관리", "reviews"],
    [LayoutGrid, "카테고리 관리", "categories"],
    [Gift, "프로모션", "promos"],
    [TrendingUp, "판매 통계", "orders"],
    [MessageCircle, "문의 관리", "questions"],
    [Settings, "사이트 설정", "settings"],
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-topline">
        <div>
          <h1>대시보드</h1>
          <p>오렌지 라이브커머스의 전체 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="dashboard-range">
          <span><CalendarDays size={16} /> {compactDate(cutoff)} ~ {compactDate(now)}</span>
          <button onClick={() => setPeriod(1)}>오늘</button>
          {[7, 30, 90, 365].map((days) => (
            <button className={period === days ? "active" : ""} key={days} onClick={() => setPeriod(days)}>
              {days === 7 ? "7일" : days === 30 ? "30일" : days === 90 ? "3개월" : "1년"}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-kpis">
        {cards.map(([Icon, label, value, note, tone]) => (
          <article className={"dashboard-kpi " + tone} key={label}>
            <span><Icon size={29} /></span>
            <div><small>{label}</small><strong>{value}</strong><p><b>▲</b> {note}</p></div>
          </article>
        ))}
      </div>

      <div className="dashboard-analytics">
        <Panel title="매출 추이" className="sales-panel">
          <div className="chart-legend"><i /> 매출액</div>
          <svg className="sales-chart" viewBox="0 0 730 225" role="img" aria-label="기간별 매출 추이">
            <defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6b22" stopOpacity=".25" /><stop offset="1" stopColor="#ff6b22" stopOpacity=".02" /></linearGradient></defs>
            {[0, 1, 2, 3].map((row) => <line key={row} x1="54" y1={42 + row * 47} x2="680" y2={42 + row * 47} stroke="#e9edf1" />)}
            <polygon points={"54,184 " + chartPoints + " 680,184"} fill="url(#sales-fill)" />
            <polyline points={chartPoints} fill="none" stroke="#ff641c" strokeWidth="3" />
            {timeline.map((item, index) => {
              const step = Math.max(1, Math.ceil(period / 8));
              if (index % step !== 0 && index !== period - 1) return null;
              const x = 54 + (index * 626) / Math.max(1, period - 1);
              const y = 184 - (item.value / chartMax) * 142;
              return <g key={index}><circle cx={x} cy={y} r="4" fill="#ff641c" /><text x={x} y="211" textAnchor="middle">{item.label}</text></g>;
            })}
          </svg>
        </Panel>

        <Panel title="주문 상태" action={() => navigate("orders")} className="status-panel">
          <div className="order-status-chart">
            <div className="order-donut" style={{ background: orders.length ? "conic-gradient(" + donut + ")" : "#edf0f3" }}>
              <div><strong>{orders.length}</strong><small>총 주문건수</small></div>
            </div>
            <div className="order-status-list">
              {statusCounts.map((item) => (
                <p key={item.status}><i style={{ background: statusColors[item.status] }} />{orderStatuses[item.status]}<b>{item.count}</b><small>{Math.round((item.count / orderTotal) * 100)}%</small></p>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="실시간 현황" className="realtime-panel">
          <div className="live-indicator"><i /> 실시간 업데이트</div>
          {[
            [Eye, "상품 조회수", money(pageViews) + "회", "peach"],
            [ShoppingCart, "기간 내 주문", money(periodOrders.length) + "건", "green"],
            [MessageCircle, "대기중 1:1 문의", money(pending) + "건", "pink"],
            [Boxes, "등록 상품", money(products.length) + "개", "purple"],
            [Video, "라이브 상품", money(liveProducts) + "개", "blue"],
            [Users, "진행 공동구매", money(activeDeals) + "개", "sky"],
          ].map(([Icon, label, value, tone]) => <div className="realtime-row" key={label}><span className={tone}><Icon size={18} /></span><p>{label}</p><b>{value}</b></div>)}
        </Panel>
      </div>

      <div className="dashboard-actions">
        {actions.map(([Icon, title, text, target, tone]) => (
          <button className={tone} key={title} onClick={() => navigate(target)}>
            <span><Icon size={29} /></span><div><strong>{title}</strong><small>{text}</small></div><i><ArrowRight size={18} /></i>
          </button>
        ))}
      </div>

      <div className="dashboard-tables">
        <Panel title="최근 주문 내역" action={() => navigate("orders")}>
          <table><thead><tr><th>주문번호</th><th>주문자</th><th>상품명</th><th>금액</th><th>상태</th></tr></thead>
            <tbody>{recentOrders.map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.customer?.name || "-"}</td><td>{order.items?.[0]?.name || "-"}</td><td>{money(order.total)}원</td><td><span className={"table-status " + order.status}>{orderStatuses[order.status] || order.status}</span></td></tr>)}</tbody>
          </table>
          {!recentOrders.length && <p className="dashboard-empty">아직 주문 내역이 없습니다.</p>}
        </Panel>
        <Panel title="최근 문의 내역" action={() => navigate("questions")}>
          <table><thead><tr><th>유형</th><th>제목</th><th>작성자</th><th>등록일</th><th>상태</th></tr></thead>
            <tbody>{recentQuestions.map((question) => <tr key={question.id}><td>상품문의</td><td>{question.title}</td><td>{question.author || question.customerName || "-"}</td><td>{question.date || "-"}</td><td><span className={"question-status " + question.status}>{question.status === "pending" ? "답변대기" : "답변완료"}</span></td></tr>)}</tbody>
          </table>
          {!recentQuestions.length && <p className="dashboard-empty">최근 문의가 없습니다.</p>}
        </Panel>
        <Panel title="공지사항" action={() => navigate("notices")}>
          <table><thead><tr><th>제목</th><th>등록일</th></tr></thead>
            <tbody>{recentNotices.map((notice) => <tr key={notice.id}><td>{notice.title}</td><td>{notice.date}</td></tr>)}</tbody>
          </table>
          {!recentNotices.length && <p className="dashboard-empty">등록된 공지사항이 없습니다.</p>}
        </Panel>
      </div>

      <Panel title="바로가기 메뉴" className="shortcut-panel">
        <div className="dashboard-shortcuts">
          {shortcuts.map(([Icon, label, target], index) => <button key={label} onClick={() => navigate(target)}><span className={"shortcut-tone-" + (index % 5)}><Icon size={22} /></span>{label}</button>)}
        </div>
      </Panel>
    </div>
  );
}