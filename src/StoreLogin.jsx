import React, { useState } from 'react';
import { api, API_ENABLED, setCsrf } from './storeApi';

export default function StoreLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function login(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!API_ENABLED) {
      setError('로그인 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const session = await api('/customer/login', {
        method: 'POST',
        body: { username: form.get('username').trim(), password: form.get('password') },
      });
      setCsrf(session.csrf);
      window.location.assign(`${import.meta.env.BASE_URL}mypage.html`);
    } catch (failure) {
      setError(failure.status === 401
        ? '아이디 또는 비밀번호를 확인해주세요.'
        : failure.status === 429
          ? '로그인 시도가 많습니다. 잠시 후 다시 시도해주세요.'
          : '로그인할 수 없습니다. 서버 연결을 확인하고 다시 시도해주세요.');
      setBusy(false);
    }
  }

  return (
    <form className="login-form" onSubmit={login} aria-busy={busy}>
      <label>아이디
        <input name="username" autoComplete="username" placeholder="아이디를 입력해주세요" required disabled={busy} />
      </label>
      <label>비밀번호
        <input name="password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력해주세요" required disabled={busy} />
      </label>
      {error && <p role="alert" style={{ color: '#c53320', margin: 0 }}>{error}</p>}
      <button className="primary" disabled={busy}>{busy ? '로그인 중…' : '로그인'}</button>
      <small hidden>관리자 계정으로 로그인하면 관리자 센터로 이동합니다.</small>
    </form>
  );
}
