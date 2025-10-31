
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DbService } from '../../db.service';
import { AdminGuard } from '../../rbac';

@UseGuards(AdminGuard as any)
@Controller('admin/editor')
export class EditorController {
  constructor(private db: DbService) {}

  @Get('jobs')
  async jobs() { return (await this.db.query('SELECT * FROM jobs ORDER BY id')).rows; }

  @Post('jobs')
  async createJob(@Body() b: any) {
    const r = await this.db.query('INSERT INTO jobs (name,tier,energy_cost,reward_xp,reward_cash,req_items) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [b.name, b.tier||1, b.energy_cost||1, b.reward_xp||1, b.reward_cash||0, b.req_items||'[]']);
    return r.rows[0];
  }

  @Put('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() b: any) {
    const r = await this.db.query('UPDATE jobs SET name=$1,tier=$2,energy_cost=$3,reward_xp=$4,reward_cash=$5,req_items=$6 WHERE id=$7 RETURNING *',
      [b.name, b.tier, b.energy_cost, b.reward_xp, b.reward_cash, b.req_items, id]);
    return r.rows[0];
  }

  @Delete('jobs/:id')
  async delJob(@Param('id') id: string) {
    await this.db.query('DELETE FROM jobs WHERE id=$1',[id]);
    return { ok: true };
  }

  @Get('items')
  async items() { return (await this.db.query('SELECT * FROM items ORDER BY id')).rows; }

  @Post('items')
  async createItem(@Body() b: any) {
    const r = await this.db.query('INSERT INTO items (name, slot, rarity, attack_boost, defense_boost, price_soft, price_hard, product_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [b.name, b.slot, b.rarity, b.attack_boost||0, b.defense_boost||0, b.price_soft||0, b.price_hard||0, b.product_id||null]);
    return r.rows[0];
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() b: any) {
    const r = await this.db.query('UPDATE items SET name=$1,slot=$2,rarity=$3,attack_boost=$4,defense_boost=$5,price_soft=$6,price_hard=$7,product_id=$8 WHERE id=$9 RETURNING *',
      [b.name, b.slot, b.rarity, b.attack_boost, b.defense_boost, b.price_soft, b.price_hard, b.product_id, id]);
    return r.rows[0];
  }

  @Delete('items/:id')
  async delItem(@Param('id') id: string) {
    await this.db.query('DELETE FROM items WHERE id=$1',[id]);
    return { ok: true };
  }
}
