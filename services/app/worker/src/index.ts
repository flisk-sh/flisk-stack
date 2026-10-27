import { SQL, sleep } from 'bun';
import { loadJobs } from './framework/job';
import { postgresStore, reserveNext, runJob } from './framework/queue';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set. Flisk provides it when the service enables the prisma feature.');

// Flisk's DATABASE_URL carries Prisma's `?schema=` parameter, which Postgres rejects as a startup parameter.
const u = new URL(url);
u.searchParams.delete('schema');
const sql = new SQL(u.toString());

const pollIntervalMs = Number(process.env.WORKER_POLL_INTERVAL ?? 1000);
const jobs = await loadJobs(new URL('./Jobs', import.meta.url).pathname);
const store = postgresStore(sql);
let running = true;

console.log(`🚀 worker started with jobs: ${[...jobs.keys()].join(', ')}`);

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`[worker] ${signal} received, finishing the current job`);
    running = false;
  });
}

while (running) {
  try {
    const row = await reserveNext(sql);
    if (!row) {
      await sleep(pollIntervalMs);
      continue;
    }
    const result = await runJob(row, jobs, store);
    console.log(`[worker] ${row.name}#${row.id} attempt ${row.attempts}: ${result}`);
  } catch (err) {
    console.error('[worker] poll failed:', err);
    await sleep(pollIntervalMs);
  }
}

await sql.close();
