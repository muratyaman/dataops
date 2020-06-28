export type IScalar = string | number | boolean;

export interface IConfig {
  [key: string]: IScalar;
}

export type IRecord = Record<string, IScalar>;

export interface IDatabase {
  config: IConfig;
  logger: ILogger;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  newRepo: <RowModel>(name: string) => Promise<IRepo<RowModel>>;
}

export type IKeyValuePairs = IRecord;

export const OP_EQ  = '$eq';
export const OP_NE  = '$ne';
export const OP_GT  = '$gt';
export const OP_GTE = '$gte';
export const OP_LT  = '$lt';
export const OP_LTE = '$lte';
export const OP_IN  = '$in';
export const OP_NIN = '$nin';

export interface IFilterOpEq  { [OP_EQ]:  IScalar; }
export interface IFilterOpNe  { [OP_NE]:  IScalar; }
export interface IFilterOpGt  { [OP_GT]:  IScalar; }
export interface IFilterOpGte { [OP_GTE]: IScalar; }
export interface IFilterOpLt  { [OP_LT]:  IScalar; }
export interface IFilterOpLte { [OP_LTE]: IScalar; }
export interface IFilterOpIn  { [OP_IN]:  IScalar[]; }
export interface IFilterOpNin { [OP_NIN]: IScalar[]; }

export type IFilterOp = IFilterOpEq | IFilterOpNe | IFilterOpGt | IFilterOpGte | IFilterOpLt | IFilterOpLte | IFilterOpIn | IFilterOpNin;
export interface IFilter {
  [field: string]: IFilterOp;
}
export type IFilters = IKeyValuePairs | IFilter[];
export interface IFilterAnd {
  $and: IFilterList;
}
export interface IFilterOr {
  $or: IFilterList;
}
export type IFilterList = IFilterAnd | IFilterOr | IFilters;
export interface IRepoFindOptions {
  filters: IFilterList;
  limit?: number;
  offset?: number;
}

export interface IRepo<Row> {
  connect(db: IDatabase, name: string): Promise<boolean>;
  findOne(options: IRepoFindOptions): Promise<Row>;
  findMany(options: IRepoFindOptions): Promise<Row[]>;
  insertOne(row: Row): Promise<boolean>;
  updateOne(id: string, row: Row): Promise<boolean>;
  deleteOne(id: string): Promise<boolean>;
}

export interface ILogger {
  log:   (msg: unknown) => Promise<void>;
  debug: (msg: unknown) => Promise<void>;
  info:  (msg: unknown) => Promise<void>;
  warn:  (msg: unknown) => Promise<void>;
  error: (msg: unknown) => Promise<void>;
}
