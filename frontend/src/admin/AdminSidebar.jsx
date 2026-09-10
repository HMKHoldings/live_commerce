import React, { useEffect, useState } from "react";
import {
  BarChart3, Boxes, ExternalLink, FileText, Gift, LayoutDashboard,
  MessageCircle, Package, Settings, ShoppingCart, Users, Video,
} from "lucide-react";
import { assetPath } from "../utils/assetPath";

const groups = [
  { icon: Package, title: "상품 관리", items: [
    ["products", "상품 목록"], ["products", "상품 등록", "create"], ["categories", "카테고리 관리"],
    ["products", "브랜드 관리"], ["products", "상품 옵션 관리"], ["reviews", "리뷰 관리"],
  ]},
  { icon: ShoppingCart, title: "주문/배송 관리", items: [
    ["orders", "주문 목록"], ["orders", "배송 관리"], ["orders", "취소/교환/반품"], ["orders", "송장 관리"],
  ]},
  { icon: Users, title: "회원 관리", items: [
    ["orders", "회원 목록"], ["settings", "회원 등급 관리"], ["promos", "쿠폰/포인트 관리"], ["questions", "1:1 문의 관리"],
  ]},
  { icon: Boxes, title: "공동구매 관리", items: [
    ["products", "공동구매 상품"], ["products", "진행중인 공동구매"], ["products", "종료된 공동구매"], ["orders", "참여자 관리"],
  ]},
  { icon: Video, title: "라이브커머스 관리", items: [
    ["products", "라이브 일정"], ["products", "라이브 상품"], ["orders", "라이브 통계"], ["settings", "SNS 연동 관리"],
  ]},
  { icon: FileText, title: "콘텐츠 관리", items: [
    ["banners", "배너 관리"], ["collections", "메인 페이지 관리"], ["promos", "팝업 관리"],
  ]},
  { icon: BarChart3, title: "통계/리포트", items: [
    ["orders", "매출 통계"], ["products", "상품 분석"], ["orders", "회원 분석"], ["audit", "유입 분석"],
  ]},
  { icon: Settings, title: "설정", items: [
    ["settings", "사이트 설정"], ["audit", "관리자 계정 관리"],
  ]},
];

export default function AdminSidebar({ section, navigate }) {
  const firstItemForSection = (nextSection) => {
    if (nextSection === "dashboard") return "dashboard";
    for (const group of groups) {
      const item = group.items.find(([target]) => target === nextSection);
      if (item) return group.title + ":" + item[1];
    }
    return "";
  };
  const [activeItem, setActiveItem] = useState(() => firstItemForSection(section));

  useEffect(() => {
    const current = groups
      .flatMap((group) => group.items.map(([target, label, action]) => ({
        id: group.title + ":" + label,
        target,
      })))
      .find((item) => item.id === activeItem);
    if (section === "dashboard" || current?.target !== section) {
      setActiveItem(firstItemForSection(section));
    }
  }, [section]);

  const open = (target, id, action) => {
    setActiveItem(id);
    navigate(target, action);
  };

  return (
    <aside className="admin-sidebar">
      <a className="admin-brand" href="./">
        <img src={assetPath("/logo/orange_logo.png")} alt="" />
        <span>오렌지 라이브커머스<small>관리자 센터</small></span>
      </a>
      <nav>
        <button className={activeItem === "dashboard" ? "active" : ""} onClick={() => open("dashboard", "dashboard")}>
          <LayoutDashboard size={17} /> 대시보드
        </button>
        {groups.map(({ icon: Icon, title, items }) => (
          <div className="admin-nav-group" key={title}>
            <div><Icon size={15} />{title}</div>
            {items.map(([target, label, action]) => (
              <button key={title + label} className={activeItem === title + ":" + label ? "active" : ""} onClick={() => open(target, title + ":" + label, action)}>
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <a href="./" target="_blank" rel="noreferrer"><ExternalLink size={15} />스토어 미리보기</a>
    </aside>
  );
}