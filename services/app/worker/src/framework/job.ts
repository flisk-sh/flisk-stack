import { Glob } from 'bun';
import { basename, join } from 'node:path';

export interface Job<P = Record<string, unknown>> {
  /** Seconds to wait before retrying a failed attempt, multiplied by the attempt number. */
  backoffSeconds?: number;
  handle(payload: P): void | Promise<void>;
}

// One file in src/Jobs = one job. The api queues it by file name: dispatch('NotifyNewPost', {...}).
export function defineJob<P = Record<string, unknown>>(job: Job<P>): Job<P> {
  return job;
}

export async function loadJobs(dir: string): Promise<Map<string, Job>> {
  const jobs = new Map<string, Job>();
  for await (const file of new Glob('**/*.{ts,js}').scan({ cwd: dir })) {
    const mod = await import(join(dir, file));
    if (!mod.default?.handle) throw new Error(`${file} has no default export from defineJob()`);
    jobs.set(basename(file).replace(/\.(ts|js)$/, ''), mod.default);
  }
  return jobs;
}
