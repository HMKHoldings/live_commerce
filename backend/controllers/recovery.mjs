import {randomBytes, randomInt, createHash, scrypt} from 'node:crypto';
import {promisify} from 'node:util';
import {httpError} from '../utils/http.mjs';
const derive = promisify(scrypt);
const hash = value => createHash('sha256').update(value).digest('hex');
const invalidCode = () => httpError(400, '인증번호가 올바르지 않거나 만료되었습니다. 새 인증번호를 요청해주세요.');

export async function recoveryController({req, path, json, send, db, limited, recoveryMailer}) {
  if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
  const input = await json();
  if (!input || typeof input !== 'object') throw httpError(400, '입력 정보를 확인해주세요.');
  const ip = req.socket.remoteAddress;
  if (path === '/api/customer/recovery/request') {
    limited(`recovery-request:${ip}`, 6);
    if (!['id', 'password'].includes(input.purpose) || typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
      throw httpError(400, '올바른 이메일을 입력해주세요.');
    const email = input.email.trim().toLowerCase();
    const identity = input.username;
    if (input.purpose === 'password' && (typeof identity !== 'string' || !identity.trim() || identity.length > 60))
      throw httpError(400, '아이디를 확인해주세요.');
    limited(`recovery-email:${hash(email)}`, 3);
    if (!recoveryMailer) throw httpError(503, '이메일 인증 서비스를 연결 중입니다. 고객센터로 문의해주세요.');
    const users = input.purpose === 'id'
      ? db.prepare('SELECT id FROM customers WHERE lower(email)=?').all(email)
      : db.prepare('SELECT id FROM customers WHERE lower(email)=? AND username=? COLLATE NOCASE').all(email, identity.trim());
    const challenge = randomBytes(32).toString('hex');
    const code = String(randomInt(0, 1000000)).padStart(6, '0');
    db.prepare('DELETE FROM customer_recovery WHERE expires<?').run(Date.now());
    db.prepare('INSERT INTO customer_recovery(id,purpose,user_ids,code_hash,expires,attempts) VALUES(?,?,?,?,?,0)')
      .run(challenge, input.purpose, JSON.stringify(users.map(u => u.id)), hash(challenge + ':' + code), Date.now() + 10 * 60000);
    if (users.length) {
      try { await recoveryMailer({to: email, code, purpose: input.purpose}); }
      catch (error) { db.prepare('DELETE FROM customer_recovery WHERE id=?').run(challenge); throw error; }
    }
    // Same response for unknown accounts: no names, IDs or codes are exposed here.
    return send(200, {challenge, expiresIn: 600, message: '입력한 정보와 일치하는 계정이 있으면 인증번호를 보내드립니다. 메일함과 스팸함을 확인해주세요.'});
  }
  if (path !== '/api/customer/recovery/complete') throw httpError(404, 'Not found');
  limited(`recovery-complete:${ip}`, 15);
  if (typeof input.challenge !== 'string' || !/^[a-f0-9]{64}$/.test(input.challenge) || typeof input.code !== 'string' || !/^\d{6}$/.test(input.code)) throw invalidCode();
  const record = db.prepare('SELECT * FROM customer_recovery WHERE id=?').get(input.challenge);
  if (!record || record.expires <= Date.now() || record.attempts >= 5) throw invalidCode();
  db.prepare('UPDATE customer_recovery SET attempts=attempts+1 WHERE id=?').run(record.id);
  const ids = JSON.parse(record.user_ids);
  if (record.code_hash !== hash(record.id + ':' + input.code) || !ids.length) throw invalidCode();
  if (record.purpose === 'id') {
    db.prepare('DELETE FROM customer_recovery WHERE id=?').run(record.id);
    const usernames = ids.map(id => db.prepare('SELECT username FROM customers WHERE id=?').get(id)?.username).filter(Boolean);
    return send(200, {usernames});
  }
  if (typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 128)
    throw httpError(400, '새 비밀번호는 12~128자로 입력해주세요.');
  const salt = randomBytes(24).toString('hex');
  const passwordHash = (await derive(input.password, salt, 64)).toString('hex');
  db.exec('BEGIN IMMEDIATE');
  try {
    // Recheck after asynchronous hashing: only one concurrent request can consume a code.
    const consumed = db.prepare('DELETE FROM customer_recovery WHERE id=? AND expires>? AND attempts<=5').run(record.id, Date.now());
    if (!consumed.changes) throw invalidCode();
    db.prepare('UPDATE customers SET salt=?,hash=? WHERE id=?').run(salt, passwordHash, ids[0]);
    db.prepare('DELETE FROM customer_sessions WHERE user_id=?').run(ids[0]);
    const pending = db.prepare("SELECT id,user_ids FROM customer_recovery WHERE purpose='password'").all();
    for (const item of pending) if (JSON.parse(item.user_ids).includes(ids[0])) db.prepare('DELETE FROM customer_recovery WHERE id=?').run(item.id);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  return send(200, {ok: true});
}
