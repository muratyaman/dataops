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

  async query<Record = IRecord>(command: string, params: IScalar[] = []): Promise<QueryResult<Record>> {
    if (this.pool) {
      return this.pool.query<Record>(command, params);
    }
    throw new Error('PgDatabase.query error: connect first');
  }

  async newRepo<RowModel>(name: string): Promise<PgRepo<RowModel>> {
    if (this.pool) {
      const repo = new PgRepo<RowModel>(this, name);
      await repo.connect(this, name);
      return Promise.resolve(repo);
    }
    throw new Error('PgDatabase.newRepo error: connect first')
  }
}
