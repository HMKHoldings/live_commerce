import React, {useEffect, useState} from 'react';
import {ArrowLeft, CheckCircle2, Eye, EyeOff, Mail} from 'lucide-react';
import {api} from '../api/storeApi';

export default function AccountRecovery({mode, onMode, onBack, onChooseUsername}) {
  const [stage, setStage] = useState('request');
  const [identity, setIdentity] = useState('');
  const [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [usernames, setUsernames] = useState([]);
  const isId = mode === 'id';
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();const timer = setInterval(tick, 1000);return () => clearInterval(timer);
  }, [deadline]);

  async function requestCode(event) {
    event?.preventDefault();if (busy) return;
    setBusy(true);setError('');setMessage('');
    try {
      const result = await api('/customer/recovery/request', {method: 'POST', body: {
        purpose: mode, email: email.trim(), ...(!isId ? {username: identity.trim()} : {}),
      }});
      setChallenge(result.challenge);setCode('');setDeadline(Date.now() + result.expiresIn * 1000);
      setRemaining(result.expiresIn);setMessage(result.message);setStage('verify');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function complete(event) {
    event.preventDefault();if (busy) return;
    if (!isId && password !== confirmation) {setError('비밀번호가 일치하지 않습니다.');return;}
    setBusy(true);setError('');
    try {
      const result = await api('/customer/recovery/complete', {method: 'POST', body: {challenge, code, ...(!isId ? {password} : {})}});
      setUsernames(result.usernames || []);setPassword('');setConfirmation('');setCode('');setDeadline(0);setStage('done');
    } catch (failure) {setError(failure.message);}
    finally {setBusy(false);}
  }
  return <main className="login-page recovery-page">
    <button className="recovery-back" onClick={onBack} disabled={busy}><ArrowLeft size={17}/> 로그인으로 돌아가기</button>
    <h1>{isId ? '아이디 찾기' : '비밀번호 찾기'}</h1>
    <div className="recovery-tabs" aria-label="계정 찾기">
      <button aria-pressed={isId} onClick={() => onMode('id')} disabled={busy}>아이디 찾기</button>
      <button aria-pressed={!isId} onClick={() => onMode('password')} disabled={busy}>비밀번호 찾기</button>
    </div>
    {stage === 'done' ? <div className="recovery-success" role="status">
      <CheckCircle2 size={42}/><h2>{isId ? '아이디를 찾았습니다.' : '비밀번호가 변경되었습니다.'}</h2>
      {isId ? <><p>로그인할 아이디를 선택해주세요.</p><div className="recovery-ids">{usernames.map(username => <button key={username} onClick={() => onChooseUsername(username)}>{username}<span>로그인 →</span></button>)}</div></> : <><p>새 비밀번호로 다시 로그인해주세요.</p><button className="login-submit" onClick={onBack}>로그인하기</button></>}
    </div> : <>
      <p className="recovery-description">{stage === 'request' ? (isId ? '가입하신 이메일로 아이디를 찾을 수 있습니다.' : '가입하신 아이디와 이메일을 확인한 후 새 비밀번호를 설정합니다.') : '이메일로 받은 인증번호 6자리를 입력해주세요.'}</p>
      {stage === 'request' ? <form onSubmit={requestCode} aria-busy={busy}>
        {!isId && <label className="recovery-field">아이디<input autoFocus name="identity" value={identity} onChange={event => setIdentity(event.target.value)} autoComplete="username" placeholder="가입하신 아이디" required maxLength={30} disabled={busy}/></label>}
        <label className="recovery-field">이메일<input autoFocus={isId} type="email" name="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="가입하신 이메일 주소" required maxLength={254} disabled={busy}/></label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="login-submit" disabled={busy}>{busy ? '요청 중…' : '인증번호 받기'}</button>
      </form> : <form onSubmit={complete} aria-busy={busy}>
        <div className="recovery-email"><Mail size={20}/><span>{email}</span><button type="button" disabled={busy} onClick={() => {setStage('request');setError('');setMessage('');setDeadline(0);}}>변경</button></div>
        {message && <p className="login-help" role="status">{message}</p>}
        <label className="recovery-field">인증번호<div className="recovery-code"><input autoFocus name="code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} pattern="[0-9]{6}" minLength={6} maxLength={6} placeholder="6자리 숫자" required disabled={busy}/><span aria-label="인증번호 남은 시간">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2,'0')}</span></div></label>
        {!remaining && <p className="login-error" role="status">인증번호가 만료되었습니다. 다시 요청해주세요.</p>}
        <button type="button" className="recovery-resend" disabled={busy || remaining > 540} onClick={requestCode}>{remaining > 540 ? `${remaining - 540}초 후 재전송 가능` : '인증번호 다시 받기'}</button>
        {!isId && <><label className="recovery-field">새 비밀번호<div className="recovery-password"><input name="new-password" type={visible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="12자 이상 입력" required minLength={12} maxLength={128} disabled={busy}/><button type="button" aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label><label className="recovery-field">새 비밀번호 확인<input name="confirmation" type={visible ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={12} maxLength={128} placeholder="새 비밀번호를 다시 입력" disabled={busy}/></label></>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="login-submit" disabled={busy || !remaining}>{busy ? '확인 중…' : isId ? '아이디 확인' : '비밀번호 변경'}</button>
      </form>}
    </>}
  </main>;
}
