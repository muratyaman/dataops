import { Collection, Document } from 'mongodb';
import { IDatabase, IRepo, IRepoFindOptions } from '../../dataops';
import { MgDatabase } from './MgDatabase';

export class MgRepo<TRowModel> implements IRepo<TRowModel> {

  collection?: Collection;

  constructor(public db: MgDatabase, public name: string) {
    this.collection = db.collection(name);
  }

  async connect(db: IDatabase, name: string): Promise<boolean> {
    console.debug(db, name);
    return Promise.resolve(true);
  }

  coll(): Collection {
    if (this.collection) {
      return this.collection;
    }
    throw new Error('MgRepo.collection is null');
  }

  async findOne(options: IRepoFindOptions): Promise<TRowModel> {
    const coll = this.coll();
    const result = await coll.findOne<TRowModel>(options.filters);
    console.debug(result);
    if (result) return result as TRowModel;
    throw new Error('Record not found');
  }

  async findMany(options: IRepoFindOptions): Promise<TRowModel[]> {
    const coll = this.coll();
    const result = await coll.find(options.filters, {
      limit: options.limit ?? 10,
      skip: options.offset ?? 0,
    });
    console.debug(result);
    const rows = await result.toArray();
    return rows.map(r => r as TRowModel);
  }

  async insertOne(row: TRowModel): Promise<boolean> {
    const coll = this.coll();
    const result = await coll.insertOne(row as Document);
    if (result && result.insertedId) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async updateOne(_id: string, row: TRowModel): Promise<boolean> {
    const coll = this.coll();
    const result = await coll.updateOne({ _id }, { $set: row });
    if (result && result.modifiedCount) {
      return Promise.resolve(0 < result.modifiedCount);
    }
    return Promise.resolve(false);
  }

  async deleteOne(_id: string): Promise<boolean> {
    const coll = this.coll();
    const result = await coll.deleteOne({ _id });
    if (result && result.deletedCount) {
      return Promise.resolve(0 < result.deletedCount);
    }
    return Promise.resolve(false);
  }

}
