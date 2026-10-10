import { httpError } from '../utils/http.mjs';

export function instagramUsername(value) {
  const username = typeof value === 'string' ? value.trim().replace(/^@/, '').toLowerCase() : '';
  if (!/^[a-z0-9._]{1,30}$/.test(username)) throw httpError(400, 'Instagram 사용자 이름을 확인해주세요.');
  return username;
}

export function followerSummary(db, creatorId, snapshot) {
  const cutoff = snapshot.fetched_at - 30 * 86400000;
  const baseline = db.prepare(`SELECT * FROM creator_social_snapshots
    WHERE creator_id=? AND account_id=? AND fetched_at<=?
    ORDER BY fetched_at DESC LIMIT 1`).get(creatorId, snapshot.account_id, cutoff);
  return {
    configured: true, username: snapshot.username, followers: snapshot.followers,
    updatedAt: new Date(snapshot.fetched_at).toISOString(),
    growth: baseline?.followers > 0 ? (snapshot.followers - baseline.followers) / baseline.followers * 100 : null,
    baselineDate: baseline ? new Date(baseline.fetched_at).toISOString().slice(0, 10) : null,
  };
}

export async function syncInstagramFollowers(db, creatorId, value, {
  env = process.env, fetchImpl = fetch, now = Date.now(),
} = {}) {
  const username = instagramUsername(value);
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  const userId = env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const version = env.INSTAGRAM_GRAPH_VERSION;
  if (!token || !/^\d+$/.test(userId || '') || !/^v\d+\.\d+$/.test(version || '')) {
    return { configured: false, username, followers: null, growth: null };
  }
  const cached = db.prepare(`SELECT * FROM creator_social_snapshots
    WHERE creator_id=? AND username=? ORDER BY fetched_at DESC LIMIT 1`).get(creatorId, username);
  if (cached && now >= cached.fetched_at && now - cached.fetched_at < 15 * 60000) {
    return followerSummary(db, creatorId, cached);
  }
  const url = new URL(`https://graph.facebook.com/${version}/${userId}`);
  url.searchParams.set('fields', `business_discovery.username(${username}){id,username,followers_count}`);
  let response, data;
  try {
    response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000),
    });
    data = await response.json();
  } catch {
    throw httpError(502, 'Instagram에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
  if (!response.ok || data.error) {
    throw httpError(502, 'Instagram 통계를 가져오지 못했습니다. 계정 이름과 API 연결을 확인해주세요.');
  }
  const account = data.business_discovery;
  if (!account || !/^\d+$/.test(String(account.id || '')) ||
      String(account.username).toLowerCase() !== username ||
      !Number.isSafeInteger(account.followers_count) || account.followers_count < 0) {
    throw httpError(422, '통계를 확인할 수 없습니다. 공개 프로페셔널 계정인지 확인해주세요.');
  }
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
  const snapshot = { account_id: String(account.id), username, day, followers: account.followers_count, fetched_at: now };
  db.prepare(`INSERT INTO creator_social_snapshots(creator_id,account_id,username,day,followers,fetched_at)
    VALUES(?,?,?,?,?,?) ON CONFLICT(creator_id,account_id,day) DO UPDATE SET
    username=excluded.username,followers=excluded.followers,fetched_at=excluded.fetched_at`)
    .run(creatorId, snapshot.account_id, username, day, snapshot.followers, now);
  return followerSummary(db, creatorId, snapshot);
}
