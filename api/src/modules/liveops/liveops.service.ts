import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface LiveEvent {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  jobs?: any[];
  loot_tables?: Record<string, any[]>;
}

@Injectable()
export class LiveOpsService {
  events: LiveEvent[] = [];
  configDir = process.env.EVENTS_DIR || path.join(process.cwd(), '..', 'config', 'events');
  constructor() {
    this.reload();
  }
  reload() {
    this.events = [];
    if (!fs.existsSync(this.configDir)) return;
    for (const f of fs.readdirSync(this.configDir)) {
      if (!f.endsWith('.yaml') && !f.endsWith('.yml')) continue;
      const full = path.join(this.configDir, f);
      const doc = yaml.load(fs.readFileSync(full, 'utf8')) as LiveEvent;
      if (doc?.id) this.events.push(doc);
    }
  }
  active(now = new Date()) {
    return this.events.filter(e => new Date(e.starts_at) <= now && now <= new Date(e.ends_at));
  }
  all() { return this.events; }
}
