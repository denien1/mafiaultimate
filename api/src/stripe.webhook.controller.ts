import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { DbService } from './db.service';

@Controller('stripe')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
  constructor(private db: DbService) {}

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string || '';
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent((req as any).rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId!;
      const itemId = Number(session.metadata?.itemId || 0);
      if (userId && itemId) {
        // grant item to inventory and bonus hard currency
        await this.db.query('INSERT INTO inventory (user_id,item_id,qty) VALUES ($1,$2,1) ON CONFLICT (user_id,item_id) DO UPDATE SET qty=inventory.qty+1',[userId,itemId]);
        await this.db.query('UPDATE profiles SET hard_currency=hard_currency+1 WHERE user_id=$1',[userId]);
      }
    }
    res.json({ received: true });
  }
}
