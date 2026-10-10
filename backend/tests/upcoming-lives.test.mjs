import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getUpcomingLives } from '../../frontend/src/creator-dashboard/upcomingLives.mjs';

test('ten upcoming lives are ordered without changing the complete list', () => {
  const lives = Array.from({ length: 10 }, (_, i) => ({
    id: i, date: `2026-10-${String(30 - i).padStart(2, '0')}`,
    time: '20:00', status: '승인 대기',
  }));
  const result = getUpcomingLives(lives, Date.parse('2026-10-10T00:00:00+09:00'));
  assert.equal(result.length, 10);
  assert.deepEqual(result.slice(0, 3).map(live => live.id), [9, 8, 7]);
  assert.equal(lives[0].id, 0);
});

test('past, invalid and rejected lives are excluded using Korean time', () => {
  const lives = [
    { id: 'past', date: '2026-10-10', time: '19:59', status: '승인 완료' },
    { id: 'now', date: '2026-10-10', time: '20:00', status: '승인 완료' },
    { id: 'future', date: '2026-10-10', time: '21:00', status: '승인 대기' },
    { id: 'rejected', date: '2026-10-11', time: '20:00', status: '반려' },
    { id: 'invalid', date: '', time: '', status: '승인 대기' },
  ];
  assert.deepEqual(getUpcomingLives(lives, Date.parse('2026-10-10T11:00:00Z')).map(live => live.id), ['now', 'future']);
  assert.deepEqual(getUpcomingLives([], Date.now()), []);
});
