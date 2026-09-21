import React from 'react';
import { assetPath } from '../utils/assetPath';
import './banner-editor.css';

const themes = [
  ['orange', '오렌지 · 라이브 쇼핑'],
  ['fresh', '그린 · 신선식품'],
  ['living', '베이지 · 리빙'],
  ['beauty', '핑크 · 뷰티'],
];

export default function BannerEditor({ banner, setBanner, upload, busy, isNew }) {
  const update = (key, value) => setBanner(old => ({ ...old, [key]: value }));
  const field = (key, label, hint, wide = false) => (
    <label className={wide ? 'banner-editor-wide' : ''} key={key}>
      <span>{label}</span>
      {key === 'title' || key === 'description'
        ? <textarea rows={key === 'title' ? 2 : 3} value={banner[key] ?? ''} onChange={event => update(key, event.target.value)} />
        : <input value={banner[key] ?? ''} onChange={event => update(key, event.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  );
  const imageField = (key, label, hint) => (
    <label className="banner-editor-wide" key={key}>
      <span>{label}</span>
      {banner[key] && <img className="banner-editor-image" src={assetPath(banner[key])} alt="" />}
      <input value={banner[key] ?? ''} onChange={event => update(key, event.target.value)} placeholder="이미지 경로 또는 업로드 후 자동 입력" />
      <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => upload(key, event.target.files?.[0])} />
      <small>{hint} · PNG, JPG, WebP · 최대 50MB</small>
    </label>
  );

  return <div className="banner-editor admin-wide">
    <div className={'admin-banner-preview theme-' + (banner.theme || 'fresh')} style={banner.image ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.08)),url("${assetPath(banner.image)}")` } : undefined}>
      <span>스토어 배너 미리보기</span>
      <strong>{banner.title || '배너 제목을 입력하세요'}</strong>
      <small>{banner.description || '설명을 입력하면 여기에 표시됩니다.'}</small>
      <em>{banner.cta || '버튼 문구'}</em>
      {!banner.image && <i>이미지 미등록 · 테마 색상 미리보기</i>}
    </div>
    <p className="banner-editor-note">미리보기는 편집용입니다. 실제 스토어에서는 화면 크기에 따라 배치가 달라질 수 있습니다.</p>

    <section>
      <header><b>1. 기본 내용</b><small>스토어에 표시할 문구를 입력하세요.</small></header>
      <div className="banner-editor-grid">
        {field('label', '관리용 배너 이름', '관리자 목록에서 구분할 이름입니다.')}
        {field('eyebrow', '제목 위 작은 문구')}
        {field('title', '큰 제목', '', true)}
        {field('description', '설명', '', true)}
        {field('cta', '버튼 문구')}
        {field('category', '버튼을 누르면 열릴 상품 카테고리', '예: 전체, 식품, 리빙. 별도의 URL 링크는 사용하지 않습니다.')}
      </div>
    </section>

    <section>
      <header><b>2. 이미지와 디자인</b><small>이미지를 바꾸면 위 미리보기에 바로 반영됩니다.</small></header>
      <div className="banner-editor-grid">
        <label><span>디자인 테마</span><select value={banner.theme || 'fresh'} onChange={event => update('theme', event.target.value)}>{themes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {imageField('image', '대표 이미지', '오렌지 테마는 스토어 기본 일러스트를 사용합니다')}
      </div>
    </section>

    <section>
      <header><b>3. 게시 설정</b><small>게시 중으로 바꾸면 스토어에 표시됩니다.</small></header>
      <div className="banner-editor-grid">
        <label><span>게시 상태</span><select value={banner.status || 'draft'} onChange={event => update('status', event.target.value)}><option value="draft">임시저장</option><option value="published">게시 중</option><option value="hidden">숨김</option></select></label>
        <label><span>노출 순서</span><input type="number" min="0" value={banner.order ?? 0} onChange={event => update('order', Number(event.target.value))} /><small>숫자가 작은 배너부터 먼저 표시됩니다.</small></label>
      </div>
    </section>

    <details className="banner-editor-extra">
      <summary>추가 설정 <small>보조 이미지, 대체 텍스트, 이미지 위 문구, ID</small></summary>
      <div className="banner-editor-grid">
        {field('imageAlt', '대표 이미지 설명', '접근성을 위한 이미지 대체 텍스트입니다.')}
        {imageField('inset', '보조 이미지', '일부 테마에서 대표 이미지 위에 표시됩니다')}
        {field('insetAlt', '보조 이미지 설명')}
        {field('artEyebrow', '이미지 위 작은 문구')}
        {field('artTitle', '이미지 위 제목')}
        <label><span>ID</span><input value={banner.id ?? ''} readOnly={!isNew} onChange={event => update('id', event.target.value)} placeholder={isNew ? '비워두면 자동 생성' : ''} /><small>기존 배너 ID는 변경할 수 없습니다.</small></label>
      </div>
    </details>
  </div>;
}
