import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DbService } from '../../db.service';

function uid(auth?: string): string | null {
  if (!auth) return null;
  try {
    const token = auth.replace(/^Bearer\s+/i,'').trim();
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
    return payload.sub as string;
  } catch { return null; }
}

@Controller('store')
export class StoreController {
  constructor(private db: DbService) {}

  @Get()
  async list() {
    const { rows } = await this.db.query('SELECT id,name,price_soft,price_hard FROM items ORDER BY id');
    // present items as SKUs
    return { skus: rows.map(r => ({ id: r.id, name: r.name, priceSoft: r.price_soft, priceHard: r.price_hard })) };
  }

  @Post('purchase')
  async purchase(@Body() body: { itemId: number, currency: 'soft'|'hard' }, @Headers('authorization') auth?: string) {
    const userId = uid(auth);
    if (!userId) return { error: 'unauthorized' };
    const item = (await this.db.query('SELECT id,price_soft,price_hard FROM items WHERE id=$1',[body.itemId])).rows[0];
    if (!item) return { error: 'no-such-item' };
    if (body.currency === 'soft') {
      const res = await this.db.query('UPDATE profiles SET cash=cash-$1 WHERE user_id=$2 AND cash >= $1 RETURNING user_id',[item.price_soft, userId]);
      if (!res.rows.length) return { error: 'insufficient-funds' };
    } else {
      const res = await this.db.query('UPDATE profiles SET hard_currency=hard_currency-$1 WHERE user_id=$2 AND hard_currency >= $1 RETURNING user_id',[item.price_hard, userId]);
      if (!res.rows.length) return { error: 'insufficient-funds' };
    }
    await this.db.query('INSERT INTO inventory (user_id,item_id,qty) VALUES ($1,$2,1) ON CONFLICT (user_id,item_id) DO UPDATE SET qty=inventory.qty+1',[userId, item.id]);
    return { ok: true };
  }
}


import Stripe from 'stripe';
import * as crypto from 'crypto';
import { Req } from '@nestjs/common';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

@Controller('stripe')
export class StripeController {
  constructor(private db: DbService) {}

  @Post('create-checkout-session')
  async createSession(@Body() body: { itemId: number }, @Headers('authorization') auth?: string) {
    const userId = uid(auth);
    if (!userId) return { error: 'unauthorized' };
    const item = (await this.db.query('SELECT id,name,price_hard FROM items WHERE id=$1',[body.itemId])).rows[0];
    if (!item || item.price_hard <= 0) return { error: 'no-such-item' };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.price_hard * 100,
        },
        quantity: 1,
      }],
      success_url: (process.env.PUBLIC_WEB_URL || 'http://localhost:3000') + '/store?success=1',
      cancel_url: (process.env.PUBLIC_WEB_URL || 'http://localhost:3000') + '/store?canceled=1',
      metadata: { userId, itemId: String(item.id) },
    });
    return { id: session.id, url: session.url };
  }
}


@Post('portal')
async portal(@Headers('authorization') auth?: string) {
  const userId = uid(auth);
  if (!userId) return { error: 'unauthorized' };
  const u = (await this.db.query('SELECT email, stripe_customer_id FROM users WHERE id=$1',[userId])).rows[0];
  let cid = u?.stripe_customer_id;
  if (!cid) {
    const c = await stripe.customers.create({ email: u.email });
    cid = c.id;
    await this.db.query('UPDATE users SET stripe_customer_id=$1 WHERE id=$2',[cid, userId]);
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: cid,
    return_url: (process.env.PUBLIC_WEB_URL || 'http://localhost:3000') + '/store'
  });
  return { url: portal.url };
}
