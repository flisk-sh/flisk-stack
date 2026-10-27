import { SQL } from 'bun';

let connection: SQL | null = null;

// Flisk's DATABASE_URL carries Prisma's `?schema=` parameter. Postgres rejects it as a
// startup parameter, and Bun's SQL client forwards query parameters, so it is dropped here.
export function cleanDatabaseUrl(url: string): string {
  const u = new URL(url);
  u.searchParams.delete('schema');
  return u.toString();
}

// The shared connection, opened on first use. Flisk provides DATABASE_URL (prisma feature).
export function db(): SQL {
  if (!connection) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set. Flisk provides it when the service enables the prisma feature.');
    connection = new SQL(cleanDatabaseUrl(url));
  }
  return connection;
}

export function setConnection(sql: SQL | null): void {
  connection = sql;
}
