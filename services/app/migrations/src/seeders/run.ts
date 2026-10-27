// Runs after `prisma migrate deploy` (see package.json): applies every seeder, then exits.
import { SQL } from 'bun';
import { seedPosts } from './PostSeeder';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set. Flisk provides it when the service enables the prisma feature.');

// Flisk's DATABASE_URL carries Prisma's `?schema=` parameter, which Postgres rejects as a startup parameter.
const u = new URL(url);
u.searchParams.delete('schema');

const sql = new SQL(u.toString());
await seedPosts(sql);
console.log('migrations: seeders applied');
await sql.close();
