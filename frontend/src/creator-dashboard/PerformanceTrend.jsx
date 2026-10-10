import React, { useEffect, useId, useState } from 'react';
import { api } from '../api/storeApi';

const number = value => Number(value).toLocaleString('ko-KR');
const dateLabel = date => date.slice(5).replace('-', '.');

export default function PerformanceTrend() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState({ viewers: true, revenue: true });
  const gradient = useId();
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const result = await api('/creator/analytics');
        if (active) { setData(result); setError(''); }
      } catch {
        if (active) setError('성과 정보를 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        if (active) setLoading(false);
      }
    }
    setLoading(true);
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 60000);
    return () => { active = false; clearInterval(timer); };
  }, [retry]);

  if (error) return <div className="trend-state" role="alert"><p>{error}</p>
    <button onClick={() => setRetry(value => value + 1)}>다시 시도</button></div>;
  if (loading || !data) return <p className="trend-state" role="status">성과 정보를 불러오는 중입니다…</p>;
  if (!data.hasData) return <div className="trend-state"><p>최근 30일의 성과 데이터가 없습니다.</p>
    <small>방송 통계가 수집되면 시청자 수와 매출 추이가 표시됩니다.</small>
    <button onClick={() => setRetry(value => value + 1)}>새로고침</button></div>;

  const metrics = [
    ['viewers', '시청자 수', `${number(data.summary.viewers)}명`],
    ['revenue', '매출액', `₩ ${number(data.summary.revenue)}`],
    ['retention', '시청 유지율', data.summary.retention === null ? '—' : `${data.summary.retention.toFixed(1)}%`],
  ];
  const maxima = Object.fromEntries(['viewers', 'revenue'].map(key => [key, Math.max(1, ...data.days.map(day => day[key]))]));
  const x = index => 20 + index / (data.days.length - 1) * 350;
  const y = (day, key) => 190 - day[key] / maxima[key] * 160;
  const points = key => data.days.map((day, index) => `${x(index)},${y(day, key)}`).join(' ');
  const day = selected === null ? null : data.days[selected];
  return <>
    <div className="mini-stats">{metrics.map(([key, title, value]) => {
      const change = data.changes[key];
      return <div key={key}><small>{title}</small><b>{value}</b>
        <em className={change < 0 ? 'trend-decrease' : ''}>{change === null ? '이전 30일 비교 없음' : `${change < 0 ? '▼' : '▲'} ${Math.abs(change).toFixed(1)}%`}</em></div>;
    })}</div>
    <div className="chart-legend trend-legend">{[['viewers', '시청자 수(명)'], ['revenue', '매출액(원)']].map(([key, label]) =>
      <button key={key} className={`trend-${key}`} aria-pressed={visible[key]}
        onClick={() => setVisible(current => ({ ...current, [key]: !current[key] }))}>● {label}</button>)}</div>
    <small className="trend-scale">각 선은 별도 눈금 · 시청자 최대 {number(maxima.viewers)}명 / 매출 최대 ₩ {number(maxima.revenue)}</small>
    <svg className="chart" viewBox="0 0 390 210" role="img" aria-label="최근 30일 일별 시청자 및 매출 추이">
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ff6425" stopOpacity=".25" /><stop offset="1" stopColor="#ff6425" stopOpacity="0" /></linearGradient></defs>
      {[30, 70, 110, 150, 190].map(value => <line key={value} x1="20" x2="370" y1={value} y2={value} stroke="#edf0f4" />)}
      {visible.viewers && <><polygon points={`20,190 ${points('viewers')} 370,190`} fill={`url(#${gradient})`} /><polyline points={points('viewers')} stroke="#ff500b" strokeWidth="3" fill="none" /></>}
      {visible.revenue && <polyline points={points('revenue')} stroke="#ffbc98" strokeWidth="3" fill="none" />}
      {data.days.map((item, index) => <rect key={item.date} x={x(index) - 6} y="20" width="12" height="175" fill="transparent"
        tabIndex="0" role="button" aria-label={`${item.date}: ${item.recorded ? `${number(item.viewers)}명, ${number(item.revenue)}원` : '수집 데이터 없음'}`}
        onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)} onClick={() => setSelected(index)}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(index); } }} />)}
      {day && <line x1={x(selected)} x2={x(selected)} y1="20" y2="190" stroke="#7e8a9d" strokeDasharray="4 4" pointerEvents="none" />}
    </svg>
    <div className="chart-dates trend-dates">{[0, 7, 14, 21, 29].map(index => <span key={index}>{dateLabel(data.days[index].date)}</span>)}</div>
    <div className="trend-detail" aria-live="polite">{day ? `${dateLabel(day.date)} · ${day.recorded ? `시청자 ${number(day.viewers)}명 · 매출 ₩ ${number(day.revenue)}` : '수집 데이터 없음'}` : '그래프 위에 마우스를 올리거나 날짜를 선택하세요.'}</div>
  </>;
}
