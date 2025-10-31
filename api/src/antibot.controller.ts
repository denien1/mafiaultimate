import { Controller, Post, Body } from '@nestjs/common';

@Controller('antibot')
export class AntiBotController {
  @Post('turnstile-verify')
  async verify(@Body() body: { token: string }) {
    if (!process.env.TURNSTILE_SECRET) return { ok: true, skipped: true };
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET, response: body.token })
    });
    const data = await res.json();
    return data;
  }
}
