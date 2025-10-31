
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { AdminGuard } from '../../rbac';
import { exec } from 'child_process';

const configDir = process.env.EVENTS_DIR || path.join(process.cwd(), '..', 'config', 'events');

@UseGuards(AdminGuard as any)
@Controller('admin/liveops/files')
export class LiveOpsEditorController {
  private listFiles(): string[] {
    if (!fs.existsSync(configDir)) return [];
    return fs.readdirSync(configDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  }

  @Get()
  list() { return { files: this.listFiles() }; }

  @Get(':name')
  read(@Param('name') name: string) {
    const full = path.join(configDir, name);
    if (!full.startsWith(configDir)) return { error: 'bad-path' };
    const content = fs.existsSync(full) ? fs.readFileSync(full,'utf8') : '';
    return { name, content };
  }

  @Post(':name')
  save(@Param('name') name: string, @Body() body: { content: string, message?: string }) {
    const full = path.join(configDir, name);
    if (!full.startsWith(configDir)) return { error: 'bad-path' };
    try { yaml.load(body.content); } catch (e: any) { return { error: 'yaml-invalid', detail: e.message }; }
    fs.writeFileSync(full, body.content, 'utf8');
    if (process.env.GIT_AUTOCOMMIT === '1') {
      exec(`git add ${full} && git commit -m ${JSON.stringify(body.message || 'Update event YAML')}`, { cwd: process.cwd() }, (err) => {
        if (err) console.warn('git commit failed', err.message);
      });
    }
    return { ok: true };
  }
}
