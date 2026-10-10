import { customerSession } from './customer.mjs';
import { httpError } from '../utils/http.mjs';
import { syncInstagramFollowers } from '../services/instagram.mjs';

export async function creatorSocialController({ req, db, send, json, limited }) {
  if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
  const session = customerSession(req, db);
  if (!session) throw httpError(401, '로그인이 필요합니다.');
  if (JSON.parse(session.data || '{}').accountType !== 'creator') throw httpError(403, '크리에이터 계정이 필요합니다.');
  if (req.headers['x-csrf-token'] !== session.csrf) throw httpError(403, 'Invalid session token');
  limited(`instagram:${session.user_id}`, 30);
  const input = await json();
  return send(200, await syncInstagramFollowers(db, session.user_id, input?.username));
}
