import { db } from './db';

// Queues a job for the worker (services/app/worker). `name` is the job's file name in worker/src/Jobs.
export async function dispatch(name: string, payload: Record<string, unknown> = {}, opts: { delaySeconds?: number } = {}) {
  const delay = opts.delaySeconds ?? 0;
  await db()`insert into jobs (name, payload, available_at)
    values (${name}, ${payload}, now() + make_interval(secs => ${delay}))`;
}
