import { db } from './db';

export interface ModelDefinition<T> {
  table: string;
  /** Columns `create` and `update` accept. Anything else in the input is ignored. */
  fillable: Array<keyof T & string>;
}

function pick<T>(attrs: Partial<T>, keys: Array<keyof T & string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) if (attrs[key] !== undefined) out[key] = attrs[key];
  return out;
}

// A thin Active Record over one table. Rows come back with the table's own column names.
export function defineModel<T extends { id: number }>(def: ModelDefinition<T>) {
  const table = () => db()(def.table);
  return {
    table: def.table,
    async all(): Promise<T[]> {
      return db()<T[]>`select * from ${table()} order by id desc`;
    },
    async find(id: number): Promise<T | null> {
      const [row] = await db()<T[]>`select * from ${table()} where id = ${id}`;
      return row ?? null;
    },
    async where(column: keyof T & string, value: unknown): Promise<T[]> {
      return db()<T[]>`select * from ${table()} where ${db()(column)} = ${value} order by id desc`;
    },
    async create(attrs: Partial<T>): Promise<T> {
      const [row] = await db()<T[]>`insert into ${table()} ${db()(pick(attrs, def.fillable))} returning *`;
      return row;
    },
    async update(id: number, attrs: Partial<T>): Promise<T | null> {
      const [row] = await db()<T[]>`update ${table()} set ${db()(pick(attrs, def.fillable))} where id = ${id} returning *`;
      return row ?? null;
    },
    async delete(id: number): Promise<boolean> {
      const rows = await db()`delete from ${table()} where id = ${id} returning id`;
      return rows.length > 0;
    },
  };
}
