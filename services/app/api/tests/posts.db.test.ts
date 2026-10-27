import { SQL } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { createApp } from '../src/app';
import { config } from '../src/config/app';
import { cleanDatabaseUrl, setConnection } from '../src/framework/db';
import { loadActions } from '../src/framework/loader';

// Needs the schema from services/app/migrations, so start the stack first (`bun stack dev`), then:
//   TEST_DATABASE_URL=postgresql://flisk_stack:<DB_PASSWORD>@localhost:15432/flisk_stack_app bun test
// Skipped without TEST_DATABASE_URL (the DATABASE_URL in .env points at the Docker network, not the host).
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('posts against Postgres', () => {
  let sql: SQL;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    sql = new SQL(cleanDatabaseUrl(url as string));
    setConnection(sql);
    app = createApp(await loadActions(config.actionsDir));
  });

  afterAll(async () => {
    await sql`delete from posts where title like 'db-test %'`;
    await sql`delete from jobs where payload->>'title' like 'db-test %'`;
    setConnection(null);
    await sql.close();
  });

  it('creates, shows, lists and deletes a post, and queues a job', async () => {
    const created = await app.request('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'db-test one', body: 'x' }),
    });
    expect(created.status).toBe(201);
    const { data: post } = await created.json();

    expect((await (await app.request(`/posts/${post.id}`)).json()).data.title).toBe('db-test one');
    const list = (await (await app.request('/posts')).json()).data as Array<{ id: number }>;
    expect(list.some((p) => p.id === post.id)).toBe(true);

    const [job] = await sql`select name, payload from jobs where (payload->>'postId')::int = ${post.id}`;
    expect(job.name).toBe('NotifyNewPost');

    expect((await app.request(`/posts/${post.id}`, { method: 'DELETE' })).status).toBe(204);
    expect((await app.request(`/posts/${post.id}`)).status).toBe(404);
  });
});
