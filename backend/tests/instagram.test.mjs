import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { openDatabase } from '../models/database.mjs';
import { instagramUsername, syncInstagramFollowers } from '../services/instagram.mjs';
import { creatorSocialController } from '../controllers/creator-social.mjs';

const env = { INSTAGRAM_ACCESS_TOKEN: 'test-token', INSTAGRAM_BUSINESS_ACCOUNT_ID: '123', INSTAGRAM_GRAPH_VERSION: 'v99.0' };
function database() {
  const db = openDatabase(':memory:');
  for (const id of [1, 2]) {
    db.prepare('INSERT INTO customers(id,username,name,email,salt,hash,data) VALUES(?,?,?,?,?,?,?)')
      .run(id, `creator${id}`, 'Test', 'test@example.test', 'salt', 'hash', JSON.stringify({ accountType: id === 1 ? 'creator' : 'customer' }));
    db.prepare('INSERT INTO customer_sessions VALUES(?,?,?,?)').run(createHash('sha256').update(`token${id}`).digest('hex'), id, 'csrf', Date.now() + 60000);
  }
  return db;
}

test('Instagram names normalize and reject query injection and profile URLs', () => {
  assert.equal(instagramUsername(' @Example.Name '), 'example.name');
  for (const name of ['', 'https://instagram.com/example', 'foo){id}', 'a'.repeat(31)]) {
    assert.throws(() => instagramUsername(name), { status: 400 });
  }
});

test('missing configuration returns no fake followers and never calls provider', async () => {
  const db = database();
  try {
    const data = await syncInstagramFollowers(db, 1, '@example', { env: {}, fetchImpl: () => assert.fail('unexpected fetch') });
    assert.equal(data.configured, false);
    assert.equal(data.followers, null);
    assert.equal(data.growth, null);
  } finally { db.close(); }
});

test('real provider response is stored, cached, and compared only to the same creator/account history', async () => {
  const db = database();
  const now = Date.parse('2026-10-10T04:00:00Z');
  let calls = 0;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(url.hostname, 'graph.facebook.com');
    assert.equal(url.searchParams.get('fields'), 'business_discovery.username(example){id,username,followers_count}');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return { ok: true, json: async () => ({ business_discovery: { id: '456', username: 'example', followers_count: 120 } }) };
  };
  try {
    const first = await syncInstagramFollowers(db, 1, '@example', { env, fetchImpl, now });
    assert.equal(first.followers, 120);
    assert.equal(first.growth, null);
    await syncInstagramFollowers(db, 1, 'example', { env, fetchImpl, now: now + 60000 });
    assert.equal(calls, 1);
    db.prepare('INSERT INTO creator_social_snapshots VALUES(?,?,?,?,?,?)').run(1, '456', 'old.name', '2026-09-09', 100, now - 31 * 86400000);
    db.prepare('INSERT INTO creator_social_snapshots VALUES(?,?,?,?,?,?)').run(2, '456', 'example', '2026-09-10', 1, now - 30 * 86400000);
    const next = await syncInstagramFollowers(db, 1, 'example', { env, fetchImpl, now: now + 16 * 60000 });
    assert.equal(next.growth, 20);
    assert.equal(next.baselineDate, '2026-09-09');
    assert.equal(db.prepare('SELECT count(*) AS n FROM creator_social_snapshots WHERE creator_id=1 AND day=?').get('2026-10-10').n, 1);
    const otherAccount = await syncInstagramFollowers(db, 1, 'other', { env, now, fetchImpl: async () => ({ ok: true, json: async () => ({ business_discovery: { id: '789', username: 'other', followers_count: 5 } }) }) });
    assert.equal(otherAccount.growth, null);
  } finally { db.close(); }
});

test('provider failures and malformed metrics never become zero follower snapshots', async () => {
  const db = database();
  try {
    await assert.rejects(syncInstagramFollowers(db, 1, 'example', { env, fetchImpl: async () => ({ ok: false, json: async () => ({ error: { message: 'secret provider text' } }) }) }), { status: 502 });
    await assert.rejects(syncInstagramFollowers(db, 1, 'example', { env, fetchImpl: async () => ({ ok: true, json: async () => ({ business_discovery: { id: '456', username: 'example', followers_count: -1 } }) }) }), { status: 422 });
    assert.equal(db.prepare('SELECT count(*) AS n FROM creator_social_snapshots').get().n, 0);
  } finally { db.close(); }
});

test('social endpoint requires creator authentication and CSRF', async () => {
  const db = database();
  try {
    const context = (cookie, csrf) => ({ db, req: { method: 'POST', headers: { cookie, 'x-csrf-token': csrf } }, limited() {}, json: async () => ({ username: 'example' }), send() {} });
    await assert.rejects(creatorSocialController(context('', 'csrf')), { status: 401 });
    await assert.rejects(creatorSocialController(context('orange_customer=token2', 'csrf')), { status: 403 });
    await assert.rejects(creatorSocialController(context('orange_customer=token1', 'wrong')), { status: 403 });
  } finally { db.close(); }
});
