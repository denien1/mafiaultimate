import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService {
  public pool: Pool;
  constructor() {
    const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mafia';
    this.pool = new Pool({ connectionString: url });
  }
  async query<T=any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
    return this.pool.query(text, params);
  }
}
