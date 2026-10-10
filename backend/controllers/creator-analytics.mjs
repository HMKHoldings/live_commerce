import { customerSession } from './customer.mjs';
import { httpError } from '../utils/http.mjs';

export function buildCreatorAnalytics(rows, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  const end = new Date(`${today}T00:00:00Z`);
  const byDate = new Map(rows.map(row => [row.date, row]));
  const days = Array.from({ length: 60 }, (_, i) => {
    const date = new Date(end.getTime() - (59 - i) * 86400000).toISOString().slice(0, 10);
    const row = byDate.get(date);
    return {
      date, viewers: row?.viewers ?? 0, revenue: row?.revenue ?? 0,
      retainedViews: row?.retained_views ?? 0, measuredViews: row?.measured_views ?? 0,
      recorded: Boolean(row),
    };
  });
  const summarize = values => {
    const sum = key => values.reduce((total, day) => total + day[key], 0);
    const measured = sum('measuredViews');
    return { viewers: sum('viewers'), revenue: sum('revenue'),
      retention: measured ? sum('retainedViews') / measured * 100 : null };
  };
  const current = days.slice(30), summary = summarize(current), previous = summarize(days.slice(0, 30));
  const changes = Object.fromEntries(Object.keys(summary).map(key => [key,
    summary[key] === null || previous[key] === null || previous[key] === 0
      ? null : (summary[key] - previous[key]) / previous[key] * 100,
  ]));
  return { days: current, summary, changes, hasData: current.some(day => day.recorded) };
}

export async function creatorAnalyticsController({ req, db, send }) {
  if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
  const session = customerSession(req, db);
  if (!session) throw httpError(401, '로그인이 필요합니다.');
  if (JSON.parse(session.data || '{}').accountType !== 'creator') {
    throw httpError(403, '크리에이터 계정이 필요합니다.');
  }
  const now = new Date();
  const window = buildCreatorAnalytics([], now).days;
  const start = new Date(new Date(`${window[0].date}T00:00:00Z`).getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const rows = db.prepare(`SELECT * FROM creator_daily_metrics WHERE creator_id=?
    AND date BETWEEN ? AND ? ORDER BY date`).all(session.user_id, start, window.at(-1).date);
  return send(200, buildCreatorAnalytics(rows, now));
}
