import nodemailer from 'nodemailer';
import {httpError} from '../utils/http.mjs';

// Credentials are server-only. Never return or log recovery messages or codes.
export function createRecoveryMailer(env = process.env) {
  if (!env.SMTP_HOST || !env.SMTP_FROM) return null;
  const port = Number(env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    ...(env.SMTP_USER ? {auth: {user: env.SMTP_USER, pass: env.SMTP_PASS}} : {}),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return async ({to, code, purpose}) => {
    try {
      await transport.sendMail({
        from: env.SMTP_FROM,
        to: {address: to, name: ''},
        subject: `[오렌지스토어] ${purpose === 'id' ? '아이디 찾기' : '비밀번호 재설정'} 인증번호`,
        text: `오렌지스토어 인증번호는 ${code}입니다.\n\n10분 이내에 입력해주세요. 인증번호를 다른 사람에게 알려주지 마세요.\n본인이 요청하지 않았다면 이 메일을 무시해주세요.`,
      });
    } catch {
      throw httpError(503, '인증 메일을 보낼 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };
}
