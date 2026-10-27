import type { SQL } from 'bun';
import type { Job } from './job';

export interface JobRow {
  id: number;
  name: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
}

export interface QueueStore {
  complete(id: number): Promise<void>;
  /** Puts the job back to run again after `delaySeconds`. */
  release(id: number, error: string, delaySeconds: number): Promise<void>;
  fail(id: number, error: string): Promise<void>;
}

// A reservation older than this is treated as a crashed worker and handed out again.
const STALE_RESERVATION = '5 minutes';

// Takes the oldest due job. SKIP LOCKED lets several worker replicas poll the same table.
export async function reserveNext(sql: SQL): Promise<JobRow | null> {
  const [row] = await sql<JobRow[]>`
    update jobs set reserved_at = now(), attempts = attempts + 1
    where id = (
      select id from jobs
      where completed_at is null and failed_at is null and available_at <= now()
        and (reserved_at is null or reserved_at < now() - ${STALE_RESERVATION}::interval)
      order by available_at, id
      for update skip locked
      limit 1
    )
    returning id, name, payload, attempts, max_attempts`;
  return row ?? null;
}

export function postgresStore(sql: SQL): QueueStore {
  return {
    async complete(id) {
      await sql`update jobs set completed_at = now(), reserved_at = null where id = ${id}`;
    },
    async release(id, error, delaySeconds) {
      await sql`update jobs set reserved_at = null, last_error = ${error},
        available_at = now() + make_interval(secs => ${delaySeconds}) where id = ${id}`;
    },
    async fail(id, error) {
      await sql`update jobs set failed_at = now(), reserved_at = null, last_error = ${error} where id = ${id}`;
    },
  };
}

// Runs one reserved row. An unknown job name fails at once; a throwing job retries until max_attempts.
export async function runJob(row: JobRow, jobs: Map<string, Job>, store: QueueStore): Promise<'done' | 'retry' | 'failed'> {
  const job = jobs.get(row.name);
  if (!job) {
    await store.fail(row.id, `no job named ${row.name} in src/Jobs`);
    return 'failed';
  }
  try {
    await job.handle(row.payload);
    await store.complete(row.id);
    return 'done';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (row.attempts >= row.max_attempts) {
      await store.fail(row.id, message);
      return 'failed';
    }
    await store.release(row.id, message, (job.backoffSeconds ?? 10) * row.attempts);
    return 'retry';
  }
}
