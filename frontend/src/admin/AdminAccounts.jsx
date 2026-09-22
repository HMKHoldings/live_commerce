import React, {useState} from 'react';
import {api} from '../api/storeApi';
import './admin-accounts.css';

export default function AdminAccounts({rows,loaded,currentUser,onReload}) {
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [editing,setEditing]=useState(null);
  const [newPassword,setNewPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const run=async (work,success)=>{
    setBusy(true);setError('');setMessage('');
    try { await work(); setMessage(success); await onReload(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const create=event=>{event.preventDefault();run(async()=>{
    await api('/admin/accounts',{method:'POST',body:{username,password}});
    setUsername('');setPassword('');
  },'관리자 계정이 추가되었습니다.');};
  const reset=event=>{event.preventDefault();if(!confirm(`${editing.username} 계정의 비밀번호를 변경하시겠습니까?`))return;run(async()=>{
    await api(`/admin/accounts/${editing.id}`,{method:'PUT',body:{password:newPassword}});
    setEditing(null);setNewPassword('');
  },'비밀번호가 변경되었습니다.');};
  const remove=row=>{if(!confirm(`${row.username} 관리자 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`))return;run(()=>api(`/admin/accounts/${row.id}`,{method:'DELETE',body:{}}),'관리자 계정이 삭제되었습니다.');};
  return <section className="admin-accounts">
    <div className="admin-accounts-card"><div className="admin-accounts-heading"><h2>관리자 계정</h2><p>관리자 계정을 추가하고 비밀번호를 변경하거나 계정을 삭제할 수 있습니다.</p></div>
      {error&&<p role="alert" className="admin-accounts-error">{error}</p>}{message&&<p role="status" className="admin-accounts-success">{message}</p>}
      <div className="admin-accounts-table-wrap"><table><thead><tr><th>아이디</th><th>상태</th><th>관리</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.username}</strong></td><td>{row.id===currentUser.id?'현재 계정':'관리자'}</td><td><div className="admin-accounts-actions"><button type="button" onClick={()=>{setEditing(row);setNewPassword('');setError('');}} disabled={busy}>비밀번호 변경</button><button type="button" className="danger" onClick={()=>remove(row)} disabled={busy||row.id===currentUser.id}>삭제</button></div></td></tr>)}</tbody></table>{!loaded&&<p className="admin-accounts-empty">불러오는 중…</p>}{loaded&&!rows.length&&<p className="admin-accounts-empty">관리자 계정이 없습니다.</p>}</div>
    </div>
    <div className="admin-accounts-card"><div className="admin-accounts-heading"><h2>새 관리자 추가</h2><p>새 계정은 저장 즉시 관리자 권한으로 로그인할 수 있습니다.</p></div><form className="admin-accounts-form" onSubmit={create}><label>아이디<input value={username} onChange={event=>setUsername(event.target.value)} minLength={3} maxLength={100} pattern="[a-zA-Z0-9@._-]+" autoComplete="off" required /></label><label>비밀번호<input type="password" value={password} onChange={event=>setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required /></label><button className="admin-primary" disabled={busy}>관리자 추가</button></form></div>
    {editing&&<div className="admin-accounts-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)setEditing(null);}}><section className="admin-accounts-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-password-title"><h2 id="admin-password-title">{editing.username} 비밀번호 변경</h2><p>새 비밀번호를 입력하세요. 다른 기기의 로그인은 해제됩니다.</p><form className="admin-accounts-form" onSubmit={reset}><label>새 비밀번호<input type="password" value={newPassword} onChange={event=>setNewPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" autoFocus required /></label><div className="admin-accounts-actions"><button type="button" onClick={()=>setEditing(null)} disabled={busy}>취소</button><button className="admin-primary" disabled={busy}>변경하기</button></div></form></section></div>}
  </section>;
}