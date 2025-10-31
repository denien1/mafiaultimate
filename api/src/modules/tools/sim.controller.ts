
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../rbac';

function weightedChoice(entries: {weight:number, value:any}[]) {
  const total = entries.reduce((a,b)=>a+b.weight,0);
  let r = Math.random()*total;
  for (const e of entries) { if ((r -= e.weight) <= 0) return e.value; }
  return entries[entries.length-1].value;
}

@UseGuards(AdminGuard as any)
@Controller('admin/tools')
export class SimController {
  @Post('drop-sim')
  simulate(@Body() body: { loot: { item_id:number, weight:number }[], runs: number }) {
    const loot = (body.loot||[]).map(x=>({ value: x.item_id, weight: x.weight || 1 }));
    const runs = Math.max(1, Math.min(1000000, body.runs || 1000));
    const counts: Record<string, number> = {};
    for (let i=0;i<runs;i++) {
      const id = weightedChoice(loot);
      counts[id] = (counts[id]||0)+1;
    }
    return { runs, counts };
  }
}
