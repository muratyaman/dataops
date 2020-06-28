import { MongoClient, Db, Collection } from 'mongodb';
import { IDatabase, ILogger } from '../../dataops';
import { MgConfig } from './MgConfig';
import { MgRepo } from './MgRepo';

export class MgDatabase implements IDatabase {

  client?: MongoClient;
  db?: Db;

  constructor(public config: MgConfig, public logger: ILogger) {

  }

  async connect(): Promise<boolean> {
    const dbUrl = this.config.URL;
    const dbName = this.config.DB_NAME;
    const dbOptions = { useNewUrlParser: true };
    try {
      this.client = await MongoClient.connect(dbUrl, dbOptions);
      this.db = this.client.db(dbName);
    } catch (err) {
      console.error('MgDatabase.connect error', err);
    }
    return Promise.resolve(true);
  }

  async disconnect(): Promise<boolean> {
    let result = false;
    try {
      if (this.client) {
        await this.client.close();
        result = true;
      }
    } catch (err) {
      console.error('MgDatabase.disconnect error', err);
    }
    return Promise.resolve(result);
  }

  collection(name: string): Collection {
    if (this.db) {
      return this.db.collection(name);
    }
    throw new Error('MgDatabase.collection error: connect to a database first');
  }

  newRepo<RowModel>(name: string): Promise<MgRepo<RowModel>> {
    if (this.db) {
      const repo = new MgRepo<RowModel>(this, name);
      return Promise.resolve(repo);
    }
    throw new Error('MgDatabase.newRepo error: connect first');
  }
}
