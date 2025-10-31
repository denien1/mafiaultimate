import { Controller, Post, Body } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DbService } from '../../db.service';

@Controller('auth')
export class AuthController {
  constructor(private db: DbService) {}

  @Post('dev-login')
  async devLogin(@Body() body: { email: string; displayName?: string }) {
    const email = body.email?.toLowerCase();
    if (!email) return { error: 'email required' };
    const secret = process.env.JWT_SECRET || 'dev';
    // ensure user exists
    const existing = await this.db.query('SELECT * FROM users WHERE email=$1',[email]);
    let userId: string;
    if (existing.rows.length) {
      userId = existing.rows[0].id;
    } else {
      const ins = await this.db.query('INSERT INTO users (email, display_name) VALUES ($1,$2) RETURNING id',[email, body.displayName || null]);
      userId = ins.rows[0].id;
      await this.db.query('INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',[userId]);
      await this.db.query('INSERT INTO stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',[userId]);
    }
    const token = jwt.sign({ sub: userId, email }, secret, { expiresIn: '7d' });
    return { token };
  }
}


import crypto from 'crypto';

async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to, subject, html })
    });
    if (!res.ok) console.warn('Resend failed', await res.text());
  } else if (process.env.SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ personalizations:[{ to:[{ email: to }] }], from:{ email: process.env.EMAIL_FROM || 'no-reply@example.com' }, subject, content:[{ type:'text/html', value: html }] })
    });
    if (!res.ok) console.warn('SendGrid failed', await res.text());
  } else {
    console.log('No email provider set. Magic link:', html);
  }
}

@Controller('auth')
export class MagicLinkController {
  constructor(private db: DbService) {}

  @Post('request-magic')
  async requestMagic(@Body() body: { email: string }) {
    const email = body.email?.toLowerCase();
    if (!email) return { error: 'email required' };
    const token = crypto.randomBytes(24).toString('hex');
    await this.db.query('INSERT INTO login_tokens (token,email) VALUES ($1,$2)', [token, email]);
    const url = (process.env.PUBLIC_WEB_URL || 'http://localhost:3000') + '/login/magic?token=' + token;
    await sendEmail(email, 'Your sign-in link', `<p>Click to sign in: <a href="${url}">${url}</a></p>`);
    return { ok: true };
  }

  @Post('consume-magic')
  async consumeMagic(@Body() body: { token: string }) {
    const t = (await this.db.query('SELECT * FROM login_tokens WHERE token=$1 AND used_at IS NULL AND created_at > now() - interval '30 minutes'',[body.token])).rows[0];
    if (!t) return { error: 'invalid-or-expired' };
    await this.db.query('UPDATE login_tokens SET used_at=now() WHERE token=$1',[body.token]);
    // ensure user exists
    const existing = await this.db.query('SELECT id FROM users WHERE email=$1',[t.email]);
    let userId: string;
    if (existing.rows.length) userId = existing.rows[0].id;
    else {
      const ins = await this.db.query('INSERT INTO users (email) VALUES ($1) RETURNING id',[t.email]);
      userId = ins.rows[0].id;
      await this.db.query('INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',[userId]);
      await this.db.query('INSERT INTO stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',[userId]);
    }
    const tokenJwt = (jwt as any).sign({ sub: userId, email: t.email }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    return { token: tokenJwt };
  }
}
