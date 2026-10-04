import React, { useEffect, useState } from "react";
import {
  BarChart3, Boxes, ChevronDown, ExternalLink, FileText, Image,
  LayoutDashboard, MessageCircle, Package, Settings, ShoppingCart,
  UserCog, Users, Video,
} from "lucide-react";
import { assetPath } from "../utils/assetPath";

const expandable = [
  { icon: Package, title: "상품 관리", group: 0, items: [
    ["products", "상품 목록"], ["products", "상품 등록"], ["categories", "카테고리 관리"],
    ["products", "브랜드 관리"], ["products", "상품 옵션 관리"], ["reviews", "리뷰 관리"],
  ]},
  { icon: ShoppingCart, title: "주문/배송 관리", group: 1, items: [
    ["orders", "주문 목록"], ["orders", "배송 관리"], ["orders", "취소/교환/반품"], ["orders", "송장 관리"],
  ]},
  { icon: Video, title: "라이브커머스 관리", group: 4, items: [
    ["products", "라이브 상품 등록", "createLive"], ["products", "라이브 상품 목록"],
    ["orders", "라이브 통계"], ["settings", "SNS 연동 관리"],
  ]},
  { icon: Boxes, title: "공동구매 관리", group: 3, items: [
    ["products", "공동구매 상품"], ["products", "진행중인 공동구매"],
    ["products", "종료된 공동구매"], ["orders", "참여자 관리"],
  ]},
];

const sections = [
  { label: "회원 · 고객 관리", links: [
    [Users, "회원 관리", "orders", "2:0"],
    [MessageCircle, "문의 관리", "questions", "2:3"],
  ]},
  { label: "콘텐츠 관리", links: [
    [Image, "배너 관리", "banners", "5:0"],
    [FileText, "콘텐츠 관리", "notices"],
  ]},
  { label: "통계", links: [
    [BarChart3, "매출 통계", "orders", "6:0"],
    [BarChart3, "판매 리포트", "products", "6:1"],
  ]},
  { label: "설정", links: [
    [Settings, "사이트 설정", "settings", "7:0"],
    [UserCog, "계정 관리", "accounts", "7:1"],
  ]},
];

const directIdForSection = {
  questions: "문의 관리",
  banners: "배너 관리",
  notices: "콘텐츠 관리",
  accounts: "계정 관리",
};

export default function AdminSidebar({ section, navigate }) {
  const [openGroup, setOpenGroup] = useState("");
  const [activeItem, setActiveItem] = useState(section === "dashboard" ? "대시보드" : directIdForSection[section] || "");

  useEffect(() => {
    if (section === "dashboard") setActiveItem("대시보드");
    else if (directIdForSection[section]) setActiveItem(directIdForSection[section]);
  }, [section]);

  const openDirect = (label, target, view) => {
    setActiveItem(label);
    setOpenGroup("");
    navigate(target, undefined, view, label);
  };

  const openChild = (group, target, label, action, index) => {
    setActiveItem(group.title + ":" + label);
    navigate(target, action, group.group + ":" + index, label);
  };

  return (
    <aside className="admin-sidebar">
      <a className="admin-brand" href="./">
        <img src={assetPath("/logo/orange_logo.png")} alt="" />
        <span>오렌지 라이브커머스<small>관리자 센터</small></span>
      </a>

      <nav aria-label="관리자 메뉴">
        <button className={"admin-nav-dashboard " + (activeItem === "대시보드" ? "active" : "")} onClick={() => openDirect("대시보드", "dashboard")}>
          <LayoutDashboard size={17} /> 대시보드
        </button>

        <p className="admin-nav-section-label">상품 · 판매 관리</p>
        {expandable.map((group) => {
          const Icon = group.icon;
          const isOpen = openGroup === group.title;
          const isActive = activeItem.startsWith(group.title + ":");
          return (
            <div className={"admin-nav-group " + (isOpen ? "open " : "") + (isActive ? "current" : "")} key={group.title}>
              <button className="admin-nav-heading" type="button" aria-expanded={isOpen} onClick={() => setOpenGroup(isOpen ? "" : group.title)}>
                <Icon size={17} /><span>{group.title}</span><ChevronDown className="admin-nav-chevron" size={14} />
              </button>
              {isOpen && <div className="admin-nav-children">
                {group.items.map(([target, label, action], index) => (
                  <button key={label} className={activeItem === group.title + ":" + label ? "active" : ""} onClick={() => openChild(group, target, label, action, index)}>
                    {label}
                  </button>
                ))}
              </div>}
            </div>
          );
        })}

        {sections.map((menuSection) => (
          <React.Fragment key={menuSection.label}>
            <p className="admin-nav-section-label">{menuSection.label}</p>
            {menuSection.links.map(([Icon, label, target, view]) => (
              <button className={"admin-nav-link " + (activeItem === label ? "active" : "")} key={label} onClick={() => openDirect(label, target, view)}>
                <Icon size={17} /><span>{label}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <a className="admin-store-preview" href="./" target="_blank" rel="noreferrer">
        <ExternalLink size={15} />스토어 미리보기
      </a>
    </aside>
  );
}