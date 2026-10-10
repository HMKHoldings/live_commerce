import React, { useEffect, useState } from 'react';
import { api } from '../api/storeApi';

function InstagramFollowers({ username }) {
  const handle = (username || '').trim().replace(/^@/, '').toLowerCase();
  const [result, setResult] = useState(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!handle) return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const data = await api('/creator/social/instagram', { method: 'POST', body: { username: handle } });
        if (active) setResult({ handle, data });
      } catch (error) {
        if (active) setResult({ handle, error: error.message });
      }
    }, 800);
    return () => { active = false; clearTimeout(timer); };
  }, [handle, refresh]);

  if (!handle) return <><b>—</b><small>Instagram</small><span className="social-status">계정 이름을 입력해주세요</span></>;
  const current = result?.handle === handle ? result : null;
  return <>
    <b>{current?.data?.followers == null ? '—' : `${current.data.followers.toLocaleString('ko-KR')}명`}</b>
    <small>Instagram · @{handle}</small>
    {!current ? <span className="social-status" role="status">확인 중…</span> : current.error ?
      <><span className="social-status" role="alert">{current.error}</span><button className="social-refresh" type="button" onClick={() => { setResult(null); setRefresh(value => value + 1); }}>다시 시도</button></> :
      !current.data.configured ? <span className="social-status">Instagram 연결이 필요합니다</span> : <>
        {current.data.growth === null ? <span className="social-status">30일 비교 데이터 수집 중</span> :
          <em className={current.data.growth < 0 ? 'social-decrease' : ''}>
            {current.data.growth < 0 ? '▼' : '▲'} {Math.abs(current.data.growth).toFixed(1)}%
            <span className="social-status">{current.data.baselineDate} 대비</span>
          </em>}
        <span className="social-status">갱신 {new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(current.data.updatedAt))}</span>
        <button className="social-refresh" type="button" onClick={() => { setResult(null); setRefresh(value => value + 1); }}>새로고침</button>
      </>}
  </>;
}

export default function SocialFollowers({ profile, SocialIcon }) {
  return <div className="followers">
    {['YouTube', 'TikTok', 'Instagram', 'Naver'].map(platform => <div key={platform}>
      <SocialIcon name={platform} />
      <div className="social-followers-content">
        {platform === 'Instagram' ? <InstagramFollowers username={profile.Instagram} /> : <>
          <b>—</b><small>{platform}</small><span className="social-status">
            {profile[platform === 'Naver' ? 'Naver 쇼핑라이브' : platform] ? '통계 연결 준비 중' : '계정 미등록'}
          </span>
        </>}
      </div>
    </div>)}
  </div>;
}
