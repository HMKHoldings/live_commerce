import { assetPath } from "./assetPath";
import React, { useEffect, useRef } from "react";
import { Shirt, Sparkles, Utensils, PanelsTopLeft, ArrowUpRight } from "lucide-react";
import { useStore } from "./StoreContext";
import "./mega-menu.css";

const icons = { fashion: Shirt, beauty: Sparkles, food: Utensils, living: PanelsTopLeft };

export default function MegaMenu({ onClose, onCategory, onCollection }) {
  const { categories: menuCategories } = useStore();
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const outside = event => {
      if (!panel.current?.contains(event.target) && !event.target.closest('.menu-button')) close.current();
    };
    const escape = event => {
      if (event.key === 'Escape') {
        close.current();
        document.querySelector('.menu-button')?.focus();
      }
    };
    const focus = event => {
      if (!panel.current?.contains(event.target) && !event.target.closest('.menu-button')) close.current();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      document.removeEventListener('focusin', focus);
    };
  }, []);

  return (
    <div className="mega-menu" id="header-categories" ref={panel} aria-label="전체 카테고리">
      <div className="mega-menu-categories">
        {menuCategories.map(group => {
          const Icon = icons[group.icon] || PanelsTopLeft;
          return <section className="mega-menu-column" key={group.title}>
            <h3><button type="button" onClick={() => onCategory(group.category)}><Icon size={21} aria-hidden="true" />{group.title}</button></h3>
            <ul>{group.items.map(item => <li key={item}><button type="button" onClick={() => onCollection(item, group.category)}>{item}</button></li>)}</ul>
          </section>;
        })}
      </div>
      <div className="mega-menu-promos">
        <button type="button" className="mega-menu-promo fresh" onClick={() => onCategory('식품')}>
          <img src={assetPath("/images/fresh-produce.jpg")} alt="" />
          <span><small>FRESH PICKS</small><strong>제철의 맛을<br />만나보세요</strong><em>신선한 식품 <ArrowUpRight size={15} /></em></span>
        </button>
        <button type="button" className="mega-menu-promo orange" onClick={() => onCollection('제주 햇감귤', '식품')}>
          <img src={assetPath("/images/oranges.jpg")} alt="" />
          <span><small>ORANGE STORE</small><strong>제주에서 온<br />달콤한 선물</strong><em>지금 둘러보기 <ArrowUpRight size={15} /></em></span>
        </button>
      </div>
    </div>
  );
}
