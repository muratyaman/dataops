import { QueryResult } from 'pg';
import { PgDatabase } from './PgDatabase';
import {
  IDatabase,
  IFilterList,
  IRepo,
  IRepoFindOptions,
  IScalar,
  OP_EQ, OP_GT, OP_GTE, OP_IN,
  OP_LT, OP_LTE, OP_NE, OP_NIN
} from '../../dataops';

function opsFun(op: string, f: string, v: IScalar[]): string {
  switch (op) {
    case OP_EQ:
      return f + '=' + v[0];
    case OP_NE:
      return f + '<>' + v[0];
    case OP_GT:
      return f + '>' + v[0];
    case OP_GTE:
      return f + '>=' + v[0];
    case OP_LT:
      return f + '<' + v[0];
    case OP_LTE:
      return f + '<=' + v[0];
    case OP_IN:
      return f + ' IN (' + v.join(', ') + ')';
    case OP_NIN:
      return f + ' NOT IN (' + v.join(', ') + ')';
  }
  throw new Error('Unknown operator ' + op);
}

export class PgRepo<RowModel> implements IRepo<RowModel> {

  constructor(public db: PgDatabase, public name: string) {

  }

  async connect(db: IDatabase, name: string): Promise<boolean> {
    console.debug(db, name);
    return Promise.resolve(true);
  }

  _placeHolder(params: IScalar[] = []): string {
    // insert param to params before generating place holder
    const p = params.length;
    return `$${p}`;
  }

  async _select(
    where = '',
    params: IScalar[] = [],
    limit = 0,
    offset = 0,
  ): Promise<QueryResult<RowModel>> {
    const limitInt = parseInt(String(limit));
    const offsetInt = parseInt(String(offset));
    const whereClause = (where ? ' WHERE ' + where : '');
    const limitClause = (limit ? ' LIMIT ' + limitInt : '');
    const offsetClause = (offset ? ' OFFSET ' + offsetInt : '');
    const command = `SELECT * FROM ${this.name} ${whereClause} ${limitClause} ${offsetClause}`;
    return this.db.query<RowModel>(command, params);
  }

  async _selectOne(where = '', params: IScalar[] = []): Promise<RowModel> {
    const result = await this._select(where, params, 1);
    if (result && result.rows && result.rows[0]) {
      return result.rows[0];
    }
    throw new Error('Record not found');
  }

  _whereConditions(filters: IFilterList): { where: string, params: IScalar[] } {
    const whereArr: string[] = [], params: IScalar[] = [];
    let where = '';

    if (Array.isArray(filters)) {
      filters.forEach(filterObj => {

        Object.entries(filterObj).forEach(([fieldName, opsAndValues])=> {

          Object.entries(opsAndValues).forEach(([op, value]) => {
            if (Array.isArray(value)) {
              const phArr: string[] = [];
              value.forEach(v => {
                params.push(v);
                const ph = this._placeHolder(params);
                phArr.push(ph);
              });
              const exp = opsFun(op, fieldName, phArr);
              whereArr.push(exp);
            } else {
              params.push(value);
              const ph = this._placeHolder(params);
              const exp = opsFun(op, fieldName, [ph]);
              whereArr.push(exp);
            }
          })
        });
      });
      where = whereArr.join(' AND '); // default logical operation
    } else {
      if ('$and' in filters) {
        // TODO
      } else if ('$or' in filters) {
        // TODO
      }
      //if (filters instanceof IKeyValuePairs) {
        Object.entries(filters).forEach(([field, value]) => {
          params.push(value);
          whereArr.push(field + ' = ' + this._placeHolder(params));
        });
        where = whereArr.join(' AND ');
      //}
    }

    // if ('ids' in filters) {
    //   const { ids } = filters;
    //   if (Array.isArray(ids)) {
    //     const idList = ids.map((id: any) => {
    //       params.push(String(id));
    //       return this._placeHolder(params);
    //     }).join(', ');
    //     where.push(`id IN (${idList})`);
    //   }
    // }

    return { where, params };
  }

  async findOne(options: IRepoFindOptions): Promise<RowModel> {
    const { where, params } = this._whereConditions(options.filters);
    return this._selectOne(where, params);
  }

  async findMany(options: IRepoFindOptions): Promise<RowModel[]> {
    const { where, params } = this._whereConditions(options.filters);
    const result = await this._select(where, params, options.limit, options.limit);
    return Promise.resolve(result.rows);
  }

  async _insert(row: RowModel): Promise<number> {
    const fields: string[] = [], params: IScalar[] = [], placeHolders: string[] = [];

    Object.entries(row).forEach(([field, value]) => {
      fields.push(field);
      params.push(value);
      placeHolders.push(this._placeHolder(params));
    });

    const command = 'INSERT INTO ' + this.name + ' (' + fields.join(', ') + ') '
      + 'VALUES (' + placeHolders.join(', ') + ')';
    const result = await this.db.query<RowModel>(command, params);
    return result.rowCount;
  }

  async insertOne(row: RowModel): Promise<boolean> {
    const count = await this._insert(row);
    return 0 < count;
  }

  async _update(options: IRepoFindOptions, row: RowModel, limit = 1): Promise<number> {
    const { where, params } = this._whereConditions(options.filters);
    const assignments: string[] = [];

    Object.entries(row).forEach(([field, value]) => {
      params.push(value);
      assignments.push(field + ' = ' + this._placeHolder(params));
    });

    const assignmentsStr = assignments.join(', ');
    const whereStr = where ? ' WHERE ' + where : '';
    const limitInt = parseInt(String(limit));
    const limitStr = limitInt ? `LIMIT ${limitInt}` : '';
    const command = `UPDATE ${this.name} SET ${assignmentsStr} ${whereStr} ${limitStr}`;
    const result = await this.db.query<RowModel>(command, params);
    return result.rowCount;
  }

  async updateOne(id: string, row: RowModel): Promise<boolean> {
    const count = await this._update({ filters: { id }}, row);
    return 0 < count;
  }

  async _delete(options: IRepoFindOptions, limit = 1): Promise<number> {
    const { where, params } = this._whereConditions(options.filters);
    const whereStr = where ? 'WHERE ' + where : '';
    const limitInt = parseInt(String(limit));
    const limitStr = limitInt ? `LIMIT ${limitInt}` : '';
    const command = `DELETE FROM ${this.name} ${whereStr} ${limitStr}`;
    const result = await this.db.query<RowModel>(command, params);
    return result.rowCount;
  }

  async deleteOne(id: string): Promise<boolean> {
    const count = await this._delete( { filters: { id }});
    return 0 < count;
  }

}
