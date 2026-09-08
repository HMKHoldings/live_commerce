# Account recovery email setup

The login page now offers ID lookup and password reset. Both require a one-time email code. No code or recovered account identity is returned before verification.

## Configure delivery

Add these values to the ignored `.env.server` file (see `.env.server.example`):

```dotenv
SMTP_HOST=smtp.your-provider.example
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=Orange Store <support@your-domain.example>
```

Use credentials and an authorized sender supplied by your mail provider. Do not put secrets in `VITE_*` variables or commit them. Port 587 requires STARTTLS; port 465 uses TLS immediately. Restart the backend with `npm run server` after setting these values.

If SMTP_HOST or SMTP_FROM is absent, requests return a clear unavailable-service error. There is no fake-success fallback and no development code printed to logs or returned by the API. SMTP configuration follows the [Nodemailer SMTP documentation](https://nodemailer.com/smtp).

## User flow

- ID lookup: registered email, then six-digit code, then select a recovered ID to prefill login.
- Password reset: registered ID and email, then code and matching new password (12–128 characters), then login with the new password.
- Codes expire after 10 minutes and allow at most five attempts. Request rate limits apply per IP and email. Successful reset revokes existing customer sessions and pending password reset codes.
- Email/code delivery in automated tests is replaced with an in-memory test mailbox. No real emails are sent by tests.

## Validation

Run `npm run build` and `npm run test:server`. For a live delivery check after SMTP configuration, use an account and mailbox you control and submit the form yourself. Real email delivery requires working SMTP credentials and has not been validated by the automated tests.
