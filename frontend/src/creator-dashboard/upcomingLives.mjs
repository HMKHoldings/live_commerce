export function getUpcomingLives(lives, now = Date.now()) {
  return lives
    .map(live => ({ live, start: Date.parse(`${live.date}T${live.time}:00+09:00`) }))
    .filter(({ live, start }) =>
      Number.isFinite(start) && start >= now &&
      ['승인 완료', '승인 대기'].includes(live.status),
    )
    .sort((a, b) => a.start - b.start)
    .map(({ live }) => live);
}
