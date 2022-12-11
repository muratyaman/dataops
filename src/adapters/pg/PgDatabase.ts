import { Pool, QueryResult } from 'pg';
import { IDatabase, ILogger, IRecord, IScalar } from '../../dataops';
import { PgRepo } from './PgRepo';
import { PgConfig } from './PgConfig';

export class PgDatabase implements IDatabase {

  pool?: Pool;

  constructor(public config: PgConfig, public logger: ILogger) {

  }

  async connect(): Promise<boolean> {
    const connectionString = this.config.URL;
    this.pool = new Pool({
      connectionString,
    });
    return Promise.resolve(true);
  }

  async disconnect(): Promise<boolean> {
    let result = false;
    try {
      if (this.pool) {
        await this.pool.end();
        result = true;
      }
    } catch (err) {
      console.error('PgDatabase.disconnect error', err);
    }
    return Promise.resolve(result);
  }

  async query<TRecord = IRecord>(command: string, params: IScalar[] = []): Promise<QueryResult<TRecord[]>> {
    if (this.pool) {
      return this.pool.query<TRecord[]>(command, params);
    }
    throw new Error('PgDatabase.query error: connect first');
  }

  async newRepo<TRowModel>(name: string): Promise<PgRepo<TRowModel>> {
    if (this.pool) {
      const repo = new PgRepo<TRowModel>(this, name);
      await repo.connect(this, name);
      return Promise.resolve(repo);
    }
    throw new Error('PgDatabase.newRepo error: connect first')
  }
}
