import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { openDatabase } from '../models/database.mjs';
import { buildCreatorAnalytics, creatorAnalyticsController } from '../controllers/creator-analytics.mjs';

test('analytics uses Seoul dates, 30-day windows and weighted retention', () => {
  const result = buildCreatorAnalytics([
    { date: '2026-10-10', viewers: 100, revenue: 20000, retained_views: 8, measured_views: 10 },
    { date: '2026-10-09', viewers: 50, revenue: 10000, retained_views: 2, measured_views: 10 },
    { date: '2026-09-10', viewers: 100, revenue: 15000, retained_views: 5, measured_views: 10 },
    { date: '2026-10-11', viewers: 99999, revenue: 99999 },
  ], new Date('2026-10-09T16:00:00Z'));
  assert.equal(result.days.length, 30);
  assert.equal(result.days[0].date, '2026-09-11');
  assert.equal(result.days.at(-1).date, '2026-10-10');
  assert.deepEqual(result.summary, { viewers: 150, revenue: 30000, retention: 50 });
  assert.deepEqual(result.changes, { viewers: 50, revenue: 100, retention: 0 });
  assert.equal(result.hasData, true);
});

test('missing metrics do not fabricate retention or comparison percentages', () => {
  const empty = buildCreatorAnalytics([], new Date('2026-10-10T00:00:00Z'));
  assert.equal(empty.hasData, false);
  assert.equal(empty.summary.retention, null);
  assert.deepEqual(empty.changes, { viewers: null, revenue: null, retention: null });
});

test('analytics rejects anonymous and customer accounts and isolates creator metrics', async () => {
  const db = openDatabase(':memory:');
  try {
    for (const [id, type] of [[1, 'creator'], [2, 'creator'], [3, 'customer']]) {
      db.prepare('INSERT INTO customers(id,username,name,email,salt,hash,data) VALUES(?,?,?,?,?,?,?)')
        .run(id, `user${id}`, 'Test', 'test@example.test', 'salt', 'hash', JSON.stringify({ accountType: type }));
      const token = createHash('sha256').update(`token${id}`).digest('hex');
      db.prepare('INSERT INTO customer_sessions VALUES(?,?,?,?)').run(token, id, 'csrf', Date.now() + 60000);
    }
    const date = buildCreatorAnalytics([]).days.at(-1).date;
    db.prepare('INSERT INTO creator_daily_metrics(creator_id,date,viewers,revenue) VALUES(?,?,?,?)').run(1, date, 25, 10000);
    db.prepare('INSERT INTO creator_daily_metrics(creator_id,date,viewers,revenue) VALUES(?,?,?,?)').run(2, date, 999, 999999);
    const context = cookie => ({ db, req: { method: 'GET', headers: { cookie } }, send: (status, data) => ({ status, data }) });
    await assert.rejects(creatorAnalyticsController(context('')), { status: 401 });
    await assert.rejects(creatorAnalyticsController(context('orange_customer=token3')), { status: 403 });
    const response = await creatorAnalyticsController(context('orange_customer=token1'));
    assert.equal(response.status, 200);
    assert.equal(response.data.summary.viewers, 25);
    assert.equal(response.data.summary.revenue, 10000);
  } finally { db.close(); }
});
