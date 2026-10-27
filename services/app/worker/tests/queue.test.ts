import { describe, expect, it } from 'bun:test';
import { defineJob, loadJobs } from '../src/framework/job';
import { type JobRow, type QueueStore, runJob } from '../src/framework/queue';

function fakeStore() {
  const calls: string[] = [];
  const store: QueueStore = {
    complete: async (id) => void calls.push(`complete ${id}`),
    release: async (id, error, delay) => void calls.push(`release ${id} ${error} ${delay}s`),
    fail: async (id, error) => void calls.push(`fail ${id} ${error}`),
  };
  return { store, calls };
}

const row = (over: Partial<JobRow> = {}): JobRow => ({
  id: 1,
  name: 'Ping',
  payload: { n: 1 },
  attempts: 1,
  max_attempts: 3,
  ...over,
});

describe('runJob', () => {
  it('completes a job that succeeds and passes its payload', async () => {
    const seen: unknown[] = [];
    const jobs = new Map([['Ping', defineJob({ handle: (p) => void seen.push(p) })]]);
    const { store, calls } = fakeStore();

    expect(await runJob(row(), jobs, store)).toBe('done');
    expect(seen).toEqual([{ n: 1 }]);
    expect(calls).toEqual(['complete 1']);
  });

  it('retries with backoff scaled by the attempt, then fails at max_attempts', async () => {
    const boom = defineJob({ backoffSeconds: 5, handle: () => { throw new Error('boom'); } });
    const jobs = new Map([['Ping', boom]]);
    const { store, calls } = fakeStore();

    expect(await runJob(row({ attempts: 2 }), jobs, store)).toBe('retry');
    expect(await runJob(row({ attempts: 3 }), jobs, store)).toBe('failed');
    expect(calls).toEqual(['release 1 boom 10s', 'fail 1 boom']);
  });

  it('fails an unknown job name without retrying', async () => {
    const { store, calls } = fakeStore();
    expect(await runJob(row({ name: 'Ghost' }), new Map(), store)).toBe('failed');
    expect(calls).toEqual(['fail 1 no job named Ghost in src/Jobs']);
  });
});

describe('loadJobs', () => {
  it('names each job after its file in src/Jobs', async () => {
    const jobs = await loadJobs(new URL('../src/Jobs', import.meta.url).pathname);
    expect([...jobs.keys()]).toEqual(['NotifyNewPost']);
  });
});
